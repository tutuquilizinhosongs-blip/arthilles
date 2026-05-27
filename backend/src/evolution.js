import { getEvolutionSettings } from './db.js';

// Retorna as credenciais da Evolution (prioriza banco, fallback env)
export async function getEvolutionConfig() {
  const fromDb = await getEvolutionSettings();

  const apiUrl = fromDb?.api_url || process.env.EVOLUTION_API_URL || '';
  const apiKey = fromDb?.api_key || process.env.EVOLUTION_API_KEY || '';
  const instance = fromDb?.instance_name || process.env.EVOLUTION_INSTANCE_NAME || '';

  return {
    apiUrl,
    apiKey,
    instance,
    hasCredentials: !!(apiUrl && apiKey && instance),
    source: fromDb ? 'database' : 'environment'
  };
}

// Monta o header padrão da Evolution API
export function evolutionHeaders(apiKey) {
  return { apikey: apiKey };
}

// === Ações de conexão ===

export async function createEvolutionInstance(config) {
  if (!config.hasCredentials) {
    throw new Error('Credenciais da Evolution não configuradas');
  }

  const url = `${config.apiUrl}/instance/create`;

  const body = {
    instanceName: config.instance,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...evolutionHeaders(config.apiKey)
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    // Algumas versões retornam erro como string ou objeto
    const message = data?.message || data?.error || JSON.stringify(data);
    throw new Error(`Falha ao criar instância: ${message}`);
  }

  return { success: true, data };
}

export async function getEvolutionQRCode(config) {
  if (!config.hasCredentials) {
    throw new Error('Credenciais da Evolution não configuradas');
  }

  // Tenta primeiro o endpoint mais comum
  const endpoints = [
    `${config.apiUrl}/instance/qrcode/${config.instance}`,
    `${config.apiUrl}/instance/connect/${config.instance}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: evolutionHeaders(config.apiKey)
      });

      if (res.ok) {
        const data = await res.json();
        // Muitas versões retornam { base64: '...' } ou { qrcode: '...' }
        const base64 = data?.base64 || data?.qrcode || data?.data?.qrcode || null;
        if (base64) {
          return { success: true, base64 };
        }
        // Às vezes retorna a imagem direto
        return { success: true, data };
      }
    } catch (e) {
      console.warn('Tentativa de QR falhou em', url);
    }
  }

  throw new Error('Não foi possível obter o QR Code da Evolution API');
}

export async function setEvolutionWebhook(config, backendPublicUrl) {
  if (!config.hasCredentials) {
    throw new Error('Credenciais da Evolution não configuradas');
  }
  if (!backendPublicUrl) {
    throw new Error('BACKEND_PUBLIC_URL não configurado');
  }

  const webhookUrl = `${backendPublicUrl.replace(/\/$/, '')}/webhook/evolution`;

  const url = `${config.apiUrl}/webhook/set/${config.instance}`;

  const body = {
    enabled: true,
    url: webhookUrl,
    webhookByEvents: false,
    events: ['MESSAGES_UPSERT']
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...evolutionHeaders(config.apiKey)
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || data?.error || JSON.stringify(data);
    throw new Error(`Falha ao configurar webhook: ${message}`);
  }

  return { success: true, webhookUrl, data };
}
