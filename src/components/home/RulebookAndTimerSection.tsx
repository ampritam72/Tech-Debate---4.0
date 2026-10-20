import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Download, FileText, Play, ShieldCheck } from 'lucide-react';

interface RulebookAndTimerSectionProps {
  onOpenTimerPage: () => void;
}

export const RulebookAndTimerSection: React.FC<RulebookAndTimerSectionProps> = ({
  onOpenTimerPage,
}) => {
  const handleTimerCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenTimerPage();
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative rounded-3xl clay-panel p-6 sm:p-8 lg:p-10 overflow-hidden"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block">
              OFFICIAL RESOURCES & ADJUDICATION STAGE TOOLS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Official Rulebook & Stage Debate Timer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
              Download the official Parliamentary Debate Rules & Adjudication Guidelines or the Tournament Code of Conduct (PDF), or click the Stage Timer & Bell card on the right to launch the full-screen automated stage debate timer.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-3">
              {/* 1. Parliamentary Debate Rules & Adjudication Guidelines Download Button */}
              <a
                href="/api/rulebook/download?type=parliamentary"
                download="Tech-Debate-4.0-Parliamentary-Debate-Rules-Adjudication-Guidelines.pdf"
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Parliamentary Debate Rules & Adjudication Guidelines</span>
                <Download className="w-4 h-4 shrink-0 opacity-90" />
              </a>

              {/* 2. Code of Conduct (Tournament Rules) Download Button */}
              <a
                href="/api/rulebook/download?type=conduct"
                download="Tech-Debate-4.0-Code-of-Conduct-Tournament-Rules.pdf"
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/15 hover:shadow-cyan-400/30 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Code of Conduct</span>
                <Download className="w-4 h-4 text-cyan-300 shrink-0" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* 3. Interactive Stage Debate Timer & Bell Picture Card Button */}
            <div
              role="button"
              tabIndex={0}
              onClick={onOpenTimerPage}
              onKeyDown={handleTimerCardKeyDown}
              aria-label="Open Stage Debate Timer"
              className="group p-4 sm:p-5 rounded-2xl clay-card text-center space-y-3.5 max-w-md w-full select-none cursor-pointer border border-cyan-400/30 hover:border-cyan-300/80 shadow-lg hover:shadow-[0_0_28px_rgba(56,189,248,0.28)] hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {/* Timer + Bell Stage Picture Banner */}
              <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-inner">
                <img
                  src="/images/stage_timer_bell.svg"
                  alt="Stage Debate Countdown Timer and Adjudication Bell"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Top-right Live Bell & Timer Tag */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-md">
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>TIMER + AUTO BELL</span>
                </div>
                {/* Bottom Interactive Launch Overlay Bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    CLICK TO LAUNCH STAGE TIMER
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-cyan-500 group-hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </span>
                </div>
              </div>

              <div className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-300 transition-colors flex items-center justify-center gap-2">
                <span>Open Stage Debate Timer</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full-screen laptop timer automatically rings 1st Bell (1:00), Warning Bell (3:00 / 2:00), Final Double Bell (4:00 / 3:00), and Overtime Bell.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

