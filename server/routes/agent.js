import { Router } from 'express';
import { getUserHistory, saveDecision } from '../tools/history.js';
import { planChallenges } from '../agents/planner.js';

const router = Router();

router.post('/plan', async (req, res) => {
  try {
    const profile = req.body.profile || {};
    if (!profile.userId) return res.status(400).json({ error: 'Missing userId' });
    const challenges = await planChallenges(profile, profile.userId);
    res.json({ challenges });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'planner_failed' });
  }
});

router.post('/decision', async (req, res) => {
  try {
    const { userId, challenge, decision } = req.body;
    if (!userId || !challenge || !decision) return res.status(400).json({ error: 'bad_request' });

    saveDecision({
      userId,
      challengeId: challenge.id,
      contentHash: challenge.contentHash,
      status: decision,
      mode: challenge.mode,
      points: challenge.points || 0,
      metadata: { topic: challenge.topic, difficulty: challenge.difficulty }
    });

    res.json({ ok: true, nextAction: decision === 'declined' ? 'request_alternative' : 'none' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'decision_failed' });
  }
});

router.get('/history', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'missing_userId' });
  res.json({ history: getUserHistory(userId) });
});

export default router;
