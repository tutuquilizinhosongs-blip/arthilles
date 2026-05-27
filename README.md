# ArthillesBot - MVP Simples para WhatsApp (Gratuito)

Sistema **pronto para vender** para pequenos negócios por R$300+.

Funciona 100% sem IA paga. Tudo via Google Sheets + Supabase gratuito.

## Como Funciona (para leigos)

- Cliente manda mensagem no WhatsApp
- Se a pergunta estiver na sua planilha do Google Sheets → responde sozinho
- Se não souber → responde: "Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes."
- Salva tudo (clientes, mensagens, agendamentos e dúvidas) no painel
- Você atende as dúvidas pendentes manualmente depois

## Conexão com WhatsApp (Evolution API)

A partir da versão atual, você pode conectar o WhatsApp **diretamente pelo painel**, sem precisar mexer em código ou variáveis de ambiente:

1. Acesse o painel → aba **WhatsApp**
2. Cole as credenciais da sua Evolution API (URL, API Key e Nome da Instância)
3. Clique em **Salvar Credenciais**
4. Clique em **Criar Instância**
5. Clique em **Gerar QR Code** e escaneie com o WhatsApp
6. Clique em **Configurar Webhook** (importante!)

O sistema mostra o status da conexão em tempo real (Desconectado / Aguardando QR / Conectado).

As credenciais ficam salvas com segurança no Supabase. Variáveis de ambiente continuam funcionando como fallback.

---

## O que você precisa ter (tudo gratuito)

1. Conta no GitHub
2. Conta no Supabase (gratuito)
3. Conta no Railway (plano gratuito)
4. Conta no Vercel (Hobby gratuito)
5. Uma planilha Google Sheets
6. Uma Evolution API (procure por "Evolution API hospedagem" - opções baratas ou gratuitas)

---

## Deploy em 4 Passos (Copie e Cole)

### Passo 1: Banco de Dados (Supabase)

1. Crie projeto em https://supabase.com
2. Vá em **SQL Editor** → cole todo o conteúdo de `supabase/schema.sql` e execute
3. Copie as chaves (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)

### Passo 2: Planilha de Respostas (Google Sheets)

Crie uma planilha com colunas `pergunta,resposta`, publique como CSV e copie o link.

### Passo 3: Backend (Railway)

- Root Directory = `backend`
- Adicione todas as variáveis (veja `.env.example`)
- Deploy

### Passo 4: Dashboard (Vercel)

- Root Directory = `dashboard`
- Adicione `NEXT_PUBLIC_API_URL` apontando para o Railway
- Deploy

Após o deploy, acesse o painel e configure o WhatsApp pela aba **WhatsApp** (veja seção acima).

---

## Teste em 5-10 Minutos

Use o arquivo `CHECKLIST_TESTE.md`.

Principais testes:
- Login
- Salvar credenciais da Evolution
- Criar instância
- Gerar QR Code e escanear
- Configurar webhook
- Enviar mensagem e ver resposta automática

---

## Arquivos Importantes

- `CHECKLIST_PRODUCAO.md`
- `CHECKLIST_TESTE.md`
- `.env.example`
- `supabase/schema.sql`

Feito com foco em simplicidade e estabilidade para pequenos negócios.
