'use client';

import { motion } from 'framer-motion';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tarefas', label: 'Tarefas', icon: '📋' },
  { id: 'habitos', label: 'Hábitos', icon: '🔁' },
];

export default function NavBar({ activeTab = 'home' }: { activeTab?: string }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-3 border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span className="font-semibold text-white text-sm tracking-wide">PeakHabit</span>
      </div>

      <nav className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab.id === activeTab
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.id === activeTab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon} {tab.label}</span>
          </button>
        ))}
      </nav>

      <button className="text-gray-500 hover:text-gray-300 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </motion.header>
  );
}
