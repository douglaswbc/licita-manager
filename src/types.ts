export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  access_token?: string;
}

export enum BidStatus {
  PENDING = 'Pendente',               // Criada, mas ainda não enviada
  WAITING_CLIENT = 'Aguardando Cliente', // E-mail enviado, esperando resposta
  WAITING_BID = 'Aguardando Licitação',  // Cliente disse SIM
  DISCARDED = 'Descartada',           // Cliente disse NÃO
  WON = 'Ganha',
  LOST = 'Perdida'
}

export interface Bid {
  id: string;
  title: string;
  date: string;
  link_docs: string;
  status: BidStatus; // Agora usa o Enum acima
  client_id: string;
  client_name?: string;
  reminder_sent: boolean;
  summary_link?: string;
  summary_sent_at?: string;
  decision?: 'Participar' | 'Descartar' | 'Pendente';
  decision_at?: string;
}

export interface Settings {
  email_sender: string;
  reminder_subject: string;
  reminder_body: string;
  summary_subject: string;
  summary_body: string;
  // Novos campos SMTP
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