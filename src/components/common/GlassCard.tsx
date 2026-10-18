import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = false,
  onClick,
  interactive = false
}) => {
  const isClickable = Boolean(onClick) || interactive;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isClickable ? { y: -4, transition: { duration: 0.22, ease: 'easeOut' as const } } : undefined}
      whileTap={isClickable ? { scale: 0.985, y: 1, transition: { duration: 0.1 } } : undefined}
      className={`relative rounded-[22px] transition-all duration-300 ${
        glow ? 'clay-card-glow' : 'clay-card'
      } ${isClickable ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      {/* Top bevel light reflection line */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
