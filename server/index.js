// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import agentRouter from "./routes/agent.js";
import presentationRouter from "./routes/presentation.js";
import { getDb } from "./database/connection.js";
import profileRouter from "./routes/profile.js";
import { planChallenges } from "./agents/planner.js"; // ⬅️ חדש: ייבוא הפונקציה ישירות

dotenv.config();

const PORT = process.env.PORT || 5050;

const app = express();
app.use(cors());
app.use(express.json());

// --- Health routes ---
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/health/db", async (_req, res) => {
  try {
    const d = await getDb();
    await d.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Example data route ---
app.get("/api/challenges", async (req, res) => {
  try {
    const { topic, difficulty, limit = 20 } = req.query;
    const d = await getDb();
    const q = {};
    if (topic) q.topic = topic;
    if (difficulty) q.difficulty = difficulty;
    const items = await d
      .collection("challenges")
      .find(q)
      .limit(Number(limit))
      .toArray();
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Direct agent plan route (short version) ---
app.post("/agent/plan", async (req, res) => {
  try {
    const { userId, profile = {}, survey = {} } = req.body || {};
    const proposals = await planChallenges({ userId, profile, survey });

    // מחזירים ישירות את התוצאות מהפלנר
    res.json({
      ok: true,
      profile,
      proposals,
      skipped: { duplicates: 0, errors: [] },
    });
  } catch (e) {
    console.error("[/agent/plan] error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Routers ---
app.use("/agent", agentRouter);
app.use(["/present", "/runs"], presentationRouter);
app.use("/profile", profileRouter);

// --- Listen ---
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
