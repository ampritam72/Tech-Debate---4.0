import React, { useState } from 'react';
import { ArrowRight, X, Lock } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 shrink-0">
            <Lock className="w-2.5 h-2.5 text-rose-400" />
            REGISTRATION CLOSED
          </span>

          <p className="truncate text-[11px] sm:text-xs text-slate-300 font-normal">
            <span className="font-bold text-white">Tech Debate 4.0</span>
            <span className="text-cyan-500/60 mx-1.5 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Registration completed</span>
            <span className="hidden lg:inline text-slate-300"> — Kit distribution starts <strong className="text-cyan-300 font-semibold">27 October</strong></span>
          </p>
        </div>

        {/* Right CTA and Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold font-mono text-[10px] sm:text-[11px] transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Lock className="w-3 h-3 text-rose-300" />
            <span>Reg Closed</span>
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
