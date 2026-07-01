import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Flame } from 'lucide-react';
import OverlayControls from '@/components/game/OverlayControls';

const DIFFICULTIES = [
  { id: 'easy', name: 'קל', description: '5 שאלות', icon: Star, color: '#22c55e' },
  { id: 'medium', name: 'בינוני', description: '8 שאלות', icon: Zap, color: '#FF8C42' },
  { id: 'hard', name: 'קשה', description: '11 שאלות', icon: Flame, color: '#ef4444' },
];

export default function DifficultySelect({ onSelect, onBack, onToggleFullscreen, isFullscreen }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <motion.div
        className="relative glass-panel rounded-3xl p-8 sm:p-10 max-w-2xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <h2 className="text-4xl font-black text-center text-[#F0F4FF] mb-8 font-display">בחרו רמת קושי</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DIFFICULTIES.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className="touch-btn flex flex-col items-center gap-3 p-6 border-2"
                style={{ borderColor: d.color, background: `${d.color}20` }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Icon className="w-12 h-12" style={{ color: d.color }} />
                <span className="text-2xl font-black" style={{ color: d.color }}>{d.name}</span>
                <span className="text-lg text-[#D1D9F0]">{d.description}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <OverlayControls
        onBack={onBack}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </motion.div>
  );
}