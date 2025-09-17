import crypto from 'crypto';

export const userHistory = new Map();

export function getUserHistory(userId, limit = 100) {
  const arr = userHistory.get(userId) || [];
  return arr.slice(-limit).reverse();
}
export function saveDecision({ userId, challengeId, contentHash, status, mode, points, metadata }) {
  const arr = userHistory.get(userId) || [];
  arr.push({ challengeId, hash: contentHash, status, mode, points, createdAt: Date.now(), meta: metadata || {} });
  userHistory.set(userId, arr);
}
export function makeHash(ch) {
  const base = `${ch.title}|${ch.instructions}|${ch.topic}|${ch.difficulty}`;
  return crypto.createHash('md5').update(base).digest('hex');
}
export function seenBefore(userId, hash) {
  return (userHistory.get(userId) || []).some(r => r.hash === hash);
}
