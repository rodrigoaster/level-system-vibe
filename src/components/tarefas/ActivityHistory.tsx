'use client';

import { motion } from 'framer-motion';
import type { ActivityEntry } from '@/types/activity';
import { CATEGORIES } from '@/types/activity';
import { CATEGORY_COLORS } from '@/lib/category-colors';
import { relativeDate } from '@/lib/date-utils';

interface ActivityHistoryProps {
  activities: ActivityEntry[];
}

interface DayGroup {
  date: string;
  label: string;
  totalXP: number;
  entries: ActivityEntry[];
}

function groupByDay(activities: ActivityEntry[]): DayGroup[] {
  const map = new Map<string, ActivityEntry[]>();

  for (const a of activities) {
    const date = a.created_at.split('T')[0];
    const group = map.get(date);
    if (group) {
      group.push(a);
    } else {
      map.set(date, [a]);
    }
  }

  return Array.from(map.entries()).map(([date, entries]) => ({
    date,
    label: relativeDate(entries[0].created_at),
    totalXP: entries.reduce((sum, e) => sum + e.xp, 0),
    entries,
  }));
}

export default function ActivityHistory({ activities }: ActivityHistoryProps) {
  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
      >
        <h3 className="mb-4 text-base font-medium text-gray-200 sm:text-lg">Historico</h3>
        <p className="py-6 text-center text-sm text-gray-400 sm:text-base">Nenhuma atividade registrada</p>
      </motion.div>
    );
  }

  const groups = groupByDay(activities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <h3 className="mb-3 text-base font-medium text-gray-200 sm:text-lg">Historico</h3>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.date}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">{group.label}</span>
              <span className="font-mono text-sm font-semibold text-emerald-400">+{group.totalXP} XP</span>
            </div>

            <div className="divide-y divide-white/5">
              {group.entries.map((a) => {
                const cat = CATEGORIES[a.category];
                const colors = CATEGORY_COLORS[a.category];
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-2 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: colors?.bg ?? 'rgba(255,255,255,0.08)' }}
                      >
                        {cat?.icon ?? '📌'}
                      </div>
                      <span className="text-sm text-gray-100">
                        {a.note ?? cat?.label ?? a.category}
                      </span>
                    </div>
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{ color: colors?.text ?? '#86efac' }}
                    >
                      +{a.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
