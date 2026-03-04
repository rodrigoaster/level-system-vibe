import type { CategoryId } from './activity';

export interface Mission {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  category: CategoryId;
  day_of_week: number | null; // 0=Mon to 6=Sun, null = every day
  is_fixed: boolean;
  created_at: string;
}

export interface MissionCompletion {
  id: string;
  mission_id: string;
  user_id: string;
  activity_id: string;
  completed_at: string; // ISO date string (YYYY-MM-DD)
}

export interface HabitDayStatus {
  mission_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface HabitGridData {
  missions: Mission[];
  completions: MissionCompletion[];
  days: string[]; // all YYYY-MM-DD strings in the month
}

export interface MonthlyHabitStats {
  dailyRates: number[]; // completion rate per day (0–1)
  monthlyRate: number;  // overall month rate (0–1)
}
