export function nextDifficulty(current, streak) {
  if (streak.success >= 2 && current !== 'hard') return current === 'easy' ? 'medium' : 'hard';
  if (streak.decline >= 2 && current !== 'easy') return current === 'hard' ? 'medium' : 'easy';
  return current;
}
