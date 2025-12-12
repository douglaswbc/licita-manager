import { supabase } from '../lib/supabase';
import { Bid, Client, Settings, Profile } from '../types';

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

  // --- CLIENTES ---
  // Função para criar o login do cliente
  createClientUser: async (clientId: string, email: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Senha padrão definida
    const defaultPassword = "mudar@1234"; 

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-client-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ 
        clientId, 
        email, 
        password: defaultPassword 
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao criar acesso');
    return result;
  },
  
  // --- CLIENTES ---
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.nome,      
      email: item.email,
      company: item.empresa,
      access_token: item.access_token,
      contract_value: item.contract_value,
      commission_rate: item.commission_rate,
      active: item.active,
      created_at: item.created_at
    })) || [];
  },

  saveClient: async (client: Partial<Client>) => {
    const { user } = (await supabase.auth.getUser()).data;
    const payload = {
      id: client.id,
      nome: client.name,
      email: client.email,
      empresa: client.company,
      contract_value: client.contract_value || 0,
      commission_rate: client.commission_rate || 0,
      user_id: user?.id
    };
    const { data, error } = await supabase.from('clients').upsert(payload).select().single();
    if (error) throw error;
    return data;
  },

  toggleClientStatus: async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('clients').update({ active: isActive }).eq('id', id);
    if (error) throw error;
  },

  deleteClient: async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  // --- LICITAÇÕES ---
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
      decision_at: item.data_decisao,
      final_value: item.final_value,
      commission_rate: item.commission_rate,
      financial_status: item.financial_status || 'aguardando_nota'
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
      final_value: bid.final_value || 0,
      commission_rate: bid.commission_rate || 0,
      financial_status: bid.financial_status,
      user_id: user?.id
    };
    const { data, error } = await supabase.from('licitacoes').upsert(payload).select().single();
    if (error) throw error;
    return data;
  },

  updateFinancialStatus: async (bidId: string, status: string) => {
    const { error } = await supabase.from('licitacoes').update({ financial_status: status }).eq('id', bidId);
    if (error) throw error;
  },

  deleteBid: async (id: string) => {
    const { error } = await supabase.from('licitacoes').delete().eq('id', id);
    if (error) throw error;
  },

  // --- PORTAL (NOVA LÓGICA: Baseada no Usuário Logado) ---
  getClientPortalData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não logado");

    // 1. Busca os dados do cliente vinculado a este usuário
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (clientError || !clientData) throw new Error("Cadastro de cliente não encontrado.");

    // 2. Busca as licitações desse cliente
    const { data: bidsData, error: bidsError } = await supabase
      .from('licitacoes')
      .select('*')
      .eq('client_id', clientData.id)
      .order('data_licitacao', { ascending: false });

    if (bidsError) throw bidsError;

    return {
      client: clientData,
      bids: bidsData.map((item: any) => ({
        id: item.id,
        title: item.titulo,
        date: item.data_licitacao,
        link_docs: item.link_docs,
        status: item.status,
        decision: item.decisao_cliente || 'Pendente',
        decision_at: item.data_decisao,
        final_value: item.final_value,
        financial_status: item.financial_status
      }))
    };
  },

  // Salvar decisão (agora usando RLS padrão, pois o usuário está logado!)
  saveClientDecision: async (bidId: string, decision: string) => {
    let novoStatus = 'Aguardando Cliente';
    if (decision === 'Participar') novoStatus = 'Aguardando Licitação';
    if (decision === 'Descartar') novoStatus = 'Descartada';

    const { error } = await supabase
      .from('licitacoes')
      .update({ 
        decisao_cliente: decision,
        data_decisao: new Date().toISOString(),
        status: novoStatus
      })
      .eq('id', bidId);
      
    if (error) throw error;
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<Settings | null> => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error && error.code !== 'PGRST116') return null;
    if (!data) return null;
    
    return {
      email_sender: data.email_remetente,
      reminder_subject: data.assunto_lembrete,
      reminder_body: data.msg_lembrete,
      summary_subject: data.assunto_resumo,
      summary_body: data.msg_resumo,
      smtp_host: data.smtp_host,
      smtp_port: data.smtp_port,
      smtp_user: data.smtp_user,
      smtp_pass: data.smtp_pass
    };
  },

  saveSettings: async (settings: Settings) => {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) throw new Error("Usuário não logado");

    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).maybeSingle();

    const payload = {
      id: existing?.id, 
      user_id: user.id,
      email_remetente: settings.email_sender,
      assunto_lembrete: settings.reminder_subject,
      msg_lembrete: settings.reminder_body,
      assunto_resumo: settings.summary_subject,
      msg_resumo: settings.summary_body,
      smtp_host: settings.smtp_host,
      smtp_port: settings.smtp_port,
      smtp_user: settings.smtp_user,
      smtp_pass: settings.smtp_pass
    };

    const { error } = await supabase.from('settings').upsert(payload);
    if (error) throw error;
  },

  // --- ADMIN ---
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },

  getAllUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const { error } = await supabase.from('profiles').update({ active: isActive }).eq('id', userId);
    if (error) throw error;
  },

  adminCreateUser: async (email: string, password: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao criar usuário');
    return result;
  }
};