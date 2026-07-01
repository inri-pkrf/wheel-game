import React, { useEffect, useRef, useState } from 'react';
import { playTick, playDing } from '@/utils/wheelSounds';

const BONUS_COLOR = '#FFD700';
const TRICK_COLOR = '#FF1744';

function polarToCartesian(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
}

function describeSegment(r, startAngle, endAngle) {
  const start = polarToCartesian(r, startAngle);
  const end = polarToCartesian(r, endAngle);
  return `M 0,0 L ${start.x},${start.y} A ${r},${r} 0 0 1 ${end.x},${end.y} Z`;
}

function bezierProgress(t, p1x, p1y, p2x, p2y) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let s = t;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - s) * (1 - s) * s * p1x + 3 * (1 - s) * s * s * p2x + s * s * s;
    const dx = 3 * (1 - s) * (1 - s) * p1x + 6 * (1 - s) * s * (p2x - p1x) + 3 * s * s * (1 - p2x);
    if (Math.abs(x - t) < 0.0001) break;
    if (Math.abs(dx) < 0.0001) break;
    s = Math.max(0, Math.min(1, s - (x - t) / dx));
  }
  return 3 * (1 - s) * (1 - s) * s * p1y + 3 * (1 - s) * s * s * p2y + s * s * s;
}

const SPIN_DURATION = 4000;
const BEZIER = [0.17, 0.67, 0.12, 0.99];
const MIN_SWIPE_VELOCITY = 0.3;

export default function Wheel({ categories, onSpinComplete, onSpinStart, isIdle, highlightIndex, usedCategoryIndices }) {
  const wheelRef = useRef(null);
  const pointerRef = useRef(null);
  const containerRef = useRef(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(null);
  const tickRafRef = useRef(null);
  const tickTimerRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const moveHistoryRef = useRef([]);

  const segmentAngle = 360 / categories.length;
  const R = 400;

  // Idle slow rotation
  useEffect(() => {
    if (isIdle && !isSpinning && !isDragging) {
      let last = performance.now();
      const animate = (now) => {
        const delta = (now - last) / 1000;
        last = now;
        rotationRef.current += delta * 8;
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [isIdle, isSpinning, isDragging]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tickRafRef.current) cancelAnimationFrame(tickRafRef.current);
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    };
  }, []);

  const getAngle = (clientX, clientY) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const handlePointerDown = (e) => {
    if (isSpinning || !isIdle) return;
    e.preventDefault();
    try { containerRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    draggingRef.current = true;
    setIsDragging(true);
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    moveHistoryRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const angle = getAngle(e.clientX, e.clientY);
    let delta = angle - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    rotationRef.current += delta;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }

    const now = Date.now();
    moveHistoryRef.current.push({ delta, time: now });
    if (moveHistoryRef.current.length > 5) {
      moveHistoryRef.current.shift();
    }
    lastAngleRef.current = angle;
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try { containerRef.current.releasePointerCapture(e.pointerId); } catch (err) {}

    const history = moveHistoryRef.current;
    if (history.length < 2) return;

    const recent = history.slice(-3);
    const totalDelta = recent.reduce((sum, m) => sum + m.delta, 0);
    const totalTime = recent[recent.length - 1].time - recent[0].time;
    const velocity = totalTime > 0 ? totalDelta / totalTime : 0;

    if (Math.abs(velocity) < MIN_SWIPE_VELOCITY) return;

    const direction = Math.sign(velocity);
    const speed = Math.min(Math.abs(velocity), 3);
    const momentumRotations = 3 + speed * 2;
    const additional = direction * momentumRotations * 360;
    let newRotation = rotationRef.current + additional;

    doMomentumSpin(newRotation);
  };

  const triggerTick = (intensity) => {
    if (!pointerRef.current) return;
    playTick(intensity);
    const deg = 12 * intensity;
    pointerRef.current.style.transform = `translateX(-50%) rotate(${deg}deg)`;
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    tickTimerRef.current = setTimeout(() => {
      if (pointerRef.current) {
        pointerRef.current.style.transform = 'translateX(-50%) rotate(0deg)';
      }
    }, 70);
  };

  const doMomentumSpin = (startRotation) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (tickRafRef.current) {
      cancelAnimationFrame(tickRafRef.current);
      tickRafRef.current = null;
    }

    const used = new Set(usedCategoryIndices || []);
    const allAvailable = categories.some((cat, i) => !used.has(i));
    if (!allAvailable) return;

    setIsSpinning(true);
    if (onSpinStart) onSpinStart();

    // compute which segment a given rotation lands on
    const segmentAt = (rot) => {
      const mod = ((rot % 360) + 360) % 360;
      return Math.floor(((360 - mod) % 360) / segmentAngle) % categories.length;
    };

    // find the target rotation: start from computed final position,
    // if it lands on a used segment, keep adding one segment angle until we find a free one
    const usedSet = new Set(usedCategoryIndices || []);
    let targetRotation = startRotation;
    if (usedSet.has(segmentAt(targetRotation))) {
      // scan toward nearest free segment — keep adding segment angles
      for (let i = 0; i < categories.length * 2; i++) {
        targetRotation += segmentAngle;
        if (!usedSet.has(segmentAt(targetRotation))) break;
      }
    }

    const currentRotation = rotationRef.current;
    const additional = targetRotation - currentRotation;
    rotationRef.current = targetRotation;

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(${BEZIER.join(',')})`;
      wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
    }

    const startTime = performance.now();
    const startRot = currentRotation;
    let lastBoundaries = Math.floor(currentRotation / segmentAngle);

    const trackTicks = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / SPIN_DURATION, 1);
      const progress = bezierProgress(t, ...BEZIER);
      const currentRot = startRot + additional * progress;
      const boundaries = Math.floor(currentRot / segmentAngle);

      if (boundaries !== lastBoundaries) {
        const intensity = Math.max(0.3, 1 - t * 0.6);
        triggerTick(intensity);
        lastBoundaries = boundaries;
      }

      if (t < 1) {
        tickRafRef.current = requestAnimationFrame(trackTicks);
      }
    };
    tickRafRef.current = requestAnimationFrame(trackTicks);

    setTimeout(() => {
      setIsSpinning(false);
      triggerTick(1.4);
      playDing();
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
      }
      onSpinComplete(segmentAt(targetRotation));
    }, SPIN_DURATION + 100);
  };

  const getSegmentColor = (cat, i) => {
    const used = new Set(usedCategoryIndices || []);
    if (used.has(i)) return '#3a3a4a';
    if (cat.type === 'bonus') return BONUS_COLOR;
    if (cat.type === 'trick') return TRICK_COLOR;
    return '#2A4365';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[1360px] aspect-square mx-auto touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full glow-orange-strong opacity-40" />

      {/* Fixed outer rings */}
      <svg viewBox="-420 -420 840 840" className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx="0" cy="0" r={R + 10} fill="none" stroke="#FF6B00" strokeWidth="6"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,107,0,0.7))' }} />
        <circle cx="0" cy="0" r={R + 4} fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* Orange segment borders layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg viewBox="-420 -420 840 840" className="w-full h-full">
          {categories.map((cat, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const start = polarToCartesian(R, startAngle);
            const end = polarToCartesian(R, endAngle);
            if (cat.type === 'bonus' || cat.type === 'trick') return null;
            return (
              <g key={`border-${cat.id}`}>
                <line x1="0" y1="0" x2={start.x} y2={start.y}
                  stroke="#FF6B00" strokeWidth="3" opacity="0.7"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,0,0.5))' }} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Rotating wheel */}
      <div
        ref={wheelRef}
        className="absolute inset-0 w-full h-full"
        style={{ transformOrigin: 'center', willChange: 'transform' }}
      >
        <svg viewBox="-420 -420 840 840" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
          {categories.map((cat, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const midAngle = startAngle + segmentAngle / 2;
            const path = describeSegment(R, startAngle, endAngle);
            const isHighlight = highlightIndex === i && !isSpinning;
            const color = getSegmentColor(cat, i);
            const isSpecial = cat.type === 'bonus' || cat.type === 'trick';
            const used = new Set(usedCategoryIndices || []);
            const isUsed = used.has(i);
            return (
              <g key={cat.id}>
                <path
                  d={path}
                  fill={color}
                  stroke={isSpecial ? 'rgba(255,255,255,0.6)' : isUsed ? 'rgba(100,100,120,0.3)' : 'rgba(240,244,255,0.25)'}
                  strokeWidth={isSpecial ? '3' : '2'}
                  className={isHighlight ? 'segment-land' : isSpecial ? 'segment-pulse' : ''}
                />
                {!isUsed && cat.type === 'bonus' && (
                  <g transform={`rotate(${midAngle})`} className="pointer-events-none">
                    <text x={-R * 0.22} y={-R * 0.88} fontSize="36" fill="#FFD700" style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))' }}>✦</text>
                    <text x={R * 0.22} y={-R * 0.88} fontSize="36" fill="#FFD700" style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))' }}>✦</text>
                  </g>
                )}
                {!isUsed && cat.type === 'trick' && (
                  <g transform={`rotate(${midAngle})`} className="pointer-events-none">
                    <text x={-R * 0.22} y={-R * 0.85} fontSize="40" fontWeight="bold" fill="#FF1744" opacity="0.6">!</text>
                    <text x={R * 0.22} y={-R * 0.85} fontSize="40" fontWeight="bold" fill="#FF1744" opacity="0.6">!</text>
                  </g>
                )}
                <g transform={`rotate(${midAngle})`} className="pointer-events-none">
                  <text
                    x="0"
                    y={-R * 0.48}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="60"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
                  >
                    {cat.icon}
                  </text>
                  <text
                    x="0"
                    y={-R * 0.68}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="36"
                    fontWeight="800"
                    fill={isUsed ? '#444' : '#FFFFFF'}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))', fontFeatureSettings: '"tnum"' }}
                  >
                    {isUsed ? 'הושלם' : (cat.shortName || cat.name)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Fixed center hub */}
      <svg viewBox="-420 -420 840 840" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#CC5500" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="72" fill="url(#hubGrad)" stroke="#FFB07A" strokeWidth="4" />
      <circle cx="0" cy="0" r="56" fill="#0D1B3E" stroke="rgba(255,107,0,0.4)" strokeWidth="2" />
      </svg>

      {/* Large pointer at top */}
      <div
        ref={pointerRef}
        className="absolute z-20 pointer-events-none"
        style={{
          left: '50%',
          top: '-28px',
          transform: 'translateX(-50%) rotate(0deg)',
          transformOrigin: 'center 28px',
          transition: 'transform 0.07s ease-out',
          filter: 'drop-shadow(0 0 14px rgba(255,107,0,0.7))',
        }}
      >
        <svg width="152" height="200" viewBox="0 0 76 100">
          <rect x="30" y="0" width="16" height="10" rx="2" fill="#CC5500" />
          <circle cx="38" cy="12" r="10" fill="#FF6B00" stroke="#FFB07A" strokeWidth="2.5" />
          <circle cx="38" cy="12" r="4" fill="#0D1B3E" />
          <path d="M38 100 L10 30 Q10 18 22 18 L54 18 Q66 18 66 30 Z" fill="#FF6B00" stroke="#FFB07A" strokeWidth="3" />
          <path d="M38 92 L16 30 Q16 24 24 24 L38 24 Z" fill="rgba(255,255,255,0.28)" />
          <line x1="38" y1="22" x2="38" y2="92" stroke="rgba(13,27,62,0.35)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}