import { connectToDatabase } from '../db';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { ObjectId } from 'mongodb';
import { ENV } from '../environments';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const secret = ENV.JWT_SECRET;
    const decoded = jwt.verify(token, secret) as any;
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    });
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
