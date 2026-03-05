'use client';

import { motion } from 'framer-motion';
import type { WeeklyProgress } from '@/types/home';

export default function WeeklyProgressBar({ progress }: { progress: WeeklyProgress }) {
  const maxThreshold = progress.bonuses[progress.bonuses.length - 1]?.threshold ?? 200;
  const pct = Math.min((progress.currentXP / maxThreshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-medium text-gray-200 sm:text-lg">Progresso da semana</h3>
        {progress.unlockedBonus && (
          <motion.span
            initial={{ opacity: 0, x: 15, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
            className="text-xs font-medium text-green-300 sm:text-sm"
          >
            +{progress.unlockedBonus} XP bônus desbloqueado ✓
          </motion.span>
        )}
      </div>

      {/* Bar + threshold markers */}
      <div className="relative mb-5">
        <div className="h-3 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-green-500/70 to-green-400/90"
            style={{ boxShadow: '0 0 10px rgba(74,222,128,0.35)' }}
          />
        </div>

        {/* Threshold dot markers */}
        {progress.bonuses.map((b, i) => {
          const pos = (b.threshold / maxThreshold) * 100;
          const unlocked = progress.currentXP >= b.threshold;
          return (
            <motion.div
              key={b.threshold}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0 + i * 0.15, type: 'spring', stiffness: 300 }}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            >
              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  unlocked
                    ? 'bg-green-400 border-green-300'
                    : 'bg-[#0d1520] border-gray-600'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Threshold labels — positioned absolutely aligned with dots */}
      <div className="relative h-8">
        {progress.bonuses.map((b, i) => {
          const pos = (b.threshold / maxThreshold) * 100;
          const unlocked = progress.currentXP >= b.threshold;
          return (
            <motion.div
              key={b.threshold}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${pos}%` }}
            >
              <p className={`text-xs font-mono leading-tight sm:text-sm ${unlocked ? 'text-green-300' : 'text-gray-500'}`}>
                {b.threshold} XP
              </p>
              <p className={`text-xs leading-tight ${unlocked ? 'text-green-400/70' : 'text-gray-600'}`}>
                +{b.bonus}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
