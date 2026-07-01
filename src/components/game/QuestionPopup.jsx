import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionPopup({ show, category, question, selectedAnswer, onSelectAnswer, onSubmit, timeLeft, questionTime, showTimer }) {
  return (
    <AnimatePresence>
      {show && question && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            className="relative glass-panel rounded-3xl p-8 sm:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Timer */}
            {showTimer && questionTime > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#D1D9F0]">זמן לתשובה</span>
                <span className={`text-sm font-bold tabular-nums ${timeLeft <= 5 ? 'text-red-400' : 'text-[#FF8C42]'}`}>
                  {timeLeft} שניות
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#FF8C42' : '#22c55e',
                  }}
                  animate={{ width: `${(timeLeft / questionTime) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
            )}

            {/* Category header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10 rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${category.color}22 0%, transparent 70%)` }}>
              <div className="text-5xl">{category.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">בחרו בתשובה הנכונה לשאלה</h2>
              </div>
              {category.type === 'bonus' && (
                <span className="mr-auto flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFD700]/30 border border-[#FFD700]/50 text-[#FFD700] font-bold text-sm">
                  <span>⭐</span>
                  בונוס
                </span>
              )}
              {category.type === 'trick' && (
                <span className="mr-auto flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/30 border border-red-500/50 text-red-400 font-bold text-sm">
                  <span>⚠️</span>
                  מכשילה
                </span>
              )}
            </div>

            {/* Question */}
            <p className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-relaxed text-glow-white">
              {question.question}
            </p>

            {/* Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {question.answers.map((answer, i) => {
                let cls = 'answer-btn';
                if (selectedAnswer === i) cls += ' selected';
                return (
                  <motion.button
                    key={i}
                    className={cls}
                    onClick={() => onSelectAnswer(i)}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, type: 'spring', damping: 20 }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-lg font-bold shrink-0">
                        {['א', 'ב', 'ג', 'ד'][i]}
                      </span>
                      <span className="flex-1">{answer}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Submit */}
            <button
              className="cta-btn w-full"
              onClick={onSubmit}
              disabled={selectedAnswer === null}
            >
              בדיקת תשובה
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}