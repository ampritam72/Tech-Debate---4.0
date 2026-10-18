import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Trophy, Award, Medal, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface ChampionshipBannerProps {
  onRegisterClick: () => void;
  onExploreHallOfFame: () => void;
}

export const ChampionshipBanner: React.FC<ChampionshipBannerProps> = ({
  onRegisterClick,
  onExploreHallOfFame
}) => {
  const prizes = [
    {
      title: 'Grand Champions',
      subtitle: 'Champions of Tech Debate 4.0',
      amount: 'BDT 15,000',
      badge: 'GRAND CHAMPION',
      icon: Trophy,
      details: 'The Perpetual Gold Championship Trophy, individual Gold Medals, and Departmental Honors Commendation.',
      color: 'border-amber-400/50 dark:border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent text-amber-700 dark:text-amber-300',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.25)]',
      iconBg: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-400/40'
    },
    {
      title: 'Finalist Squad',
      subtitle: 'Tournament Runners-Up',
      amount: 'BDT 7,000',
      badge: 'RUNNER-UP SQUAD',
      icon: Medal,
      details: 'Championship Silver Trophy, individual Silver Medals, and official Departmental Merit Certificates.',
      color: 'border-cyan-400/50 dark:border-cyan-400/40 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent text-cyan-700 dark:text-cyan-300',
      glow: 'shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_0_40px_rgba(0,229,255,0.25)]',
      iconBg: 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border border-cyan-400/40'
    },
    {
      title: 'Top Orator',
      subtitle: 'Grand Final Best Speaker',
      amount: 'BDT 3,000',
      badge: 'BEST SPEAKER',
      icon: Award,
      details: 'The Forensics Excellence Crest, Individual Best Speaker Trophy, and Certified High-Speaker Accolade.',
      color: 'border-blue-400/50 dark:border-blue-400/40 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent text-blue-700 dark:text-blue-300',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]',
      iconBg: 'bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-400/40'
    }
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
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
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24"
    >
      <div className="rounded-3xl border border-sky-200/90 dark:border-sky-500/25 bg-white/95 dark:bg-[#0c2248]/85 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_12px_45px_rgba(14,165,233,0.12)] relative overflow-hidden">
        
        {/* Subtle top neon hairline gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        
        {/* Ambient brand glow spotlights */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-sky-100 dark:border-sky-500/20">
          <div>
            <div className="inline-flex items-center gap-2 mb-2.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-950/70 border border-sky-200 dark:border-cyan-400/40 text-xs font-mono font-semibold text-sky-700 dark:text-cyan-300 uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>Official Accolades & Prize Purse</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              BDT 25,000 Championship Purse & Academic Honors
            </h2>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Officially sanctioned by the Department of Computer Science & Engineering. All 32 participating squads receive official parliamentary participation credentials and departmental merit crests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRegisterClick}
              className="inline-flex items-center justify-center min-h-[44px] gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(14,165,233,0.35)] cursor-pointer touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>Register Squad</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </motion.button>
            <button
              onClick={onExploreHallOfFame}
              className="inline-flex items-center justify-center min-h-[44px] gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border border-sky-200 dark:border-cyan-400/30 text-sky-700 dark:text-cyan-200 hover:bg-sky-50 dark:hover:bg-cyan-500/10 text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <span>Past Winners</span>
            </button>
          </div>
        </div>

        {/* 3 Prize Cards Grid with Framer Motion hover & scroll reveals */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {prizes.map((prize, idx) => {
            const Icon = prize.icon;
            return (
              <motion.div 
                key={idx}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-xl transition-all ${prize.color} ${prize.glow}`}
              >
                {/* Top glow hairline */}
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-40 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-white/90 dark:bg-[#071630]/90 border border-current shadow-xs">
                      {prize.badge}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${prize.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {prize.amount}
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {prize.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    {prize.subtitle}
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {prize.details}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-current/20 flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Verified cash purse & institutional certificate</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
};
