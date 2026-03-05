'use client';

import { motion } from 'framer-motion';
import type { ActivityEntry, CategoryId } from '@/types/activity';
import { CATEGORIES } from '@/types/activity';
import { relativeDate } from '@/lib/date-utils';

const CATEGORY_COLORS: Record<CategoryId, { bg: string; text: string }> = {
  fitness:    { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd' },
  nutrition:  { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7' },
  delivery:   { bg: 'rgba(249,115,22,0.15)',  text: '#fdba74' },
  learning:   { bg: 'rgba(74,222,128,0.15)',  text: '#86efac' },
  spiritual:  { bg: 'rgba(167,139,250,0.15)', text: '#c4b5fd' },
  social:     { bg: 'rgba(250,204,21,0.15)',  text: '#fde047' },
  creativity: { bg: 'rgba(244,114,182,0.15)', text: '#f9a8d4' },
};

export default function RecentActivities({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
      >
        <h3 className="mb-4 text-base font-medium text-gray-200 sm:text-lg">Atividades recentes</h3>
        <p className="py-6 text-center text-sm text-gray-400 sm:text-base">Nenhuma atividade registrada</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <h3 className="mb-3 text-base font-medium text-gray-200 sm:text-lg">Atividades recentes</h3>

      <div className="divide-y divide-white/5">
        {activities.map((a, i) => {
          const cat = CATEGORIES[a.category];
          const colors = CATEGORY_COLORS[a.category];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
              whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="flex items-center justify-between px-2 py-3 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                {/* Colored icon container */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-base"
                  style={{ backgroundColor: colors?.bg ?? 'rgba(255,255,255,0.08)' }}
                >
                  <span style={{ filter: 'grayscale(0.2)' }}>{cat?.icon ?? '📌'}</span>
                </div>
                <span className="text-sm text-gray-100 sm:text-base">
                  {a.note ?? cat?.label ?? a.category}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 sm:text-sm">{relativeDate(a.created_at)}</span>
                <span
                  className="font-mono text-sm font-semibold sm:text-base"
                  style={{ color: colors?.text ?? '#86efac' }}
                >
                  +{a.xp} XP
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
