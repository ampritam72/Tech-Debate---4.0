import React, { useState } from 'react';
import { Trophy, Medal, Star, Award, Crown } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { GlassCard } from '../components/common/GlassCard';
import { useTournament } from '../context/TournamentContext';

export const HallOfFamePage: React.FC = () => {
  const { hallOfFame } = useTournament();
  const [selectedEdition, setSelectedEdition] = useState<'1.0' | '2.0' | '3.0' | '4.0'>('4.0');

  const editionData = hallOfFame.find(h => h.edition === selectedEdition) || hallOfFame[3];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="DIGITAL HERITAGE"
        title="Hall of Fame & Championship Dynasty"
        subtitle="Preserving the permanent legacy of Tech Debate across every edition. Celebrating champion squads, best tournament debaters, and the organizers who built the institution."
        centered
      />

      {/* Edition Selector Tabs */}
      <div className="flex items-center justify-center mb-12 overflow-x-auto scrollbar-none py-1">
        <div className="inline-flex items-center p-1.5 bg-white/95 dark:bg-[#0c2248]/80 rounded-2xl border border-sky-200/90 dark:border-sky-400/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,165,233,0.08)] flex-nowrap whitespace-nowrap">
          {(['1.0', '2.0', '3.0', '4.0'] as const).map(ed => {
            const isSelected = selectedEdition === ed;
            const year = ed === '1.0' ? '2023' : ed === '2.0' ? '2024' : ed === '3.0' ? '2025' : '2026';
            return (
              <button
                key={ed}
                onClick={() => setSelectedEdition(ed)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(14,165,233,0.35)]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-white/5'
                }`}
              >
                <span>Tech Debate {ed}</span>
                <span className="ml-1.5 opacity-70">({year})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edition Banner Header */}
      <div className="mb-10 text-center space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
          EDITION {editionData.edition} · {editionData.year}
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          "{editionData.theme}"
        </h3>
        {editionData.status === 'IN_PROGRESS' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-xs border border-amber-300 dark:border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            2026 Live Tournament in Progress
          </span>
        )}
      </div>

      {/* Main Podium: Champion & Runner-up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Champion Podium */}
        <GlassCard glow className="p-8 border-amber-400 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-[#13264f] dark:via-[#0e1d3e] dark:to-[#081530] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-amber-700 dark:text-amber-300 uppercase tracking-widest font-bold block">
                  CHAMPION SQUAD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {editionData.champion.batch}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40">
              Gold Tier
            </span>
          </div>

          <h4 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white my-3">
            {editionData.champion.teamName}
          </h4>

          <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block font-semibold">
              Championship Debater Lineup
            </span>
            {editionData.champion.members.map((member, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="font-medium">{member}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Runner-up Podium */}
        <GlassCard className="p-8 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#102246] dark:via-[#0d1a38] dark:to-[#081530] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Medal className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest font-bold block">
                  RUNNER-UP SQUAD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {editionData.runnerUp.batch}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
              Silver Tier
            </span>
          </div>

          <h4 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white my-3">
            {editionData.runnerUp.teamName}
          </h4>

          <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block font-semibold">
              Runner-Up Debater Lineup
            </span>
            {editionData.runnerUp.members.map((member, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-300">
                <Medal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{member}</span>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* Individual Laureates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        
        {/* Best Tournament Debater */}
        <GlassCard className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold block">
              BEST TOURNAMENT DEBATER
            </span>
            <h5 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {editionData.bestTournamentDebater.name}
            </h5>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {editionData.bestTournamentDebater.batch} {editionData.bestTournamentDebater.studentId && `· ID: ${editionData.bestTournamentDebater.studentId}`}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              {editionData.bestTournamentDebater.achievement}
            </p>
          </div>
        </GlassCard>

        {/* Final Match Best Debater */}
        <GlassCard className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold block">
              FINAL MATCH BEST DEBATER
            </span>
            <h5 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {editionData.finalMatchBestDebater.name}
            </h5>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {editionData.finalMatchBestDebater.batch} {editionData.finalMatchBestDebater.studentId && `· ID: ${editionData.finalMatchBestDebater.studentId}`}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              Honored for forensic dominance and decisive reply speeches during the Grand Final.
            </p>
          </div>
        </GlassCard>

      </div>

      {/* Committee Archive for this Edition */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Organizing Committee Archive · Tech Debate {editionData.edition}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            The visionary faculty and student leads who conducted tournament operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {editionData.committee.map((member, i) => (
            <GlassCard key={i} className="p-5">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {member.name}
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 font-semibold">
                {member.position}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                {member.batch}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};
