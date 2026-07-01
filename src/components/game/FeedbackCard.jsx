import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles, ArrowLeft } from 'lucide-react';

export default function FeedbackCard({ show, isCorrect, question, selectedAnswer, onNext, round, totalRounds, categoryType }) {
  return (
    <AnimatePresence>
      {show && question && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            className="relative glass-panel rounded-3xl p-8 sm:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
          >
            {/* Status header */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-14 h-14 text-green-400" style={{ filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.5))' }} />
                  <div>
                    <h2 className="text-4xl font-black text-green-400">תשובה נכונה!</h2>
                    <div className="flex items-center gap-2 text-[#FF8C42] text-xl font-bold">
                      <Sparkles className="w-5 h-5" />
                      {categoryType === 'bonus' ? 'בונוס! כפול נקודות!' : '+10 נקודות'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 shrink-0 text-[#F58080] flex items-center justify-center">
                    <XCircle className="w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(245,128,128,0.5))' }} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-[#F58080]">תשובה שגויה</p>
                    <p className="text-xl font-bold text-[#E59898] mt-1">
                      {categoryType === 'trick' ? '20- נקודות' : '10- נקודות'}
                    </p>
                    <p className="text-[#D1D1D1] text-lg mt-1">
                      התשובה הנכונה: <span className="font-bold text-[#38E54D]">{question.answers[question.correct]}</span>
                    </p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Explanation */}
            <motion.div
              className="glass-card rounded-2xl p-5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl text-white leading-relaxed">{question.explanation}</p>
            </motion.div>

            {/* Fact - "הידעת" */}
            <motion.div
              className="rounded-2xl p-5 mb-6 border border-[#FF6B00]/50"
              style={{ background: 'rgba(255,107,0,0.28)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-2 text-[#FF8C42] font-bold">
                <Sparkles className="w-5 h-5" />
                <span className="text-lg">הידעת?</span>
              </div>
              <p className="text-lg text-white leading-relaxed">{question.fact}</p>
            </motion.div>

            {/* Next button */}
            <motion.button
              className="cta-btn w-full"
              onClick={onNext}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.97 }}
            >
              {round >= totalRounds - 1 ? 'סיום המשחק' : 'המשיכו לשאלה הבאה'}
              <ArrowLeft className="w-7 h-7" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}