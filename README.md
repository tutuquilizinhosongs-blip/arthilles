# Arthilles - WhatsApp Bot MVP (Simples e Gratuito)

**Sistema simples de atendimento automático no WhatsApp** para vender para pequenos negócios (R$ 300+).

- 100% gratuito para rodar (Vercel + Railway + Supabase)
- Sem OpenAI, Twilio, OpenRouter obrigatório ou n8n
- FAQ via Google Sheets (público CSV)
- Fallback automático para atendimento humano
- Agendamento simples
- Painel web limpo

## Funcionalidades

- Login de administrador
- Dashboard com: Clientes, Mensagens, Agendamentos, Dúvidas não respondidas, Status
- Respostas automáticas por FAQ do Google Sheets
- Quando não encontra na FAQ: envia mensagem de encaminhamento + salva a dúvida no Supabase
- Coleta de agendamento passo a passo pelo WhatsApp
- Tudo configurado por variáveis de ambiente

## Stack (todas gratuitas)

- **Frontend**: Next.js → Vercel (Hobby gratuito)
- **Backend**: Node.js + Express → Railway (plano gratuito/trial)
- **Banco**: Supabase (plano gratuito)
- **FAQ**: Google Sheets (CSV público)
- **WhatsApp**: Evolution API (open source / self-hosted)

## Como funciona o Bot (fluxo simples)

1. Cliente manda mensagem no WhatsApp
2. Backend recebe via webhook da Evolution API
3. Procura a pergunta na planilha do Google Sheets
4. Se encontrar → responde com a resposta da planilha
5. Se **não** encontrar → responde:
   > "Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes."
   e salva a pergunta na tabela `unknown_questions`
6. Se o cliente digitar "agendar", "marcar", "horário" etc → inicia coleta de dados para agendamento

## Variáveis de Ambiente Necessárias

```env
NODE_ENV=production
LOG_LEVEL=info
BACKEND_PUBLIC_URL=https://seu-backend.up.railway.app
DASHBOARD_PUBLIC_URL=https://seu-dashboard.vercel.app
CORS_ORIGIN=https://seu-dashboard.vercel.app

AUTH_SECRET=sua_chave_secreta_forte
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=sua_senha_forte

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

GOOGLE_SHEETS_CSV_URL=https://docs.google.com/spreadsheets/.../export?format=csv

EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua_key
EVOLUTION_INSTANCE_NAME=nome-da-instancia
```

---

## Deploy Passo a Passo (Completo)

### 1. Supabase (gratuito)

1. Crie conta em https://supabase.com
2. Novo projeto (região South America se possível)
3. Vá em **SQL Editor** → New query
4. Cole **todo** o conteúdo de `supabase/schema.sql`
5. Execute
6. Vá em **Project Settings → API** e copie:
   - Project URL → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Google Sheets (FAQ)

1. Crie uma planilha Google
2. Na primeira aba, coloque exatamente estas colunas na linha 1:
   ```
   pergunta,resposta
   ```
3. Preencha algumas linhas de exemplo:
   ```
   Qual o horário de funcionamento?,Funcionamos de segunda a sexta das 8h às 18h.
   Quanto custa?,Nossos serviços começam a partir de R$ 150.
   ```
4. Compartilhar → Publicar na web → Escolha a aba → CSV → Copie o link
5. Cole esse link na variável `GOOGLE_SHEETS_CSV_URL`

### 3. Backend (Railway)

1. Entre em https://railway.app
2. New Project → Deploy from GitHub repo → selecione `arthilles`
3. Em **Settings** do serviço:
   - Root Directory: `backend`
   - **NÃO** use Dockerfile por enquanto (Railway usa Nixpacks para Node)
   - Start Command: `npm start`
4. Variáveis → adicione todas as do backend (veja .env.example)
5. Deploy
6. Após deploy, copie a URL pública (ex: https://arthilles-backend.up.railway.app)

### 4. Dashboard (Vercel)

1. Entre em https://vercel.com
2. New Project → importe o repositório `arthilles`
3. Root Directory: `dashboard`
4. Adicione a variável:
   - `NEXT_PUBLIC_API_URL` = URL do backend Railway
5. Deploy

### 5. Evolution API (WhatsApp)

1. Hospede ou use uma Evolution API acessível (várias opções open source gratuitas/baratas)
2. Crie uma instância
3. No painel do Arthilles (dashboard), vá em Configurações ou use as variáveis
4. Configure o webhook no Evolution para:
   `https://SEU-BACKEND.up.railway.app/webhook/evolution`

### 6. Teste final

- Acesse o dashboard
- Faça login com o admin
- Mande mensagem no WhatsApp conectado
- Veja os dados aparecendo no painel

---

## Estrutura do Projeto (simples)

```
arthilles/
├── backend/          # Node + Express
├── dashboard/        # Next.js
├── supabase/         # schema.sql
└── README.md
```

## Licença
MIT - Use livremente, inclusive para revenda.
