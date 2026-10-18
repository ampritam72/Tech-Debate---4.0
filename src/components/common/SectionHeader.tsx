import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  centered = false,
  className = ''
}) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 mb-3.5 px-3.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-400/40 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.15)] ${centered ? 'mx-auto' : ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{badge}</span>
        </div>
      )}
      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance leading-[1.2]">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl text-balance leading-relaxed ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
