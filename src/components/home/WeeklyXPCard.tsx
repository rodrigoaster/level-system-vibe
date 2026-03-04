'use client';

import { motion } from 'framer-motion';
import type { WeeklyProgress } from '@/types/home';

export default function WeeklyXPCard({ progress }: { progress: WeeklyProgress }) {
  const maxThreshold = progress.bonuses[progress.bonuses.length - 1]?.threshold ?? 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="flex-1 rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
              className="text-xl font-bold text-green-400 font-mono"
            >
              +{progress.currentXP}
            </motion.span>
            <span className="text-sm text-green-400 font-medium">XP</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            meta: {maxThreshold} XP
          </p>
        </div>
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-lg"
        >
          ⚡
        </motion.span>
      </div>
    </motion.div>
  );
}
