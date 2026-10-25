import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Lock } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { MagneticButton } from '../motion';

interface RegistrationCountdownCardProps {
  onRegisterClick: () => void;
}

export const RegistrationCountdownCard: React.FC<RegistrationCountdownCardProps> = ({
  onRegisterClick,
}) => {
  const { teams } = useTournament();

  // Target registration deadline: Oct 25 at 11:59 PM (Registration Closes)
  const getTargetTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const oct25ThisYear = new Date(`${year}-10-25T23:59:59+06:00`).getTime();
    // If current system clock is somehow past Oct 25 of this year, target next year's Oct 25 so countdown stays live
    if (now.getTime() > oct25ThisYear) {
      return new Date(`${year + 1}-10-25T23:59:59+06:00`).getTime();
    }
    return oct25ThisYear;
  };

  const calculateTimeLeft = () => {
    const targetDate = getTargetTimestamp();
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>(() => calculateTimeLeft());

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeTeams = teams.filter(
    (t) => t.status !== 'REJECTED' && t.status !== 'DISQUALIFIED'
  );
  const registeredTeamsCount = activeTeams.length;
  const participantsCount = activeTeams.reduce((acc, t) => {
    const validMembers = Array.isArray(t.members)
      ? t.members.filter((m) => m && m.fullName && m.fullName.trim().length > 0)
      : [];
    return acc + (validMembers.length > 0 ? validMembers.length : 3);
  }, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
    >
      <div 
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(10,25,47,0.93) 0%, rgba(13,38,76,0.88) 50%, rgba(10,25,47,0.93) 100%), url(/images/herobanner.png), url(/herobanner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="relative rounded-[28px] sm:rounded-[32px] clay-panel p-4 sm:p-7 lg:p-8 overflow-hidden"
      >
        
        {/* Top/bottom neon glow accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
        
        {/* Subtle cyber grid pattern overlay */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 opacity-[0.06] pointer-events-none [background-image:linear-gradient(rgba(34,211,238,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.3)_1px,transparent_1px)] [background-size:32px_32px]"
        />

        {/* Ambient radial glows */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-5 lg:gap-7 w-full">
            
            {/* Stage Banner Image Card with Glowing Cyan Border */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative w-[180px] sm:w-[240px] xl:w-[260px] aspect-[16/11] rounded-2xl clay-card p-1 shrink-0 overflow-hidden group select-none"
            >
              <img
                src="/images/herobanner.png"
                alt="Tech Debate 4.0 Championship Arena Banner"
                className="w-full h-full object-cover object-center rounded-xl select-none group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('/images/herobanner.png')) {
                    target.src = '/herobanner.png';
                  } else if (!target.src.includes('/images/tech_debate_countdown_stage_fallback.svg')) {
                    target.src = '/images/tech_debate_countdown_stage_fallback.svg';
                  }
                }}
              />
              <div className="absolute inset-1 rounded-xl pointer-events-none border border-cyan-300/30" />
            </motion.div>

            {/* Text Information & Controls */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center lg:items-start max-w-full">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] text-rose-400 uppercase block mb-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                REGISTRATION CLOSED
              </span>

              <h2 className="font-display text-2xl sm:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Registration is Closed
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
                Online registration for Tech Debate 4.0 closed on 25 October at 11:59 PM BST. Thank you for the massive response! Kit distribution starts on 27 October.
              </p>

              {/* Status Info & Registration Closed Action Button */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full lg:w-auto">
                {/* Milestone Stat Badges */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 select-none">
                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl clay-card text-center border border-rose-500/30">
                    <span className="font-mono text-xs sm:text-sm font-bold text-rose-300 block uppercase">
                      CLOSED
                    </span>
                    <span className="text-[7px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      25 OCT
                    </span>
                  </div>

                  <span className="text-xs sm:text-base font-black text-cyan-400 font-mono select-none">→</span>

                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl clay-card text-center border border-cyan-500/30">
                    <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 block uppercase">
                      KIT DIST.
                    </span>
                    <span className="text-[7px] sm:text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      27 OCT
                    </span>
                  </div>

                  <span className="text-xs sm:text-base font-black text-cyan-400 font-mono select-none">→</span>

                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl clay-card text-center border border-blue-500/30">
                    <span className="font-mono text-xs sm:text-sm font-bold text-blue-300 block uppercase">
                      PLAY-OFF
                    </span>
                    <span className="text-[7px] sm:text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                      28 OCT
                    </span>
                  </div>
                </div>

                {/* Register Closed Button & Registered Teams Info */}
                <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                  <MagneticButton onClick={onRegisterClick}>
                    <div
                      className="
                        clay-btn-secondary
                        min-h-[46px] sm:min-h-[48px] px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl
                        text-xs sm:text-sm font-bold
                        flex items-center justify-center gap-2
                        whitespace-nowrap group cursor-pointer
                        border border-rose-500/40 text-rose-300 hover:text-white hover:border-rose-400
                        shadow-lg shadow-rose-500/10
                        touch-manipulation active:scale-[0.98]
                      "
                    >
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>Registration Closed</span>
                    </div>
                  </MagneticButton>

                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl clay-pill text-xs text-slate-200 font-medium whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="tabular-nums font-semibold">
                      {registeredTeamsCount} {registeredTeamsCount === 1 ? 'Team' : 'Teams'} • {participantsCount} Participants
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.section>
  );
};
