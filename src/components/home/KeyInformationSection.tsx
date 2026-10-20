import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, FileText, ArrowRight, Scale, ShieldCheck } from 'lucide-react';
import { SpotlightCard, MagneticButton, StaggerContainer, StaggerItem } from '../motion';

interface KeyInformationSectionProps {
  onViewRulesClick: (ruleId?: string) => void;
}

export const KeyInformationSection: React.FC<KeyInformationSectionProps> = ({
  onViewRulesClick,
}) => {
  const infoCards = [
    {
      id: 'format',
      title: 'Parliamentary Debate Format',
      description: 'Asian Parliamentary format with Government & Opposition sides.',
      icon: Scale,
      highlight: 'Standard Rules',
    },
    {
      id: 'team',
      title: 'Teams of 3 Speakers',
      description: '3 primary speakers per team representing your batch.',
      icon: Users,
      highlight: '3 Members',
    },
    {
      id: 'timings',
      title: 'Time Limits & Structure',
      description: 'Substantive speeches: 4 mins. Reply speeches: 3 mins (Timed Bells).',
      icon: Clock,
      highlight: 'Timed Bells',
    },
    {
      id: 'judging',
      title: 'Judging Criteria',
      description: 'Matter (40%), Manner (40%), and Method (20%) rubric.',
      icon: FileText,
      highlight: 'Official Rubric',
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative rounded-3xl clay-panel p-6 sm:p-8 lg:p-10 overflow-hidden"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-badge text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>RULES & REGULATIONS</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Key Information
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans max-w-xl">
              Essential guidelines and standards established for all participants, adjudicators, and squads.
            </p>
          </div>

          <MagneticButton onClick={() => onViewRulesClick()}>
            <div className="w-full sm:w-auto px-6 py-3 rounded-xl clay-btn-primary text-xs sm:text-sm font-bold tracking-wide cursor-pointer flex items-center justify-center gap-2 shrink-0">
              <span>View Detailed Rules</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </MagneticButton>
        </div>

        {/* 4 Spotlight Cards Grid with Stagger */}
        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {infoCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <StaggerItem key={idx} preset="slideUp">
                <SpotlightCard
                  onClick={() => onViewRulesClick(card.id)}
                  className="p-5 sm:p-6 flex flex-col justify-between group cursor-pointer h-full"
                >
                  {/* Subtle Card Glow Hairline */}
                  <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-[#102a56]/80 border border-sky-200 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-cyan-200 group-hover:scale-110 group-hover:border-sky-400 group-hover:shadow-[0_0_18px_rgba(14,165,233,0.35)] transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-400/30 text-sky-700 dark:text-cyan-300">
                        {card.highlight}
                      </span>
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors leading-snug">
                      {card.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-sky-100 dark:border-cyan-500/15 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-cyan-400 group-hover:text-sky-700 dark:group-hover:text-cyan-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </motion.div>
    </section>
  );
};
