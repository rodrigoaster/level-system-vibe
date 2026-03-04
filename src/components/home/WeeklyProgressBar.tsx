'use client';

import { motion } from 'framer-motion';
import type { WeeklyProgress } from '@/types/home';

export default function WeeklyProgressBar({ progress }: { progress: WeeklyProgress }) {
  const maxThreshold = progress.bonuses[progress.bonuses.length - 1]?.threshold ?? 200;
  const pct = Math.min((progress.currentXP / maxThreshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400">Progresso da semana</h3>
        {progress.unlockedBonus && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[10px] text-green-400 font-medium"
          >
            +{progress.unlockedBonus} XP bônus desbloqueado
          </motion.span>
        )}
      </div>

      <div className="relative">
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-green-500/70 to-green-400/90"
          />
        </div>

        {progress.bonuses.map((b, i) => {
          const pos = (b.threshold / maxThreshold) * 100;
          const unlocked = progress.currentXP >= b.threshold;
          return (
            <motion.div
              key={b.threshold}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0 + i * 0.15, type: 'spring', stiffness: 300 }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 -ml-1.5 ${
                  unlocked
                    ? 'bg-green-400 border-green-500'
                    : 'bg-gray-800 border-gray-600'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2">
        {progress.bonuses.map((b) => (
          <div
            key={b.threshold}
            className="text-center"
            style={{ width: `${(1 / progress.bonuses.length) * 100}%` }}
          >
            <p className={`text-[10px] font-mono ${progress.currentXP >= b.threshold ? 'text-green-400' : 'text-gray-600'}`}>
              {b.threshold} XP
            </p>
            <p className={`text-[9px] ${progress.currentXP >= b.threshold ? 'text-green-400/60' : 'text-gray-700'}`}>
              +{b.bonus} bônus
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
