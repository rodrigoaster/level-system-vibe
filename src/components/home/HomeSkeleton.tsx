'use client';

import { motion } from 'framer-motion';

function Pulse({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-white/5 rounded-xl ${className}`}
    />
  );
}

export default function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Pulse className="mb-6 h-8 w-20" />

      <div className="mb-5 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-3 md:gap-5">
        <Pulse className="h-36 rounded-2xl" />
        <Pulse className="h-36 rounded-2xl" />
        <Pulse className="h-36 rounded-2xl" />
      </div>

      <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:gap-5">
        <Pulse className="h-44 rounded-2xl" />
        <Pulse className="h-44 rounded-2xl" />
      </div>

      <Pulse className="h-28 rounded-2xl mb-6" />
      <Pulse className="h-48 rounded-2xl" />
    </div>
  );
}
