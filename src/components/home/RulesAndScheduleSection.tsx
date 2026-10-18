import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, FileText, ArrowRight, BookOpen } from 'lucide-react';

interface RulesAndScheduleProps {
  onViewRulesClick: () => void;
  onViewScheduleClick: () => void;
}

export const RulesAndScheduleSection: React.FC<RulesAndScheduleProps> = ({
  onViewRulesClick,
  onViewScheduleClick,
}) => {
  const infoCards = [
    {
      title: 'Parliamentary Debate Format',
      icon: Users,
    },
    {
      title: 'Team of 2/3 Speakers',
      icon: Users,
    },
    {
      title: 'Time Limits & Structure',
      icon: Clock,
    },
    {
      title: 'Judging Criteria',
      icon: FileText,
    },
  ];

  const dates = [
    { date: '17 Oct', title: 'Registration Opens' },
    { date: '22 Oct', title: 'Registration Closes' },
    { date: '25 Oct', title: 'Play-Off Rounds Start' },
    { date: 'Upcoming', title: 'Round of 32' },
    { date: 'Upcoming', title: 'Quarter & Semi Finals' },
    { date: 'Upcoming', title: 'Grand Final' },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Key Information (4 cards + button) */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-6 rounded-3xl border border-slate-800/80 bg-slate-900/75 p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.35)] flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block mb-1">
              RULES & SCHEDULE
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Key Information
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 mb-6 font-sans">
              Everything you need to know
            </p>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-8">
              {infoCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-2 sm:mb-3 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.35)] transition-all">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                      {card.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onViewRulesClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] via-[#00a8ff] to-[#0072ff] hover:from-[#38bdf8] hover:to-[#0284c7] text-white text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(0,180,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 self-start active:scale-95"
          >
            <span>View Detailed Rules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Right Column: Important Dates + Notebook Graphic */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-6 rounded-3xl border border-slate-800/80 bg-slate-900/75 p-5 sm:p-8 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.35)]"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block mb-0.5">
                SCHEDULE (TENTATIVE)
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Important Dates
              </h2>
            </div>

            <button
              onClick={onViewScheduleClick}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-950/80 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-xs self-start sm:self-auto"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Timeline Nodes */}
            <div className="md:col-span-7 space-y-3.5 relative">
              {/* Vertical connector line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500/60 to-cyan-500/30 pointer-events-none" />

              {dates.map((d, i) => (
                <div key={i} className="flex items-center gap-3.5 relative pl-6 group">
                  {/* Glowing Node Dot */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_8px_#00e5ff]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono font-semibold text-cyan-300 whitespace-nowrap">
                    {d.date}
                  </span>

                  <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {d.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Notebook Graphic: "GOOD ARGUMENTS A BRIGHTER TOMORROW" */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-40 sm:w-44 aspect-[3/4] rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-[#0c225a] via-[#05143a] to-[#02091c] p-4 shadow-[0_0_30px_rgba(0,180,255,0.25)] flex flex-col justify-between transform rotate-2 hover:rotate-0 transition-transform">
                <div className="w-full flex justify-end">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                    CSE DEBATE
                  </div>
                  <div className="font-serif italic text-xs font-extrabold text-white leading-tight">
                    GOOD<br />
                    ARGUMENTS<br />
                    A BRIGHTER<br />
                    TOMORROW
                  </div>
                </div>

                {/* Pen accent */}
                <div className="w-full flex items-center justify-center pt-2 border-t border-cyan-500/30">
                  <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-amber-300 rounded-full shadow-[0_0_6px_#00e5ff]" />
                </div>
              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};
