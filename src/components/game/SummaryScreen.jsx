import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw } from 'lucide-react';
import RoundAccordion from '@/components/game/RoundAccordion';

function getRank(percentage) {
  if (percentage === 100) return { icon: '🏆', title: 'אלוף פיקוד העורף', color: '#FF6B00' };
  if (percentage >= 80) return { icon: '🏅', title: 'מומחה פיקוד העורף', color: '#FF8C42' };
  if (percentage >= 60) return { icon: '🏅', title: 'מקצוען', color: '#D1D9F0' };
  if (percentage >= 40) return { icon: '🏅', title: 'מתקדם', color: '#D1D9F0' };
  return { icon: '🏅', title: 'מתחיל', color: '#D1D9F0' };
}

export default function SummaryScreen({ show, score, correctCount, totalRounds, onPlayAgain, roundHistory }) {
  const percentage = show ? Math.round((correctCount / totalRounds) * 100) : 0;
  const rank = getRank(percentage);
  const circumference = 2 * Math.PI * 50;

  useEffect(() => {
    if (show && percentage >= 60) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#FF8C42', '#F0F4FF', '#0A2463'],
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show, percentage]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

      <motion.div
        className="relative glass-panel rounded-3xl p-8 sm:p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide text-center"
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {/* Certificate for high scores */}
        {percentage >= 80 && (
          <motion.div
            className="mb-6 rounded-2xl p-5 border-4 border-double"
            style={{ borderColor: rank.color, background: `${rank.color}12` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-4xl mb-2">📜</div>
            <h3 className="text-xl font-black mb-1" style={{ color: rank.color }}>תעודת הצטיינות</h3>
            <p className="text-sm text-[#D1D9F0]">הוענקה למשתתף שהפגין ידע יוצא דופן בתחום הגנת העורף</p>
          </motion.div>
        )}

        <motion.div
          className="text-7xl mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 12 }}
        >
          {rank.icon}
        </motion.div>

        <h2 className="text-4xl font-black text-white mb-2 text-glow-white">כל הכבוד!</h2>
        <p className="text-xl text-[#D1D9F0] mb-6">סיימתם את המשחק</p>

        {/* Circular progress graph */}
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <motion.circle
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={rank.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                transform="rotate(-90 70 70)"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (circumference * percentage / 100) }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 8px ${rank.color}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
            </div>
          </div>
        </motion.div>

        {/* Score */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <div className="text-6xl font-black font-display text-[#FF6B00] text-glow-orange tabular-nums">
            {score}
          </div>
          <p className="text-lg text-[#D1D9F0] mt-1">ניקוד</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4">
            <div className="text-sm text-[#D1D9F0]">תשובות נכונות</div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <div className="text-2xl font-bold" style={{ color: rank.color }}>{rank.title}</div>
            <div className="text-sm text-[#D1D9F0]">דירוג</div>
          </div>
        </div>

        {/* Round breakdown accordion — only wrong answers */}
        {roundHistory && roundHistory.filter(r => r.showInSummary).length > 0 && (
          <motion.div
            className="mb-8 text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-[#D1D9F0] mb-3 text-center">פירוט השאלות שטעיתם</h3>
            <RoundAccordion rounds={roundHistory.filter(r => r.showInSummary)} />
          </motion.div>
        )}

        <button className="cta-btn w-full" onClick={onPlayAgain}>
          <RotateCcw className="w-7 h-7" />
          שחקו שוב
        </button>
      </motion.div>
    </motion.div>
  );
}