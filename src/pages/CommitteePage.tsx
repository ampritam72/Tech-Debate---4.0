import React, { useState, useMemo } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { 
  LEADERSHIP_CARDS, 
  SORTED_STUDENT_MEMBERS, 
  CommitteeMemberData 
} from '../data/committeeMembers';
import { UserCheck, Shield } from 'lucide-react';

interface CommitteeMemberCardProps {
  member: CommitteeMemberData;
  isTopReserved?: boolean;
}

const CommitteeMemberCard: React.FC<CommitteeMemberCardProps> = ({ member, isTopReserved }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Combine photoCandidates with photoUrl
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

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0a1c3c&color=38bdf8&size=512`;
  const photoSrc = (!imgError && candidates[candidateIndex]) ? candidates[candidateIndex] : avatarFallback;

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // If it's a reserved placeholder card
  if (member.isPlaceholder) {
    return (
      <div
        className="
          relative rounded-2xl border border-dashed border-sky-400/35 
          bg-[#0c2246]/65 p-4 sm:p-5 backdrop-blur-xl 
          flex flex-col items-center justify-between
          transition-all duration-300 group
          hover:border-sky-400/60 hover:bg-[#0f2852]/80
          shadow-[0_8px_30px_rgba(3,14,38,0.4)]
        "
      >
        {/* Top Glow Hairline */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
        
        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-sky-500/40 pointer-events-none group-hover:border-sky-400" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-sky-500/40 pointer-events-none group-hover:border-sky-400" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-sky-500/40 pointer-events-none group-hover:border-sky-400" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-sky-500/40 pointer-events-none group-hover:border-sky-400" />

        {/* Reserved Picture Frame */}
        <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#071732]/85 border border-sky-400/25 mb-4 flex flex-col items-center justify-center text-center p-4 group-hover:border-sky-400/50 transition-colors">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed border-sky-400/40 flex items-center justify-center text-sky-300/60 mb-3 bg-[#0a1f42]/80 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-sky-300/60" />
          </div>
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-sky-300 uppercase">
            RESERVED SEAT
          </span>
          <span className="text-[10px] text-slate-300 mt-1 font-sans">
            Official Announcement Soon
          </span>
        </div>

        {/* Designation */}
        <div className="w-full mb-2">
          <span className="inline-block w-full text-center px-3 py-1.5 rounded-full bg-[#081836]/90 border border-sky-400/30 text-[11px] sm:text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
            {member.position || 'Executive Board'}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-display text-base sm:text-lg font-bold text-slate-300/80 text-center tracking-tight">
          —
        </h3>
      </div>
    );
  }

  // Active Leadership & Student Member Card
  return (
    <div
      className={`
        relative rounded-2xl border backdrop-blur-xl transition-all duration-300 
        flex flex-col group cyber-card-glow p-4 sm:p-5
        ${isTopReserved 
          ? 'border-cyan-400/40 dark:border-cyan-400/40 bg-gradient-to-b from-[#0e2a56]/90 to-[#091a38]/95 shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:border-cyan-300 hover:shadow-[0_16px_45px_rgba(6,182,212,0.25)] hover:-translate-y-1.5' 
          : 'border-sky-200/90 hover:border-sky-400/80 dark:border-sky-400/25 dark:hover:border-sky-400/60 bg-white/95 hover:bg-white dark:bg-[#0c2248]/80 dark:hover:bg-[#0f2a58]/90 shadow-[0_8px_30px_rgba(14,165,233,0.08)] hover:shadow-[0_16px_45px_-8px_rgba(14,165,233,0.18)] hover:-translate-y-1.5'}
      `}
    >
      {/* Top Hairline Glow */}
      <div className={`absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent ${isTopReserved ? 'via-cyan-300' : 'via-sky-400/50'} to-transparent pointer-events-none`} />

      {/* Corner Accents */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-sky-300 dark:border-sky-500/40 pointer-events-none group-hover:border-cyan-400 transition-colors" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-sky-300 dark:border-sky-500/40 pointer-events-none group-hover:border-cyan-400 transition-colors" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-sky-300 dark:border-sky-500/40 pointer-events-none group-hover:border-cyan-400 transition-colors" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-sky-300 dark:border-sky-500/40 pointer-events-none group-hover:border-cyan-400 transition-colors" />

      {/* 1. Portrait Frame (4:5 with cyber neon border) */}
      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-900/90 dark:bg-[#071630]/90 border border-sky-200 dark:border-sky-400/25 group-hover:border-cyan-400/80 mb-4 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
        <img
          src={photoSrc}
          alt={member.name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />
        {/* Scrim overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
        
        {/* Tag indicator overlay */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-md border text-[10px] sm:text-[11px] font-mono font-bold backdrop-blur-md shadow-sm ${
            isTopReserved 
              ? 'bg-cyan-950/90 border-cyan-400/50 text-cyan-200' 
              : 'bg-white/95 dark:bg-[#081834]/95 border-sky-200 dark:border-sky-400/35 text-sky-700 dark:text-sky-300'
          }`}>
            {member.semester}
          </span>
        </div>
      </div>

      {/* 2. Designation Badge */}
      <div className="mb-2 max-w-full">
        <span className={`inline-block max-w-full truncate px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-sm ${
          isTopReserved
            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
            : 'bg-sky-50 dark:bg-slate-950/90 text-sky-700 dark:text-cyan-300 border border-sky-200 dark:border-slate-700/80'
        }`}>
          {member.position || 'Executive Member'}
        </span>
      </div>

      {/* 3. Name */}
      <h3 className={`font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight line-clamp-2 transition-colors ${
        isTopReserved
          ? 'text-white group-hover:text-cyan-200'
          : 'text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-200'
      }`}>
        {member.name}
      </h3>
    </div>
  );
};

export const CommitteePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="ORGANIZING BODY"
        title="Tech Debate 4.0 Organizing Committee"
        subtitle="The dedicated assembly of advisors, student convenors, and executive coordinators powering the 2026 championship."
        centered
      />

      {/* Section 1: Executive Leadership & Advisory Board */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-1 rounded-full bg-cyan-400" />
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Executive Leadership & Advisory Board
          </h2>
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

      {/* Section 2: Student Committee Members */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-1 rounded-full bg-sky-500" />
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Organizing Committee Members
          </h2>
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
  );
};

export default CommitteePage;
