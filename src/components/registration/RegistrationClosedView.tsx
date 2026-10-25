import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Calendar, 
  Users, 
  Trophy, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Home, 
  Search, 
  Sparkles,
  Info,
  Clock,
  Shirt,
  Award
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

interface RegistrationClosedViewProps {
  onGoHome?: () => void;
}

export const RegistrationClosedView: React.FC<RegistrationClosedViewProps> = ({ onGoHome }) => {
  const { teams } = useTournament();
  const [searchQuery, setSearchQuery] = useState('');

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'home' }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoSchedule = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'about' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHallOfFame = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'hall-of-fame' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const searchedTeams = searchQuery.trim()
    ? teams.filter((t) => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.batch.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.members?.some(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim()) || m.studentId.includes(searchQuery.trim()))
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 1. Main Registration Closed Banner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl clay-panel p-6 sm:p-10 overflow-hidden text-center"
      >
        {/* Glow ambient background accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-5">
          
          {/* Animated Closed Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>REGISTRATION CLOSED</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Registration Has <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300">
              Officially Ended
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            The registration portal for <strong>Tech Debate 4.0</strong> closed on{' '}
            <span className="text-cyan-300 font-mono font-semibold">25 October 2026 at 11:59 PM BST</span>.
            Squad rosters and team member allocations across all CSE batches are now strictly locked.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            A heartfelt thank you to all the enthusiastic debaters from the Department of Computer Science & Engineering, Varendra University for the overwhelming response!
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-3">
            <div className="p-3.5 rounded-2xl clay-card text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
                Total Squads
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white tabular-nums">
                {registeredTeamsCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl clay-card text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
                Debaters
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white tabular-nums">
                {participantsCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl clay-card text-center">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-0.5">
                Next Stage
              </span>
              <span className="font-display text-xs sm:text-sm font-bold text-white block mt-1">
                Kit Distribution
              </span>
            </div>

            <div className="p-3.5 rounded-2xl clay-card text-center">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-0.5">
                Roster Status
              </span>
              <span className="font-display text-xs sm:text-sm font-bold text-emerald-300 block mt-1">
                Locked & Synced
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 w-full">
            <button
              onClick={handleGoHome}
              className="clay-btn-primary px-6 py-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <button
              onClick={handleGoSchedule}
              className="clay-btn-secondary px-6 py-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>View Tournament Schedule</span>
            </button>
          </div>

        </div>
      </motion.div>

      {/* 2. Upcoming Milestones & Instructions for Registered Squads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Kit Distribution Notice */}
        <div className="p-6 rounded-3xl clay-card space-y-3 relative overflow-hidden border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Shirt className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full clay-badge text-[10px] font-mono font-bold text-cyan-300">
              STAGE 04 • 27 OCT
            </span>
          </div>

          <h3 className="font-display text-base sm:text-lg font-bold text-white">
            Official Delegate Kit Distribution
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Registered team leaders will collect official tournament delegate badges, kit folders, debate guidelines, and batch identification tags on <strong>27 October</strong> at the CSE Department, Varendra University.
          </p>

          <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Reporting times will be shared with leaders</span>
          </div>
        </div>

        {/* Play-Off Round of 32 Notice */}
        <div className="p-6 rounded-3xl clay-card space-y-3 relative overflow-hidden border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Award className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full clay-badge text-[10px] font-mono font-bold text-blue-300">
              STAGE 05 • 28 OCT
            </span>
          </div>

          <h3 className="font-display text-base sm:text-lg font-bold text-white">
            Play-Off - Rounds of 32 Kick-off
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Debate clashes begin on stage in Asian Parliamentary format (3v3). Government and Opposition matchups, adjudicator panels, and round motions will be unveiled before the round.
          </p>

          <div className="pt-2 text-xs font-mono text-blue-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auditorium & CSE Seminar Rooms</span>
          </div>
        </div>
      </motion.div>

      {/* 3. Check Registered Squad Status & Voucher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl clay-panel p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              TEAM VERIFICATION LOOKUP
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Already Registered? Check Your Squad Status
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {teams.length} Squads in Record
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Team Name, Team ID (e.g. TD4-TEAM-01), Debater Name, or Student ID..."
            className="w-full bg-[#071533] border border-cyan-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans transition-all"
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim().length > 0 && (
          <div className="space-y-3 pt-2">
            {searchedTeams.length === 0 ? (
              <div className="p-6 rounded-2xl clay-card text-center text-slate-400 text-xs sm:text-sm">
                No registered squad found matching <span className="text-white font-mono">"{searchQuery}"</span>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchedTeams.map((team) => (
                  <div 
                    key={team.id}
                    className="p-4 rounded-2xl clay-card space-y-2.5 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30">
                        {team.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                        team.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : team.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {team.status || 'PENDING'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-bold text-white truncate">
                        {team.name}
                      </h4>
                      <div className="text-[11px] font-mono text-slate-400">
                        {team.batch} • {team.department || 'CSE Dept'}
                      </div>
                    </div>

                    {Array.isArray(team.members) && team.members.length > 0 && (
                      <div className="pt-1.5 border-t border-cyan-500/15 space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400/80 block uppercase">
                          Debater Roster:
                        </span>
                        <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
                          {team.members.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#0a1b42] border border-cyan-500/20">
                              {m.fullName} ({m.studentId})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </motion.div>

    </div>
  );
};
