import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[38px] px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer touch-manipulation active:scale-[0.98] ${
              isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-sky-500/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,210,255,0.25)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
