import { supabase } from '../lib/supabase';
import { Bid, Client, Settings } from '../types';

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // --- CLIENTES ---
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data || [];
  },
  saveClient: async (client: Partial<Client>) => {
    // Se tiver ID, atualiza. Se não, cria.
    const { data, error } = await supabase
      .from('clients')
      .upsert(client)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteClient: async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  // --- LICITAÇÕES (BIDS) ---
  getBids: async (): Promise<Bid[]> => {
    // Trazemos também o nome do cliente usando o relacionamento do banco
    const { data, error } = await supabase
      .from('licitacoes')
      .select(`
        *,
        clients ( name ) 
      `);
      
    if (error) throw error;
    
    // Mapeando para o formato que seu frontend espera
    return data.map((item: any) => ({
      ...item,
      date: item.data_licitacao, // O banco usa snake_case, seu type usa date
      client_name: item.clients?.name // Adicionei isso para facilitar na tabela
    })) || [];
  },
  saveBid: async (bid: Partial<Bid>) => {
    // Converter camelCase do front para snake_case do banco
    const payload = {
      id: bid.id,
      title: bid.title,
      data_licitacao: bid.date, // Ajuste importante
      link_docs: bid.link_docs,
      status: bid.status,
      client_id: bid.client_id,
      reminder_sent: bid.reminder_sent || false
    };

    const { data, error } = await supabase
      .from('licitacoes')
      .upsert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  deleteBid: async (id: string) => {
    const { error } = await supabase.from('licitacoes').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<Settings | null> => {
    const { data, error } = await supabase.from('settings').select('*').single();
    // Se não tiver config ainda, não é erro crítico, retorna null
    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  },
  saveSettings: async (settings: Settings) => {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) throw new Error("Usuário não logado");

    const { data, error } = await supabase
      .from('settings')
      .upsert({ ...settings, user_id: user.id }) // Vincula ao usuário
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};