import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/6a3d00b84bc4992a305862ca/5bacc627f_whitelogo.gif';

export default function TelemetryBar({ score, round, totalRounds, streak, hideScore }) {
  const logoRef = useRef(null);
  const [logoSrc, setLogoSrc] = useState(LOGO_URL);

  // Freeze GIF after one play: capture last frame to canvas, replace src
  useEffect(() => {
    const timer = setTimeout(() => {
      const img = logoRef.current;
      if (!img) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 48;
        canvas.height = img.naturalHeight || 48;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        setLogoSrc(canvas.toDataURL('image/png'));
      } catch (e) {
        // CORS-tainted canvas — keep animated GIF as fallback
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass-panel rounded-2xl px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img ref={logoRef} src={logoSrc} alt="פיקוד העורף" className="h-9 sm:h-12 w-auto" crossOrigin="anonymous" />
        </div>

        {/* Title — truly centered */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base sm:text-2xl font-bold text-[#F0F4FF] font-display whitespace-nowrap">גלגל המחוזות</h1>

        {/* Progress + Score */}
        {!hideScore && (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Progress dots — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i < round
                    ? 'w-3 bg-[#FF6B00] glow-orange'
                    : i === round
                    ? 'w-8 bg-[#FF8C42]'
                    : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Compact progress — mobile */}
          <span className="sm:hidden text-sm font-bold text-[#FF8C42] tabular-nums">{round}/{totalRounds}</span>

          {/* Streak */}
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B00]" />
              <span className="text-sm sm:text-lg font-bold text-[#FF8C42] tabular-nums">{streak}</span>
            </div>
          )}

          {/* Score */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-[#D1D9F0] font-medium hidden md:inline">ניקוד</span>
            <motion.div
              key={score}
              initial={{ scale: 1.3, color: '#FF8C42' }}
              animate={{ scale: 1, color: '#F0F4FF' }}
              transition={{ duration: 0.3 }}
              className="text-xl sm:text-3xl font-black font-display tabular-nums"
            >
              {score}
            </motion.div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}