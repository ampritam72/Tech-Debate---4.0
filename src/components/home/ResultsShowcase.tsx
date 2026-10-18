import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Trophy, Medal, Star, Award, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';
import { useTournament } from '../../context/TournamentContext';

export const ResultsShowcase: React.FC = () => {
  const { hallOfFame } = useTournament();
  const current4 = hallOfFame.find(h => h.edition === '4.0') || hallOfFame[3];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.55,
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
        badge="HONORS PODIUM"
        title="Tournament Honors & Results"
        subtitle="The ultimate recognition for forensic brilliance and logical endurance at Tech Debate 4.0."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Champion Team Card */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="relative p-7 rounded-3xl border border-amber-400/50 dark:border-amber-400/35 bg-white/95 dark:bg-[#0c2248]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(251,191,36,0.15)] hover:shadow-[0_16px_40px_rgba(251,191,36,0.25)] transition-all overflow-hidden"
        >
          {/* Top amber neon hairline */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-300 font-bold block">
                  CHAMPION SQUAD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {current4.champion.batch}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-xs border border-amber-400/40 font-bold">
              Gold Trophy · BDT 15,000
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            {current4.champion.teamName}
          </h3>

          <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-amber-900/40">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Debater Lineup:
            </span>
            <div className="space-y-1.5">
              {current4.champion.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="font-medium">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Runner-up Team Card */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="relative p-7 rounded-3xl border border-cyan-400/40 dark:border-sky-500/25 bg-white/95 dark:bg-[#0c2248]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,229,255,0.12)] hover:shadow-[0_16px_40px_rgba(2,10,28,0.5)] transition-all overflow-hidden"
        >
          {/* Top cyan neon hairline */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold block">
                  RUNNER-UP SQUAD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {current4.runnerUp.batch}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-xs border border-cyan-400/40 font-bold">
              Silver Medal · BDT 7,000
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            {current4.runnerUp.teamName}
          </h3>

          <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Debater Lineup:
            </span>
            <div className="space-y-1.5">
              {current4.runnerUp.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                  <span className="font-medium">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Individual Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Best Tournament Debater */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative p-6 rounded-2xl border border-slate-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-[#0c2248]/85 backdrop-blur-xl flex items-start gap-4 hover:border-cyan-400/60 dark:hover:border-sky-400/50 hover:shadow-[0_12px_30px_rgba(2,10,28,0.4)] transition-all overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block">
              BEST TOURNAMENT DEBATER
            </span>
            <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {current4.bestTournamentDebater.name}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {current4.bestTournamentDebater.batch} · ID: {current4.bestTournamentDebater.studentId}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {current4.bestTournamentDebater.achievement}
            </p>
          </div>
        </motion.div>

        {/* Final Match Best Debater */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative p-6 rounded-2xl border border-slate-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-[#0c2248]/85 backdrop-blur-xl flex items-start gap-4 hover:border-blue-400/60 dark:hover:border-sky-400/50 hover:shadow-[0_12px_30px_rgba(2,10,28,0.4)] transition-all overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold block">
              FINAL MATCH BEST DEBATER
            </span>
            <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {current4.finalMatchBestDebater.name}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {current4.finalMatchBestDebater.batch} · ID: {current4.finalMatchBestDebater.studentId}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Awarded based on the single highest adjudicator cumulative ballot during the Grand Final constructives.
            </p>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
};
