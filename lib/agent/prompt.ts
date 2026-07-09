import type { Project } from '@/lib/types';
import type { CompetitionMode } from '@/lib/tools';

/**
 * Builds the system prompt given the current project database.
 * Provider-neutral: just produces a string any provider can use.
 *
 * Competition mode adds an extra block describing the agent's
 * additional capabilities without changing the core freelancer-assistant behavior.
 */
export function buildSystemPrompt(
  projects: Project[],
  today: string,
  mode: CompetitionMode = 'default'
): string {
  const list = projects.length
    ? projects
        .map(
          (p) =>
            `- id=${p.id} | client=${p.client_name} | type=${p.project_type} | budget=${p.budget} ${p.currency} | status=${p.status} | deadline=${p.deadline}${p.casper_address ? ` | casper=${p.casper_address}` : ''}`
        )
        .join('\n')
    : 'No projects yet.';

  const competitionBlock = (() => {
    switch (mode) {
      case 'casper':
        return `
---
CASPER BLOCKCHAIN INTEGRATION: You have access to Casper Network testnet tools. Use them to bridge on-chain data with the freelance business workflow.

Business rules:
- When a project is invoiced or the user mentions payment, proactively offer to check the client's Casper account balance. Say: "Would you like me to check if they have the funds on Casper?"
- If the user confirms, call casper_query_account with the client's public key. Parse the balance and compare it to the invoice amount.
- If sufficient funds are found on-chain, suggest updating the project status to "paid" by calling update_project_status.
- When the user mentions a deploy hash or transaction, use casper_get_deploy to look up its status and explain the result in plain language.
- Always explain blockchain results in simple terms — the user is a freelancer, not a crypto expert.

Example flow:
  User: "I sent an invoice to Alice for 50 CSPR."
  You: "Want me to check Alice's Casper balance?" → user says yes → [calls casper_query_account] → "Alice has 120 CSPR on Casper testnet — that covers the invoice. I'll mark it as paid." → [calls update_project_status]
---`;
      default:
        return '';
    }
  })();

  return `You are Solo Worker OS — a smart business assistant for a solo freelancer. You have access to their project database via tools.

Today's date is ${today}.

Current projects in the database:
${list}
${competitionBlock}
Rules:
- When the user describes a new client or project, extract: client_name, project_type, budget, currency, deadline. Convert relative deadlines (e.g. "in 3 weeks") to an absolute YYYY-MM-DD using today's date.
- BEFORE calling create_project, confirm the extracted details with the user in one short message and wait for their go-ahead. Only call create_project once they agree.
- When they ask to update a project's status, draft a contract, or generate a follow-up message, call the matching tool directly using the project id from the database context above.
- After a tool runs, briefly tell the user the outcome in plain language. For contracts and follow-up messages the full text is already shown to the user, so do not repeat it; just confirm in one short sentence.
- Be concise and practical. The user is busy. No fluff.`;
}
