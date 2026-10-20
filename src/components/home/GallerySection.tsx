import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Image as ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useTournament } from '../../context/TournamentContext';
import { GalleryPhoto } from '../../types';

interface GallerySectionProps {
  onViewMoreClick: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  WORKSHOP: 'Workshop',
  KIT_DISTRIBUTION: 'Kit Distribution',
  DEBATE_SESSIONS: 'Debate Sessions',
  JUDGES: 'Judges & Adjudication',
  FINAL_EVENT: 'Final Event',
  AWARDS: 'Award Ceremony',
};

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
      title: CATEGORY_LABELS[cat] || cat,
      category: cat,
      imageUrl: '',
      images: [],
      caption: `Official event photography for ${CATEGORY_LABELS[cat] || cat}.`,
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

  const handleLightboxPrev = useCallback(() => {
    if (!activeLightbox) return;
    const validImgs = getValidImagesForSegment(activeLightbox.photo);
    if (validImgs.length <= 1) return;
    setActiveLightbox((prev) =>
      prev
        ? {
            ...prev,
            index: (prev.index - 1 + validImgs.length) % validImgs.length,
          }
        : null
    );
  }, [activeLightbox, getValidImagesForSegment]);

  const handleLightboxNext = useCallback(() => {
    if (!activeLightbox) return;
    const validImgs = getValidImagesForSegment(activeLightbox.photo);
    if (validImgs.length <= 1) return;
    setActiveLightbox((prev) =>
      prev
        ? {
            ...prev,
            index: (prev.index + 1) % validImgs.length,
          }
        : null
    );
  }, [activeLightbox, getValidImagesForSegment]);

  useEffect(() => {
    if (!activeLightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      else if (e.key === 'ArrowRight') handleLightboxNext();
      else if (e.key === 'Escape') setActiveLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLightbox, handleLightboxPrev, handleLightboxNext]);

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

      {/* 4 Larger Gallery Photo Cards Grid (matching Gallery Page banner & details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayPhotos.map((photo) => {
          const validImages = getValidImagesForSegment(photo);
          const totalImages = validImages.length;
          const currentIdx =
            totalImages > 0 ? (cardSlideIndex[photo.id] || 0) % totalImages : 0;
          const currentImageUrl = totalImages > 0 ? validImages[currentIdx] : '';
          const categoryLabel =
            CATEGORY_LABELS[photo.category] || photo.category.replace('_', ' ');

          return (
            <GlassCard
              key={photo.id}
              onClick={() => {
                if (totalImages > 0) {
                  setActiveLightbox({ photo, index: currentIdx });
                }
              }}
              className={`group overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col justify-between ${
                totalImages > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
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

                    {/* Category Pill Badge on Banner */}
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
                        <Maximize2 className="w-3.5 h-3.5" /> Expand Photo
                      </span>
                    </div>
                  </>
                ) : (
                  /* UPLOAD SOON BANNER */
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#0b1d42] via-[#07132c] to-[#040a18] flex flex-col items-center justify-center p-5 text-center border-b border-sky-500/20 select-none">
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 backdrop-blur-md">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <ImageIcon className="w-6 h-6 text-cyan-300" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-extrabold uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      UPLOAD SOON
                    </span>

                    <p className="text-[10px] font-mono text-slate-300 mt-2 leading-relaxed">
                      Official pictures will be uploaded soon.
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Card Info (matching Gallery Page details) */}
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

      {/* Lightbox Modal (identical to Gallery Page with Left & Right Arrow Scrolling) */}
      {activeLightbox && (() => {
        const validImgs = getValidImagesForSegment(activeLightbox.photo);
        const total = validImgs.length;
        const safeIdx = total > 0 ? activeLightbox.index % total : 0;
        const activeUrl = total > 0 ? validImgs[safeIdx] : '';
        const catLabel =
          CATEGORY_LABELS[activeLightbox.photo.category] ||
          activeLightbox.photo.category.replace('_', ' ');

        return (
          <div
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 bg-[#050f20]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-2xl bg-white dark:bg-[#0c2248] border border-slate-300 dark:border-sky-400/40 p-4 sm:p-6 shadow-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-[#102a56]/90 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-sky-400/40 transition-colors z-30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#071630] mb-4 border border-slate-200 dark:border-sky-500/25 flex items-center justify-center">
                {activeUrl ? (
                  <img
                    src={activeUrl}
                    alt={activeLightbox.photo.title}
                    referrerPolicy="no-referrer"
                    onError={() => markUrlBroken(activeUrl)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest">
                      UPLOAD SOON
                    </span>
                  </div>
                )}

                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handleLightboxPrev}
                      aria-label="Previous picture"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/60 flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleLightboxNext}
                      aria-label="Next picture"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/60 flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  </>
                )}

                {total > 0 && (
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 text-xs font-mono font-bold text-cyan-300">
                    Photo {safeIdx + 1} of {total}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                  <span>{catLabel}</span>
                  <span>·</span>
                  <span>{activeLightbox.photo.date}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {activeLightbox.photo.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeLightbox.photo.caption}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
