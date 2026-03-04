'use client';

import { motion } from 'framer-motion';

function Pulse({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-white/5 rounded-lg ${className}`}
    />
  );
}

export default function HomeSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Pulse className="h-5 w-16 mb-5" />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Pulse className="h-28 rounded-xl" />
        <Pulse className="h-28 rounded-xl" />
        <Pulse className="h-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Pulse className="h-36 rounded-xl" />
        <Pulse className="h-36 rounded-xl" />
      </div>

      <Pulse className="h-20 rounded-xl mb-4" />
      <Pulse className="h-40 rounded-xl" />
    </div>
  );
}
