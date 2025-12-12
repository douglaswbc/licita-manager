-- ==============================================================================
-- 1. CONFIGURAÇÕES INICIAIS E EXTENSÕES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. GARANTIA DA ESTRUTURA DAS TABELAS
-- ==============================================================================

-- Tabela: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text DEFAULT 'user', -- 'admin', 'user' (assessor), 'client'
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela: CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id), -- O Assessor dono deste cliente
  auth_user_id uuid REFERENCES auth.users(id), -- O Login do Portal deste cliente
  nome text NOT NULL,
  email text NOT NULL,
  empresa text,
  contract_value numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0,
  active boolean DEFAULT true,
  access_token uuid DEFAULT uuid_generate_v4(), -- Para link mágico (legado)
  created_at timestamptz DEFAULT now()
);

-- Tabela: LICITACOES
CREATE TABLE IF NOT EXISTS public.licitacoes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id), -- O Assessor
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  data_licitacao date NOT NULL,
  link_docs text,
  status text DEFAULT 'Pendente',
  decisao_cliente text DEFAULT 'Pendente',
  data_decisao timestamptz,
  final_value numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0,
  financial_status text DEFAULT 'aguardando_nota',
  lembrete_enviado boolean DEFAULT false,
  lembrete_enviado_em timestamptz,
  link_resumo text,
  resumo_enviado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela: SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_remetente text,
  smtp_host text,
  smtp_port int,
  smtp_user text,
  smtp_pass text,
  assunto_lembrete text DEFAULT 'Lembrete de Licitação',
  msg_lembrete text DEFAULT 'Olá {{CLIENTE}}, faltam 2 dias para a licitação {{LICITACAO}}.',
  assunto_resumo text DEFAULT 'Resumo da Licitação',
  msg_resumo text DEFAULT 'Segue o resumo: {{LINK}}',
  created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 3. FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- ==============================================================================

-- Função vital para evitar Loop Infinito nas políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Trigger para criar perfil automaticamente ao cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'user'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antigo se existir e recria
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURANÇA (RLS) - LIMPEZA E RECRIAÇÃO
-- ==============================================================================

-- Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- --- TABELA PROFILES ---
DROP POLICY IF EXISTS "Profiles: Leitura Geral" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Atualizacao" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Insercao" ON public.profiles;

-- Quem pode ver perfis?
-- 1. Admin vê tudo.
-- 2. Usuário vê a si mesmo.
-- 3. Assessor vê os perfis dos seus clientes (para listar na árvore).
CREATE POLICY "Profiles: Leitura Geral" ON public.profiles
FOR SELECT USING (
  is_admin() 
  OR id = auth.uid()
  OR id IN (SELECT auth_user_id FROM public.clients WHERE user_id = auth.uid())
);

-- Quem pode atualizar?
-- Admin (para bloquear) ou o próprio dono.
CREATE POLICY "Profiles: Atualizacao" ON public.profiles
FOR UPDATE USING ( is_admin() OR id = auth.uid() );

-- Quem pode inserir? (Trigger do sistema)
CREATE POLICY "Profiles: Insercao" ON public.profiles
FOR INSERT WITH CHECK (true);


-- --- TABELA CLIENTS ---
DROP POLICY IF EXISTS "Clients: Admin Total" ON public.clients;
DROP POLICY IF EXISTS "Clients: Assessor Total" ON public.clients;
DROP POLICY IF EXISTS "Clients: Portal Leitura" ON public.clients;

-- Admin faz tudo
CREATE POLICY "Clients: Admin Total" ON public.clients FOR ALL USING ( is_admin() );

-- Assessor vê e edita APENAS os clientes criados por ele
CREATE POLICY "Clients: Assessor Total" ON public.clients FOR ALL USING ( user_id = auth.uid() );

-- Cliente do Portal VÊ apenas o seu próprio cadastro
CREATE POLICY "Clients: Portal Leitura" ON public.clients FOR SELECT USING ( auth_user_id = auth.uid() );


-- --- TABELA LICITACOES ---
DROP POLICY IF EXISTS "Bids: Admin Total" ON public.licitacoes;
DROP POLICY IF EXISTS "Bids: Assessor Total" ON public.licitacoes;
DROP POLICY IF EXISTS "Bids: Portal Leitura" ON public.licitacoes;
DROP POLICY IF EXISTS "Bids: Portal Decisao" ON public.licitacoes;

-- Admin faz tudo
CREATE POLICY "Bids: Admin Total" ON public.licitacoes FOR ALL USING ( is_admin() );

-- Assessor vê e edita suas licitações
CREATE POLICY "Bids: Assessor Total" ON public.licitacoes FOR ALL USING ( user_id = auth.uid() );

-- Cliente do Portal VÊ licitações vinculadas a ele
CREATE POLICY "Bids: Portal Leitura" ON public.licitacoes FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);

-- Cliente do Portal ATUALIZA (decisão) nas licitações dele
CREATE POLICY "Bids: Portal Decisao" ON public.licitacoes FOR UPDATE USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);


-- --- TABELA SETTINGS ---
DROP POLICY IF EXISTS "Settings: Dono" ON public.settings;

CREATE POLICY "Settings: Dono" ON public.settings
FOR ALL USING ( user_id = auth.uid() );

-- ==============================================================================
-- 5. FUNÇÃO PARA BLOQUEIO EM CASCATA (Assessor -> Clientes)
-- ==============================================================================
CREATE OR REPLACE FUNCTION toggle_assessor_status_cascade(p_assessor_id uuid, p_active boolean)
RETURNS void AS $$
BEGIN
  -- Atualiza Assessor
  UPDATE public.profiles SET active = p_active WHERE id = p_assessor_id;
  -- Atualiza Clientes dele
  UPDATE public.profiles
  SET active = p_active
  WHERE id IN (SELECT auth_user_id FROM public.clients WHERE user_id = p_assessor_id AND auth_user_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. PERMISSÕES FINAIS E ADMIN
-- ==============================================================================

-- Força atualização do cache da API para garantir que colunas novas apareçam
NOTIFY pgrst, 'reload schema';

-- Define o Admin Supremo
UPDATE public.profiles 
SET role = 'admin', active = true 
WHERE email = 'licitamanager@gmail.com';