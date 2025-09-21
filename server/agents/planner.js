import OpenAI from 'openai';
import { makeHash, seenBefore, getUserHistory } from '../tools/history.js';
import { courageScore, totalPoints } from '../tools/scoring.js';
import { randomUUID as uuid } from 'crypto';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// אתגרים פשוטים וממוקדים - 2 בלבד לכל נושא, עם אפשרויות זמן שונות
const FALLBACK_CHALLENGES = {
  "Building Self-Confidence": [
    { text: "Practice introducing yourself to a mirror", time: 5 },
    { text: "Make eye contact with 3 strangers during the day", time: 15 }
  ],
  "Fitness & Sports": [
    { text: "Do 20 jumping jacks with full energy", time: 5 },
    { text: "Take a 15-minute energetic walk outside", time: 15 }
  ],
  "Public Speaking": [
    { text: "Record yourself telling a 2-minute story about your day", time: 5 },
    { text: "Ask one question in your next group conversation", time: 10 }
  ],
  "Creativity": [
    { text: "Write a short poem about your current mood", time: 5 }, 
    { text: "Sketch something you see right now for 10 minutes", time: 10 }
  ],
  "Learning & Growth": [
    { text: "Learn 3 new words in any language", time: 5 },
    { text: "Watch a 10-minute educational video on a topic you're curious about", time: 10 }
  ],
  "Social Skills": [
    { text: "Give someone a genuine compliment", time: 5 },
    { text: "Start a conversation with someone in line at the store", time: 10 }
  ],
  "Personal Goals": [
    { text: "Write down one specific goal you want to achieve this month", time: 5 },
    { text: "Take one small action toward a goal you've been postponing", time: 15 }
  ],
  "Communication Skills": [
    { text: "Call a friend you haven't spoken to in a week", time: 10 },
    { text: "Practice active listening in your next conversation", time: 15 }
  ]
};

function generateFallback(topics, userLevel, availability, seenHashes = new Set()) {
  const challenges = [];
  
  topics.forEach((topic) => {
    const topicChallenges = FALLBACK_CHALLENGES[topic] || FALLBACK_CHALLENGES["Building Self-Confidence"];
    
    // בדיוק 2 משימות לכל נושא שלא נראו בעבר
    let addedForTopic = 0;
    for (let i = 0; i < topicChallenges.length && addedForTopic < 2; i++) {
      const challengeData = topicChallenges[i];
      const challengeText = challengeData.text;
      const timeMinutes = challengeData.time;
      
      // בדיקה שלא ראינו את המשימה הזו בעבר
      const hash = makeHash({ title: challengeText, topic, time: timeMinutes });
      if (seenHashes.has(hash)) {
        continue; // דלג על משימה שכבר נראתה
      }
      
      const difficulty = userLevel <= 1 ? 'easy' : userLevel <= 3 ? 'medium' : 'hard';
      
      challenges.push({
        id: uuid(),
        title: `dareU: ${challengeText}`,
        instructions: "",
        topic,
        difficulty,
        mode: 'solo',
        est_time_min: timeMinutes,
        tags: getTagsForTopic(topic),
        evidence_type: "none",
        psychology_hint: getHintForTopic(topic),
        courage: courageScore({
          socialExposure: challengeText.includes('stranger') || challengeText.includes('conversation') || challengeText.includes('call'),
          performanceRisk: difficulty !== 'easy',
          novelty: true,
          timeCommitment: timeMinutes
        }),
        contentHash: hash
      });
      
      addedForTopic++;
    }
  });
  
  return challenges;
}

function getTagsForTopic(topic) {
  const tagMap = {
    "Building Self-Confidence": ["confidence", "self_growth"],
    "Fitness & Sports": ["physical", "energy"],
    "Public Speaking": ["social", "communication"],
    "Creativity": ["creative", "expression"],
    "Learning & Growth": ["learning", "curiosity"],
    "Social Skills": ["social", "interaction"],
    "Personal Goals": ["goals", "action"]
  };
  
  return tagMap[topic] || ["general"];
}

function getHintForTopic(topic) {
  const hints = {
    "Building Self-Confidence": "Small confident actions build lasting self-assurance.",
    "Fitness & Sports": "Movement creates energy and improves mood instantly.",
    "Public Speaking": "Practice reduces fear of judgment and builds communication skills.",
    "Creativity": "Creative expression unlocks new ways of thinking.",
    "Learning & Growth": "Learning little and often compounds over time.",
    "Social Skills": "Small social interactions build connection and confidence.",
    "Personal Goals": "Taking action, however small, creates momentum toward your goals."
  };
  
  return hints[topic] || "Every small step counts toward growth.";
}

export async function planChallenges(profile, userId) {
  const { topics = [], motivation = 'intrinsic', availability, userLevel = 1 } = profile;
  
  // מגבלת 3 נושאים מקסימום (2 משימות כל אחד = 6 משימות ליום)
  const limitedTopics = topics.slice(0, 3);
  const challengesPerTopic = 2;
  const maxChallenges = limitedTopics.length * challengesPerTopic;
  
  // שמירת המשימות שכבר הוצגו למשתמש כדי שלא יחזרו בעתיד
  const history = getUserHistory(userId, 200); // יותר היסטוריה לזכרון טוב יותר
  const seenHashes = new Set(
    history
      .map(h => h.contentHash)
      .filter(Boolean)
      .concat(history.map(h => h.challengeId).filter(Boolean)) // גם IDs של אתגרים
  );
  
  // חישוב רמת קושי דינמית
  const completedChallenges = history.filter(h => h.status === 'success').length;
  const successRate = history.length > 0 ? completedChallenges / history.length : 0;
  const dynamicDifficulty = getDynamicDifficulty(userLevel, successRate);
  
  let generatedChallenges = [];
  
  // ניסיון יצירה עם AI
  try {
    for (const topic of limitedTopics) {
      const topicChallenges = await generateChallengesForTopic(
        topic, 
        dynamicDifficulty,
        availability,
        motivation,
        userId,
        seenHashes // העברת הרשימה של משימות שכבר נראו
      );
      generatedChallenges.push(...topicChallenges);
    }
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    generatedChallenges = generateFallback(limitedTopics, userLevel, availability, seenHashes);
  }
  
  // קיבוץ לפי נושאים ושמירה על מגבלת 2 לנושא - ללא כפילויות
  const challengesByTopic = {};
  const allUsedHashes = new Set(seenHashes); // כל ה-hashes שכבר השתמשנו בהם
  
  for (const challenge of generatedChallenges) {
    const topic = challenge.topic;
    if (!challengesByTopic[topic]) {
      challengesByTopic[topic] = [];
    }
    
    // רק אם לא ראינו את המשימה הזו בעבר ויש פחות מ-2 במאותו נושא
    const hash = challenge.contentHash || makeHash(challenge);
    if (!allUsedHashes.has(hash) && challengesByTopic[topic].length < 2) {
      challenge.contentHash = hash;
      challenge.points = challenge.points || totalPoints(
        challenge.difficulty, 
        challenge.courage, 
        motivation, 
        challenge.tags
      );
      challengesByTopic[topic].push(challenge);
      allUsedHashes.add(hash); // הוסף ל-set כדי למנוע כפילויות
    }
  }
  
  // אם אין מספיק משימות, הוסף מה-fallback
  for (const topic of limitedTopics) {
    if (!challengesByTopic[topic] || challengesByTopic[topic].length < 2) {
      const fallbackChallenges = generateFallback([topic], userLevel, availability, allUsedHashes);
      const needed = 2 - (challengesByTopic[topic]?.length || 0);
      
      for (let i = 0; i < needed && i < fallbackChallenges.length; i++) {
        const fallback = fallbackChallenges[i];
        if (!allUsedHashes.has(fallback.contentHash)) {
          if (!challengesByTopic[topic]) challengesByTopic[topic] = [];
          challengesByTopic[topic].push(fallback);
          allUsedHashes.add(fallback.contentHash);
        }
      }
    }
  }
  
  // המרה חזרה לרשימה שטוחה
  const finalChallenges = [];
  for (const topic of limitedTopics) {
    const topicChallenges = challengesByTopic[topic] || [];
    finalChallenges.push(...topicChallenges);
  }
  
  return finalChallenges;
}

async function generateChallengesForTopic(topic, difficulty, availability, motivation, userId, seenHashes = new Set()) {
  const prompt = `
Generate exactly 2 unique personalized challenges for the topic "${topic}".

Requirements:
- All titles MUST start with "dareU: " 
- Difficulty level: ${difficulty}
- User motivation type: ${motivation}
- Time options: either 5 minutes OR 10-15 minutes per challenge
- Make challenges practical, specific, and achievable
- NO documentation, reflection, or learning required - just the direct action
- Focus on simple, concrete actions the user can complete immediately
- Be specific and actionable, not vague
- Ensure challenges are different from each other

One challenge should be quick (5 minutes), one should be longer (10-15 minutes).

Examples of good challenges:
- "dareU: Call a friend you haven't spoken to in a month" (10 min)
- "dareU: Do 25 push-ups without stopping" (5 min)
- "dareU: Write a thank you note to someone who helped you" (5 min)

For each challenge provide:
- title (starting with "dareU: " - be specific and actionable)
- instructions (exactly the same as title - just the action, no additional steps)
- difficulty (${difficulty})
- mode (solo)
- est_time_min (either 5 OR between 10-15 minutes)
- tags (array of 2 relevant tags)
- evidence_type (none)
- psychology_hint (one short sentence explaining why this helps)

Return as JSON with key "challenges" containing exactly 2 different challenges.
  `.trim();

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8, // מעט יותר יצירתיות כדי למנוע חזרות
    max_tokens: 1000
  });

  const text = response.choices[0]?.message?.content || "";
  
  try {
    const parsed = JSON.parse(text);
    if (parsed?.challenges && Array.isArray(parsed.challenges)) {
      const uniqueChallenges = [];
      
      for (const challenge of parsed.challenges.slice(0, 2)) {
        const challengeTitle = challenge.title?.startsWith('dareU:') ? challenge.title : `dareU: ${challenge.title}`;
        const hash = makeHash({ title: challengeTitle, topic, time: challenge.est_time_min });
        
        // בדוק שלא ראינו את המשימה הזו בעבר
        if (!seenHashes.has(hash)) {
          uniqueChallenges.push({
            id: uuid(),
            title: challengeTitle,
            instructions: "",
            topic,
            difficulty: difficulty,
            mode: 'solo',
            est_time_min: Math.max(5, Math.min(challenge.est_time_min || 10, 15)), // בין 5 ל-15 דקות
            tags: Array.isArray(challenge.tags) ? challenge.tags.slice(0, 2) : getTagsForTopic(topic),
            evidence_type: "none",
            psychology_hint: challenge.psychology_hint || getHintForTopic(topic),
            courage: courageScore({
              socialExposure: challengeTitle?.toLowerCase().includes('stranger') || 
                              challengeTitle?.toLowerCase().includes('conversation') ||
                              challengeTitle?.toLowerCase().includes('ask') ||
                              challengeTitle?.toLowerCase().includes('call'),
              performanceRisk: difficulty !== 'easy',
              novelty: true,
              timeCommitment: challenge.est_time_min || 10
            }),
            contentHash: hash
          });
        }
      }
      
      return uniqueChallenges;
    }
  } catch (e) {
    console.warn("Failed to parse AI response:", e);
  }
  
  // fallback אם AI לא הצליח
  return generateFallback([topic], 1, availability, seenHashes).slice(0, 2);
}

function getDynamicDifficulty(userLevel, successRate) {
  if (userLevel <= 1) return 'easy';
  if (successRate >= 0.8 && userLevel >= 3) return 'hard';
  if (successRate >= 0.6 && userLevel >= 2) return 'medium';
  return 'easy';
}