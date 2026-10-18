import React, { useState } from 'react';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { GlassCard } from '../components/common/GlassCard';
import { useTournament } from '../context/TournamentContext';
import { GalleryPhoto } from '../types';

export const GalleryPage: React.FC = () => {
  const { gallery } = useTournament();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Moments' },
    { id: 'OPENING', label: 'Opening Ceremony' },
    { id: 'DEBATE_SESSIONS', label: 'Debate Sessions' },
    { id: 'JUDGES', label: 'Judges & Adjudication' },
    { id: 'FINAL_EVENT', label: 'Final Event' },
    { id: 'AWARDS', label: 'Award Ceremony' },
  ];

  const filteredPhotos = selectedCategory === 'ALL'
    ? gallery
    : gallery.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="HISTORICAL ARCHIVE"
        title="Event Memories & Visual Retrospective"
        subtitle="Immerse yourself in moments of intense rebuttal, adjudication deliberations, auditorium stage triumphs, and academic brotherhood."
        centered
      />

      {/* Category Filter Tabs */}
      <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-2 mb-10 p-1.5 bg-white/95 dark:bg-[#0c2248]/80 rounded-2xl border border-sky-200/90 dark:border-sky-400/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,165,233,0.08)] overflow-x-auto scrollbar-none w-fit max-w-full mx-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(14,165,233,0.35)]'
                : 'text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry / Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map(photo => (
          <GlassCard
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="group overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            {/* Image container */}
            <div className="relative aspect-[4/3] bg-[#081836] overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                  if (fallback) fallback.style.display = 'flex';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Fallback container with styled SVG */}
              <div 
                style={{ display: 'none' }}
                className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#0c1938] via-[#091024] to-[#040714] items-center justify-center flex-col p-6 text-center border-b border-slate-800"
              >
                <ImageIcon className="w-10 h-10 text-cyan-400/60 mb-2" />
                <span className="font-display text-sm font-bold text-white line-clamp-1">{photo.title}</span>
                <span className="text-[11px] font-mono text-cyan-300 mt-1">{photo.category}</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs text-cyan-300 font-mono flex items-center gap-1.5 font-bold">
                  <Maximize2 className="w-3.5 h-3.5" /> Expand Photo
                </span>
              </div>
            </div>

            {/* Photo Card Info */}
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{photo.category.replace('_', ' ')}</span>
                <span>{photo.date}</span>
              </div>
              <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                {photo.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-[#050f20]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl bg-white dark:bg-[#0c2248] border border-slate-300 dark:border-sky-400/40 p-4 sm:p-6 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-[#102a56]/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-sky-400/30 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#071630] mb-4 border border-slate-200 dark:border-sky-500/25">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                <span>{activePhoto.category.replace('_', ' ')}</span>
                <span>·</span>
                <span>{activePhoto.date}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {activePhoto.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
