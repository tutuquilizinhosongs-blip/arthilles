# CHECKLIST DE PRODUÇÃO - ArthillesBot MVP

Siga esta lista em ordem. Não pule etapas.

## 1. Supabase
- [ ] Criar projeto gratuito
- [ ] Executar TODO o conteúdo de `supabase/schema.sql` no SQL Editor
- [ ] Copiar SUPABASE_URL, ANON_KEY e SERVICE_ROLE_KEY

## 2. Google Sheets
- [ ] Criar planilha com colunas exatas: `pergunta,resposta`
- [ ] Publicar aba como CSV
- [ ] Copiar link do CSV para GOOGLE_SHEETS_CSV_URL

## 3. Railway (Backend)
- [ ] Conectar repositório
- [ ] Root Directory = `backend`
- [ ] Start Command = `npm start`
- [ ] Adicionar TODAS as variáveis do `.env.example`
- [ ] Fazer Deploy
- [ ] Copiar URL pública gerada

## 4. Vercel (Dashboard)
- [ ] Conectar repositório
- [ ] Root Directory = `dashboard`
- [ ] Adicionar variável `NEXT_PUBLIC_API_URL` com a URL do Railway
- [ ] Deploy

## 5. Configurar WhatsApp (Novo - Opção A)
- [ ] Após deploy, acesse o painel
- [ ] Vá na aba **WhatsApp**
- [ ] Cole as credenciais da sua Evolution API (URL, Key, Instance Name)
- [ ] Clique em "Salvar Configurações do WhatsApp"
- [ ] (Opcional) Use o botão de status para testar a conexão

## 6. Testes Básicos
- [ ] Abrir /health do backend → deve retornar ok
- [ ] Fazer login no dashboard
- [ ] Ver abas carregando sem erro
- [ ] Testar uma pergunta da planilha no WhatsApp
- [ ] Testar pergunta desconhecida (deve cair no fallback)

Pronto. Sistema operacional sem custo mensal.
