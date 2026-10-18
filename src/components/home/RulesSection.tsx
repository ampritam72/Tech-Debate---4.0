import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ShieldAlert, Award, UserCheck, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';
import { PARLIAMENTARY_RULES } from '../../services/mockData';

export const RulesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'format' | 'timing' | 'poi' | 'judging' | 'conduct'>('format');

  const tabs = [
    { id: 'format' as const, label: 'Parliamentary Format', icon: BookOpen },
    { id: 'timing' as const, label: 'Timing & Bells', icon: Clock },
    { id: 'poi' as const, label: 'Points of Information', icon: ShieldAlert },
    { id: 'judging' as const, label: 'Adjudication Rubric', icon: Award },
    { id: 'conduct' as const, label: 'Code of Conduct', icon: UserCheck },
  ];

  const currentRule = PARLIAMENTARY_RULES[activeTab];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24"
    >
      <SectionHeader
        badge="OFFICIAL REGULATIONS"
        title="Rules, Time Protocols & Adjudication Framework"
        subtitle="Full Asian Parliamentary debate structure adapted for intra-CSE technical matches. Every participant must master these protocols prior to preliminary rounds."
      />

      {/* Interactive Tabs with Electric Blue Styling */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap font-mono uppercase tracking-wider ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200/60 dark:hover:bg-cyan-500/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Rule Panel with Animated Content Switch */}
      <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_8px_32px_rgba(0,119,254,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4 gap-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentRule.title}
              </h3>
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 shrink-0 self-start sm:self-auto">
                Official TD4 Protocol
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {currentRule.description}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {currentRule.points.map((pt, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
