import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, FileText, Trophy } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { SpotlightCard } from '../motion';

export const StatisticsCounter: React.FC = () => {
  const { teams, fixtures, hallOfFame } = useTournament();

  // Real-time live calculations from Firebase Cloud Firestore & Tournament Database
  const activeTeams = teams.filter(
    (t) => t.status !== 'REJECTED' && t.status !== 'DISQUALIFIED'
  );
  const teamsCount = activeTeams.length;
  const verifiedCount = activeTeams.filter((t) => t.status === 'VERIFIED' || t.payment?.status === 'VERIFIED').length;

  const participantsCount = activeTeams.reduce((acc, t) => {
    const validMembers = Array.isArray(t.members)
      ? t.members.filter((m) => m && m.fullName && m.fullName.trim().length > 0)
      : [];
    return acc + (validMembers.length > 0 ? validMembers.length : 3);
  }, 0);

  const matchesCount = fixtures.length > 0 ? fixtures.length : 31;
  const editionsCount = hallOfFame.length > 0 ? hallOfFame.length : 4;

  const stats = [
    {
      id: 'teams',
      value: `${teamsCount}`,
      suffix: teamsCount >= 40 ? '+' : '',
      label: 'Registered Teams',
      sublabel:
        verifiedCount > 0
          ? `${teamsCount} ${teamsCount === 1 ? 'Squad' : 'Squads'} (${verifiedCount} Verified)`
          : `${teamsCount} ${teamsCount === 1 ? 'Squad' : 'Squads'} in Database`,
      icon: Users,
      isLive: true,
    },
    {
      id: 'participants',
      value: `${participantsCount}`,
      suffix: participantsCount >= 120 ? '+' : '',
      label: 'Participants',
      sublabel: `${participantsCount} ${participantsCount === 1 ? 'Debater' : 'Debaters'} Enrolled`,
      icon: User,
      isLive: true,
    },
    {
      id: 'matches',
      value: `${matchesCount}`,
      suffix: '+',
      label: 'Matches',
      sublabel: 'Official Fixtures',
      icon: FileText,
      isLive: false,
    },
    {
      id: 'editions',
      value: `${editionsCount}`,
      suffix: '',
      label: 'Editions',
      sublabel: 'Dynasty Legacy',
      icon: Trophy,
      isLive: false,
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="h-full min-w-0"
            >
              <SpotlightCard className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-5 group select-none h-full min-w-0">
                {/* Top subtle neon hairline */}
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

                {/* Glowing Icon in circular neon border */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl clay-tab flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-all">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>

                {/* Dynamic Value and Label */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={`${stat.id}-${stat.value}`}
                        initial={{ opacity: 0.4, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        className="text-xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors tabular-nums"
                      >
                        {stat.value}
                      </motion.span>
                    </AnimatePresence>
                    {stat.suffix && (
                      <span className="text-lg sm:text-2xl font-display font-extrabold text-sky-600 dark:text-cyan-400 leading-none">
                        {stat.suffix}
                      </span>
                    )}
                    {stat.isLive && (
                      <span
                        className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider shrink-0"
                        title="Real-Time Synced with Cloud Registration Database"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="hidden sm:inline">LIVE</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 sm:mt-1 font-sans truncate">
                    {stat.label}
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-sky-600 dark:text-cyan-300/80 truncate mt-0.5">
                    {stat.sublabel}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
