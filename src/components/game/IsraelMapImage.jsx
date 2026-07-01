import React from 'react';
import { motion } from 'framer-motion';

const MAP_URL = 'https://media.base44.com/images/public/6a3d00b84bc4992a305862ca/f51b798f0_ChatGPTImageJun28202610_56_52AM.png';

export default function IsraelMapImage() {
  return (
    <motion.img
      src={MAP_URL}
      alt="מפת מחוזות פיקוד העורף"
      className="w-full h-auto"
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        objectFit: 'contain',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    />
  );
}