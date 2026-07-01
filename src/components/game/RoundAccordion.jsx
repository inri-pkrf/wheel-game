import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

export default function RoundAccordion({ rounds }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-2">
      {rounds.map((round, i) => (
        <div key={i} className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center gap-3 p-3 text-right"
          >
            <span className={`text-xl font-bold shrink-0 ${round.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {round.isCorrect ? '✓' : '✗'}
            </span>
            <span className="flex-1 text-white font-medium text-sm leading-snug">{round.question}</span>
            {round.type === 'bonus' && <span className="text-xs text-[#FFD700] font-bold shrink-0">בונוס</span>}
            {round.type === 'trick' && <span className="text-xs text-red-400 font-bold shrink-0">מכשילה</span>}
            <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <ChevronDown className="w-5 h-5 text-[#D1D9F0]" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-3 pt-0 space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-xs text-[#D1D9F0] shrink-0">תשובה נכונה:</span>
                    <span className="text-sm text-green-400 font-bold flex-1 text-right">{round.correctAnswer}</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${round.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    {round.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    <span className="text-xs text-[#D1D9F0] shrink-0">התשובה שלך:</span>
                    <span className={`text-sm font-bold flex-1 text-right ${round.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {round.selectedAnswerText || 'לא נענתה'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}