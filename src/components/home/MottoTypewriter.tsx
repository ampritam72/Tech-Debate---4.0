import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MottoTypewriterProps {
  className?: string;
  delay?: number;
}

export const MottoTypewriter: React.FC<MottoTypewriterProps> = ({
  className = '',
  delay = 300,
}) => {
  const line1Full = 'Defend Your';
  const line2Full = 'Stance With Logic';

  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [phase, setPhase] = useState<
    'TYPE_L1' | 'TYPE_L2' | 'HOLD' | 'DELETE_L2' | 'DELETE_L1' | 'PAUSE'
  >('TYPE_L1');
  const [isStarted, setIsStarted] = useState(false);

  // Initial delay before starting typewriter sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    let timeoutId: NodeJS.Timeout;

    switch (phase) {
      case 'TYPE_L1': {
        if (text1.length < line1Full.length) {
          timeoutId = setTimeout(() => {
            setText1(line1Full.slice(0, text1.length + 1));
          }, 85 + Math.random() * 20);
        } else {
          timeoutId = setTimeout(() => {
            setPhase('TYPE_L2');
          }, 150);
        }
        break;
      }
      case 'TYPE_L2': {
        if (text2.length < line2Full.length) {
          timeoutId = setTimeout(() => {
            setText2(line2Full.slice(0, text2.length + 1));
          }, 85 + Math.random() * 20);
        } else {
          timeoutId = setTimeout(() => {
            setPhase('HOLD');
          }, 2200);
        }
        break;
      }
      case 'HOLD': {
        setPhase('DELETE_L2');
        break;
      }
      case 'DELETE_L2': {
        if (text2.length > 0) {
          timeoutId = setTimeout(() => {
            setText2(line2Full.slice(0, text2.length - 1));
          }, 40);
        } else {
          timeoutId = setTimeout(() => {
            setPhase('DELETE_L1');
          }, 100);
        }
        break;
      }
      case 'DELETE_L1': {
        if (text1.length > 0) {
          timeoutId = setTimeout(() => {
            setText1(line1Full.slice(0, text1.length - 1));
          }, 40);
        } else {
          timeoutId = setTimeout(() => {
            setPhase('PAUSE');
          }, 350);
        }
        break;
      }
      case 'PAUSE': {
        timeoutId = setTimeout(() => {
          setPhase('TYPE_L1');
        }, 200);
        break;
      }
    }

    return () => clearTimeout(timeoutId);
  }, [phase, text1, text2, isStarted, line1Full, line2Full]);

  const showCursorOnLine1 =
    phase === 'TYPE_L1' || phase === 'DELETE_L1' || phase === 'PAUSE';

  return (
    <div className={`flex flex-col items-start select-none w-full ${className}`}>
      {/* Line 1: Defend Your */}
      <div className="inline-flex items-center flex-wrap align-baseline max-w-full leading-tight">
        <span className="text-slate-900 dark:text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)] break-words">
          {text1}
        </span>
        {showCursorOnLine1 && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block font-mono text-cyan-400 dark:text-cyan-300 select-none ml-1 text-[0.88em] leading-none align-baseline drop-shadow-[0_0_12px_#00e5ff]"
            aria-hidden="true"
          >
            _
          </motion.span>
        )}
      </div>

      {/* Line 2: Stance With Logic */}
      <div className="mt-1 sm:mt-2 inline-flex items-center flex-wrap align-baseline max-w-full leading-tight">
        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 dark:from-cyan-300 dark:via-cyan-200 dark:to-blue-400 from-sky-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(0,229,255,0.35)] break-words">
          {text2}
        </span>
        {!showCursorOnLine1 && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block font-mono text-cyan-400 dark:text-cyan-300 select-none ml-1 text-[0.88em] leading-none align-baseline drop-shadow-[0_0_12px_#00e5ff]"
            aria-hidden="true"
          >
            _
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default MottoTypewriter;
