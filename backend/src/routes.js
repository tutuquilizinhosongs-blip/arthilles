import express from 'express';
import { handleIncomingMessage } from './bot.js';
import { supabase, COMPANY_ID, getOrCreateClient } from './db.js';
import { login, verifyToken } from './auth.js';
import { findAnswer } from './sheets.js';
import { getEvolutionConfig, evolutionHeaders } from './evolution.js';

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
    evolution: { configured: false, source: 'none' }
  };

  try {
    const { error } = await supabase.from('companies').select('id').limit(1);
    status.supabase = error ? 'error' : 'ok';
  } catch {}

  try {
    await findAnswer('teste');
    status.sheets = 'ok';
  } catch {
    status.sheets = 'error (verifique GOOGLE_SHEETS_CSV_URL)';
  }

  // Evolution status com fallback DB + env
  try {
    const config = await getEvolutionConfig();
    status.evolution = {
      configured: config.hasCredentials,
      source: config.source,
      instance: config.instance || null
    };
  } catch (e) {
    status.evolution = { configured: false, error: 'Erro ao ler configurações' };
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

  // Envia resposta usando config do banco (com fallback env)
  const config = await getEvolutionConfig();
  if (config.hasCredentials) {
    try {
      await fetch(`${config.apiUrl}/message/sendText/${config.instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...evolutionHeaders(config.apiKey)
        },
        body: JSON.stringify({ number: phone, text: reply })
      });
    } catch (e) {
      console.error('Erro ao enviar via Evolution:', e.message);
    }
  }

  res.json({ ok: true, reply });
});

// === Evolution Settings (Opção A - protegido) ===

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });
  req.user = user;
  next();
}

// Busca configurações salvas da Evolution
router.get('/evolution/settings', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('evolution_settings')
    .select('api_url, instance_name, updated_at')
    .eq('company_id', COMPANY_ID)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  // Nunca retorna a api_key por segurança
  res.json({
    api_url: data?.api_url || '',
    instance_name: data?.instance_name || '',
    updated_at: data?.updated_at || null,
    has_key: !!(data?.api_key) || !!process.env.EVOLUTION_API_KEY
  });
});

// Salva/atualiza configurações da Evolution
router.post('/evolution/settings', requireAuth, async (req, res) => {
  const { api_url, api_key, instance_name } = req.body || {};

  if (!api_url || !instance_name) {
    return res.status(400).json({ error: 'api_url e instance_name são obrigatórios' });
  }

  try {
    const saved = await (await import('./db.js')).saveEvolutionSettings({
      api_url,
      api_key,
      instance_name
    });

    res.json({
      success: true,
      api_url: saved.api_url,
      instance_name: saved.instance_name,
      updated_at: saved.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Status detalhado da Evolution (usando config salva)
router.get('/evolution/status', requireAuth, async (req, res) => {
  const config = await getEvolutionConfig();

  if (!config.hasCredentials) {
    return res.json({ connected: false, message: 'Nenhuma credencial configurada' });
  }

  try {
    const response = await fetch(`${config.apiUrl}/instance/connectionState/${config.instance}`, {
      headers: evolutionHeaders(config.apiKey),
      timeout: 8000
    });

    const data = await response.json();
    res.json({
      connected: true,
      instance: config.instance,
      source: config.source,
      data
    });
  } catch (e) {
    res.json({
      connected: false,
      instance: config.instance,
      source: config.source,
      error: 'Não foi possível conectar com a Evolution API'
    });
  }
});

// Simple login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await login(email, password);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  res.json(user);
});

// Protected routes middleware
function requireAuthOld(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });
  req.user = user;
  next();
}

// Unknown questions (for dashboard)
router.get('/faq/unknown', requireAuthOld, async (req, res) => {
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
router.get('/appointments', requireAuthOld, async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, clients(full_name, phone)')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/appointments', requireAuthOld, async (req, res) => {
  const { service, preferred_date, preferred_time, client_phone, client_name } = req.body;

  const client = await getOrCreateClient(client_phone, client_name);

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
router.get('/clients', requireAuthOld, async (req, res) => {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(200);
  res.json(data || []);
});

// Recent messages
router.get('/messages', requireAuthOld, async (req, res) => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(100);
  res.json(data || []);
});
