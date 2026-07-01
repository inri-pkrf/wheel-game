import React from 'react';
import { ArrowRight, Maximize2, Minimize2, Home } from 'lucide-react';

export default function OverlayControls({
  onBack,
  onToggleFullscreen,
  isFullscreen,
  showBack = true,
  showHome = true,
  homeHref = 'https://totem-smart-flow.base44.app/',
}) {
  return (
    <>
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="glass-card rounded-2xl flex items-center justify-center text-[#D1D9F0] hover:text-[#FF8C42] transition-colors"
            style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)' }}
            aria-label="חזרה"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        )}
        <button
          onClick={onToggleFullscreen}
          className="glass-card rounded-2xl flex items-center justify-center text-[#D1D9F0] hover:text-[#FF8C42] transition-colors"
          style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)' }}
          aria-label="מסך מלא"
        >
          {isFullscreen ? <Minimize2 className="w-7 h-7" /> : <Maximize2 className="w-7 h-7" />}
        </button>
      </div>

      {showHome && (
        <a
          href={homeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-30 flex items-center justify-center rounded-full text-white hover:brightness-110 transition-all"
          style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)', backgroundColor: 'rgba(247, 179, 124, 0.9)' }}
          aria-label="חזרה לדף הבית"
        >
          <Home className="w-7 h-7" />
        </a>
      )}
    </>
  );
}
