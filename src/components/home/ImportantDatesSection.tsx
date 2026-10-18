import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

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
  const dates = [
    { date: '17 Oct', title: 'Registration Opens', stage: 'Stage 01', completed: true },
    { date: '22 Oct', title: 'Registration Closes', stage: 'Stage 02', active: true },
    { date: '25 Oct', title: 'Play-Off Rounds Start', stage: 'Stage 03', completed: false },
    { date: 'Upcoming', title: 'Round of 32', stage: 'Stage 04', completed: false },
    { date: 'Upcoming', title: 'Quarter & Semi Finals', stage: 'Stage 05', completed: false },
    { date: 'Upcoming', title: 'Grand Final', stage: 'Stage 06', completed: false },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
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

        {/* Grid: Left Timeline + Right Championship Notebook Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Timeline Nodes with Staggered Entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-7 space-y-4 relative"
          >
            {/* Vertical Connector Line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500/60 to-cyan-300 pointer-events-none" />

            {dates.map((d, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center justify-between gap-4 relative pl-8 p-3 rounded-2xl clay-card transition-all group"
              >
                {/* Glowing Node Dot */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  d.active
                    ? 'border-cyan-300 bg-cyan-500 shadow-[0_0_15px_#0ea5e9] scale-110 animate-pulse'
                    : d.completed
                    ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'border-cyan-300 dark:border-cyan-500/30 bg-white dark:bg-[#081836] group-hover:border-cyan-400'
                }`}>
                  {d.completed ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${d.active ? 'bg-white' : 'bg-cyan-500 dark:bg-cyan-300'}`} />
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-3 py-1.5 rounded-xl clay-tab text-xs font-mono font-semibold text-sky-700 dark:text-cyan-200 shrink-0">
                    {d.date}
                  </span>
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                    {d.title}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 group-hover:text-cyan-400 shrink-0">
                  {d.stage}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: High-Tech Notebook & Protocol Graphics Card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02, rotate: 0.5 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm rounded-2xl clay-card-glow p-5 sm:p-6 relative overflow-hidden"
            >
              {/* Neon Bookmark Ribbon */}
              <div className="absolute top-0 right-6 w-5 h-9 bg-gradient-to-b from-sky-400 to-blue-600 rounded-b-md shadow-[0_0_12px_rgba(14,165,233,0.5)]" />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-cyan-500/15 border border-sky-200 dark:border-cyan-400/40 flex items-center justify-center text-sky-600 dark:text-cyan-300 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
                    Championship Protocol
                  </h3>
                  <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-400">
                    EDITION 4.0 / 2026
                  </span>
                </div>
              </div>

              {/* Protocol Highlights */}
              <div className="space-y-3 font-mono text-xs border-y border-sky-100 dark:border-cyan-500/20 py-4 my-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Opening Ceremony:</span>
                  <span className="text-sky-700 dark:text-cyan-300 font-bold">10:00 AM</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Motion Release:</span>
                  <span className="text-sky-700 dark:text-cyan-300 font-bold">15m Pre-match</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Auditorium Venue:</span>
                  <span className="text-slate-900 dark:text-white font-bold">VU Main Campus</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Strict Attendance Mandatory</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
