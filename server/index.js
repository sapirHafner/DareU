// index.js (חדש)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import agentRouter from './routes/agent.js';
import competitionRouter from './routes/competition.js';
import calendarRouter from './routes/calendar.js';

const app = express();
app.use(cors());
app.use(express.json());

// בדיקת חיבור (להשאיר)
app.get('/health', (_req, res) => res.json({ ok: true }));

// ===== ראוטרים חדשים =====
app.use('/agent', agentRouter);           // /agent/plan , /agent/decision , /agent/history
app.use('/competition', competitionRouter); // /competition/create , /competition/finish
app.use('/calendar', calendarRouter);       // /calendar/add (Stub כרגע)

// ===== מסלול ישן (Legacy) – אפשר להשאיר זמנית או למחוק =====
app.post('/agent/generateDailyChallenge', (req, res) => {
  const { topicId = 'general' } = req.body || {};
  res.json({
    challenge: {
      id: `ch_${topicId}_${Date.now()}`,
      topicId,
      title: 'צעד מיקרו התחלתי',
      description: `בצע/י פעולה של 10 דק׳ בנושא ${topicId}`,
      microFallback: 'מיקרו: 2 דק׳ הכנה',
      estMinutes: 10,
      difficulty: 'easy',
      tips: ['רשמו תחושה לפני/אחרי'],
      motivationCue: 'intrinsic',
      successMetric: 'done',
      createdAt: new Date().toISOString(),
    },
  });
});

const PORT = process.env.PORT || 5050; // שומר את ברירת המחדל שלך
app.listen(PORT, () => console.log(`[agent] running on http://localhost:${PORT}`));
