const { MongoClient } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGODB_URI, dbName = process.env.DB_NAME || "dareu";
const want = ["relationships","public_speaking","time_management"]; // לפי body.json

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db(dbName).collection("challenges");
    for (const t of want) {
      const arr = await col.find({ topic: t }).limit(10).toArray();
      console.log(`\n=== ${t} (${arr.length}) ===`);
      arr.forEach(d => console.log(`- ${d.slug} | ${d.title} | min:${d.minutes} | diff:${d.difficulty} | fallback:${!!d.isFallback}`));
    }
  } catch (e) { console.error("❌", e.message); } finally { await client.close(); }
})();
