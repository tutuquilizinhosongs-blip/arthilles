import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export { supabase };

export const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export async function getOrCreateClient(phone, fullName = null) {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .eq('phone', phone)
    .maybeSingle();

  if (data) return data;

  const { data: newClient } = await supabase
    .from('clients')
    .insert({ company_id: COMPANY_ID, phone, full_name: fullName })
    .select()
    .single();

  return newClient;
}

export async function saveMessage(phone, direction, body) {
  await supabase.from('messages').insert({
    company_id: COMPANY_ID,
    phone,
    direction,
    body
  });
}

export async function saveUnknownQuestion(phone, question) {
  await supabase.from('unknown_questions').insert({
    company_id: COMPANY_ID,
    phone,
    question
  });
}

export async function saveAppointment(data) {
  await supabase.from('appointments').insert({
    company_id: COMPANY_ID,
    ...data
  });
}

export async function getSession(phone) {
  const { data } = await supabase
    .from('conversation_sessions')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .eq('phone', phone)
    .maybeSingle();
  return data;
}

export async function upsertSession(phone, state, data = {}) {
  await supabase
    .from('conversation_sessions')
    .upsert({
      company_id: COMPANY_ID,
      phone,
      state,
      data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'company_id,phone' });
}

// === Evolution Settings (Opção A) ===
export async function getEvolutionSettings() {
  const { data, error } = await supabase
    .from('evolution_settings')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function saveEvolutionSettings({ api_url, api_key, instance_name }) {
  const { data, error } = await supabase
    .from('evolution_settings')
    .upsert({
      company_id: COMPANY_ID,
      api_url: api_url || null,
      api_key: api_key || null,
      instance_name: instance_name || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'company_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
