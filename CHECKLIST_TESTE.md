# CHECKLIST DE TESTE RÁPIDO (5-10 minutos)

Use este checklist após o deploy para validar que tudo funciona.

## Teste 1: Saúde do Backend
1. Abra: `SEU-BACKEND/health`
2. Deve retornar JSON com `"ok": true`

## Teste 2: Login no Painel
1. Abra o Dashboard (Vercel)
2. Use ADMIN_EMAIL e ADMIN_PASSWORD
3. Deve entrar e mostrar as abas

## Teste 3: Status
1. No painel, vá na aba **Status**
2. Verifique se supabase e sheets aparecem como 'ok'

## Teste 4: FAQ Funcionando
1. Na planilha, adicione: `Qual o horário?,Funcionamos das 8h às 18h`
2. No WhatsApp conectado, envie: "Qual o horário?"
3. Bot deve responder exatamente o texto da planilha

## Teste 5: Fallback (Pergunta Desconhecida)
1. Envie no WhatsApp uma pergunta que NÃO está na planilha
2. Bot deve responder:
   "Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes."
3. No painel → aba **Dúvidas Pendentes** → deve aparecer a pergunta

## Teste 6: Agendamento
1. Envie no WhatsApp: "agendar"
2. Siga o fluxo (nome → serviço → data → horário)
3. No final deve confirmar o agendamento
4. No painel → aba **Agendamentos** deve mostrar o registro

## Teste 7: Dados no Painel
- Clientes aparecendo
- Mensagens aparecendo
- Sem erros no console do navegador

Se todos os testes acima passarem → MVP está pronto para usar/vender.
