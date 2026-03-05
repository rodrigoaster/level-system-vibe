'use client';

import { motion } from 'framer-motion';
import type { DayXP } from '@/types/home';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function WeeklyChart({ data }: { data: DayXP[] }) {
  const maxXP = Math.max(...data.map((d) => d.xp), 1);
  const totalXP = data.reduce((s, d) => s + d.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-200 sm:text-lg">XP da Semana</h3>
        <span className="text-sm font-mono text-gray-300 sm:text-base">+{totalXP} XP</span>
      </div>

      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const pct = (d.xp / maxXP) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="text-xs font-mono text-gray-400 sm:text-sm"
              >
                {d.xp > 0 ? `+${d.xp}` : ''}
              </motion.span>
              <div className="w-full flex flex-col justify-end h-16">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 4)}%` }}
                  transition={{ duration: 0.7, delay: 0.6 + i * 0.08, ease: 'easeOut' }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  className="w-full rounded-md"
                  style={{
                    backgroundColor: d.xp > 0 ? '#4ade80' : '#ffffff08',
                    opacity: d.xp > 0 ? 0.7 : 1,
                  }}
                />
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.08 }}
                className="text-xs text-gray-400 sm:text-sm"
              >
                {DAYS[i]}
              </motion.span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
