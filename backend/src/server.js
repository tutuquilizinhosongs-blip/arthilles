import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Melhor CORS para Railway + Vercel
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.DASHBOARD_PUBLIC_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.some(allowed => origin === allowed || allowed === '*')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use(router);

app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// Validação útil no startup
console.log('=== Arthilles Backend Starting ===');
console.log('Port:', PORT);
console.log('Supabase configured:', !!process.env.SUPABASE_URL);
console.log('Google Sheets configured:', !!process.env.GOOGLE_SHEETS_CSV_URL);
console.log('Evolution configured:', !!process.env.EVOLUTION_API_URL);
console.log('Admin login:', process.env.ADMIN_EMAIL || 'not set');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Arthilles Backend rodando em http://0.0.0.0:${PORT}`);
});
