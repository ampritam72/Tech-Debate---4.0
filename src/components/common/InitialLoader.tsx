import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechDebateLogo } from './TechDebateLogo';
import { Sparkles, Trophy, ShieldCheck } from 'lucide-react';

interface InitialLoaderProps {
  onComplete?: () => void;
  minimumDurationMs?: number;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({
  onComplete,
  minimumDurationMs = 2800,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [statusTextIndex, setStatusTextIndex] = useState<number>(0);

  const statusMessages = [
    'Initializing Arena Core...',
    'Calibrating Logic Engines...',
    'Loading Championship Rosters...',
    'Ready for Clash of Minds...',
  ];

  useEffect(() => {
    // Optimized progress updates (25 steps instead of 100 to prevent main-thread UI locking)
    const stepInterval = minimumDurationMs / 25;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + 4);
      });
    }, stepInterval);

    // Rotate status messages
    const statusTimer = setInterval(() => {
      setStatusTextIndex((prev) => (prev + 1) % statusMessages.length);
    }, 700);

    // Complete loading sequence
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
    }, minimumDurationMs);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
      clearTimeout(completeTimer);
    };
  }, [minimumDurationMs]);

  const handleFinish = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="initial-app-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            transition: { duration: 0.5, ease: 'easeOut' },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030c1e] text-slate-100 overflow-hidden select-none px-4"
        >
          {/* Animated Background Cyber Lines & Glowing Backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] rounded-full bg-cyan-600/15 blur-[60px] sm:blur-[100px]" />
            
            {/* Cyber Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.35) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-xl text-center">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase shadow-md shadow-cyan-950"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">4TH INTRA-CSE PARLIAMENTARY DEBATE</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 hidden sm:inline-block" />
            </motion.div>

            {/* Official Tech Debate Logo Reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mb-6 max-w-full"
            >
              <TechDebateLogo size="hero" className="relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </motion.div>

            {/* Main Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-2"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Defend Your Stance With{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  Logic
                </span>
              </h1>
            </motion.div>

            {/* Subtitle / Host Details */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-[10px] sm:text-xs tracking-[0.2em] text-cyan-200/80 uppercase font-medium mb-8"
            >
              DEPARTMENT OF CSE
            </motion.p>

            {/* Cyber Progress Indicator Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full max-w-xs sm:max-w-md space-y-2.5"
            >
              <div className="relative h-2 w-full rounded-full bg-slate-800/90 border border-cyan-900/60 overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              </div>

              {/* Status Text & Percentage Display */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 px-1 font-mono">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusTextIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="text-cyan-400/90 flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 animate-spin" />
                    <span className="truncate">{statusMessages[statusTextIndex]}</span>
                  </motion.span>
                </AnimatePresence>
                <span className="text-cyan-300 font-bold ml-2">{progress}%</span>
              </div>
            </motion.div>

            {/* Quick Skip Action Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={handleFinish}
              className="mt-6 text-xs tracking-wider text-slate-400 hover:text-cyan-300 underline underline-offset-4 transition-colors cursor-pointer py-1 px-3"
            >
              Skip Intro & Enter Arena →
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
