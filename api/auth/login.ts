import { connectToDatabase } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { ENV } from '../environments';

// ── In-process rate limiter (per IP) ─────────────────────────────────────────
// Works per serverless instance. Good enough for a dev/MVP app.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 10;          // max attempts
const RATE_WINDOW_MS = 15 * 60 * 1000; // per 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT) return true;

  record.count += 1;
  return false;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate limit by client IP
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ message: 'Too many login attempts. Please try again in 15 minutes.' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Look up by normalised email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user._id.toString() }, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set httpOnly cookie
    res.setHeader('Set-Cookie', serialize('auth_token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }));

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
