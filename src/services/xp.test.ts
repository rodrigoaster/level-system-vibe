import { describe, it, expect } from 'vitest';
import { computeLevel } from './xp';

// ---------------------------------------------------------------------------
// Level formula (pure logic verification)
// ---------------------------------------------------------------------------

describe('computeLevel (quadratic: 50*(L-1)^2)', () => {
  const cases: [number, number][] = [
    [0, 1],      // 50*0=0 <= 0, 50*1=50 > 0 → level 1
    [49, 1],     // 50*1=50 > 49 → level 1
    [50, 2],     // 50*1=50 <= 50, 50*4=200 > 50 → level 2
    [199, 2],    // 50*1=50 <= 199, 50*4=200 > 199 → level 2
    [200, 3],    // 50*4=200 <= 200, 50*9=450 > 200 → level 3
    [450, 4],    // 50*9=450 <= 450, 50*16=800 > 450 → level 4
    [800, 5],    // 50*16=800 <= 800, 50*25=1250 > 800 → level 5
  ];

  it.each(cases)('%i XP → level %i', (xp, expectedLevel) => {
    expect(computeLevel(xp)).toBe(expectedLevel);
  });
});
