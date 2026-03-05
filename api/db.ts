/**
 * db.ts — MongoDB connection with automatic index setup
 *
 * Responsible for:
 * - Caching the MongoClient across serverless invocations
 * - Creating required indexes on first connection
 */

import { MongoClient, Db } from 'mongodb';
import { ENV } from './environments';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let indexesCreated = false;

async function ensureIndexes(db: Db) {
  if (indexesCreated) return;

  // Unique index on users.email → prevents duplicate accounts
  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true, name: 'email_unique' }
  );

  // Index on favorites.userId → fast lookup per user
  await db.collection('favorites').createIndex(
    { userId: 1 },
    { unique: true, name: 'userId_unique' }
  );

  indexesCreated = true;
  console.log('[DB] Indexes ensured');
}

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = ENV.MONGODB_URI;
  const dbName = ENV.MONGODB_DB;

  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables. Check your .env file.');
  if (!dbName) throw new Error('MONGODB_DB is not defined in environment variables. Check your .env file.');

  const client = await MongoClient.connect(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  const db = client.db(dbName);

  // Create indexes on first connection (idempotent — safe to run repeatedly)
  await ensureIndexes(db);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
