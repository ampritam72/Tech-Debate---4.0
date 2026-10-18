import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number | string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = '',
  height = 3,
}) => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none origin-left bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.7)] ${className}`}
      style={{
        scaleX,
        height,
      }}
    />
  );
};
