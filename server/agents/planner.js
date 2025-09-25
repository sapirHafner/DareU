// server/agents/planner.js
import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { nextDifficulty } from "../tools/progression.js";
import { proposeChallengesLLM } from "./llm.js";

const FALLBACK_ONLY =
  (process.env.FALLBACK_ONLY || "").toLowerCase() === "1" ||
  (process.env.FALLBACK_ONLY || "").toLowerCase() === "true";

const LLM_OFF =
  (process.env.LLM_OFF || "").toLowerCase() === "1" ||
  (process.env.LLM_OFF || "").toLowerCase() === "true";

console.log("[planner] flags:", { LLM_OFF, FALLBACK_ONLY });

// --- Topic normalization ---
const TOPIC_MAP = new Map([
  ["relationships & dating", "relationships"],
  ["relationships", "relationships"],
  ["public speaking", "public_speaking"],
  ["time management", "time_management"],
  ["fitness & sports", "fitness"],
  ["fitness", "fitness"],
]);
function normalizeTopic(t = "") {
  const k = String(t).trim().toLowerCase();
  return TOPIC_MAP.get(k) || t;
}

// --- Stable 2-per-topic picker (rotates daily) ---
function dayKey(d = new Date()) { return Math.floor(d.getTime() / 86400000); }
function pick2PerTopicStable(itemsByTopic, today = new Date()) {
  const key = dayKey(today);
  const out = [];
  for (const [topic, arr] of Object.entries(itemsByTopic)) {
    if (!arr || arr.length === 0) continue;
    const start = key % arr.length;
    const rotated = arr.slice(start).concat(arr.slice(0, start));
    out.push(...rotated.slice(0, Math.min(2, rotated.length)));
  }
  return out;
}

const HEBREW_RE = /[\u0590-\u05FF]/;

const DIFFICULTY_BY_LEVEL = {
  beginner: ["easy"],
  intermediate: ["easy", "medium"],
  advanced: ["medium", "hard"],
};
const MINUTES_BY_DIFFICULTY = { easy: 5, medium: 12, hard: 20 };

function preferredByLevel(level = "beginner") {
  return DIFFICULTY_BY_LEVEL[level] || ["easy"];
}
function normalizeTitleText(s = "") {
  return String(s).replace(/\s+/g, " ").trim();
}
function englishLine({ title, topic = "general", minutes = 5 }) {
  const t = String(topic).toLowerCase();
  if (!title || HEBREW_RE.test(title)) {
    const n = Number(minutes) || 5;
    return `dareU: ${t} — ${n} minutes`;
  }
  return `dareU: ${normalizeTitleText(title)}`;
}
function normKey(s = "") {
  return s.toLowerCase().replace(/^dareu:\s*/i, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function textHash(s = "") {
  return crypto.createHash("sha256").update(normKey(s)).digest("hex");
}

// recent usage from both runs and completed_challenges (last 60 days)
async function getRecentlyUsed(db, userId) {
  const since = new Date(Date.now() - 60 * 24 * 3600 * 1000);

  const usedTplRuns = await db.collection("challenge_runs").distinct("templateId", {
    userId, createdAt: { $gte: since }
  });
  const usedHashesRuns = await db.collection("challenge_runs").distinct("textHash", {
    userId, createdAt: { $gte: since }
  });
  const usedHashesCompleted = await db.collection("completed_challenges").distinct("textHash", {
    userId, completedAt: { $gte: since }
  });

  const usedTemplateIds = usedTplRuns.filter(Boolean).map(String);
  const usedTextHashes = [...new Set([...usedHashesRuns, ...usedHashesCompleted].filter(Boolean))];

  return { usedTemplateIds, usedTextHashes };
}

async function getUserStreakAndCurrentDifficulty(db, userId) {
  const recent = await db.collection("challenge_runs")
    .find({ userId })
    .project({ status: 1, difficulty: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  let streak = 0;
  for (const r of recent) {
    if (r.status === "completed") streak++; else break;
  }
  const withDiff = recent.find(r => r.difficulty);
  const currentDifficulty = withDiff?.difficulty || "easy";
  return { streak, currentDifficulty };
}

/**
 * Return proposals: { templateId?, text, suggestedText, topic, difficulty, minutes }
 * Hybrid: prefer LLM (with "avoid" lists) + fill from DB without repeats.
 */
export async function planChallenges({ userId, profile, survey } = {}) {
  const rawTopics = (profile?.topics || survey?.topics || ["fitness"]);
  const topics = rawTopics.map(normalizeTopic).filter(Boolean).slice(0, 3);

  // --- Emergency: DB fallback only ---
  if (FALLBACK_ONLY) {
    const db = await getDb();
    const byTopic = {};
    for (const t of topics) {
      byTopic[t] = await db.collection("challenges")
        .find({ topic: t, isFallback: true })
        // אל תבטלו _id; צריך אותו ל-templateId
        .project({ slug: 1, topic: 1, title: 1, minutes: 1, difficulty: 1, type: 1 })
        .toArray();
    }
    const picked = pick2PerTopicStable(byTopic);
    return picked
      .filter(d => d && d.topic)
      .map(d => {
        const line = englishLine({ title: d.title, topic: d.topic, minutes: d.minutes });
        return {
          templateId: String(d._id ?? d.slug ?? ""),
          text: line,
          suggestedText: line,
          topic: d.topic,
          difficulty: d.difficulty || "easy",
          minutes: Number.isFinite(d.minutes) ? Math.max(1, Math.min(30, Math.round(d.minutes))) : 5,
        };
      })
      .slice(0, 6);
  }

  const level = profile?.level || "beginner";
  const levelPrefs = preferredByLevel(level);

  try {
    const db = await getDb();

    const { streak, currentDifficulty } = await getUserStreakAndCurrentDifficulty(db, userId);
    const targetDifficulty = nextDifficulty(currentDifficulty, streak) || currentDifficulty;

    const { usedTemplateIds, usedTextHashes } = await getRecentlyUsed(db, userId);

    // DB candidates by topics (ignore null topics)
    const candidates = await db.collection("challenges")
      .find({ topic: { $in: topics, $ne: null } })
      .limit(50)
      .toArray();

    // compact catalog for LLM
    const catalog = candidates.map(c => ({
      id: String(c._id ?? c.slug ?? ""),
      title: c.title || "Tiny step",
      topic: c.topic || topics[0],
      difficulty: c.difficulty || levelPrefs[0],
      minutes: Number.isFinite(c.minutes) ? Math.max(1, Math.min(30, Math.round(c.minutes))) : MINUTES_BY_DIFFICULTY[levelPrefs[0]],
    }));

    let llmProposals = [];
    if (!LLM_OFF && process.env.OPENAI_API_KEY) {
      try {
        llmProposals = await proposeChallengesLLM({
          topics,
          level,
          motivation: profile?.motivation || "intrinsic",
          avoidTemplateIds: usedTemplateIds,
          avoidTexts: [],
          avoidHashes: usedTextHashes,
          catalog,
          max: 6,
          targetDifficulty,
        });
      } catch (e) {
        console.warn("[planner] LLM call failed, falling back to DB only:", e.message);
      }
    } else {
      console.log("[planner] LLM disabled via env (LLM_OFF) or missing API key — using DB only.");
    }

    const byId = new Map(catalog.map(c => [c.id, c]));
    let proposals = llmProposals.map(p => {
      if (p.type === "catalog" && p.refId && byId.has(p.refId)) {
        const c = byId.get(p.refId);
        const line = englishLine({ title: c.title, topic: c.topic, minutes: c.minutes });
        return {
          templateId: c.id,
          text: line,
          suggestedText: line,
          topic: c.topic,
          difficulty: c.difficulty,
          minutes: c.minutes,
        };
      }
      // custom
      const topic = p.topic || topics[0];
      const minutes = Math.min(30, Math.max(1, Math.round(p.minutes || MINUTES_BY_DIFFICULTY[targetDifficulty] || 5)));
      const difficulty = p.difficulty || targetDifficulty || levelPrefs[0];
      const title = p.text || `${topic} — ${minutes} minutes`;
      const line = englishLine({ title, topic, minutes });
      return {
        templateId: null,
        text: line,
        suggestedText: line,
        topic,
        difficulty,
        minutes,
      };
    });

    // filter out used/near-duplicate custom texts
    proposals = proposals.filter(pr => {
      if (pr.templateId) return true;
      const h = textHash(pr.text || "");
      return !usedTextHashes.includes(h);
    });

    // If less than 6, fill from DB (no repeats)
    if (proposals.length < 6) {
      const fresh = candidates.filter(c => {
        const tpl = String(c._id ?? c.slug ?? "");
        return tpl && !usedTemplateIds.includes(tpl);
      });

      const scored = fresh.map(c => {
        const cd = c.difficulty || null;
        let score = 0;
        if (cd && String(cd) === String(targetDifficulty)) score += 2;
        if (cd && levelPrefs.includes(String(cd))) score += 1;
        return { c, score };
      }).sort((a, b) => b.score - a.score);

      for (const { c } of scored) {
        const baseLine = englishLine({
          title: c.title || "Tiny step",
          topic: c.topic || topics[0],
          minutes: Number.isFinite(c.minutes) ? Math.max(1, Math.min(30, Math.round(c.minutes))) : MINUTES_BY_DIFFICULTY[levelPrefs[0]],
        });

        const doc = {
          templateId: String(c._id ?? c.slug ?? ""),
          text: baseLine,
          suggestedText: baseLine,
          topic: c.topic || topics[0],
          difficulty: c.difficulty || targetDifficulty || levelPrefs[0],
          minutes: Number.isFinite(c.minutes) ? Math.max(1, Math.min(30, Math.round(c.minutes))) : MINUTES_BY_DIFFICULTY[levelPrefs[0]],
        };

        const h = textHash(doc.text);
        if (usedTextHashes.includes(h)) continue;
        if (proposals.find(p => p.templateId === doc.templateId)) continue;

        proposals.push(doc);
        if (proposals.length >= 6) break;
      }
    }

    // cap to 2 per topic
    const perTopic = {};
    const capped = [];
    for (const p of proposals) {
      const t = p.topic || topics[0];
      perTopic[t] = (perTopic[t] || 0) + 1;
      if (perTopic[t] <= 2) capped.push(p);
    }

    // Fallback late: if nothing survived, pick 2-per-topic from isFallback=true
    if (capped.length === 0) {
      const byTopic = {};
      for (const t of topics) {
        byTopic[t] = await db.collection("challenges")
          .find({ topic: t, isFallback: true })
          .project({ slug: 1, topic: 1, title: 1, minutes: 1, difficulty: 1, type: 1 }) // keep _id
          .toArray();
      }
      const picked = pick2PerTopicStable(byTopic);
      if (picked.length) {
        return picked
          .filter(d => d && d.topic)
          .map(d => {
            const line = englishLine({ title: d.title, topic: d.topic, minutes: d.minutes });
            return {
              templateId: String(d._id ?? d.slug ?? ""),
              text: line,
              suggestedText: line,
              topic: d.topic,
              difficulty: d.difficulty || levelPrefs[0],
              minutes: Number.isFinite(d.minutes) ? Math.max(1, Math.min(30, Math.round(d.minutes))) : MINUTES_BY_DIFFICULTY[levelPrefs[0]],
            };
          })
          .slice(0, 6);
      }
    }

    return capped.slice(0, 6);
  } catch (e) {
    console.warn("[planner] fallback due to error:", e?.message || e);
  }

  // final ultra-safe fallback
  return [
    { text: "dareU: Walk outside for 5 minutes", suggestedText: "dareU: Walk outside for 5 minutes", topic: "general", difficulty: "easy", minutes: 5 },
    { text: "dareU: Stretch for 3 minutes", suggestedText: "dareU: Stretch for 3 minutes", topic: "general", difficulty: "easy", minutes: 3 },
  ];
}
