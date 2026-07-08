export type ProjectStatus = 'active' | 'delivered' | 'invoiced' | 'paid';

export interface Project {
  id: string;
  client_name: string;
  project_type: string;
  budget: number;
  currency: string;
  deadline: string; // ISO date YYYY-MM-DD
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  casper_address?: string; // Client's Casper Network public key (for on-chain payment verification)
}

export interface ChatMessage {
  id: string;
  project_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AgentAction {
  id: string;
  project_id: string | null;
  action_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
