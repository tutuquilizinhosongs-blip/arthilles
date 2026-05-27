import axios from 'axios';

let cache = { data: [], ts: 0 };
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchFaq() {
  const url = process.env.GOOGLE_SHEETS_CSV_URL;
  if (!url) return [];

  const now = Date.now();
  if (now - cache.ts < CACHE_MS && cache.data.length) {
    return cache.data;
  }

  try {
    const res = await axios.get(url, { timeout: 8000 });
    const lines = res.data.trim().split(/\r?\n/);
    const faqs = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 2) {
        faqs.push({
          pergunta: (cols[0] || '').trim().toLowerCase(),
          resposta: (cols[1] || '').trim()
        });
      }
    }

    cache = { data: faqs, ts: now };
    return faqs;
  } catch (e) {
    console.error('Erro ao buscar Google Sheets:', e.message);
    return cache.data; // return old cache if fail
  }
}

export async function findAnswer(message) {
  const faqs = await fetchFaq();
  const clean = message.toLowerCase().trim();

  for (const row of faqs) {
    if (row.pergunta && clean.includes(row.pergunta)) {
      return row.resposta;
    }
  }
  return null;
}
