'use client';

import { motion } from 'framer-motion';
import type { WeeklyProgress } from '@/types/home';

export default function WeeklyXPCard({ progress }: { progress: WeeklyProgress }) {
  const maxThreshold = progress.bonuses[progress.bonuses.length - 1]?.threshold ?? 200;
  const pct = Math.min((progress.currentXP / maxThreshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-default rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
              className="font-mono text-2xl font-bold text-green-300 sm:text-3xl"
            >
              +{progress.currentXP}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg font-medium text-green-300 sm:text-xl"
            >
              XP
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-1 text-xs text-gray-400 sm:text-sm"
          >
            meta: {maxThreshold} XP
          </motion.p>
        </div>
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-2xl sm:text-3xl"
        >
          ⚡
        </motion.span>
      </div>

      {/* Mini progress bar toward weekly goal */}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-green-500/70 to-green-400/90"
          style={{ boxShadow: '0 0 8px rgba(74,222,128,0.4)' }}
        />
      </div>
    </motion.div>
  );
}
