/**
 * Returns the Monday 00:00:00 of the week containing the given date.
 * Week starts on Monday (ISO 8601).
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the first day of the month (00:00:00) for the given date.
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns a human-readable relative date string in pt-BR.
 */
export function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return `${diff} dias atrás`;
}

/**
 * Fills a 7-day week (Mon-Sun) with XP data, inserting 0 for missing days.
 */
export function fillWeeklyDays(
  weekStart: Date,
  xpByDay: { date: string; xp: number }[],
): { date: string; xp: number }[] {
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const found = xpByDay.find((x) => x.date === dateStr);
    result.push({ date: dateStr, xp: found?.xp ?? 0 });
  }
  return result;
}
