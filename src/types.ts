export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  access_token?: string;
  // Novos campos financeiros
  contract_value?: number;  // Valor Fixo (R$)
  commission_rate?: number; // Comissão (%)
  active?: boolean;
  created_at?: string;
}

export enum BidStatus {
  PENDING = 'Pendente',
  WAITING_CLIENT = 'Aguardando Cliente',
  WAITING_BID = 'Aguardando Licitação',
  DISCARDED = 'Descartada',
  WON = 'Ganha',
  LOST = 'Perdida'
}

export interface Bid {
  id: string;
  title: string;
  date: string;
  link_docs: string;
  status: BidStatus;
  client_id: string;
  client_name?: string;
  reminder_sent: boolean;
  summary_link?: string;
  summary_sent_at?: string;
  decision?: 'Participar' | 'Descartar' | 'Pendente';
  decision_at?: string;
  final_value?: number
  commission_rate?: number;
  financial_status?: 'aguardando_nota' | 'pendente' | 'pago';
}

export interface Settings {
  email_sender: string;
  reminder_subject: string;
  reminder_body: string;
  summary_subject: string;
  summary_body: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}