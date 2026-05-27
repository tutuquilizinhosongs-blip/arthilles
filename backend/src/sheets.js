import axios from 'axios';

let cache = { data: [], ts: 0 };
const CACHE_MS = 5 * 60 * 1000;

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

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
      const cols = parseCsvLine(lines[i]);
      if (cols.length >= 2 && cols[0]) {
        faqs.push({
          pergunta: cols[0].toLowerCase(),
          resposta: cols[1] || ''
        });
      }
    }

    cache = { data: faqs, ts: now };
    return faqs;
  } catch (e) {
    console.error('Erro ao buscar Google Sheets:', e.message);
    return cache.data;
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
