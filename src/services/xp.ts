/**
 * Quadratic level formula: largest L where 50*(L-1)^2 <= xp
 */
export function computeLevel(xp: number): number {
  let level = 1;
  while (50 * level * level <= xp) {
    level++;
  }
  return level;
}
