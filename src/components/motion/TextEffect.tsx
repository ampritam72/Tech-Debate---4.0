import React from 'react';
import { motion, type Variants } from 'framer-motion';

export interface TextEffectProps {
  children: string;
  className?: string;
  segmentClassName?: string;
  preset?: 'fade' | 'blur' | 'slide' | 'scale';
  per?: 'word' | 'char';
  delay?: number;
  duration?: number;
  staggerDuration?: number;
  as?: React.ElementType;
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className = '',
  segmentClassName = '',
  preset = 'blur',
  per = 'word',
  delay = 0,
  duration,
  staggerDuration = 0.08,
  as: Component = 'span',
}) => {
  const elements = per === 'word' ? children.split(' ') : children.split('');

  const getVariants = (): { container: Variants; item: Variants } => {
    switch (preset) {
      case 'blur': {
        const itemDuration = duration ?? 0.85;
        return {
          container: {
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: delay, staggerChildren: staggerDuration },
            },
          },
          item: {
            hidden: { opacity: 0, filter: 'blur(12px)', y: 14 },
            visible: {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              transition: { duration: itemDuration, ease: [0.16, 1, 0.3, 1] },
            },
          },
        };
      }
      case 'slide': {
        const itemDuration = duration ?? 0.95;
        return {
          container: {
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: delay, staggerChildren: staggerDuration },
            },
          },
          item: {
            hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: itemDuration, ease: [0.16, 1, 0.3, 1] },
            },
          },
        };
      }
      case 'scale': {
        const itemDuration = duration ?? 0.8;
        return {
          container: {
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: delay, staggerChildren: staggerDuration },
            },
          },
          item: {
            hidden: { opacity: 0, scale: 0.8, filter: 'blur(6px)' },
            visible: {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              transition: { duration: itemDuration, ease: [0.16, 1, 0.3, 1] },
            },
          },
        };
      }
      case 'fade':
      default: {
        const itemDuration = duration ?? 0.75;
        return {
          container: {
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: delay, staggerChildren: staggerDuration },
            },
          },
          item: {
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: itemDuration, ease: [0.16, 1, 0.3, 1] },
            },
          },
        };
      }
    }
  };

  const { container, item } = getVariants();

  return (
    <Component className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        animate="visible"
        className="inline-wrap"
      >
        {elements.map((el, index) => (
          <motion.span
            key={index}
            variants={item}
            className={`inline-block whitespace-pre ${segmentClassName}`}
          >
            {el}
            {per === 'word' && index < elements.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};
