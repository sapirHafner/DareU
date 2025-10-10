import { Router } from "express";
import { getDb } from "../database/connection.js";

const router = Router();

// POST /profile/upsert
router.post("/upsert", async (req, res) => {
  try {
    const {
      userId,
      topics = [],
      motivation = null,  // e.g. "intrinsic"
      level = "beginner",
      answers = {},
      scores = {},
      normalized = {},
      availability = null,
    } = req.body || {};

    if (!userId) return res.status(400).json({ ok: false, error: "missing_userId" });

    const db = await getDb();
    const now = new Date();

    const doc = {
      _id: userId,
      topics,
      primaryMotivation: motivation,
      currentLevel: level,
      answers,
      scores,
      normalized,
      availability,
      updatedAt: now,
    };

    await db.collection("user_profiles").updateOne(
      { _id: userId },
      {
        $set: doc,
        $setOnInsert: { createdAt: now, totalPoints: 0, recentActivity: [] },
      },
      { upsert: true }
    );

    const profile = await db.collection("user_profiles").findOne(
      { _id: userId },
      { projection: { _id: 1, topics: 1, primaryMotivation: 1, currentLevel: 1, totalPoints: 1 } }
    );

    res.json({ ok: true, profile });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /profile/get?userId=...
router.get("/get", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, error: "missing_userId" });

    const db = await getDb();
    const profile = await db.collection("user_profiles").findOne({ _id: userId });
    res.json({ ok: true, profile });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
