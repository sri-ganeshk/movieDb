import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  TMDB_API_KEY: process.env.TMDB_API_KEY as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  MONGODB_DB: process.env.MONGODB_DB as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
