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
