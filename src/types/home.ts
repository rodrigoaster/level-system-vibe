import type { ActivityEntry } from './activity';

export type TierId = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

export interface TierColorScheme {
  accent: string;
  glow: string;
  badge: string;
  ring: string;
}

export const TIER_COLORS: Record<TierId, TierColorScheme> = {
  bronze:  { accent: '#8899b0', glow: '#8899b033', badge: '#8899b0', ring: '#8899b066' },
  silver:  { accent: '#4d8ef7', glow: '#4d8ef733', badge: '#4d8ef7', ring: '#4d8ef766' },
  gold:    { accent: '#9b6ff8', glow: '#9b6ff833', badge: '#9b6ff8', ring: '#9b6ff866' },
  diamond: { accent: '#f7b740', glow: '#f7b74033', badge: '#f7b740', ring: '#f7b74066' },
  master:  { accent: '#f05555', glow: '#f0555533', badge: '#f05555', ring: '#f0555566' },
};

export interface RankInfo {
  level: number;
  tier: TierId;
  tierLabel: string;
  colors: TierColorScheme;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}

export interface StreakInfo {
  current: number;
  best: number;
}

export interface WeeklyBonus {
  threshold: number;
  bonus: number;
}

export const WEEKLY_BONUSES: WeeklyBonus[] = [
  { threshold: 50, bonus: 10 },
  { threshold: 100, bonus: 25 },
  { threshold: 200, bonus: 50 },
];

export interface WeeklyProgress {
  currentXP: number;
  bonuses: WeeklyBonus[];
  unlockedBonus: number | null;
}

export interface DayXP {
  date: string;
  xp: number;
}

export interface UserState {
  id: string;
  user_id: string;
  xp: number;
  streak: number;
  best_streak: number;
  total_tasks: number;
}

export interface HomeData {
  rank: RankInfo;
  streak: StreakInfo;
  weeklyProgress: WeeklyProgress;
  monthlyXP: DayXP[];
  weeklyXPByDay: DayXP[];
  recentActivities: ActivityEntry[];
}
