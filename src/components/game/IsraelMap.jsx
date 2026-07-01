import React from 'react';
import { motion } from 'framer-motion';

const REGIONS = [
  { id: 'north', name: 'צפון', color: '#2ECC71', labelPos: { x: 110, y: 45 } },
  { id: 'haifa', name: 'חיפה', color: '#9B59B6', labelPos: { x: 65, y: 88 } },
  { id: 'dan', name: 'דן', color: '#4A90D9', labelPos: { x: 62, y: 142 } },
  { id: 'jerusalem', name: 'ירושלים', color: '#FFA500', labelPos: { x: 115, y: 125 } },
  { id: 'pakmad', name: 'פקמ"ד', color: '#5B8FB9', labelPos: { x: 158, y: 125 } },
  { id: 'south', name: 'דרום', color: '#FF6B00', labelPos: { x: 95, y: 260 } },
  { id: 'eilat', name: 'אילת', color: '#00C9A7', labelPos: { x: 125, y: 385 } },
];

const PATHS = {
  north: 'M 95,8 L 135,8 L 150,40 L 138,75 L 100,80 L 82,45 L 88,20 Z',
  haifa: 'M 82,45 L 100,80 L 88,115 L 52,118 L 38,88 L 55,58 Z',
  dan: 'M 52,118 L 88,115 L 92,155 L 58,168 L 35,148 L 38,125 Z',
  jerusalem: 'M 88,115 L 138,75 L 152,108 L 142,150 L 108,165 L 92,155 Z',
  pakmad: 'M 138,75 L 168,65 L 178,125 L 158,185 L 142,150 L 152,108 Z',
  south: 'M 35,148 L 58,168 L 92,155 L 108,165 L 142,150 L 158,185 L 168,250 L 155,325 L 118,360 L 78,350 L 38,280 L 25,210 L 28,165 Z',
  eilat: 'M 118,360 L 155,325 L 140,400 L 122,415 L 108,390 Z',
};

export default function IsraelMap() {
  return (
    <svg viewBox="0 0 200 430" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 16px rgba(255,107,0,0.35))' }}>
      {REGIONS.map((region, i) => (
        <motion.path
          key={region.id}
          d={PATHS[region.id]}
          fill={region.color}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.82, 1, 0.82] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
      {REGIONS.map((region) => (
        <text
          key={`label-${region.id}`}
          x={region.labelPos.x}
          y={region.labelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontWeight="700"
          fill="white"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))', pointerEvents: 'none' }}
        >
          {region.name}
        </text>
      ))}
    </svg>
  );
}