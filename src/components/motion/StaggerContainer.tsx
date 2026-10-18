import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerChildren?: number;
  delayChildren?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerChildren = 0.1,
  delayChildren = 0,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  preset?: 'fade' | 'slideUp' | 'scaleUp' | 'slideRight';
}> = ({ children, className = '', preset = 'slideUp' }) => {
  const itemVariants: Record<string, Variants> = {
    slideUp: {
      hidden: { opacity: 0, y: 24 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      },
    },
    slideRight: {
      hidden: { opacity: 0, x: -24 },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      },
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.9 },
      show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      },
    },
    fade: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.4 } },
    },
  };

  return (
    <motion.div variants={itemVariants[preset]} className={className}>
      {children}
    </motion.div>
  );
};
