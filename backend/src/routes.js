import express from 'express';
import { handleIncomingMessage } from './bot.js';
import { supabase, COMPANY_ID } from './db.js';
import { login, verifyToken } from './auth.js';
import { findAnswer } from './sheets.js';

export const router = express.Router();

// Public health
router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'arthilles-backend', time: new Date().toISOString() });
});

// Public status
router.get('/status', async (req, res) => {
  const status = {
    backend: 'ok',
    supabase: 'unknown',
    sheets: 'unknown',
    evolution: !!process.env.EVOLUTION_API_URL
  };

  try {
    const { error } = await supabase.from('companies').select('id').limit(1);
    status.supabase = error ? 'error' : 'ok';
  } catch {}

  try {
    const faqs = await findAnswer('teste');
    status.sheets = 'ok';
  } catch {
    status.sheets = 'error (verifique GOOGLE_SHEETS_CSV_URL)';
  }

  res.json(status);
});

// Webhook Evolution API
router.post('/webhook/evolution', async (req, res) => {
  const body = req.body;
  const message =
    body?.data?.message?.conversation ||
    body?.data?.message?.extendedTextMessage?.text ||
    body?.message?.conversation ||
    body?.text ||
    '';

  const remoteJid = body?.data?.key?.remoteJid || body?.data?.remoteJid || '';
  const phone = remoteJid.replace(/@.*/, '');

  if (!phone || !message || body?.data?.key?.fromMe) {
    return res.json({ ok: true, ignored: true });
  }

  const reply = await handleIncomingMessage(phone, message);

  // Send reply via Evolution (if configured)
  if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
    try {
      await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY
        },
        body: JSON.stringify({ number: phone, text: reply })
      });
    } catch (e) {
      console.error('Erro ao enviar via Evolution:', e.message);
    }
  }

  res.json({ ok: true, reply });
});

// Simple login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await login(email, password);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  res.json(user);
});

// Protected routes middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });
  req.user = user;
  next();
}

// Unknown questions (for dashboard)
router.get('/faq/unknown', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('unknown_questions')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Appointments
router.get('/appointments', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, clients(full_name, phone)')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/appointments', requireAuth, async (req, res) => {
  const { service, preferred_date, preferred_time, client_phone, client_name } = req.body;

  const client = await getOrCreateClientFromPhone(client_phone, client_name); // helper below

  const { data, error } = await supabase.from('appointments').insert({
    company_id: COMPANY_ID,
    client_id: client.id,
    service,
    preferred_date,
    preferred_time
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Clients
router.get('/clients', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(200);
  res.json(data || []);
});

// Recent messages
router.get('/messages', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(100);
  res.json(data || []);
});

// Helper (duplicated for simplicity)
async function getOrCreateClientFromPhone(phone, name) {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .eq('phone', phone)
    .maybeSingle();
  if (data) return data;
  const { data: created } = await supabase.from('clients').insert({
    company_id: COMPANY_ID, phone, full_name: name
  }).select().single();
  return created;
}
