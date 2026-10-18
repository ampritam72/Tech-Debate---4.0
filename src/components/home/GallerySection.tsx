import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Users, Trophy, Sparkles, MessageSquare, Video } from 'lucide-react';

interface GallerySectionProps {
  onViewMoreClick: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onViewMoreClick }) => {
  const photos = [
    {
      title: 'Opening Remarks',
      category: 'Stage',
      icon: Mic,
      gradient: 'from-[#061b47] to-[#040e2b]'
    },
    {
      title: 'Main Stage Ceremony',
      category: 'Auditorium',
      icon: Users,
      gradient: 'from-[#08235e] to-[#051336]'
    },
    {
      title: 'Trophy Showcase',
      category: 'Honors',
      icon: Trophy,
      gradient: 'from-[#0a296e] to-[#061842]'
    },
    {
      title: 'Keynote Speech',
      category: 'Oratory',
      icon: Sparkles,
      gradient: 'from-[#082057] to-[#04102e]'
    },
    {
      title: 'Intense Debate Session',
      category: 'Match',
      icon: MessageSquare,
      gradient: 'from-[#061842] to-[#030c24]'
    },
    {
      title: 'Arena Atmosphere',
      category: 'Ambiance',
      icon: Video,
      gradient: 'from-[#092566] to-[#05143a]'
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-sky-600 dark:text-cyan-400 block mb-1">
            GALLERY
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Moments That Matter
          </h2>
        </div>

        <button
          onClick={onViewMoreClick}
          className="clay-btn-secondary min-h-[44px] px-5 py-3 text-xs sm:text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto cursor-pointer touch-manipulation active:scale-[0.98]"
        >
          <span>View More Photos</span>
          <ArrowRight className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* 6 Photo Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {photos.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl clay-card p-3 transition-all flex flex-col justify-between group overflow-hidden cursor-pointer select-none"
              onClick={onViewMoreClick}
            >
              {/* Graphical Frame */}
              <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${item.gradient} border border-cyan-400/35 flex flex-col items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform shadow-inner`}>
                <div className="w-9 h-9 rounded-full clay-tab flex items-center justify-center text-cyan-200 mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <div className="pt-2.5">
                <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
