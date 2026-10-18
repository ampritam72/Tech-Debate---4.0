import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface ChampionshipTopTickerProps {
  onRegisterClick: () => void;
  onViewSchedule: () => void;
}

export const ChampionshipTopTicker: React.FC<ChampionshipTopTickerProps> = ({
  onRegisterClick,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-[#030712] via-[#071738] to-[#030712] text-slate-200 border-b border-cyan-500/30 text-xs py-2 px-3 sm:px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Status Badge & Announcement */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            REGISTRATION OPEN
          </span>

          <p className="truncate text-[11px] sm:text-xs text-slate-300 font-normal">
            <span className="font-bold text-white">Tech Debate 4.0</span>
            <span className="text-cyan-500/60 mx-1.5 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Department of CSE, Varendra University</span>
            <span className="hidden lg:inline text-slate-300"> — Grand Prize <strong className="text-amber-300 font-semibold">BDT 25,000</strong></span>
          </p>
        </div>

        {/* Right CTA and Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 font-bold font-mono text-[10px] sm:text-[11px] transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.35)] whitespace-nowrap"
          >
            <span>Register</span>
            <ArrowRight className="w-3 h-3 text-slate-950" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss banner"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
