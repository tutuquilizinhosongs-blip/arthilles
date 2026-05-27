## Arthilles - Sistema de Atendimento WhatsApp (MVP Simples)

**Versão simples, estável e 100% gratuita** para vender para pequenos negócios por R$ 300 ou mais.

- Sem OpenAI, OpenRouter, Twilio ou n8n
- Funciona só com Google Sheets + Supabase + Evolution API
- Fallback automático para atendimento humano
- Agendamento simples pelo WhatsApp
- Painel web limpo

## O que o sistema faz

1. Cliente manda mensagem no WhatsApp
2. Se a pergunta bater com a FAQ do Google Sheets → responde automaticamente
3. Se não encontrar → responde:
   > "Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes."
   e salva a dúvida no Supabase para você atender depois
4. Se o cliente quiser agendar (digitar "agendar", "marcar", "horário" etc) → o bot coleta nome, serviço, data e horário e salva no banco

## Stack (todas gratuitas)

- Frontend: Next.js → Vercel (Hobby)
- Backend: Node.js + Express → Railway (plano gratuito)
- Banco: Supabase (plano gratuito)
- FAQ: Google Sheets (CSV público)
- WhatsApp: Evolution API (open source)

---

## 1. Variáveis de Ambiente (obrigatórias)

Crie um arquivo `.env` no backend com:

```env
NODE_ENV=production
LOG_LEVEL=info

BACKEND_PUBLIC_URL=https://seu-backend.up.railway.app
DASHBOARD_PUBLIC_URL=https://seu-dashboard.vercel.app
CORS_ORIGIN=https://seu-dashboard.vercel.app

AUTH_SECRET=qualquer_coisa_forte_aqui
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=sua_senha_forte

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GOOGLE_SHEETS_CSV_URL=https://docs.google.com/.../export?format=csv

EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua_chave
EVOLUTION_INSTANCE_NAME=nome_da_instancia
```

---

## 2. Como Fazer o Deploy Completo (Passo a Passo)

### Passo 1: Supabase (5 minutos)

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto (escolha região South America se disponível)
3. Vá em **SQL Editor** → **New query**
4. Abra o arquivo `supabase/schema.sql` deste repositório e cole **todo** o conteúdo
5. Clique em **Run** ou Ctrl+Enter
6. Vá em **Project Settings → API** e copie as 3 chaves:
   - `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Passo 2: Google Sheets FAQ (3 minutos)

1. Crie uma planilha no Google Sheets
2. Na linha 1 coloque exatamente:
   ```
   pergunta,resposta
   ```
3. Nas linhas seguintes coloque suas perguntas e respostas:
   ```
   Qual o horário?,Funcionamos de seg a sex das 08h às 18h.
   Quanto custa o serviço?,A partir de R$ 120.
   ```
4. Clique em **Arquivo → Compartilhar → Publicar na web**
5. Escolha a aba → Formato: **CSV** → Publique
6. Copie o link gerado e use como `GOOGLE_SHEETS_CSV_URL`

### Passo 3: Backend no Railway (10 minutos)

1. Acesse https://railway.app
2. Faça login com GitHub
3. Clique em **New Project** → **Deploy from GitHub Repo**
4. Selecione o repositório `arthilles`
5. Em **Settings** do serviço que foi criado:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/health`
6. Vá em **Variables** e cole todas as variáveis acima
7. Clique em **Deploy**
8. Após o deploy, copie a URL pública que o Railway gerou (ex: `https://arthilles-backend.up.railway.app`)

> **Importante**: Não precisa de Dockerfile. O Railway roda Node.js nativamente.

### Passo 4: Dashboard no Vercel (5 minutos)

1. Acesse https://vercel.com
2. New Project → importe o repositório `arthilles`
3. Em **Root Directory** selecione `dashboard`
4. Em Environment Variables adicione:
   - `NEXT_PUBLIC_API_URL` = a URL do backend que você copiou no passo anterior
5. Clique em Deploy

### Passo 5: Conectar o WhatsApp (Evolution API)

1. Tenha uma Evolution API rodando (pode ser gratuita ou barata)
2. Crie uma instância
3. No Evolution, configure o Webhook para:
   `https://SEU-BACKEND.up.railway.app/webhook/evolution`
4. Teste enviando uma mensagem

---

## 3. Como Testar o Sistema

### Teste 1 - Status

Abra no navegador:
`https://SEU-BACKEND.up.railway.app/health`

Deve retornar `{ "ok": true }`

### Teste 2 - Login no Painel

1. Acesse `https://seu-dashboard.vercel.app`
2. Use o email e senha que você colocou nas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`
3. Você verá o painel

### Teste 3 - FAQ

- Coloque na planilha: `Qual o horário?,Funcionamos das 8h às 18h`
- Envie "Qual o horário?" no WhatsApp
- O bot deve responder automaticamente

### Teste 4 - Fallback (Dúvida desconhecida)

- Envie uma pergunta que não está na planilha
- O bot responde: "Sua pergunta foi encaminhada para nossa equipe..."
- Atualize o painel → aba "Dúvidas Pendentes" deve mostrar a pergunta

### Teste 5 - Agendamento

- Envie "agendar" ou "quero marcar"
- Siga o fluxo: nome → serviço → data → horário
- Verifique no painel em "Agendamentos"

---

## 4. Arquivos Criados

- `backend/` - Todo o backend Node/Express
- `dashboard/` - Painel Next.js
- `supabase/schema.sql` - Banco de dados
- `README.md` - Esta documentação

## 5. URLs Importantes

- Backend Health: `SEU-BACKEND/health`
- Backend Status: `SEU-BACKEND/status`
- Dashboard: `SEU-DASHBOARD`
- Webhook Evolution: `SEU-BACKEND/webhook/evolution`

---

## Dicas para Vender

- Instale para o cliente em menos de 30 minutos
- Personalize as respostas da planilha com o nome da empresa dele
- Ofereça 1 mês de suporte como bônus
- O sistema é simples de manter e explicar

Feito com foco em simplicidade e estabilidade.
