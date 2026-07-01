import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function IntroScreen({ onStart }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <motion.div
        className="relative glass-panel rounded-3xl p-10 sm:p-12 max-w-xl w-full text-center"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
      >
        {/* Floating question marks — symmetric */}
        {[
          // Top corners
          { pos: '-top-5 right-10', size: 'text-4xl', delay: 0, duration: 3.5, y: -10 },
          { pos: '-top-5 left-10', size: 'text-4xl', delay: 0.3, duration: 3.5, y: -10 },
          // Bottom corners
          { pos: '-bottom-5 right-10', size: 'text-4xl', delay: 1, duration: 3.5, y: 10 },
          { pos: '-bottom-5 left-10', size: 'text-4xl', delay: 1.3, duration: 3.5, y: 10 },
          // Center sides
          { pos: 'top-1/3 -right-4', size: 'text-3xl', delay: 0.6, duration: 3.2, y: -9 },
          { pos: 'top-1/3 -left-4', size: 'text-3xl', delay: 0.6, duration: 3.2, y: -9 },
          // Bottom center sides
          { pos: 'bottom-1/3 -right-4', size: 'text-3xl', delay: 1.2, duration: 3.2, y: 9 },
          { pos: 'bottom-1/3 -left-4', size: 'text-3xl', delay: 1.2, duration: 3.2, y: 9 },
        ].map((q, i) => (
          <motion.div
            key={i}
            className={`absolute ${q.pos} ${q.size} pointer-events-none opacity-70`}
            animate={{ y: [0, q.y, 0] }}
            transition={{ repeat: Infinity, duration: q.duration, delay: q.delay, ease: 'easeInOut' }}
          >
            ❓
          </motion.div>
        ))}

        {/* Logo */}
        <motion.div
          className="w-32 mx-auto mb-6"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <img
            src="https://media.base44.com/images/public/6a3d00b84bc4992a305862ca/d231e650c_ChatGPTImageJun28202611_47_45AM.png"
            alt="פיקוד העורף"
            className="w-full h-auto"
          />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 text-glow-white font-display">
          גלגל המחוזות
        </h1>
        <p className="text-lg text-[#FF8C42] font-bold mb-8">פיקוד העורף</p>

        <p className="text-xl text-[#D1D9F0] leading-relaxed mb-2">
          עד כמה אתם מכירים את מחוזות פיקוד העורף?
        </p>
        <p className="text-xl text-[#D1D9F0] leading-relaxed mb-8">
          סובבו את הגלגל וגלו דברים חדשים
        </p>

        <button className="cta-btn w-full" onClick={onStart}>
          התחילו לשחק
          <Play className="w-7 h-7" />
        </button>
      </motion.div>
    </motion.div>
  );
}