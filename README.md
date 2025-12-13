# 🦅 LicitaManager

O **CRM completo para Consultores de Licitações**.  
> Sistema SaaS para gestão de processos licitatórios, automação de e-mails, controle financeiro e portal do cliente.

---

## 📋 Sobre o Projeto

O **LicitaManager** resolve a dor de assessores que gerenciam dezenas de licitações via planilhas e WhatsApp.  
O sistema centraliza a operação, automatiza avisos de prazos e oferece um portal exclusivo para que os clientes do assessor aprovem ou reprovem oportunidades.

---

## ✨ Principais Funcionalidades

### 🏢 Gestão de Clientes
CRM completo com dados da empresa e contratos.

### 📂 Gestão de Licitações
- Upload de múltiplos documentos (Edital, Termo de Referência, etc).
- Fluxo de Status (**Pendente → Ganha / Perdida**).
- Cálculo automático de comissões sobre êxito.

### 📧 Automação de E-mails (Edge Functions)
- Disparo de resumos com links para download de arquivos.
- Lembretes automáticos de prazos.
- Configuração de SMTP personalizado (o e-mail sai em nome do Assessor).

### 🔐 Portal do Cliente
Acesso restrito para o cliente visualizar apenas suas licitações e tomar decisões.

### 📊 Dashboard Financeiro
Visão clara de faturamento fixo vs. comissões variáveis.

---

## 🛠 Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS  
- **Bibliotecas:** React Router DOM, React Hook Form, Lucide Icons, React Toastify  
- **Backend (BaaS):** Supabase (PostgreSQL, Auth, Storage, Edge Functions)  
- **Email:** Nodemailer (via Deno Edge Functions)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)
- Conta no Supabase
- Supabase CLI (opcional, para deploy das functions)

---

### 1. Configuração do Supabase

1. Crie um novo projeto no Supabase.  
2. Vá em **SQL Editor** e rode o script de criação de tabelas (disponível na documentação do projeto ou solicite ao desenvolvedor).  
3. Vá em **Storage** e crie um bucket público chamado `bids`.  
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

---

### 2. Instalação do Frontend

```bash
# Clone o repositório
git clone https://github.com/douglaswbc/licitamanager.git

# Entre na pasta
cd licitamanager

# Instale as dependências
npm install

# Crie o arquivo de ambiente
cp .env.example .env

---

### 3. Configuração das Variáveis de Ambiente
Edite o arquivo .env na raiz do projeto:

VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE

---

### 4. Rodando Localmente
npm run dev

O projeto estará rodando em:
👉 http://localhost:3000

---

### ☁️ Deploy das Edge Functions (Backend)
- As funções de e-mail rodam no servidor do Supabase (Deno).
Login na CLI do Supabase
npx supabase login

---

### Vincule o projeto local ao projeto na nuvem
npx supabase link --project-ref ID_DO_SEU_PROJETO

### Configure as variáveis de ambiente no Supabase (se necessário)
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
Nota: As credenciais de SMTP são configuradas diretamente na UI do sistema, na tela de Configurações, e salvas no banco de dados.
---

### Deploy das Functions
npx supabase functions deploy send-summary
npx supabase functions deploy create-client-user
npx supabase functions deploy admin-create-user
npx supabase functions deploy check-reminders
---

### 📂 Estrutura de Pastas
src/
├── components/       # Componentes reutilizáveis (Modal, Layouts)
├── contexts/         # Contexto de Autenticação (AuthContext)
├── pages/            # Telas do sistema (Dashboard, Bids, Login)
├── services/         # Comunicação com Supabase (api.ts)
├── types/            # Tipagem TypeScript
└── App.tsx           # Rotas e configuração principal

supabase/
└── functions/        # Código Backend (Deno/TypeScript)
    ├── send-summary/ # Envio de e-mails com anexos
    └── ...
---

### 🛡️ Segurança e RLS

O sistema utiliza Row Level Security (RLS) do PostgreSQL:

Assessores: Apenas leem e editam dados criados por eles (user_id = auth.uid()).

Clientes (Portal): Apenas leem licitações vinculadas à sua empresa e atualizam o campo de Decisão.

Arquivos: O Storage possui políticas para permitir upload apenas para usuários autenticados, mas leitura pública (para facilitar o download via e-mail).

---

### 📄 Licença

Este projeto está sob a licença MIT.
Sinta-se à vontade para usar e modificar.

Desenvolvido com 💙 por Douglas W. B. Cuimar.