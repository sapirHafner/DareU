import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let client = null;
let db = null;

export async function getDb() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "dareU";
  if (!uri) throw new Error("Missing MONGODB_URI");

  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  await client.connect();
  db = client.db(dbName);
  return db;
}

// getDatabase
export const getDatabase = getDb;

export async function closeDb() {
  if (client) await client.close();
  client = null;
  db = null;
}
