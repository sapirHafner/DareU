import { Router } from 'express';
import { randomUUID as uuid } from 'crypto';

const rooms = new Map();
const router = Router();

router.post('/create', (req, res) => {
  const { ownerUserId, challengeId } = req.body || {};
  if (!ownerUserId || !challengeId) return res.status(400).json({ error: 'bad_request' });
  const token = uuid();
  rooms.set(token, { ownerUserId, challengeId, finishedUserId: null });
  const joinUrl = `${process.env.APP_URL || 'http://localhost:5050'}/competition/join/${token}`;
  res.json({ joinUrl, token, firstFinishBonus: 10 });
});

router.post('/finish', (req, res) => {
  const { token, userId } = req.body || {};
  const room = rooms.get(token);
  if (!room) return res.status(404).json({ error: 'room_not_found' });
  const first = !room.finishedUserId;
  if (first) room.finishedUserId = userId;
  res.json({ first, bonus: first ? 10 : 0 });
});

export default router;   // 👈 זה החלק שהיה חסר
