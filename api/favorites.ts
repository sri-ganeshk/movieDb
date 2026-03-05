import { connectToDatabase } from './db';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { ENV } from './environments';

export default async function handler(req: any, res: any) {
  // Validate JWT from cookie
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let userId: string;
  try {
    const secret = ENV.JWT_SECRET;
    const decoded = jwt.verify(token, secret) as any;
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // ─── GET: Fetch all favorite movie IDs ───────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const userFavorites = await db.collection('favorites').findOne({ userId });
      // Ensure all IDs are numbers for consistency
      const movies = (userFavorites?.movies || []).map(Number);
      return res.status(200).json({ favorites: movies });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // ─── POST: Add movie(s) to favorites ─────────────────────────────────────
  if (req.method === 'POST') {
    const { movieId } = req.body;
    if (!movieId || !Array.isArray(movieId)) {
      return res.status(400).json({ message: 'Missing or invalid movieId array' });
    }

    // Ensure IDs stored as numbers
    const movieIds: number[] = movieId.map(Number);

    try {
      const { db } = await connectToDatabase();
      // upsert: true — creates the doc if userId not found (eliminates race condition)
      await db.collection('favorites').updateOne(
        { userId },
        { $addToSet: { movies: { $each: movieIds } } },
        { upsert: true }
      );
      return res.status(200).json({ message: 'Movies added to favorites' });
    } catch (err) {
      console.error('Error updating favorites:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // ─── DELETE: Remove a movie from favorites ────────────────────────────────
  if (req.method === 'DELETE') {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'Missing movieId' });
    }

    const movieIdNum = Number(movieId);

    try {
      const { db } = await connectToDatabase();
      await db.collection('favorites').updateOne(
        { userId },
        { $pull: { movies: movieIdNum } as any }
      );
      return res.status(200).json({ message: 'Movie removed from favorites' });
    } catch (err) {
      console.error('Error removing favorite:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
