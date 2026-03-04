'use client';

import { motion } from 'framer-motion';
import type { DayXP } from '@/types/home';

const W = 400;
const H = 120;
const PAD_X = 0;
const PAD_Y = 10;

export default function MonthlyChart({ data }: { data: DayXP[] }) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex-1 rounded-xl p-4 border border-white/5 bg-white/[0.02]"
      >
        <h3 className="text-xs font-medium text-gray-400 mb-3">Evolução do mês</h3>
        <div className="h-24 flex items-center justify-center text-gray-600 text-xs">
          Sem dados neste mês
        </div>
      </motion.div>
    );
  }

  const maxXP = Math.max(...data.map((d) => d.xp), 1);
  const stepX = data.length > 1 ? (W - PAD_X * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD_X + i * stepX;
    const y = H - PAD_Y - ((d.xp / maxXP) * (H - PAD_Y * 2));
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaPath = `M${firstPt.x},${firstPt.y} ${points.map((p) => `L${p.x},${p.y}`).join(' ')} L${lastPt.x},${H - PAD_Y} L${firstPt.x},${H - PAD_Y} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex-1 rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400">Evolução do mês</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#monthlyGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        <motion.polyline
          points={polyline}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <p className="text-[10px] text-gray-600 mt-1">XP por dia</p>
    </motion.div>
  );
}
