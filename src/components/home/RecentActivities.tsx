'use client';

import { motion } from 'framer-motion';
import type { ActivityEntry } from '@/types/activity';
import { CATEGORIES } from '@/types/activity';
import { relativeDate } from '@/lib/date-utils';

export default function RecentActivities({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="rounded-xl p-4 border border-white/5 bg-white/[0.02]"
      >
        <h3 className="text-xs font-medium text-gray-400 mb-3">Atividades recentes</h3>
        <p className="text-xs text-gray-600 text-center py-4">Nenhuma atividade registrada</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <h3 className="text-xs font-medium text-gray-400 mb-3">Atividades recentes</h3>

      <div className="space-y-2.5">
        {activities.map((a, i) => {
          const cat = CATEGORIES[a.category];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{cat?.icon ?? '📌'}</span>
                <span className="text-sm text-gray-300">{a.note ?? cat?.label ?? a.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-600">{relativeDate(a.created_at)}</span>
                <span className="text-xs text-green-400 font-mono font-medium">+{a.xp} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
