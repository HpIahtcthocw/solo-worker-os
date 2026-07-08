import type { ToolSpec, ToolExecutionResult } from '../types';
import {
  queryAccount,
  getDeploy,
  healthCheck,
  buildTransferDeploy,
  submitDeploy,
  requestFaucet,
  type CasperTransferResult,
  type CasperFaucetResult,
} from './client';

/**
 * Casper Network tool specs.
 *
 * These tools demonstrate the agent's ability to interact with the
 * Casper blockchain — a core requirement of the Casper Agentic Buildathon.
 *
 * Tool categories:
 *   - Read:    queryAccount, getDeploy, healthCheck
 *   - Write:   faucet (request testnet funds), buildTransferDeploy + submitDeploy
 */

export const CASPER_TOOL_SPECS: ToolSpec[] = [
  // ── Read tools ──────────────────────────────────────────────

  {
    name: 'casper_query_account',
    description:
      'Query a Casper Network account by its public key. Returns balance in CSPR, account hash, and main purse URef. Use this when the user asks about an account balance, wallet status, or on-chain holdings.',
    input_schema: {
      type: 'object',
      properties: {
        public_key_hash: {
          type: 'string',
          description:
            'The Casper account public key in hex. Ed25519 keys start with "01" followed by 64 hex chars. Secp256k1 keys start with "02" followed by 66 hex chars. Do NOT use the "account-hash-" form here — use the raw public key.',
        },
      },
      required: ['public_key_hash'],
    },
  },
  {
    name: 'casper_get_deploy',
    description:
      'Look up a deploy (transaction) on Casper Network by its deploy hash. Returns the deploy status, timestamp, and execution result. Use this when the user asks about a transaction status or deploy confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        deploy_hash: {
          type: 'string',
          description: 'The deploy hash. Accepts formats: "deploy-<hex>" or raw hex.',
        },
      },
      required: ['deploy_hash'],
    },
  },

  // ── Write tools ─────────────────────────────────────────────

  {
    name: 'casper_faucet',
    description:
      'Request testnet CSPR from the Casper faucet. Sends 1000 CSPR to the specified account. Rate limited to once per 24 hours per address. Use this when a user needs testnet funds to perform transactions.',
    input_schema: {
      type: 'object',
      properties: {
        public_key_hex: {
          type: 'string',
          description: 'The account public key hex (with or without 0x prefix). Do NOT use account-hash- format here — use the raw public key.',
        },
      },
      required: ['public_key_hex'],
    },
  },
  {
    name: 'casper_build_transfer',
    description:
      'Build a CSPR transfer deploy JSON structure. This prepares (but does NOT sign or submit) a transfer transaction. Returns the deploy structure that can be reviewed and signed. Use this when the user wants to send CSPR to another account — show them the deploy structure first for confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        from_account: {
          type: 'string',
          description: "Sender's account hash (e.g. 'account-hash-...').",
        },
        to_public_key: {
          type: 'string',
          description: "Recipient's public key hex (e.g. '0203a1a0...').",
        },
        amount: {
          type: 'string',
          description: 'Amount in CSPR to send (e.g. "1.5", "0.5").',
        },
      },
      required: ['from_account', 'to_public_key', 'amount'],
    },
  },
];

/**
 * Execute a Casper-specific tool by name.
 * This is a separate executor so existing executeTool() remains untouched.
 */
export async function executeCasperTool(
  name: string,
  input: Record<string, unknown>
): Promise<ToolExecutionResult> {
  switch (name) {
    // ── Read: Query Account ────────────────────────────────────
    case 'casper_query_account': {
      const publicKeyHash = String(input.public_key_hash).trim();
      try {
        const info = await queryAccount(publicKeyHash);
        const result = JSON.stringify(info, null, 2);
        return {
          toolResult: result,
          clientSummary: `Casper account ${publicKeyHash.slice(0, 16)}...: ${info.balance_cspr} CSPR`,
          displayText: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          toolResult: `Error querying account: ${message}`,
          clientSummary: `Failed to query Casper account`,
        };
      }
    }

    // ── Read: Get Deploy ───────────────────────────────────────
    case 'casper_get_deploy': {
      const deployHash = String(input.deploy_hash).trim();
      try {
        const info = await getDeploy(deployHash);
        const result = JSON.stringify(info, null, 2);
        return {
          toolResult: result,
          clientSummary: `Deploy ${deployHash.slice(0, 16)}...: ${info.state}`,
          displayText: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          toolResult: `Error looking up deploy: ${message}`,
          clientSummary: `Failed to look up deploy`,
        };
      }
    }

    // ── Write: Faucet ──────────────────────────────────────────
    case 'casper_faucet': {
      const publicKeyHex = String(input.public_key_hex).trim();
      try {
        const result = await requestFaucet(publicKeyHex);
        const resultJson = JSON.stringify(result, null, 2);
        return {
          toolResult: resultJson,
          clientSummary: result.success
            ? `Faucet: sent 1000 CSPR to ${publicKeyHex.slice(0, 16)}...`
            : `Faucet failed: ${result.message}`,
          displayText: resultJson,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          toolResult: `Error requesting faucet: ${message}`,
          clientSummary: `Faucet request failed`,
        };
      }
    }

    // ── Write: Build Transfer Deploy ───────────────────────────
    case 'casper_build_transfer': {
      const fromAccount = String(input.from_account).trim();
      const toPublicKey = String(input.to_public_key).trim();
      const amount = String(input.amount).trim();

      try {
        const deploy = buildTransferDeploy(fromAccount, toPublicKey, amount);
        // buildTransferDeploy returns Record<string, unknown>, cast for result extraction
        const d = deploy as Record<string, unknown>;
        const header = d.header as Record<string, unknown>;
        const result: CasperTransferResult & { deploy_structure: Record<string, unknown> } = {
          deploy_hash: String(d.hash ?? ''),
          from_account: String(header.account ?? ''),
          to_account: toPublicKey.slice(0, 32),
          amount_cspr: amount,
          amount_motes: String(Math.floor(parseFloat(amount) * 1_000_000_000)),
          status: 'built (unsigned — requires signing before submission)',
          deploy_structure: deploy,
        };

        const resultJson = JSON.stringify(result, null, 2);
        return {
          toolResult: resultJson,
          clientSummary: `Transfer deploy prepared: ${amount} CSPR from ${fromAccount.slice(0, 16)}... to ${toPublicKey.slice(0, 16)}... (unsigned)`,
          displayText: resultJson,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          toolResult: `Error building transfer: ${message}`,
          clientSummary: `Failed to build transfer deploy`,
        };
      }
    }

    default:
      return {
        toolResult: `Unknown Casper tool: ${name}`,
        clientSummary: `Unknown tool: ${name}`,
      };
  }
}
