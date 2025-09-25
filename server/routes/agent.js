import { Router } from "express";
import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { planChallenges } from "../agents/planner.js";

// scoring & profile
import { totalPoints, basePoints, courageScore, motivationBonus } from "../tools/scoring.js";
import { getUserProfile } from "../tools/history.js";

const router = Router();

/* Helpers */
function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function normalizeText(text = "") {
  const t = String(text).replace(/\s+/g, " ").trim();
  const stripped = t.replace(/^(?:dareu:\s*)+/i, ""); 
  return `dareU: ${stripped}`;
}

function textHash(text = "") {
  return crypto.createHash("sha256").update(normalizeText(text)).digest("hex");
}

// Compute points for a run based on difficulty, courage, and user motivation
async function computePointsForRun({ run, evidence = {} }) {
  const difficulty = run?.difficulty || "easy";
  const tags = Array.isArray(run?.tags) ? run.tags : [];

  const courage = courageScore({
    socialExposure: !!evidence.socialExposure,
    performanceRisk: !!evidence.performanceRisk,
    novelty: !!evidence.novelty,
    timeCommitment: run?.minutes ?? 5,
  });

  let motivation = "intrinsic";
  try {
    const profile = await getUserProfile?.(run.userId);
    motivation = profile?.primaryMotivation || motivation;
  } catch (_) {}

  const points = totalPoints(difficulty, courage, motivation, tags);
  const breakdown = {
    base: basePoints(difficulty),
    courage,
    motivationBonus: motivationBonus(motivation, tags),
  };

  return { points, breakdown };
}

/* Build run document for DB */
function buildRunDoc({ userId, proposal, periodKey }) {
  const base = {
    userId,
    status: "proposed",
    periodKey,
    createdAt: new Date(),
  };

  const templateId = proposal.templateId || proposal.id || proposal.slug || null;
  const topic = proposal.topic || proposal.category || null;
  const difficulty = proposal.difficulty || null;
  const minutes = proposal.minutes ?? proposal.durationMinutes ?? null;

  if (topic) base.topic = topic;
  if (difficulty) base.difficulty = difficulty;
  if (minutes != null) base.minutes = minutes;

  const rawText = proposal.text || proposal.title || proposal.instructions || "";

  if (templateId) {
    return {
      ...base,
      templateId,
      suggestedText: normalizeText(rawText), // ← תמיד מנרמלים
    };
  } else {
    return {
      ...base,
      suggestedText: normalizeText(rawText),
      textHash: textHash(rawText),
    };
  }
}

/* --- Plan & persist proposals: /agent/plan --- */
router.post("/plan", async (req, res) => {
  const db = await getDb();
  const { userId, survey, profile } = req.body || {};
  if (!userId) return res.status(400).json({ ok: false, error: "missing_userId" });

  try {
    // אם הגיע פרופיל/שאלון מהקליינט – נשמור אותם לפני התכנון
    if (survey || profile) {
      await db.collection("user_profiles").updateOne(
        { _id: userId },
        {
          $set: { ...(profile || {}), ...(survey || {}), updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    }

    // ← פרופיל אפקטיבי לתכנון (אם לא הגיע בפרמטרים – נטען מה־DB)
    let effectiveProfile = profile;
    if (!effectiveProfile) {
      const p = await db.collection("user_profiles").findOne(
        { _id: userId },
        { projection: { topics: 1, level: 1, currentLevel: 1, motivation: 1, primaryMotivation: 1 } }
      );
      if (p) {
        // מיפוי מספר -> tier מילולי
        const mapNumLevelToTier = (n) => {
          if (typeof n !== "number") return null;
          if (n <= 3) return "beginner";
          if (n <= 6) return "intermediate";
          return "advanced";
        };
        
        const tier =
          p.level && typeof p.level === "string"
            ? p.level
            : mapNumLevelToTier(p.currentLevel) || "beginner";
            
        effectiveProfile = {
          topics: p.topics || [],
          level: tier,
          motivation: p.motivation || p.primaryMotivation || "intrinsic",
        };
      }
    }

    // תכנון (מקבל פרופיל אפקטיבי אם יש)
    const proposals = await planChallenges({ userId, survey, profile: effectiveProfile });
    const periodKey = todayKey();

    const saved = [];
    let dupCount = 0;
    const errors = [];

    for (const p of proposals || []) {
      const doc = buildRunDoc({ userId, proposal: p, periodKey });
      try {
        const r = await db.collection("challenge_runs").insertOne(doc);
        saved.push({
          runId: r.insertedId,
          templateId: doc.templateId || null,
          suggestedText: doc.suggestedText,
          topic: doc.topic || null,
          difficulty: doc.difficulty || null,
          minutes: doc.minutes ?? null,
          periodKey: doc.periodKey,
        });
      } catch (err) {
        if (err?.code === 11000) { dupCount += 1; continue; }
        errors.push({ message: err.message || String(err) });
      }
    }

    // ✅ מחזירים גם profile כדי שה־UI יציג אותו
    res.json({
      ok: true,
      profile: effectiveProfile || null,
      proposals: saved,
      skipped: { duplicates: dupCount, errors }
    });
  } catch (e) {
    console.error("[/agent/plan] failed:", e);
    res.status(500).json({ ok: false, error: "planner_failed" });
  }
});

/* --- User decision: /agent/decision --- */
router.post("/decision", async (req, res) => {
  const db = await getDb();
  const { runId, decision } = req.body || {};
  if (!runId || !["accept", "reject"].includes(decision))
    return res.status(400).json({ ok: false, error: "bad_params" });

  const { ObjectId } = await import("mongodb");
  await db.collection("challenge_runs").updateOne(
    { _id: new ObjectId(runId) },
    { $set: { status: decision === "accept" ? "accepted" : "rejected", updatedAt: new Date() } }
  );
  res.json({ ok: true });
});

/* --- Complete run (auto-scoring): /agent/complete --- */
router.post("/complete", async (req, res) => {
  try {
    const db = await getDb();
    const { runId, evidence = {} } = req.body || {};
    if (!runId) return res.status(400).json({ ok: false, error: "missing_runId" });

    const { ObjectId } = await import("mongodb");
    const run = await db.collection("challenge_runs").findOne({ _id: new ObjectId(runId) });
    if (!run) return res.status(404).json({ ok: false, error: "run_not_found" });

    // compute points automatically
    const scoring = await computePointsForRun({ run, evidence });

    // update run doc
    await db.collection("challenge_runs").updateOne(
      { _id: new ObjectId(runId) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          score: { points: scoring.points, breakdown: scoring.breakdown },
          evidence,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      }
    );

    // update user profile totals (profile id = userId)
    await db.collection("user_profiles").updateOne(
      { _id: run.userId },
      {
        $inc: { totalPoints: scoring.points },
        $set: { lastActivity: new Date(), updatedAt: new Date() },
        $push: {
          recentActivity: {
            $each: [{ points: scoring.points, topic: run.topic || "general", timestamp: new Date() }],
            $slice: -10,
          },
        },
      },
      { upsert: true }
    );

    // recompute level (every 100 pts → +1 level)
    const profile = await db.collection("user_profiles").findOne(
      { _id: run.userId },
      { projection: { totalPoints: 1 } }
    );
    if (profile?.totalPoints != null) {
      const newLevel = Math.floor(profile.totalPoints / 100) + 1;
      await db.collection("user_profiles").updateOne(
        { _id: run.userId },
        { $set: { currentLevel: newLevel } }
      );
    }

    // --- save into completed_challenges (idempotent) ---
    const periodKeyNow = todayKey();
    const safeText = run.suggestedText || "";
    const safeHash = run.textHash || textHash(safeText);
    await db.collection("completed_challenges").updateOne(
      { userId: run.userId, periodKey: periodKeyNow, textHash: safeHash },
      {
        $setOnInsert: {
          userId: run.userId,
          runId: run._id,
          topic: run.topic || "general",
          suggestedText: normalizeText(safeText),
          textHash: safeHash,
          minutes: run.minutes ?? 5,
          difficulty: run.difficulty || "easy",
          sourceTemplateId: run.templateId || null,
          periodKey: periodKeyNow,
          completedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ ok: true, points: scoring.points, breakdown: scoring.breakdown });
  } catch (e) {
    console.error("[/agent/complete] failed:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;