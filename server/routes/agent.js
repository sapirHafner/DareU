import { Router } from 'express';
import { planChallenges } from '../agents/planner.js';
import { getUserHistory, saveDecision } from '../tools/history.js';
import { nextDifficulty } from '../tools/progression.js';

const router = Router();

// יצירת אתגרים על בסיס שאלון
router.post('/plan', async (req, res) => {
  try {
    const { 
      userId, 
      surveyData,  // נתוני השאלון החדשים
      userLevel = 1,
      availability = { minutesPerSession: 15 }
    } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // המרת נתוני השאלון לפרופיל
    const profile = surveyDataToProfile(surveyData, userLevel, availability);
    
    const challenges = await planChallenges(profile, userId);
    
    res.json({ 
      challenges,
      profile: {
        topics: profile.topics,
        primaryMotivation: profile.motivation,
        currentLevel: userLevel
      }
    });
  } catch (error) {
    console.error('Error in /agent/plan:', error);
    res.status(500).json({ error: 'internal_error', message: error.message });
  }
});

// החלטה על אתגר (Success/Later/Skip)
router.post('/decision', (req, res) => {
  const { userId, challengeId, contentHash, status, mode, points, metadata } = req.body || {};
  
  if (!userId || !challengeId || !status) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }

  saveDecision({ userId, challengeId, contentHash, status, mode, points, metadata });
  
  res.json({ ok: true, recorded: status });
});

// היסטוריית משתמש
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;
  
  const history = getUserHistory(userId, Number(limit));
  res.json({ history, count: history.length });
});

// המרת נתוני שאלון לפרופיל סוכן
function surveyDataToProfile(surveyData, userLevel, availability) {
  if (!surveyData) {
    // ברירת מחדל אם אין נתוני שאלון
    return {
      topics: ['Building Self-Confidence', 'Learning & Growth', 'Personal Goals'],
      motivation: 'intrinsic',
      availability,
      userLevel,
      motivationScores: {
        intrinsic: 0.7,
        social: 0.3,
        competitive: 0.2,
        extrinsic: 0.4
      }
    };
  }

  return {
    topics: surveyData.selectedTopics || ['Building Self-Confidence'],
    motivation: surveyData.primaryMotivation || 'intrinsic',
    availability,
    userLevel,
    motivationScores: surveyData.normalized || {
      intrinsic: 0.5,
      social: 0.5,
      competitive: 0.5,
      extrinsic: 0.5
    }
  };
}

export default router;