import OpenAI from 'openai';
import { makeHash, seenBefore } from '../tools/history.js';
import { courageScore, totalPoints } from '../tools/scoring.js';
import { randomUUID as uuid } from 'crypto';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // <- מודל בטוח וזמין לרוב

function fallback(topic, availability) {
  const est = Math.min(availability?.minutesPerSession || 15, 20);
  return [
    {
      id: uuid(),
      title: "dareU: Whisper a tiny win",
      instructions: "Write one micro-win from today and tell a close friend in one sentence. Take a photo of the note.",
      topic, difficulty: "easy", mode: "solo", est_time_min: est,
      tags: ["consistency","social_warmup"], evidence_type: "photo",
      psychology_hint: "Naming small wins builds self-efficacy.",
      courage: 20, points: 14, contentHash: "fallback-1"
    },
    {
      id: uuid(),
      title: "dareU: 3-minute park workout",
      instructions: "Do 3 sets of push-ups in a public park. If comfortable, ask a passerby to time you.",
      topic, difficulty: "medium", mode: "solo", est_time_min: est,
      tags: ["perform"], evidence_type: "photo",
      psychology_hint: "Brief exposure reduces avoidance.",
      courage: 55, points: 31, contentHash: "fallback-2"
    },
    {
      id: uuid(),
      title: "dareU: Friend sprint — first to 20 pull-ups wins",
      instructions: "Invite a friend. First to complete 20 pull-ups posts a proof photo. Winner gets +10 bonus points.",
      topic, difficulty: "hard", mode: "friend", est_time_min: est,
      tags: ["race","with_friends"], evidence_type: "photo",
      psychology_hint: "Competition can unlock effort.",
      courage: 70, points: 44, contentHash: "fallback-3"
    }
  ];
}

export async function planChallenges(profile, userId) {
  const { topics = [], motivation = 'competition', availability } = profile;
  const mainTopic = topics[0] || 'fitness';

  // בקשה למודל (מוגנת ב-try/catch)
  let ideas = [];
  try {
    const prompt = `
You are a DareU planner. Generate 5 short challenge ideas in ENGLISH for the topic "${mainTopic}".
Rules:
- Titles must start with "dareU:".
- Start EASY with psychological/mental depth (gentle exposure & reflection), then MEDIUM, then HARD.
- Include a friend/competition variant among them.
- For each: title, 2-4 step instructions, difficulty (easy/medium/hard), mode (solo/friend),
  est_time_min (fit ${availability?.minutesPerSession || 20} minutes), tags (array), evidence_type (photo/text/link),
  psychology_hint (1 short sentence).
Return strict JSON with key "challenges".
    `.trim();

    const r = await client.responses.create({
      model: MODEL,            // <- משתמש במודל מה-ENV או gpt-4o-mini
      input: prompt,
      temperature: 0.7
    });

    const text = r.output_text ?? "";
    try {
      const parsed = JSON.parse(text);
      if (parsed?.challenges && Array.isArray(parsed.challenges)) {
        ideas = parsed.challenges;
      }
    } catch (e) {
      console.warn("LLM returned non-JSON, using fallback. Raw:", text.slice(0, 200));
    }
  } catch (err) {
    console.error("OpenAI call failed:", err?.message || err);
  }

  // בנייה, ניקוד וסינון כפילויות
  const out = [];
  const baseList = ideas.length ? ideas : fallback(mainTopic, availability);
  for (const idea of baseList) {
    const ch = {
      id: idea.id || uuid(),
      title: String(idea.title || '').trim(),
      instructions: String(idea.instructions || '').trim(),
      topic: mainTopic,
      difficulty: ['easy','medium','hard'].includes(idea.difficulty) ? idea.difficulty : 'easy',
      mode: (idea.mode === 'friend' ? 'friend' : 'solo'),
      est_time_min: Number(idea.est_time_min || availability?.minutesPerSession || 15),
      tags: Array.isArray(idea.tags) ? idea.tags : [],
      evidence_type: ['photo','text','link'].includes(idea.evidence_type) ? idea.evidence_type : 'photo',
      psychology_hint: String(idea.psychology_hint || 'Start small, reflect, and build confidence.')
    };

    const courage = ch.courage ?? courageScore({
      socialExposure: ch.tags.includes('with_friends') || ch.mode === 'friend',
      performanceRisk: ch.tags.includes('race') || ch.tags.includes('perform'),
      novelty: ch.tags.includes('explore'),
      timeCommitment: Math.min(ch.est_time_min, 20)
    });

    ch.courage = courage;
    ch.points = ch.points ?? totalPoints(ch.difficulty, courage, motivation, ch.tags);

    if (!ch.title.toLowerCase().startsWith('dareu:')) ch.title = `dareU: ${ch.title}`;

    const hash = ch.contentHash || (makeHash(ch));
    if (seenBefore(userId, hash)) continue;
    ch.contentHash = hash;

    out.push(ch);
  }

  if (!out.length) return fallback(mainTopic, availability);
  if (!out.some(c => c.mode === 'friend')) {
    const last = out[out.length - 1];
    out.push({
      ...last,
      id: uuid(),
      mode: 'friend',
      title: 'dareU: Friend sprint — first to finish gets +10',
      tags: Array.from(new Set([...(last.tags||[]), 'race', 'with_friends'])),
      contentHash: 'friend-injected'
    });
  }
  return out.slice(0, 5);
}
