import React, { useState } from 'react';
import { Trophy, Medal, Star, Award, Crown, Sparkles, Upload, Image as ImageIcon, Trash2, Shield } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { GlassCard } from '../components/common/GlassCard';
import { useTournament } from '../context/TournamentContext';
import { CommitteeMemberCard } from './CommitteePage';
import {
  LEADERSHIP_CARDS,
  SORTED_STUDENT_MEMBERS,
  CommitteeMemberData,
} from '../data/committeeMembers';

// Client-side image compressor so uploaded prize photos persist smoothly in Cloud Firestore & localStorage
async function compressImageFile(file: File, maxWidth = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(e.target?.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(e.target?.result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const HallOfFamePage: React.FC = () => {
  const { hallOfFame, updateHallOfFame4 } = useTournament();
  const [selectedEdition, setSelectedEdition] = useState<'1.0' | '2.0' | '3.0' | '4.0'>('4.0');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const editionData = hallOfFame.find(h => h.edition === selectedEdition) || hallOfFame[3];

  const emergingTeamData = editionData.emergingTeam || {
    teamName: 'Emerging Team TBD',
    batch: '2026 Season',
    members: ['Rising Debaters Award', 'Breakout Performance', 'VU Central Auditorium'],
    photoUrl: '',
  };

  const handlePrizePhotoUpload = async (
    target: 'champion' | 'runnerUp' | 'emergingTeam' | 'bestTournamentDebater',
    file?: File | null
  ) => {
    if (!file) return;
    setUploadingKey(target);
    try {
      const dataUrl = await compressImageFile(file);
      if (target === 'champion') {
        await updateHallOfFame4({
          champion: { ...editionData.champion, photoUrl: dataUrl },
        });
      } else if (target === 'runnerUp') {
        await updateHallOfFame4({
          runnerUp: { ...editionData.runnerUp, photoUrl: dataUrl },
        });
      } else if (target === 'emergingTeam') {
        await updateHallOfFame4({
          emergingTeam: { ...emergingTeamData, photoUrl: dataUrl },
        });
      } else if (target === 'bestTournamentDebater') {
        await updateHallOfFame4({
          bestTournamentDebater: { ...editionData.bestTournamentDebater, photoUrl: dataUrl },
        });
      }
    } catch (err) {
      console.error('Failed to upload prize photo:', err);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemovePrizePhoto = async (
    target: 'champion' | 'runnerUp' | 'emergingTeam' | 'bestTournamentDebater'
  ) => {
    if (target === 'champion') {
      await updateHallOfFame4({ champion: { ...editionData.champion, photoUrl: '' } });
    } else if (target === 'runnerUp') {
      await updateHallOfFame4({ runnerUp: { ...editionData.runnerUp, photoUrl: '' } });
    } else if (target === 'emergingTeam') {
      await updateHallOfFame4({ emergingTeam: { ...emergingTeamData, photoUrl: '' } });
    } else if (target === 'bestTournamentDebater') {
      await updateHallOfFame4({
        bestTournamentDebater: { ...editionData.bestTournamentDebater, photoUrl: '' },
      });
    }
  };

  // Match historical committee members to their full photo card data when available
  const allKnownCommitteeMembers = [...LEADERSHIP_CARDS, ...SORTED_STUDENT_MEMBERS];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="DIGITAL HERITAGE"
        title="Hall of Fame & Championship Dynasty"
        subtitle="Preserving the permanent legacy of Tech Debate across every edition. Celebrating champion squads, runners-up, emerging teams, best tournament debaters, and the organizers who built the institution."
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

      {selectedEdition === '4.0' ? (
        /* TECH DEBATE 4.0: 4 PRIZE GIVING CATEGORIES WITH PICTURE SHOWCASE & UPLOAD */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* 1. Champion Team */}
          <GlassCard glow className="p-6 sm:p-8 border-amber-400 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-[#13264f] dark:via-[#0e1d3e] dark:to-[#081530] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-amber-700 dark:text-amber-300 uppercase tracking-widest font-bold block">
                      CHAMPION TEAM
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

              {/* Picture Showcase & Upload Area */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#061128] border border-amber-400/30 mb-5 group">
                {editionData.champion.photoUrl ? (
                  <>
                    <img
                      src={editionData.champion.photoUrl}
                      alt={editionData.champion.teamName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <label className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === 'champion' ? 'Uploading...' : 'Change Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePrizePhotoUpload('champion', e.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePrizePhoto('champion')}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-dashed border-amber-400/50 flex items-center justify-center text-amber-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-amber-300 block uppercase tracking-wider">
                        Champion Team Picture
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Official Winner Photo Showcase
                      </span>
                    </div>
                    <label className="mt-1 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingKey === 'champion' ? 'Uploading...' : 'Upload Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePrizePhotoUpload('champion', e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                {editionData.champion.teamName}
              </h4>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block font-semibold">
                Champion Team Debaters
              </span>
              {editionData.champion.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="font-medium">{member}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 2. Runners Up Team */}
          <GlassCard className="p-6 sm:p-8 border-slate-200 dark:border-sky-500/30 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#102246] dark:via-[#0d1a38] dark:to-[#081530] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-sky-500/20 border border-slate-300 dark:border-sky-400/40 flex items-center justify-center text-slate-700 dark:text-sky-300">
                    <Medal className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-slate-700 dark:text-sky-300 uppercase tracking-widest font-bold block">
                      RUNNERS UP TEAM
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {editionData.runnerUp.batch}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-700 dark:text-sky-300 px-2.5 py-1 rounded bg-slate-100 dark:bg-sky-950/60 border border-slate-300 dark:border-sky-500/30 font-bold">
                  Silver Tier
                </span>
              </div>

              {/* Picture Showcase & Upload Area */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#061128] border border-sky-400/30 mb-5 group">
                {editionData.runnerUp.photoUrl ? (
                  <>
                    <img
                      src={editionData.runnerUp.photoUrl}
                      alt={editionData.runnerUp.teamName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <label className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === 'runnerUp' ? 'Uploading...' : 'Change Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePrizePhotoUpload('runnerUp', e.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePrizePhoto('runnerUp')}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-sky-500/15 border border-dashed border-sky-400/50 flex items-center justify-center text-sky-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-sky-300 block uppercase tracking-wider">
                        Runners Up Team Picture
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Official Runners Up Photo Showcase
                      </span>
                    </div>
                    <label className="mt-1 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingKey === 'runnerUp' ? 'Uploading...' : 'Upload Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePrizePhotoUpload('runnerUp', e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                {editionData.runnerUp.teamName}
              </h4>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block font-semibold">
                Runners Up Debater Lineup
              </span>
              {editionData.runnerUp.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-300">
                  <Medal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-medium">{member}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 3. Emerging Team */}
          <GlassCard className="p-6 sm:p-8 border-emerald-300 dark:border-emerald-500/35 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-[#0d2638] dark:via-[#0b1d34] dark:to-[#081530] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-widest font-bold block">
                      EMERGING TEAM
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {emergingTeamData.batch}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40">
                  Rising Star
                </span>
              </div>

              {/* Picture Showcase & Upload Area */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#061128] border border-emerald-400/30 mb-5 group">
                {emergingTeamData.photoUrl ? (
                  <>
                    <img
                      src={emergingTeamData.photoUrl}
                      alt={emergingTeamData.teamName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <label className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === 'emergingTeam' ? 'Uploading...' : 'Change Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePrizePhotoUpload('emergingTeam', e.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePrizePhoto('emergingTeam')}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-dashed border-emerald-400/50 flex items-center justify-center text-emerald-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-emerald-300 block uppercase tracking-wider">
                        Emerging Team Picture
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Official Emerging Squad Photo Showcase
                      </span>
                    </div>
                    <label className="mt-1 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingKey === 'emergingTeam' ? 'Uploading...' : 'Upload Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePrizePhotoUpload('emergingTeam', e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                {emergingTeamData.teamName}
              </h4>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block font-semibold">
                Emerging Team Debaters
              </span>
              {emergingTeamData.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">{member}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 4. Best Tournament Debater */}
          <GlassCard className="p-6 sm:p-8 border-cyan-300 dark:border-cyan-500/35 bg-gradient-to-br from-cyan-50/70 via-white to-cyan-50/30 dark:from-[#0c2448] dark:via-[#0a1c3a] dark:to-[#081530] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-cyan-700 dark:text-cyan-300 uppercase tracking-widest font-bold block">
                      BEST TOURNAMENT DEBATER
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {editionData.bestTournamentDebater.batch}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-cyan-800 dark:text-cyan-300 font-bold px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40">
                  MVP Debater
                </span>
              </div>

              {/* Picture Showcase & Upload Area */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#061128] border border-cyan-400/30 mb-5 group">
                {editionData.bestTournamentDebater.photoUrl ? (
                  <>
                    <img
                      src={editionData.bestTournamentDebater.photoUrl}
                      alt={editionData.bestTournamentDebater.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <label className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === 'bestTournamentDebater' ? 'Uploading...' : 'Change Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePrizePhotoUpload('bestTournamentDebater', e.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePrizePhoto('bestTournamentDebater')}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-dashed border-cyan-400/50 flex items-center justify-center text-cyan-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-cyan-300 block uppercase tracking-wider">
                        Best Debater Picture
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Official Best Tournament Debater Photo
                      </span>
                    </div>
                    <label className="mt-1 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingKey === 'bestTournamentDebater' ? 'Uploading...' : 'Upload Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePrizePhotoUpload('bestTournamentDebater', e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                {editionData.bestTournamentDebater.name}
              </h4>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                {editionData.bestTournamentDebater.batch}{' '}
                {editionData.bestTournamentDebater.studentId && `· ID: ${editionData.bestTournamentDebater.studentId}`}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {editionData.bestTournamentDebater.achievement}
              </p>
            </div>
          </GlassCard>

        </div>
      ) : (
        <>
          {/* Historical Editions (1.0, 2.0, 3.0): Main Podium: Champion & Runner-up */}
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
        </>
      )}

      {/* Committee Archive for this Edition (With Full Photo Cards like Committee Page) */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h4 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Organizing Committee Archive · Tech Debate {editionData.edition}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            The visionary faculty advisors, convenors, and executive committee members who conducted tournament operations.
          </p>
        </div>

        {selectedEdition === '4.0' ? (
          <div className="space-y-12">
            {/* Section 1: Executive Leadership & Advisory Board */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-5 w-1 rounded-full bg-cyan-400" />
                <h5 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Executive Leadership & Advisory Board
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {LEADERSHIP_CARDS.map((member) => (
                  <CommitteeMemberCard
                    key={member.id}
                    member={member}
                    isTopReserved={true}
                  />
                ))}
              </div>
            </div>

            {/* Section 2: Organizing Committee Members */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-5 w-1 rounded-full bg-sky-500" />
                <h5 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Organizing Committee Members
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {SORTED_STUDENT_MEMBERS.map((member) => (
                  <CommitteeMemberCard
                    key={member.id}
                    member={member}
                    isTopReserved={false}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editionData.committee.map((member, i) => {
              const matched = allKnownCommitteeMembers.find(
                (m) => m.name.toLowerCase() === member.name.toLowerCase()
              );
              const cardMember: CommitteeMemberData = matched
                ? {
                    ...matched,
                    position: member.position || matched.position,
                    semester: member.batch || matched.semester,
                  }
                : {
                    id: `hof-${editionData.edition}-${i}`,
                    name: member.name,
                    studentId: '',
                    semester: member.batch,
                    semesterNumber: 8,
                    contactNumber: '',
                    photoUrl: member.photoUrl || '',
                    photoCandidates: member.photoUrl ? [member.photoUrl] : [],
                    position: member.position,
                  };
              return (
                <CommitteeMemberCard
                  key={cardMember.id}
                  member={cardMember}
                  isTopReserved={i < 4}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

