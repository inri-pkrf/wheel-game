import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function IdleWarning({ show, countdown, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          onTouchStart={onDismiss}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" />

          <motion.div
            className="relative text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <AlertTriangle className="w-24 h-24 text-[#FF6B00] mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.6))' }} />
            </motion.div>

            <h2 className="text-4xl font-black text-white mb-4">המשחק יתאפס בעוד</h2>
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-black font-display text-[#FF6B00] text-glow-orange mb-4 tabular-nums"
            >
              {countdown}
            </motion.div>
            <p className="text-2xl text-[#D1D9F0]">געו במסך כדי להמשיך לשחק</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}