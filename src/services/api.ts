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

  // Busca todos os perfis E a tabela de vinculo de clientes para montarmos a árvore
  getDataForAdminUsers: async () => {
    // 1. Busca perfis
    const { data: profiles, error: errProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (errProfiles) throw errProfiles;

    // 2. Busca relacionamentos
    let relationships = [];
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, user_id, auth_user_id, empresa'); 
      
      if (!error && data) {
        relationships = data;
      } else {
        console.warn("Aviso: Falha ao carregar vínculos.", error);
      }
    } catch (e) {
      console.warn("Erro silencioso:", e);
    }

    return { profiles, relationships };
  },

  // Chama a função cascata do banco
  toggleAssessorCascade: async (assessorId: string, isActive: boolean) => {
    const { error } = await supabase.rpc('toggle_assessor_status_cascade', {
      p_assessor_id: assessorId,
      p_active: isActive
    });
    if (error) throw error;
  },
  
  // --- AUTOMAÇÕES ---
  
  // Função para enviar o resumo IMEDIATAMENTE
  sendSummaryEmail: async (bidId: string, link: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}` // Envia token para segurança
      },
      // Agora enviamos apenas o ID, a Edge Function busca os anexos no banco
      body: JSON.stringify({ bidId }) 
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao enviar e-mail.');
    return result;
  },
  
  uploadFile: async (file: File) => {
    // 1. Limpa o nome do arquivo (Remove acentos, espaços e caracteres especiais)
    const cleanName = file.name
      .normalize('NFD') // Separa os acentos das letras
      .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
      .replace(/[^a-zA-Z0-9.-]/g, "_"); // Substitui qualquer coisa que não seja letra/número/ponto/traço por _

    // 2. Cria nome único com Timestamp
    const fileName = `${Date.now()}-${cleanName}`;
    
    // 3. Upload
    const { data, error } = await supabase.storage
      .from('bids')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Erro Supabase Storage:", error);
      throw error;
    }

    // 4. Pega URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('bids')
      .getPublicUrl(fileName);

    return {
      name: file.name, // Mantemos o nome original para exibição
      url: publicUrl,
      path: data.path
    };
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
      attachments: item.attachments || [], // <--- CORREÇÃO CRUCIAL: Mapeia o JSON do banco para o Frontend
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
      attachments: bid.attachments, // <--- CORREÇÃO CRUCIAL: Salva o array de arquivos no banco
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

  // --- PORTAL DO CLIENTE ---
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
        attachments: item.attachments || [], // <--- Também exibe os arquivos no portal
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
  getSettings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Se não encontrou linha (PGRST116), retorna objeto vazio para o form iniciar zerado
    if (error) {
      if (error.code === 'PGRST116') return {}; 
      console.error(error);
      return null;
    }
    
    // Converte qualquer valor NULL do banco em STRING VAZIA para o React não bugar
    return {
      id: data.id,
      user_id: data.user_id,
      email_remetente: data.email_remetente || '', 
      smtp_host: data.smtp_host || '',
      smtp_port: data.smtp_port || 587,
      smtp_user: data.smtp_user || '',
      smtp_pass: data.smtp_pass || '',
      assunto_lembrete: data.assunto_lembrete || 'Lembrete de Licitação',
      msg_lembrete: data.msg_lembrete || 'Olá {{CLIENTE}}, faltam 2 dias para a licitação {{LICITACAO}}.',
      assunto_resumo: data.assunto_resumo || 'Resumo da Licitação',
      msg_resumo: data.msg_resumo || 'Segue o resumo: {{LINK}}',
    }; 
  },

  saveSettings: async (settings: Settings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não logado");

    const payload = {
      user_id: user.id,
      email_remetente: settings.email_remetente,
      smtp_host: settings.smtp_host,
      smtp_port: settings.smtp_port,
      smtp_user: settings.smtp_user,
      smtp_pass: settings.smtp_pass,
      assunto_lembrete: settings.assunto_lembrete,
      msg_lembrete: settings.msg_lembrete,
      assunto_resumo: settings.assunto_resumo,
      msg_resumo: settings.msg_resumo,
      updated_at: new Date().toISOString()
    };

    // Verifica se já existe config para esse user
    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).single();

    if (existing) {
        // Update
        const { error } = await supabase
            .from('settings')
            .update(payload)
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        // Insert
        const { error } = await supabase
            .from('settings')
            .insert([payload]);
        if (error) throw error;
    }

    return true;
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