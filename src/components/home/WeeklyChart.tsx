'use client';

import { motion } from 'framer-motion';
import type { DayXP } from '@/types/home';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function WeeklyChart({ data }: { data: DayXP[] }) {
  const maxXP = Math.max(...data.map((d) => d.xp), 1);
  const totalXP = data.reduce((s, d) => s + d.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex-1 rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400">XP da Semana</h3>
        <span className="text-xs text-gray-600 font-mono">+{totalXP} XP</span>
      </div>

      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => {
          const pct = (d.xp / maxXP) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-500 font-mono">
                {d.xp > 0 ? `+${d.xp}` : ''}
              </span>
              <div className="w-full flex flex-col justify-end h-14">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 2)}%` }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: 'easeOut' }}
                  className="w-full rounded-sm"
                  style={{
                    backgroundColor: d.xp > 0 ? '#4ade80' : '#ffffff08',
                    opacity: d.xp > 0 ? 0.7 : 1,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-600">{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
