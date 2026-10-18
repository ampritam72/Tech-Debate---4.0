import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Award, Crown } from 'lucide-react';
import { SpotlightCard, MagneticButton, StaggerContainer, StaggerItem } from '../motion';

interface HallOfFameSectionProps {
  onViewAllClick: () => void;
}

export const HallOfFameSection: React.FC<HallOfFameSectionProps> = ({ onViewAllClick }) => {
  const editions = [
    {
      edition: 'Tech Debate 1.0',
      year: '2022',
      champion: 'The Logic Lords',
      isUpcoming: false,
    },
    {
      edition: 'Tech Debate 2.0',
      year: '2023',
      champion: 'Binary Brigade',
      isUpcoming: false,
    },
    {
      edition: 'Tech Debate 3.0',
      year: '2024',
      champion: 'Syntax Error',
      isUpcoming: false,
    },
    {
      edition: 'Tech Debate 4.0',
      year: '2026',
      champion: 'Be the next champion',
      isUpcoming: true,
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-sky-600 dark:text-cyan-400 block mb-1">
            HALL OF FAME
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Legacy of Great Minds
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-sans">
            Celebrating the champions who shaped Tech Debate.
          </p>
        </div>

        <MagneticButton onClick={onViewAllClick}>
          <div className="clay-btn-secondary min-h-[44px] px-5 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto cursor-pointer font-bold touch-manipulation active:scale-[0.98]">
            <span>View All Editions</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </div>
        </MagneticButton>
      </div>

      {/* 4 Cards Grid */}
      <StaggerContainer
        staggerChildren={0.08}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {editions.map((item, idx) => (
          <StaggerItem key={idx} preset="slideUp">
            <SpotlightCard className="h-full p-5 flex flex-col justify-between overflow-hidden group select-none">
              {/* Top Hairline */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

              <div>
                {/* Header: Edition & Year Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
                    {item.edition}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full clay-tab text-[10px] font-mono font-bold text-sky-700 dark:text-cyan-300">
                    {item.year}
                  </span>
                </div>

                {/* Visual Frame */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-cyan-400/20 bg-slate-950/70 mb-4 flex items-center justify-center p-3 shadow-inner">
                  {item.isUpcoming ? (
                    /* High-Tech Glowing Trophy Pedestal */
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-xl" />
                        <Trophy className="w-12 h-12 text-sky-500 dark:text-cyan-300 drop-shadow-[0_0_12px_#38bdf8] relative z-10" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-widest mt-2">
                        NEXT CHAMPION
                      </span>
                    </div>
                  ) : (
                    /* Champion Celebration Graphic */
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-t from-sky-100 to-sky-50 dark:from-[#041235] dark:to-[#0a2360] rounded-lg">
                      <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                        <Trophy className="w-6 h-6 drop-shadow-[0_0_8px_#fbbf24]" />
                        <Crown className="w-8 h-8 drop-shadow-[0_0_10px_#fbbf24]" />
                        <Award className="w-6 h-6 drop-shadow-[0_0_8px_#fbbf24]" />
                      </div>
                      <div className="absolute bottom-1.5 text-[9px] font-mono text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                        CHAMPION TROPHY
                      </div>
                    </div>
                  )}
                </div>

                {/* Champion Badge & Name */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span>Champion</span>
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {item.champion}
                  </h3>
                </div>
              </div>

              {/* Bottom Icon */}
              <div className="mt-4 pt-3 border-t border-sky-100 dark:border-cyan-500/20 flex justify-end">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-400/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

    </section>
  );
};
