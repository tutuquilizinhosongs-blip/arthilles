# ArthillesBot - MVP Simples para WhatsApp (Gratuito)

Sistema **pronto para vender** para pequenos negócios por R$300+.

Funciona 100% sem IA paga. Tudo via Google Sheets + Supabase gratuito.

## Como Funciona (para leigos)

- Cliente manda mensagem no WhatsApp
- Se a pergunta estiver na sua planilha do Google Sheets → responde sozinho
- Se não souber → responde: "Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes."
- Salva tudo (clientes, mensagens, agendamentos e dúvidas) no painel
- Você atende as dúvidas pendentes manualmente depois

## O que você precisa ter (tudo gratuito)

1. Conta no GitHub
2. Conta no Supabase (gratuito)
3. Conta no Railway (plano gratuito)
4. Conta no Vercel (Hobby gratuito)
5. Uma planilha Google Sheets
6. Uma Evolution API (para conectar WhatsApp - existem opções baratas/grátis)

---

## Deploy em 4 Passos (Copie e Cole)

### Passo 1: Banco de Dados (Supabase) - 4 minutos

1. Entre em https://supabase.com e crie conta
2. Clique em **New Project**
3. Crie o projeto (escolha região mais próxima do Brasil)
4. Depois de criado, vá em **SQL Editor** (no menu lateral)
5. Clique em **New query**
6. Abra o arquivo `supabase/schema.sql` deste repositório
7. **Cole todo o conteúdo** e clique em **Run**
8. Vá em **Project Settings → API** e copie as três chaves:
   - Project URL → SUPABASE_URL
   - anon public → SUPABASE_ANON_KEY
   - service_role → SUPABASE_SERVICE_ROLE_KEY

### Passo 2: Planilha de Respostas (Google Sheets) - 3 minutos

1. Crie uma planilha nova no Google
2. Na primeira linha escreva exatamente:
   `pergunta,resposta`
3. Nas linhas de baixo coloque suas respostas (exemplo):
   ```
   Qual o horário de atendimento?,Funcionamos de segunda a sexta das 8h às 18h.
   Quanto custa?,Nossos serviços começam em R$ 150.
   ```
4. Clique em **Arquivo → Compartilhar → Publicar na web**
5. Selecione a aba → Formato CSV → **Publicar**
6. Copie o link que aparece e guarde (essa é sua GOOGLE_SHEETS_CSV_URL)

### Passo 3: Backend (Railway) - 8 minutos

1. Entre em https://railway.app e faça login com GitHub
2. Clique em **New Project** → **Deploy from GitHub Repo**
3. Selecione este repositório (`arthilles`)
4. No serviço criado, clique em **Settings**:
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Healthcheck Path: `/health`
5. Vá em **Variables** e cole todas as variáveis abaixo (substitua pelos seus valores):

```env
NODE_ENV=production
BACKEND_PUBLIC_URL= (cole depois do deploy)
DASHBOARD_PUBLIC_URL= (cole depois)
CORS_ORIGIN=https://seu-dashboard.vercel.app
AUTH_SECRET=qualquercoisaforte123
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=suasenha123
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_SHEETS_CSV_URL=https://docs.google.com/.../export?format=csv
EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua_chave
EVOLUTION_INSTANCE_NAME=arthilles
```

6. Clique em **Deploy**
7. Após terminar, copie a URL que aparece (ex: https://arthilles-production.up.railway.app)

### Passo 4: Painel Web (Vercel) - 5 minutos

1. Entre em https://vercel.com e faça login com GitHub
2. Clique em **Add New Project**
3. Selecione o repositório `arthilles`
4. Em **Root Directory** escolha `dashboard`
5. Em Environment Variables adicione:
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: a URL do Railway que você copiou
6. Clique em **Deploy**
7. Após terminar, copie a URL do seu painel

---

## Configurar o WhatsApp (Evolution API)

1. Tenha uma instância da Evolution API rodando (procure no Google por "Evolution API hospedagem" - existem opções por ~R$15-30/mês ou gratuitas)
2. Crie uma instância nova
3. No campo Webhook coloque:
   `https://SEU-BACKEND.up.railway.app/webhook/evolution`
4. Salve
5. Conecte o QR Code no WhatsApp Business

Pronto. O bot já está respondendo.

---

## Teste em 5 Minutos

Use o arquivo `CHECKLIST_TESTE.md`.

Testes principais:
- Login no painel
- FAQ respondendo automaticamente
- Pergunta desconhecida caindo no fallback
- Fluxo de agendamento funcionando
- Dados aparecendo no painel

---

## Arquivos Importantes

- `.env.example` → todas as variáveis explicadas
- `CHECKLIST_PRODUCAO.md` → passo a passo de produção
- `CHECKLIST_TESTE.md` → como validar se está tudo certo
- `supabase/schema.sql` → banco de dados

---

## Suporte

Este é um MVP simples e estável feito para ser vendido e mantido facilmente.

Qualquer dúvida técnica, o código está limpo e comentado.
