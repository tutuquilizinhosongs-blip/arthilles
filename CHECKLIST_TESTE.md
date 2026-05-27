# CHECKLIST DE TESTE RÁPIDO - ArthillesBot (WhatsApp)

## 1. Login e Painel
- [ ] Login com ADMIN_EMAIL / ADMIN_PASSWORD funciona
- [ ] Aba "WhatsApp" aparece

## 2. Credenciais da Evolution
- [ ] Preencha URL, API Key e Nome da Instância
- [ ] Clique em "Salvar Credenciais"
- [ ] Mensagem de sucesso aparece

## 3. Criar Instância
- [ ] Clique em "Criar Instância"
- [ ] Deve retornar sucesso (pode demorar alguns segundos)

## 4. QR Code
- [ ] Clique em "Gerar QR Code"
- [ ] QR Code aparece na tela
- [ ] Escaneie com WhatsApp Business
- [ ] Após escanear, clique em "Atualizar"
- [ ] Status deve mudar para "Conectado"

## 5. Webhook
- [ ] Clique em "Configurar Webhook"
- [ ] Deve mostrar sucesso

## 6. Teste de Mensagem
- [ ] Envie uma mensagem que existe na planilha de FAQ
- [ ] Bot responde automaticamente
- [ ] Envie pergunta desconhecida → cai no fallback para equipe

Se todos os passos acima funcionarem, a conexão WhatsApp está completa e operacional.
