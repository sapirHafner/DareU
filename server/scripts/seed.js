import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "dareU";

if (!uri) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const challenges = [
  { slug: "fitness-5min-walk", topic: "fitness", title: "הליכת 5 דק׳", minutes: 5, difficulty: "easy", type: "solo" },
  { slug: "fitness-10-pushups", topic: "fitness", title: "10 שכיבות סמיכה", minutes: 5, difficulty: "easy", type: "solo" },
  { slug: "public-speaking-voice-note", topic: "public_speaking", title: "דקת דיבור מוקלטת", minutes: 5, difficulty: "easy", type: "solo" }
];

async function main() {
  await client.connect();
  const db = client.db(dbName);

  // אינדקס ייחודי כדי למנוע כפילויות
  await db.collection("challenges").createIndex({ slug: 1 }, { unique: true });

  // upsert idempotent – אפשר להריץ שוב בלי כפילויות
  const ops = challenges.map(c => ({
    updateOne: {
      filter: { slug: c.slug },
      update: { $set: { ...c, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      upsert: true
    }
  }));

  const res = await db.collection("challenges").bulkWrite(ops, { ordered: false });
  console.log("✅ seed done:", { upserted: res.upsertedCount ?? 0, modified: res.modifiedCount ?? 0 });

  await client.close();
}
main().catch(e => { console.error("❌ seed error", e); process.exit(1); });
