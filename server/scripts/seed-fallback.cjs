// scripts/seed-fallback.cjs
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "dareu";
if (!uri) {
  console.error("❌ MONGODB_URI missing in .env");
  process.exit(1);
}

const now = new Date();
const mk = (slug, topic, title, minutes=5, type="solo") => ({
  slug, topic, title, minutes, difficulty: "easy", type,
  isFallback: true, createdAt: now, updatedAt: now
});

// 4 easy tasks per topic, in English
const docs = [
  // fitness
  mk("fitness-5min-walk", "fitness", "Take a 5-minute walk"),
  mk("fitness-10-pushups", "fitness", "Do 10 push-ups"),
  mk("fitness-15-squats", "fitness", "Complete 15 squats"),
  mk("fitness-30s-plank", "fitness", "Hold a 30-second plank"),

  // public_speaking
  mk("ps-intro-mirror-30s", "public_speaking", "Give a 30-second intro in front of a mirror"),
  mk("ps-readaloud-1min", "public_speaking", "Read aloud for 1 minute from a favorite text"),
  mk("ps-voice-note", "public_speaking", "Record a short voice note with one idea"),
  mk("ps-story-1min-friend", "public_speaking", "Tell a 1-minute story to a friend", 5, "friend"),

  // time_management
  mk("tm-5min-plan", "time_management", "Spend 5 minutes planning tomorrow"),
  mk("tm-two-minute-rule", "time_management", "Apply the 2-minute rule to one small task"),
  mk("tm-inbox-5min", "time_management", "Organize your email inbox for 5 minutes"),
  mk("tm-5min-declutter", "time_management", "Declutter your desk or bag for 5 minutes"),

  // relationships
  mk("rel-text-thanks", "relationships", "Send a thank-you message to someone"),
  mk("rel-coffee-invite", "relationships", "Invite a friend for a short coffee chat"),
  mk("rel-one-kind-note", "relationships", "Write one kind note or compliment"),
  mk("rel-ask-how-are-you", "relationships", "Ask two people ‘How are you, really?’"),
];

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db(dbName).collection("challenges");
    await col.createIndex({ slug: 1 }, { unique: true });
    await col.createIndex({ topic: 1 });

    for (const d of docs) {
      await col.updateOne({ slug: d.slug }, { $setOnInsert: d }, { upsert: true });
    }
    console.log("✅ seed-fallback (English) done");
  } catch (e) {
    console.error("❌", e.message);
  } finally {
    await client.close();
  }
})();
