import dotenv from 'dotenv';

dotenv.config();

// Validate all required environment variables at startup
const REQUIRED_KEYS = ['TMDB_API_KEY', 'MONGODB_URI', 'MONGODB_DB', 'JWT_SECRET'] as const;
REQUIRED_KEYS.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
  }
});

export const ENV = {
  TMDB_API_KEY: process.env.TMDB_API_KEY as string,
  MONGODB_URI:  process.env.MONGODB_URI  as string,
  MONGODB_DB:   process.env.MONGODB_DB   as string,
  JWT_SECRET:   process.env.JWT_SECRET   as string,
  NODE_ENV:     process.env.NODE_ENV || 'development',
};
