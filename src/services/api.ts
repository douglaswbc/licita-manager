import { supabase } from '../lib/supabase';
import { Bid, Client, Settings } from '../types';

export const api = {
  // --- AUTH (Mantém igual) ---
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });
    if (error) throw error;
  },

  updateUser: async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },
  
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // --- CLIENTES (Mantém igual) ---
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.nome,      
      email: item.email,
      company: item.empresa,
      access_token: item.access_token 
    })) || [];
  },

  saveClient: async (client: Partial<Client>) => {
    const { user } = (await supabase.auth.getUser()).data;
    const payload = {
      id: client.id,
      nome: client.name,
      email: client.email,
      empresa: client.company,
      user_id: user?.id
    };
    const { data, error } = await supabase.from('clients').upsert(payload).select().single();
    if (error) throw error;
    return data;
  },

  deleteClient: async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  // --- LICITAÇÕES (Mantém igual) ---
  getBids: async (): Promise<Bid[]> => {
    const { data, error } = await supabase
      .from('licitacoes')
      .select(`*, clients ( nome )`).order('data_licitacao', { ascending: true });
      
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.titulo,
      date: item.data_licitacao,
      link_docs: item.link_docs,
      status: item.status,
      client_id: item.client_id,
      client_name: item.clients?.nome,
      reminder_sent: item.lembrete_enviado,
      summary_link: item.link_resumo,
      summary_sent_at: item.resumo_enviado_em,
      decision: item.decisao_cliente || 'Pendente',
      decision_at: item.data_decisao
    })) || [];
  },

  saveBid: async (bid: Partial<Bid>) => {
    const { user } = (await supabase.auth.getUser()).data;
    const payload = {
      id: bid.id,
      titulo: bid.title,
      data_licitacao: bid.date,
      link_docs: bid.link_docs,
      status: bid.status,
      client_id: bid.client_id,
      lembrete_enviado: bid.reminder_sent || false,
      link_resumo: bid.summary_link,
      resumo_enviado_em: bid.summary_sent_at,
      decisao_cliente: bid.decision, 
      data_decisao: bid.decision_at,
      user_id: user?.id
    };
    const { data, error } = await supabase.from('licitacoes').upsert(payload).select().single();
    if (error) throw error;
    return data;
  },

  deleteBid: async (id: string) => {
    const { error } = await supabase.from('licitacoes').delete().eq('id', id);
    if (error) throw error;
  },

  // --- PORTAL (Mantém igual) ---
  getPortalData: async (token: string) => {
    const { data: client, error: errClient } = await supabase.from('clients').select('*').eq('access_token', token).single();
    if (errClient || !client) throw new Error("Acesso Inválido");

    const { data: bids, error: errBids } = await supabase.from('licitacoes').select('*').eq('client_id', client.id).order('data_licitacao', { ascending: false });
    if (errBids) throw errBids;

    return {
      client: { name: client.nome, company: client.empresa },
      bids: bids.map((item: any) => ({
        id: item.id,
        title: item.titulo,
        date: item.data_licitacao,
        link_docs: item.link_docs,
        status: item.status,
        decision: item.decisao_cliente || 'Pendente',
        decision_at: item.data_decisao
      }))
    };
  },

  saveDecision: async (bidId: string, decision: 'Participar' | 'Descartar') => {
    let novoStatus = 'Aguardando Cliente';
    if (decision === 'Participar') novoStatus = 'Aguardando Licitação';
    if (decision === 'Descartar') novoStatus = 'Descartada';

    const { error } = await supabase.from('licitacoes').update({ 
      decisao_cliente: decision,
      data_decisao: new Date().toISOString(),
      status: novoStatus
    }).eq('id', bidId);
    if (error) throw error;
  },

  // --- SETTINGS (CORRIGIDO PARA EVITAR DUPLICIDADE) ---
  getSettings: async (): Promise<Settings | null> => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) {
      if (error.code === 'PGRST116') return null; 
      throw error;
    }
    return {
      email_sender: data.email_remetente,
      reminder_subject: data.assunto_lembrete,
      reminder_body: data.msg_lembrete,
      summary_subject: data.assunto_resumo,
      summary_body: data.msg_resumo
    };
  },

  saveSettings: async (settings: Settings) => {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) throw new Error("Usuário não logado");

    // 1. Busca se JÁ EXISTE uma configuração para este usuário
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    const payload = {
      // Se achou, usa o ID existente para ATUALIZAR. Se não, deixa undefined para CRIAR.
      id: existing?.id, 
      user_id: user.id,
      email_remetente: settings.email_sender,
      assunto_lembrete: settings.reminder_subject,
      msg_lembrete: settings.reminder_body,
      assunto_resumo: settings.summary_subject,
      msg_resumo: settings.summary_body
    };

    const { data, error } = await supabase.from('settings').upsert(payload).select().single();
    if (error) throw error;
    return data;
  }
};