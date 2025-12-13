-- ==============================================================================
-- 1. LIMPEZA E CONFIGURAÇÃO INICIAL (Opcional, remove tabelas antigas se existirem)
-- ==============================================================================
-- DROP TABLE IF EXISTS public.licitacoes;
-- DROP TABLE IF EXISTS public.settings;
-- DROP TABLE IF EXISTS public.clients;
-- DROP TABLE IF EXISTS public.profiles;

-- Habilita extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABELAS
-- ==============================================================================

-- Tabela de Perfis (Vinculada ao Auth do Supabase)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'user'::text, -- 'admin', 'user' (assessor), 'client'
  active boolean DEFAULT false,   -- MODELO SAAS: Nasce bloqueado até pagar
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de Configurações (SMTP e Modelos de Email)
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_remetente text, -- Nome que aparece no e-mail (Ex: Águia Consultoria)
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  assunto_lembrete text DEFAULT 'Lembrete de Licitação',
  msg_lembrete text DEFAULT 'Olá {{CLIENTE}}, faltam 2 dias para a licitação {{LICITACAO}}.',
  assunto_resumo text DEFAULT 'Resumo da Licitação',
  msg_resumo text DEFAULT 'Segue o resumo da licitação: {{LINK}}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT settings_user_id_key UNIQUE (user_id) -- Garante 1 config por usuário
);

-- Tabela de Clientes (Empresas que o Assessor atende)
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Dono do cliente (Assessor)
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Login do Portal do Cliente
  nome text NOT NULL,
  email text NOT NULL,
  empresa text,
  contract_value numeric(10,2) DEFAULT 0,
  commission_rate numeric(5,2) DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de Licitações (Oportunidades)
CREATE TABLE public.licitacoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Assessor responsável
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  data_licitacao timestamp with time zone,
  link_docs text,
  attachments jsonb DEFAULT '[]'::jsonb, -- LISTA DE ARQUIVOS (PDFs)
  status text DEFAULT 'Pendente', -- Pendente, Aguardando Cliente, Ganha, Perdida...
  
  -- Campos de Automação
  lembrete_enviado boolean DEFAULT false,
  link_resumo text,
  resumo_enviado_em timestamp with time zone,
  
  -- Portal do Cliente
  decisao_cliente text, -- 'Participar', 'Descartar'
  data_decisao timestamp with time zone,
  
  -- Financeiro
  final_value numeric(15,2),
  commission_rate numeric(5,2),
  financial_status text DEFAULT 'aguardando_nota', -- 'aguardando_nota', 'pendente', 'pago'
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- ==============================================================================
-- 3. TRIGGERS E FUNÇÕES (Automação de Banco)
-- ==============================================================================

-- Função: Cria Profile automaticamente ao registrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, active)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    false -- IMPORTANTE: Nasce inativo (Flow de Pagamento)
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Dispara a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função Admin: Bloqueio em Cascata (Assessor -> Clientes)
CREATE OR REPLACE FUNCTION toggle_assessor_status_cascade(p_assessor_id uuid, p_active boolean)
RETURNS void AS $$
BEGIN
  -- 1. Atualiza o status do Assessor
  UPDATE public.profiles SET active = p_active WHERE id = p_assessor_id;
  
  -- 2. Atualiza o status de todos os Clientes vinculados a ele na tabela 'clients'
  UPDATE public.clients SET active = p_active WHERE user_id = p_assessor_id;
  
  -- 3. Se os clientes tiverem login de portal (auth_user_id), bloqueia/libera o profile deles também
  UPDATE public.profiles 
  SET active = p_active 
  WHERE id IN (SELECT auth_user_id FROM public.clients WHERE user_id = p_assessor_id AND auth_user_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - Segurança
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS: SETTINGS
CREATE POLICY "Users manage own settings" ON settings FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: CLIENTS
-- Assessor vê seus clientes
CREATE POLICY "Assessors manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);
-- Cliente (Portal) vê seu próprio registro
CREATE POLICY "Clients read own data" ON clients FOR SELECT USING (auth.uid() = auth_user_id);

-- POLÍTICAS: LICITACOES
-- Assessor vê/edita tudo que criou
CREATE POLICY "Assessors manage own bids" ON licitacoes FOR ALL USING (auth.uid() = user_id);

-- Cliente (Portal) VÊ as licitações vinculadas a ele
CREATE POLICY "Portal clients view own bids" ON licitacoes FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);

-- Cliente (Portal) ATUALIZA apenas a decisão
CREATE POLICY "Portal clients update decision" ON licitacoes FOR UPDATE USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
) WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);

-- ADMIN (Política Global Opcional - Admin vê tudo)
-- (Geralmente admin usa Supabase Dashboard, mas se tiver painel admin no app, adicione policies checando role='admin')

-- ==============================================================================
-- 5. STORAGE (Arquivos PDF)
-- ==============================================================================

-- Criação do Bucket (Se der erro de já existente, ignore)
INSERT INTO storage.buckets (id, name, public) VALUES ('bids', 'bids', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer um pode baixar (Para o cliente baixar sem logar se receber por email)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'bids' );

-- Política: Apenas usuários logados (Assessores) fazem upload
CREATE POLICY "Auth Uploads" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'bids' AND auth.role() = 'authenticated' );

-- Política: Apenas usuários logados deletam
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE 
USING ( bucket_id = 'bids' AND auth.role() = 'authenticated' );

-- ==============================================================================
-- 6. DADOS INICIAIS (Seed do seu Usuário Admin)
-- ==============================================================================

-- Atualiza seu usuário principal para ser ADMIN e ATIVO
-- Substitua pelo seu email real se necessário
UPDATE public.profiles 
SET role = 'admin', active = true 
WHERE email = 'licitamanager@gmail.com'; 
-- (Ou qualquer email que você usou para criar a conta inicial)