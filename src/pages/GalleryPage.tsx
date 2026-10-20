import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { GlassCard } from '../components/common/GlassCard';
import { useTournament } from '../context/TournamentContext';
import { GalleryPhoto } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  WORKSHOP: 'Workshop',
  KIT_DISTRIBUTION: 'Kit Distribution',
  DEBATE_SESSIONS: 'Debate Sessions',
  JUDGES: 'Judges & Adjudication',
  FINAL_EVENT: 'Final Event',
  AWARDS: 'Award Ceremony',
};

const OFFICIAL_CATEGORIES: Array<{ id: GalleryPhoto['category']; label: string }> = [
  { id: 'WORKSHOP', label: 'Workshop' },
  { id: 'KIT_DISTRIBUTION', label: 'Kit Distribution' },
  { id: 'DEBATE_SESSIONS', label: 'Debate Sessions' },
  { id: 'JUDGES', label: 'Judges & Adjudication' },
  { id: 'FINAL_EVENT', label: 'Final Event' },
  { id: 'AWARDS', label: 'Award Ceremony' },
];

export const GalleryPage: React.FC = () => {
  const { gallery } = useTournament();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cardSlideIndex, setCardSlideIndex] = useState<Record<string, number>>({});
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});
  const [activeLightbox, setActiveLightbox] = useState<{
    photo: GalleryPhoto;
    index: number;
  } | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Moments' },
    ...OFFICIAL_CATEGORIES,
  ];

  // Ensure all 6 official segments are always present
  const normalizedSegments: GalleryPhoto[] = OFFICIAL_CATEGORIES.map((cat) => {
    const found = gallery.find((g) => g.category === cat.id);
    if (found) return found;
    return {
      id: `g-${cat.id.toLowerCase()}`,
      title: cat.label,
      category: cat.id,
      imageUrl: '',
      images: [],
      caption: `Official event moments and photography for ${cat.label}.`,
      date: 'Upcoming',
    };
  });

  const filteredPhotos =
    selectedCategory === 'ALL'
      ? normalizedSegments
      : normalizedSegments.filter((p) => p.category === selectedCategory);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="HISTORICAL ARCHIVE"
        title="Event Memories & Visual Retrospective"
        subtitle="Immerse yourself in moments of intense rebuttal, adjudication deliberations, auditorium stage triumphs, and academic brotherhood."
        centered
      />

      {/* Category Filter Tabs */}
      <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-2 mb-10 p-1.5 bg-white/95 dark:bg-[#0c2248]/80 rounded-2xl border border-sky-200/90 dark:border-sky-400/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,165,233,0.08)] overflow-x-auto scrollbar-none w-fit max-w-full mx-auto">
        {categories.map((cat) => (
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

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => {
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
              className={`group overflow-hidden hover:border-cyan-500/50 transition-all ${
                totalImages > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Image or Upload Soon Banner Container */}
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

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 backdrop-blur-md z-10">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Photo Counter Pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-sky-400/30 backdrop-blur-md z-10">
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
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/50 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCardNext(e, photo, totalImages)}
                          aria-label="Next picture"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#051026]/85 hover:bg-cyan-500 text-white border border-cyan-400/50 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#051026]/75 backdrop-blur-xs">
                          {validImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentIdx
                                  ? 'w-4 bg-cyan-400'
                                  : 'w-1.5 bg-slate-400/60'
                              }`}
                            />
                          ))}
                        </div>
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
                  /* UPLOAD SOON BANNER (shown when no picture is uploaded or file is not found) */
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#0b1d42] via-[#07132c] to-[#040a18] flex flex-col items-center justify-center p-6 text-center border-b border-sky-500/20 select-none">
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 backdrop-blur-md">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                      <ImageIcon className="w-7 h-7 text-cyan-300" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Clock className="w-3.5 h-3.5" />
                      UPLOAD SOON
                    </span>

                    <p className="text-[11px] font-mono text-slate-300 mt-2.5 max-w-[220px] leading-relaxed">
                      Official pictures for <strong className="text-cyan-300">{categoryLabel}</strong> will be uploaded soon.
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Card Info */}
              <div className="p-4 space-y-1.5">
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
            </GlassCard>
          );
        })}
      </div>

      {/* Lightbox Modal with Left & Right Arrow Scrolling */}
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

                {/* Left & Right Arrow Buttons in Picture Show Modal */}
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

                {/* Counter Badge inside Modal */}
                {total > 0 && (
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 text-xs font-mono font-bold text-cyan-300">
                    Photo {safeIdx + 1} of {total}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip if multiple photos exist */}
              {total > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
                  {validImgs.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLightbox({ photo: activeLightbox.photo, index: idx })}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === safeIdx
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

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
    </div>
  );
};
