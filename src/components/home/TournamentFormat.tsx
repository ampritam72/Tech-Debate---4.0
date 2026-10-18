import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Play, Users, Trophy, Award, Crown, ChevronRight } from 'lucide-react';
import { SpotlightCard, StaggerContainer, StaggerItem } from '../motion';

export const TournamentFormat: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Registration',
      description: '64 squads enroll and confirm',
      icon: FileText,
      isFinal: false,
    },
    {
      step: '02',
      title: 'Round of 64',
      description: '32 knockout matches open the clash',
      icon: Play,
      isFinal: false,
    },
    {
      step: '03',
      title: 'Round of 32',
      description: '16 high-intensity clashes',
      icon: Users,
      isFinal: false,
    },
    {
      step: '04',
      title: 'Round of 16',
      description: '8 matches filter the elite',
      icon: Award,
      isFinal: false,
    },
    {
      step: '05',
      title: 'Quarter & Semis',
      description: '4 QF & 2 Semifinal showdowns',
      icon: Trophy,
      isFinal: false,
    },
    {
      step: '06',
      title: 'Grand Final',
      description: 'The ultimate debate for glory',
      icon: Crown,
      isFinal: true,
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      
      {/* Header with Title and Quote */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block mb-1">
            OFFICIAL TOURNAMENT PROGRESSION
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            From Registration to the Grand Stage
          </h2>
        </div>

        <div className="text-sm font-serif italic text-cyan-200/80 md:text-right">
          "Different perspectives.<br className="hidden md:inline" /> A brighter tomorrow."
        </div>
      </div>

      {/* Horizontal Connected 6-Stage Timeline */}
      <div className="relative rounded-3xl clay-panel p-6 sm:p-8 mb-8">
        
        {/* Subtle horizontal connecting line on desktop */}
        <div className="hidden lg:block absolute top-[52px] left-14 right-14 h-[2px] bg-gradient-to-r from-cyan-400/60 via-blue-400/60 to-amber-400/70 z-0 pointer-events-none" />

        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 relative z-10"
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={idx} preset="scaleUp">
                <SpotlightCard className="flex flex-col items-center text-center group h-full p-3 sm:p-4">
                  {/* Node Circle */}
                  <div className="relative mb-2.5 sm:mb-3.5">
                    <div className={`w-11 h-11 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      item.isFinal
                        ? 'clay-card-glow text-amber-300 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                        : 'clay-card text-cyan-200 border-cyan-400/60'
                    }`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Arrow Indicator between nodes on desktop */}
                    {idx < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-cyan-400/50">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Step Number */}
                  <span className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-wider mb-0.5 sm:mb-1 ${
                    item.isFinal ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {item.step}
                  </span>

                  {/* Step Title */}
                  <h3 className="font-display text-xs sm:text-base font-bold text-white mb-1">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[11px] sm:text-xs text-slate-300 max-w-full leading-tight">
                    {item.description}
                  </p>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};
