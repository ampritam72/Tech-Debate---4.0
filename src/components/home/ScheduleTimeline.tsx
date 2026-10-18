import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Clock, MapPin, CheckCircle2, CircleDot } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';
import { useTournament } from '../../context/TournamentContext';

export const ScheduleTimeline: React.FC = () => {
  const { schedule } = useTournament();

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24"
    >
      <SectionHeader
        badge="EVENT ROADMAP"
        title="Schedule & Championship Milestones"
        subtitle="Live chronological timetable of Tech Debate 4.0. Venue announcements and reporting times are strictly maintained by the organizing committee."
      />

      <div className="relative ml-4 sm:ml-8">
        {/* Glowing vertical connector line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500/50 to-slate-300 dark:to-cyan-950 pointer-events-none" />

        <div className="space-y-7">
          {schedule.map((item, idx) => (
            <motion.div 
              key={item.id}
              custom={idx}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative pl-8 sm:pl-10 group"
            >
              {/* Timeline node icon */}
              <div className={`absolute -left-[1px] top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                item.isCompleted 
                  ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : item.isActive 
                    ? 'bg-cyan-500/25 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(0,229,255,0.45)]' 
                    : 'bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-400'
              }`}>
                {item.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : item.isActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                )}
              </div>

              {/* Glass Card */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`relative p-5 sm:p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  item.isActive
                    ? 'border-sky-400 dark:border-sky-400/80 bg-white dark:bg-[#0e2752]/90 shadow-[0_4px_30px_rgba(56,189,248,0.25)]'
                    : 'border-sky-200/90 dark:border-sky-500/25 bg-white/95 dark:bg-[#0c2248]/80 shadow-[0_8px_30px_rgba(14,165,233,0.08)] hover:border-sky-400 hover:shadow-[0_12px_36px_rgba(14,165,233,0.18)]'
                }`}
              >
                {/* Top subtle neon hairline */}
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 dark:border-sky-500/20 pb-3 mb-3">
                  <div>
                    <span className="font-mono text-xs text-sky-700 dark:text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-400/30">
                      {item.date}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-[#071630]/80 border border-sky-200 dark:border-sky-500/20 text-sky-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span>{item.timeRange}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 text-sky-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span>{item.venue}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {item.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
