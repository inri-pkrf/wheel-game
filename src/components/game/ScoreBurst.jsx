import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreBurst({ trigger, points = 10 }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (trigger > 0) {
      const id = trigger;
      setBursts((prev) => [...prev, { id, points }]);
      const timer = setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, points]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            className={`absolute text-5xl font-black font-display ${burst.points > 0 ? 'text-[#FF8C42]' : 'text-red-400'}`}
            initial={{ left: '50%', top: '48%', x: '-50%', y: '-50%', opacity: 0, scale: 0.3 }}
            animate={{
              left: '12%',
              top: '6%',
              x: '-50%',
              y: '-50%',
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.3, 1, 0.8],
            }}
            transition={{
              duration: 1.4,
              ease: 'easeOut',
              times: [0, 0.15, 0.7, 1],
            }}
            style={{ textShadow: '0 0 20px rgba(255,107,0,0.6), 0 0 40px rgba(255,107,0,0.3)' }}
          >
            {burst.points > 0 ? `+${burst.points}` : burst.points}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}