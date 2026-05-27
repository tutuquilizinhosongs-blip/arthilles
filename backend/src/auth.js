import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'change_me';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex');
}

export async function login(email, password) {
  // For MVP we do simple check against env + Supabase
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return { token: 'admin_' + SECRET.slice(0, 12), role: 'admin' };
  }
  return null;
}

export function verifyToken(token) {
  if (!token) return null;
  if (token.startsWith('admin_')) return { role: 'admin' };
  return null;
}
