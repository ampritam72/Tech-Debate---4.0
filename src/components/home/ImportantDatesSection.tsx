import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { HOME_SECTION_BACKGROUNDS, getSectionBgStyle } from '../../config/sectionBackgrounds';
import { usePortalSettings } from '../../config/portalSettings';

interface ImportantDatesSectionProps {
  onViewScheduleClick: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const ImportantDatesSection: React.FC<ImportantDatesSectionProps> = ({
  onViewScheduleClick,
}) => {
  const { timelineStages: dates } = usePortalSettings();

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={getSectionBgStyle(HOME_SECTION_BACKGROUNDS.importantDatesPanel)}
        className="relative rounded-3xl clay-panel p-6 sm:p-8 lg:p-10 overflow-hidden"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-cyan-500/20">
          <div>
            <div className="clay-pill px-3 py-1 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCHEDULE (TENTATIVE)</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Important Dates & Milestones
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans max-w-xl">
              Official calendar leading up to the grand championship confrontation on stage.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewScheduleClick}
            className="clay-btn-secondary min-h-[44px] px-5 py-3 text-xs sm:text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto cursor-pointer touch-manipulation active:scale-[0.98]"
          >
            <span>View Full Schedule</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </motion.button>
        </div>

        {/* Grid: Left Timeline (Stage 1 to Stage 8) + Right Full-Height Roadmap Picture Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Timeline Nodes with Staggered Entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-7 space-y-3.5 relative flex flex-col justify-between"
          >
            {/* Vertical Connector Line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400 via-cyan-400 to-blue-500/60 pointer-events-none" />

            {dates.map((d, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`flex items-center justify-between gap-3 sm:gap-4 relative pl-8 p-3 sm:p-3.5 rounded-2xl clay-card transition-all group ${
                  d.completed ? 'border-emerald-500/35' : ''
                }`}
              >
                {/* Glowing Node Dot */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  d.completed
                    ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.75)]'
                    : d.active
                    ? 'border-cyan-300 bg-cyan-500 shadow-[0_0_15px_#0ea5e9] scale-110 animate-pulse'
                    : 'border-cyan-300 dark:border-cyan-500/30 bg-white dark:bg-[#081836] group-hover:border-cyan-400'
                }`}>
                  {d.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${d.active ? 'bg-white' : 'bg-cyan-500 dark:bg-cyan-300'}`} />
                  )}
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="px-2.5 sm:px-3 py-1.5 rounded-xl clay-tab text-[11px] sm:text-xs font-mono font-semibold text-sky-700 dark:text-cyan-200 shrink-0">
                    {d.date}
                  </span>
                  <span className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                    {d.title}
                  </span>
                  {d.completed && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/70 text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                      title="Completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                    d.completed
                      ? 'text-emerald-400'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-cyan-400'
                  }`}>
                    {d.stage}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Stage 1 to Stage 8 Full-Height Roadmap Picture Frame (No Text, Full Opacity) */}
          <div className="lg:col-span-5 flex items-stretch">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full min-h-[420px] lg:min-h-0 rounded-2xl border border-cyan-400/40 overflow-hidden shadow-[0_12px_36px_rgba(6,182,212,0.22)] relative bg-[#04122d]"
            >
              <img
                src={HOME_SECTION_BACKGROUNDS.roadmapCard}
                alt="Tech Debate 4.0 Stage 1 to Stage 8 Roadmap"
                referrerPolicy="no-referrer"
                className="w-full h-full lg:absolute lg:inset-0 object-cover object-center block opacity-100"
              />
            </motion.div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
