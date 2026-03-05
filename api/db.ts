import { MongoClient, Db } from 'mongodb';
import { ENV } from './environments';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = ENV.MONGODB_URI;
  const dbName = ENV.MONGODB_DB;

  const client = await MongoClient.connect(uri as string);
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}
