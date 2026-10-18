import React, { useState, useMemo } from 'react';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { LEADERSHIP_CARDS, CommitteeMemberData } from '../../data/committeeMembers';
import { SpotlightCard, StaggerContainer, StaggerItem } from '../motion';

interface CommitteeSectionProps {
  onViewAllClick: () => void;
}

interface HomeMemberCardProps {
  member: CommitteeMemberData;
  onClick: () => void;
}

const HomeMemberCard: React.FC<HomeMemberCardProps> = ({ member, onClick }) => {
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Build candidate image urls
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (member.photoCandidates && member.photoCandidates.length > 0) {
      list.push(...member.photoCandidates);
    }
    if (member.photoUrl && !list.includes(member.photoUrl)) {
      list.push(member.photoUrl);
    }
    return list;
  }, [member]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=003882&color=00d2ff&size=512`;
  const currentPhotoSrc = !hasError && candidates[candidateIdx] ? candidates[candidateIdx] : fallbackAvatar;

  const handleImageError = () => {
    if (candidateIdx + 1 < candidates.length) {
      setCandidateIdx((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <SpotlightCard
      className="p-4 sm:p-5 flex flex-col items-center text-center group cursor-pointer select-none h-full border border-sky-400/25 hover:border-cyan-400/60 bg-gradient-to-b from-[#0e2a56]/85 to-[#081838]/95 dark:from-[#0c234a]/90 dark:to-[#06142c]/95 shadow-[0_8px_30px_rgba(6,182,212,0.12)] hover:shadow-[0_16px_45px_rgba(6,182,212,0.22)] transition-all duration-300 rounded-2xl"
      onClick={onClick}
    >
      {/* Top Hairline Neon Glow */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

      {/* Cyber Corner Accents */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400/40 pointer-events-none group-hover:border-cyan-300 transition-colors" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/40 pointer-events-none group-hover:border-cyan-300 transition-colors" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400/40 pointer-events-none group-hover:border-cyan-300 transition-colors" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400/40 pointer-events-none group-hover:border-cyan-300 transition-colors" />

      {/* Portrait Frame with Real Photo */}
      <div className="w-full aspect-[4/5] rounded-xl bg-[#06152d] border border-cyan-400/30 relative overflow-hidden mb-4 group-hover:border-cyan-300/80 transition-all duration-300 shadow-inner">
        <img
          src={currentPhotoSrc}
          alt={member.name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Batch / Role pill on photo */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/85 border border-cyan-400/40 text-[10px] sm:text-[11px] font-mono font-bold text-cyan-200 backdrop-blur-md shadow-sm">
            {member.semester}
          </span>
        </div>
      </div>

      {/* Designation / Role Badge */}
      <div className="w-full mb-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-[11px] sm:text-xs font-mono font-bold text-cyan-200 uppercase tracking-wider shadow-sm truncate max-w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {member.position || 'Coordinator'}
        </span>
      </div>

      {/* Member Name */}
      <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-cyan-200 transition-colors tracking-tight line-clamp-2">
        {member.name}
      </h3>
    </SpotlightCard>
  );
};

export const CommitteeSection: React.FC<CommitteeSectionProps> = ({ onViewAllClick }) => {
  // 1st 4 leadership members: Arnab Sir, Nuhan Sir, Pritam, Farhan
  const leadershipMembers = LEADERSHIP_CARDS.slice(0, 4);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-sky-600 dark:text-cyan-400 block mb-1">
            COMMITTEE
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The People Behind Tech Debate 4.0
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans">
            Driven by passion. Built by a dedicated team.
          </p>
        </div>

        {/* View All Button */}
        <button
          onClick={onViewAllClick}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-400/40 hover:border-cyan-300 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] group"
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>View All Committee</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Portrait Cards Grid: Arnab Sir, Nuhan Sir, Pritam, Farhan */}
      <StaggerContainer
        staggerChildren={0.08}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {leadershipMembers.map((member) => (
          <StaggerItem key={member.id} preset="slideUp">
            <HomeMemberCard
              member={member}
              onClick={onViewAllClick}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};
