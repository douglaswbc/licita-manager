export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
}

export enum BidStatus {
  PENDING = 'Pending',
  WON = 'Won',
  LOST = 'Lost'
}

export interface Bid {
  id: string;
  title: string;
  date: string; // ISO string
  link_docs: string;
  status: BidStatus;
  client_id: string;
  reminder_sent: boolean;
  summary_link?: string;
  summary_sent_at?: string;
}

export interface Settings {
  email_sender: string;
  reminder_subject: string;
  reminder_body: string;
  summary_subject: string;
  summary_body: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}