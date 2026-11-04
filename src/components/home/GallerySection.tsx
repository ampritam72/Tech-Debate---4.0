import React, { useState, useCallback } from 'react';
import {
  ArrowRight,
  Image as ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import {
  GalleryLightboxModal,
  GALLERY_CATEGORY_LABELS,
} from '../common/GalleryLightboxModal';
import { useTournament } from '../../context/TournamentContext';
import { GalleryPhoto } from '../../types';

interface GallerySectionProps {
  onViewMoreClick: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onViewMoreClick }) => {
  const { gallery } = useTournament();
  const [cardSlideIndex, setCardSlideIndex] = useState<Record<string, number>>({});
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});
  const [activeLightbox, setActiveLightbox] = useState<{
    photo: GalleryPhoto;
    index: number;
  } | null>(null);

  // Select the 4 featured gallery cards matching the 4 requested categories:
  // 1. Workshop, 2. Kit Distribution, 3. Debate Sessions, 4. Judges & Adjudication
  const targetCategories: Array<GalleryPhoto['category']> = [
    'WORKSHOP',
    'KIT_DISTRIBUTION',
    'DEBATE_SESSIONS',
    'JUDGES',
  ];

  const displayPhotos: GalleryPhoto[] = targetCategories.map((cat) => {
    const found = gallery.find((item) => item.category === cat);
    if (found) return found;
    return {
      id: `g-${cat.toLowerCase()}`,
      title: GALLERY_CATEGORY_LABELS[cat] || cat,
      category: cat,
      imageUrl: '',
      images: [],
      caption: `Official event photography for ${GALLERY_CATEGORY_LABELS[cat] || cat}.`,
      date: 'October 2026',
    };
  });

  const getValidImagesForSegment = useCallback(
    (item: GalleryPhoto): string[] => {
      const raw =
        Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : item.imageUrl
          ? [item.imageUrl]
          : [];
      return raw.filter(
        (u) =>
          typeof u === 'string' &&
          u.trim().length > 0 &&
          !u.includes('images.unsplash.com') &&
          !brokenUrls[u]
      );
    },
    [brokenUrls]
  );

  const markUrlBroken = (url: string) => {
    setBrokenUrls((prev) => ({ ...prev, [url]: true }));
  };

  const handleCardPrev = (e: React.MouseEvent, item: GalleryPhoto, total: number) => {
    e.stopPropagation();
    if (total <= 1) return;
    setCardSlideIndex((prev) => {
      const curr = prev[item.id] || 0;
      return { ...prev, [item.id]: (curr - 1 + total) % total };
    });
  };

  const handleCardNext = (e: React.MouseEvent, item: GalleryPhoto, total: number) => {
    e.stopPropagation();
    if (total <= 1) return;
    setCardSlideIndex((prev) => {
      const curr = prev[item.id] || 0;
      return { ...prev, [item.id]: (curr + 1) % total };
    });
  };

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

      {/* 4 Featured Gallery Photo Cards Grid - All Clickable to Open Popup Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayPhotos.map((photo) => {
          const validImages = getValidImagesForSegment(photo);
          const totalImages = validImages.length;
          const currentIdx =
            totalImages > 0 ? (cardSlideIndex[photo.id] || 0) % totalImages : 0;
          const currentImageUrl = totalImages > 0 ? validImages[currentIdx] : '';
          const categoryLabel =
            GALLERY_CATEGORY_LABELS[photo.category] || photo.category.replace('_', ' ');

          return (
            <GlassCard
              key={photo.id}
              onClick={() => setActiveLightbox({ photo, index: currentIdx })}
              className="group overflow-hidden hover:border-cyan-400/70 transition-all flex flex-col justify-between cursor-pointer"
            >
              {/* Image Banner Container */}
              <div className="relative aspect-[4/3] bg-[#081836] overflow-hidden">
                {totalImages > 0 && currentImageUrl ? (
                  <>
                    <img
                      src={currentImageUrl}
                      alt={`${photo.title} (${currentIdx + 1}/${totalImages})`}
                      referrerPolicy="no-referrer"
                      onError={() => markUrlBroken(currentImageUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Badge on Banner */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 backdrop-blur-md z-10">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Counter Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-[#051026]/85 border border-sky-400/30 backdrop-blur-md z-10">
                      <span className="text-[10px] font-mono font-bold text-white">
                        {currentIdx + 1} / {totalImages}
                      </span>
                    </div>

                    {/* Left & Right Arrow Controls for Scrolling Pictures */}
                    {totalImages > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleCardPrev(e, photo, totalImages)}
                          aria-label="Previous picture"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/50 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCardNext(e, photo, totalImages)}
                          aria-label="Next picture"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/50 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                      <span className="text-xs text-cyan-300 font-mono flex items-center gap-1.5 font-bold">
                        <Maximize2 className="w-3.5 h-3.5" /> Open Album Slider
                      </span>
                    </div>
                  </>
                ) : (
                  /* UPLOAD SOON BANNER (also opens multi-slide album popup on click!) */
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#0b1d42] via-[#07132c] to-[#040a18] flex flex-col items-center justify-center p-5 text-center border-b border-sky-500/20 select-none">
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 backdrop-blur-md">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-cyan-300" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-extrabold uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      UPLOAD SOON
                    </span>

                    <p className="text-[10px] font-mono text-slate-300 mt-2 leading-relaxed">
                      Official pictures will be uploaded soon.
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 opacity-80 group-hover:opacity-100">
                      <Maximize2 className="w-3 h-3" />
                      Click to View Album
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Card Info */}
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                      {categoryLabel}
                    </span>
                    <span>{photo.date}</span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Multi-Photo Popup Slider Modal */}
      {activeLightbox && (
        <GalleryLightboxModal
          photo={activeLightbox.photo}
          initialIndex={activeLightbox.index}
          validImages={getValidImagesForSegment(activeLightbox.photo)}
          onMarkUrlBroken={markUrlBroken}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </section>
  );
};
