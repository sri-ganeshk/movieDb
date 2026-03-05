import { connectToDatabase } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { ENV } from '../environments';

// ── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password is too long';
  return null;
}

function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name must be under 50 characters';
  return null;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, name } = req.body;

  // Server-side validation
  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });

  const nameError = validateName(name);
  if (nameError) return res.status(400).json({ message: nameError });

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash password (async — does not block event loop)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user — store email normalised to lowercase
    const result = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
    });

    // Sign JWT
    const token = jwt.sign({ userId: result.insertedId.toString() }, ENV.JWT_SECRET, {
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

    return res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        email: email.toLowerCase(),
        name: name.trim(),
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
