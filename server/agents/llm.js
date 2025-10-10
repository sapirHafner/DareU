// server/agents/llm.js
import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normKey(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/^dareu:\s*/i, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashKey(s = "") {
  return crypto.createHash("sha1").update(normKey(s)).digest("hex");
}

/**
 * Ask the LLM for small challenge proposals.
 * Returns array of {type, refId?, text?, topic, difficulty, minutes}
 */
export async function proposeChallengesLLM({
  topics = ["fitness"],
  level = "beginner",
  motivation = "intrinsic",
  avoidTemplateIds = [],
  avoidTexts = [],
  avoidHashes = [],
  catalog = [],
  max = 4,
  targetDifficulty = "easy",
}) {
  // build a compact avoid list (by normalized hashes)
  const avoid = new Set([
    ...avoidHashes,
    ...avoidTexts.map(hashKey),
  ]);

  // Simple description for difficulty → minutes guardrails
  const minutesGuide = {
    easy: "3–10 minutes, no equipment, very low social risk",
    medium: "10–20 minutes, mild effort, minor social exposure",
    hard: "15–30 minutes, clearly challenging, optional social exposure",
  };

  const system = [
    `You are DareU, a micro-challenge planner.`,
    `Return ONLY valid JSON (no commentary).`,
    `Propose ${max} concise, actionable challenges.`,
    `Each item must be: { "type":"custom"|"catalog", "refId"?:string, "text"?:string, "topic":string, "difficulty":"easy"|"medium"|"hard", "minutes":number }`,
    `Use the given topics. Prefer difficulty ${targetDifficulty} appropriate for user's level (${level}).`,
    `Minutes must follow: ${JSON.stringify(minutesGuide)}.`,
    `Avoid duplicates and near-duplicates. Do not repeat any "avoid" hashes.`,
    `Keep text short (<=90 chars), imperative, in English.`,
  ].join("\n");

  const user = {
    topics,
    level,
    motivation,
    targetDifficulty,
    minutesGuide,
    max,
    catalog: catalog.slice(0, 40).map(c => ({
      id: c.id, title: c.title, topic: c.topic, difficulty: c.difficulty, minutes: c.minutes
    })),
    avoid: {
      templateIds: avoidTemplateIds,
      textHashes: Array.from(avoid),
    },
    // Examples of accepted outputs are implicit by schema
  };

  try {
    const resp = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
      ],
      response_format: { type: "json_object" },
    });

    const raw = resp.choices?.[0]?.message?.content || "{}";
    // Expect a top-level {"items":[...]}
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { items: [] };
    }
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    // Normalize + filter client-side again
    const out = [];
    const seen = new Set();
    for (const it of items) {
      if (!it || !it.topic) continue;
      const topic = String(it.topic || topics[0]).trim();
      const difficulty = ["easy","medium","hard"].includes(String(it.difficulty)) ? it.difficulty : targetDifficulty;
      const minutesNum = Math.min(30, Math.max(1, Math.round(Number(it.minutes || 5))));
      if (it.type === "catalog" && it.refId) {
        // catalog pick
        const key = `id:${it.refId}`;
        if (seen.has(key)) continue;
        if (avoidTemplateIds.includes(it.refId)) continue;
        out.push({ type: "catalog", refId: it.refId, topic, difficulty, minutes: minutesNum });
        seen.add(key);
      } else if (it.type === "custom" && it.text) {
        // custom text
        const text = String(it.text).trim();
        const h = hashKey(text);
        if (avoid.has(h)) continue;
        const key = `t:${h}`;
        if (seen.has(key)) continue;
        out.push({ type: "custom", text, topic, difficulty, minutes: minutesNum });
        seen.add(key);
      }
      if (out.length >= max) break;
    }
    return out;
  } catch (e) {
    console.warn("[llm] proposeChallengesLLM failed:", e.message);
    return []; // planner will fallback
  }
}
