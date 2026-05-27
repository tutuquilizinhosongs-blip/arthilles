import { findAnswer } from './sheets.js';
import { saveMessage, saveUnknownQuestion, getOrCreateClient, saveAppointment, getSession, upsertSession } from './db.js';

const HANDOFF = 'Sua pergunta foi encaminhada para nossa equipe. Em breve responderemos com mais detalhes.';

function wantsAppointment(text) {
  const t = text.toLowerCase();
  return t.includes('agendar') || t.includes('marcar') || t.includes('horario') || t.includes('agenda') || t.includes('consulta');
}

export async function handleIncomingMessage(phone, message) {
  const cleanMsg = message.trim();
  await saveMessage(phone, 'inbound', cleanMsg);

  // 1. Check if we are in appointment collection flow
  const session = await getSession(phone);
  if (session && session.state === 'collecting_appointment') {
    const data = session.data || {};
    if (!data.name) {
      data.name = cleanMsg;
      await upsertSession(phone, 'collecting_appointment', data);
      return 'Qual o serviço que você deseja? (ex: corte, limpeza, consulta)';
    }
    if (!data.service) {
      data.service = cleanMsg;
      await upsertSession(phone, 'collecting_appointment', data);
      return 'Qual a data preferida? (ex: 15/06 ou amanhã)';
    }
    if (!data.date) {
      data.date = cleanMsg;
      await upsertSession(phone, 'collecting_appointment', data);
      return 'Qual o horário preferido? (ex: 14h ou 09:30)';
    }
    if (!data.time) {
      data.time = cleanMsg;

      // Save appointment
      const client = await getOrCreateClient(phone, data.name);
      await saveAppointment({
        client_id: client.id,
        service: data.service,
        preferred_date: data.date,
        preferred_time: data.time
      });

      await upsertSession(phone, 'done', {});
      return `Agendamento registrado! Nome: ${data.name} | Serviço: ${data.service} | ${data.date} às ${data.time}. Em breve entraremos em contato.`;
    }
  }

  // 2. New appointment request
  if (wantsAppointment(cleanMsg)) {
    await upsertSession(phone, 'collecting_appointment', {});
    return 'Perfeito! Vamos agendar. Qual o seu nome completo?';
  }

  // 3. Normal FAQ flow
  const answer = await findAnswer(cleanMsg);
  if (answer) {
    await saveMessage(phone, 'outbound', answer);
    return answer;
  }

  // 4. Unknown question → handoff + save
  await saveUnknownQuestion(phone, cleanMsg);
  await saveMessage(phone, 'outbound', HANDOFF);
  return HANDOFF;
}
