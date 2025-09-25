const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "dareu";

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db(dbName).collection("challenges");
    const topics = await col.distinct("topic");
    console.log("✅ Distinct topics:", topics);
    const counts = await col.aggregate([{ $group: { _id: "$topic", count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray();
    console.log("📊 Counts per topic:"); counts.forEach(t => console.log(`- ${t._id}: ${t.count}`));
  } catch (e) { console.error("❌", e.message); } finally { await client.close(); }
})();
