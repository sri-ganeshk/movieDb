import { connectToDatabase } from './db';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { ENV } from './environments';

export default async function handler(req: any, res: any) {
  // Validate JWT
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let userId;
  try {
    const secret = ENV.JWT_SECRET;
    const decoded = jwt.verify(token, secret) as any;
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const favoritesCollection = db.collection('favorites');
      const userFavorites = await favoritesCollection.findOne({ userId });
      
      return res.status(200).json({ favorites: userFavorites ? userFavorites.movies : [] });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { movieId } = req.body;
    if (!movieId || !Array.isArray(movieId)) {
      return res.status(400).json({ message: 'Missing or invalid movieId array' });
    }

    try {
      const { db } = await connectToDatabase();
      const favoritesCollection = db.collection('favorites');

      const userFavorites = await favoritesCollection.findOne({ userId });
      if (userFavorites) {
        await favoritesCollection.updateOne(
          { userId },
          { $addToSet: { movies: { $each: movieId } } }
        );
      } else {
        await favoritesCollection.insertOne({
          userId,
          movies: movieId,
        });
      }
      return res.status(200).json({ message: 'Movies added to favorites' });
    } catch (err) {
      console.error('Error updating favorites:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ message: 'Missing movieId' });
    }

    try {
      const { db } = await connectToDatabase();
      const favoritesCollection = db.collection('favorites');

      await favoritesCollection.updateOne(
        { userId },
        { $pull: { movies: movieId } as any }
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
