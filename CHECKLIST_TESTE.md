# CHECKLIST DE TESTE RÁPIDO (5-10 minutos)

Use este checklist após o deploy para validar que tudo funciona.

## Teste 1: Saúde do Backend
1. Abra: `SEU-BACKEND/health`
2. Deve retornar JSON com `"ok": true`

## Teste 2: Login no Painel
1. Abra o Dashboard (Vercel)
2. Use ADMIN_EMAIL e ADMIN_PASSWORD
3. Deve entrar e mostrar as abas (incluindo WhatsApp)

## Teste 3: Status
1. No painel, vá na aba **Status**
2. Verifique se supabase e sheets aparecem como 'ok'

## Teste 4: Configurar WhatsApp (Novo)
1. Vá na aba **WhatsApp**
2. Preencha as 3 credenciais da Evolution
3. Salve
4. Verifique se o status na aba Status mostra "evolution" como configured

## Teste 5: FAQ Funcionando
1. Na planilha, adicione: `Qual o horário?,Funcionamos das 8h às 18h`
2. No WhatsApp conectado, envie: "Qual o horário?"
3. Bot deve responder exatamente o texto da planilha

## Teste 6: Fallback (Pergunta Desconhecida)
1. Envie no WhatsApp uma pergunta que NÃO está na planilha
2. Bot deve responder o fallback
3. No painel → aba **Dúvidas Pendentes**

Se todos os testes acima passarem → MVP está pronto.
