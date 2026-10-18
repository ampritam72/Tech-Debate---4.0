import React from 'react';
import { motion } from 'framer-motion';

export interface NeonDividerProps {
  className?: string;
  glowIntensity?: 'subtle' | 'medium' | 'vibrant';
  withDiamond?: boolean;
}

export const NeonDivider: React.FC<NeonDividerProps> = ({
  className = '',
  glowIntensity = 'medium',
  withDiamond = true,
}) => {
  const glowOpacity =
    glowIntensity === 'vibrant'
      ? 'bg-cyan-400/40 blur-xl'
      : glowIntensity === 'medium'
      ? 'bg-cyan-400/28 blur-lg'
      : 'bg-cyan-400/18 blur-md';

  return (
    <motion.div
      role="separator"
      aria-hidden="true"
      initial={{ opacity: 0, scaleX: 0.85 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* 1. Ambient Breathing Neon-Cyan Glow Halo in the center */}
      <motion.div
        animate={{
          opacity: [0.4, 0.85, 0.4],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute left-1/2 -top-3 -translate-x-1/2 w-72 sm:w-[480px] h-7 rounded-full ${glowOpacity} pointer-events-none`}
      />

      {/* 2. Main Neon Gradient Baseline Track */}
      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent overflow-hidden">
        {/* Animated Traveling Neon Laser Pulse / Energy Sweep Beam */}
        <motion.div
          animate={{
            x: ['-100%', '350%'],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1.2,
          }}
          className="absolute top-0 w-44 sm:w-64 h-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_14px_#00e5ff]"
        />

        {/* Brighter Center Core Accent Line */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-64 sm:w-96 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/90 to-transparent shadow-[0_0_12px_rgba(0,229,255,0.85)]" />
      </div>

      {/* 3. Center Cyber-Portal Emblem / Diamond Node */}
      {withDiamond && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          {/* Cyber bracket accents left & right */}
          <div className="hidden sm:block absolute -left-6 text-[10px] font-mono text-cyan-400/60 select-none">
            [
          </div>
          <div className="hidden sm:block absolute -right-6 text-[10px] font-mono text-cyan-400/60 select-none">
            ]
          </div>

          {/* Pulsing Ripple Halo */}
          <motion.div
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute w-5 h-5 rounded-full border border-cyan-400/60 pointer-events-none"
          />

          {/* Central Rotating Neon Diamond */}
          <motion.div
            animate={{
              rotate: [45, 225, 45],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 bg-cyan-300 border border-cyan-100 shadow-[0_0_10px_#00e5ff] rounded-[1px]"
          />
        </div>
      )}
    </motion.div>
  );
};

export default NeonDivider;
