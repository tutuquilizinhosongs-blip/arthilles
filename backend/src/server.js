import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (process.env.CORS_ORIGIN || '').split(','),
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.use(router);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Arthilles Backend rodando na porta ${PORT}`);
});
