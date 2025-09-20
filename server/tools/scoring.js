export function courageScore({ socialExposure=false, performanceRisk=false, novelty=false, timeCommitment=10 }) {
  let s = 0;
  if (socialExposure) s += 30;
  if (performanceRisk) s += 30;
  if (novelty) s += 20;
  s += Math.min(timeCommitment, 20);
  return Math.min(100, s);
}
export function motivationBonus(motivation, tags=[]) {
  const map = { competition: 'race', social: 'with_friends', reward: 'reward', curiosity: 'explore', discipline: 'consistency' };
  return tags.includes(map[motivation]) ? 10 : 0;
}
export function basePoints(difficulty) {
  return difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
}
export function totalPoints(difficulty, courage, motivation, tags=[]) {
  return basePoints(difficulty) + Math.round(courage/5) + motivationBonus(motivation, tags);
}
