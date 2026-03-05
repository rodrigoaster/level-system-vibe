'use client';

import { motion } from 'framer-motion';
import type { DayXP } from '@/types/home';

const W = 400;
const H = 120;
const PAD_X = 0;
const PAD_Y = 10;
const LABEL_H = 20;

export default function MonthlyChart({ data }: { data: DayXP[] }) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
      >
        <h3 className="mb-4 text-base font-medium text-gray-200 sm:text-lg">Evolução do mês</h3>
        <div className="flex h-28 items-center justify-center text-sm text-gray-400 sm:text-base">
          Sem dados neste mês
        </div>
      </motion.div>
    );
  }

  const maxXP = Math.max(...data.map((d) => d.xp), 1);
  const stepX = data.length > 1 ? (W - PAD_X * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD_X + i * stepX;
    const y = PAD_Y + ((1 - d.xp / maxXP) * (H - PAD_Y * 2));
    return { x, y, date: d.date };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaPath = `M${firstPt.x},${firstPt.y} ${points.map((p) => `L${p.x},${p.y}`).join(' ')} L${lastPt.x},${H - PAD_Y} L${firstPt.x},${H - PAD_Y} Z`;

  // Day labels: show at day 1, 5, 10, 15, 20, 25, 30
  const labelDays = [1, 5, 10, 15, 20, 25, 30];
  const dayLabels = points
    .map((p) => ({ ...p, day: parseInt(p.date.slice(8, 10), 10) }))
    .filter((p) => labelDays.includes(p.day));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-200 sm:text-lg">Evolução do mês</h3>
        <span className="text-xs text-gray-500 sm:text-sm">XP por dia</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H + LABEL_H}`}
        className="w-full"
        style={{ height: '7rem' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#monthlyGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Line */}
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

        {/* Baseline */}
        <line
          x1={PAD_X}
          y1={H - PAD_Y}
          x2={W - PAD_X}
          y2={H - PAD_Y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* X-axis day labels */}
        {dayLabels.map((p) => (
          <text
            key={p.day}
            x={p.x}
            y={H + LABEL_H - 2}
            textAnchor="middle"
            fontSize="14"
            fill="rgba(156,163,175,0.7)"
            fontFamily="monospace"
          >
            {p.day}
          </text>
        ))}
      </svg>
    </motion.div>
  );
}
