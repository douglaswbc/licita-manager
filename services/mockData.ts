import { Bid, BidStatus, Client, Settings } from '../../types';

// Initial Seed Data
const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'John Doe', email: 'john@constructors.com', company: 'Constructors Inc.' },
  { id: '2', name: 'Jane Smith', email: 'jane@buildfast.com', company: 'BuildFast Ltd.' },
  { id: '3', name: 'Robert Johnson', email: 'rob@citygov.org', company: 'City Government' },
];

const INITIAL_BIDS: Bid[] = [
  { 
    id: '101', 
    title: 'City Bridge Renovation', 
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    link_docs: 'https://docs.google.com/bridge',
    status: BidStatus.PENDING, 
    client_id: '3', 
    reminder_sent: false 
  },
  { 
    id: '102', 
    title: 'Highway 54 Expansion', 
    date: new Date(Date.now() - 86400000 * 10).toISOString(), 
    link_docs: 'https://docs.google.com/highway',
    status: BidStatus.LOST, 
    client_id: '1', 
    reminder_sent: true 
  },
  { 
    id: '103', 
    title: 'Community Center HVAC', 
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    link_docs: 'https://docs.google.com/hvac',
    status: BidStatus.WON, 
    client_id: '2', 
    reminder_sent: true,
    summary_link: 'https://drive.google.com/summary',
    summary_sent_at: new Date().toISOString()
  },
];

const INITIAL_SETTINGS: Settings = {
  email_sender: 'notifications@licitamanager.com',
  reminder_subject: 'Upcoming Bid Deadline',
  reminder_body: 'This is a reminder that the bid deadline is approaching.',
  summary_subject: 'Bid Summary Available',
  summary_body: 'Please find attached the summary for the recent bid.',
};

// LocalStorage Keys
const KEYS = {
  CLIENTS: 'lm_clients',
  BIDS: 'lm_bids',
  SETTINGS: 'lm_settings',
  AUTH: 'lm_auth'
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Auth
  login: async (email: string, password: string) => {
    await delay(500);
    if (email && password) {
      localStorage.setItem(KEYS.AUTH, 'true');
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem(KEYS.AUTH);
  },
  isAuthenticated: () => {
    return localStorage.getItem(KEYS.AUTH) === 'true';
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    await delay(300);
    const stored = localStorage.getItem(KEYS.CLIENTS);
    if (!stored) return INITIAL_CLIENTS;
    return JSON.parse(stored);
  },
  saveClient: async (client: Client) => {
    await delay(300);
    const clients = await mockService.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    let newClients;
    if (index >= 0) {
      newClients = [...clients];
      newClients[index] = client;
    } else {
      newClients = [...clients, { ...client, id: Math.random().toString(36).substr(2, 9) }];
    }
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(newClients));
    return newClients;
  },
  deleteClient: async (id: string) => {
    await delay(300);
    const clients = await mockService.getClients();
    const newClients = clients.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(newClients));
    return newClients;
  },

  // Bids
  getBids: async (): Promise<Bid[]> => {
    await delay(300);
    const stored = localStorage.getItem(KEYS.BIDS);
    if (!stored) return INITIAL_BIDS;
    return JSON.parse(stored);
  },
  saveBid: async (bid: Bid) => {
    await delay(300);
    const bids = await mockService.getBids();
    const index = bids.findIndex(b => b.id === bid.id);
    let newBids;
    if (index >= 0) {
      newBids = [...bids];
      newBids[index] = bid;
    } else {
      newBids = [...bids, { ...bid, id: Math.random().toString(36).substr(2, 9) }];
    }
    localStorage.setItem(KEYS.BIDS, JSON.stringify(newBids));
    return newBids;
  },
  deleteBid: async (id: string) => {
    await delay(300);
    const bids = await mockService.getBids();
    const newBids = bids.filter(b => b.id !== id);
    localStorage.setItem(KEYS.BIDS, JSON.stringify(newBids));
    return newBids;
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    await delay(300);
    const stored = localStorage.getItem(KEYS.SETTINGS);
    if (!stored) return INITIAL_SETTINGS;
    return JSON.parse(stored);
  },
  saveSettings: async (settings: Settings) => {
    await delay(500);
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
};