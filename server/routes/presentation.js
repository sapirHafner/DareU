// routes/runs.js
import { Router } from "express";
import { getDb } from "../database/connection.js";

const router = Router();

function looksNonEnglish(text = "") {
  return /[\u0590-\u05FF]/.test(text); // מזהה עברית; לא נוגעים ב-DB, רק בתשובה
}

function ensureEnglishText({ text, topic = "general", minutes = 5 }) {
  if (!text || looksNonEnglish(text)) {
    const n = Number(minutes) || 5;
    const t = String(topic).toLowerCase();
    return `dareU: Try a ${n}-minute ${t} challenge`;
  }
  // מוסיפים פריפיקס אם חסר
  return text.startsWith("dareU:") ? text : `dareU: ${text}`;
}

// GET /runs/today?userId=...
router.get("/today", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ ok: false, error: "missing_userId" });

  try {
    const db = await getDb();
    const periodKey = new Date().toISOString().slice(0, 10);
    const items = await db.collection("challenge_runs")
      .find({
        userId,
        periodKey,
        status: { $in: ["proposed", "accepted"] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    const cleaned = items.map(it => ({
      ...it,
      suggestedText: ensureEnglishText({
        text: it.suggestedText,
        topic: it.topic,
        minutes: it.minutes
      }),
    }));

    res.json({ ok: true, items: cleaned, periodKey });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /runs/history?userId=...&limit=20
router.get("/history", async (req, res) => {
  const { userId, limit = 20 } = req.query;
  if (!userId) return res.status(400).json({ ok: false, error: "missing_userId" });

  try {
    const db = await getDb();
    const items = await db.collection("challenge_runs")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();

    const cleaned = items.map(it => ({
      ...it,
      suggestedText: ensureEnglishText({
        text: it.suggestedText,
        topic: it.topic,
        minutes: it.minutes
      }),
    }));

    res.json({ ok: true, items: cleaned });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
