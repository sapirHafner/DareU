import { Router } from 'express';
const router = Router();

router.post('/add', (req, res) => {
  const { userId, title, startISO, durationMin = 30 } = req.body || {};
  if (!userId || !title || !startISO) return res.status(400).json({ error: 'bad_request' });
  const fake = `https://calendar.google.com/fake?title=${encodeURIComponent(title)}&start=${encodeURIComponent(startISO)}`;
  res.json({ ok: true, htmlLink: fake, note: 'Calendar OAuth not configured yet' });
});

export default router;
