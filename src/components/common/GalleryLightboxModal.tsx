import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { HOME_SECTION_BACKGROUNDS } from '../../config/sectionBackgrounds';

export const GALLERY_CATEGORY_LABELS: Record<string, string> = {
  WORKSHOP: 'Workshop',
  KIT_DISTRIBUTION: 'Kit Distribution',
  DEBATE_SESSIONS: 'Debate Sessions',
  JUDGES: 'Judges & Adjudication',
  FINAL_EVENT: 'Final Event',
  AWARDS: 'Award Ceremony',
};

interface FallbackSlide {
  title: string;
  subtitle: string;
  previewBg: string;
}

const SEGMENT_FALLBACK_SLIDES: Record<string, FallbackSlide[]> = {
  WORKSHOP: [
    {
      title: 'Workshop Session — Frame 01',
      subtitle: 'Opening briefing on Asian Parliamentary (3v3) format and motion analysis',
      previewBg: HOME_SECTION_BACKGROUNDS.debateSpeaker,
    },
    {
      title: 'Workshop Session — Frame 02',
      subtitle: 'Faculty Convenor & advisors guiding debaters on constructive speeches (5 mins)',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
    {
      title: 'Workshop Session — Frame 03',
      subtitle: 'Interactive Q&A and Point of Information (POI) & Rebuttal (3 mins) drills',
      previewBg: HOME_SECTION_BACKGROUNDS.rulebookTimerPanel,
    },
    {
      title: 'Workshop Session — Frame 04',
      subtitle: 'Participating CSE batches group session at Varendra University',
      previewBg: HOME_SECTION_BACKGROUNDS.registrationCountdownBg,
    },
  ],
  KIT_DISTRIBUTION: [
    {
      title: 'Kit Distribution — Frame 01',
      subtitle: 'Official delegate folders, badges, and rulebooks prepared for registered squads',
      previewBg: HOME_SECTION_BACKGROUNDS.countdownThumbnail,
    },
    {
      title: 'Kit Distribution — Frame 02',
      subtitle: 'Team leaders collecting official squad kits and batch identification tags',
      previewBg: HOME_SECTION_BACKGROUNDS.debateSpeaker,
    },
    {
      title: 'Kit Distribution — Frame 03',
      subtitle: 'Pre-match check-in desk and bracket verification with organizing committee',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
  ],
  DEBATE_SESSIONS: [
    {
      title: 'Debate Sessions — Frame 01',
      subtitle: 'Government vs Opposition 3-speaker substantive clashes on stage',
      previewBg: HOME_SECTION_BACKGROUNDS.rulebookTimerPanel,
    },
    {
      title: 'Debate Sessions — Frame 02',
      subtitle: 'High-stakes Point of Information (POI) and 3-minute rebuttal exchanges',
      previewBg: HOME_SECTION_BACKGROUNDS.debateSpeaker,
    },
    {
      title: 'Debate Sessions — Frame 03',
      subtitle: 'Audience and batch supporters cheering in the debate hall',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
    {
      title: 'Debate Sessions — Frame 04',
      subtitle: 'Timekeeper & Speaker bell desk during live tournament rounds',
      previewBg: HOME_SECTION_BACKGROUNDS.registrationCountdownBg,
    },
  ],
  JUDGES: [
    {
      title: 'Judges & Adjudication — Frame 01',
      subtitle: 'Faculty adjudicators evaluating Matter (40%), Manner (40%), and Method (20%)',
      previewBg: HOME_SECTION_BACKGROUNDS.debateSpeaker,
    },
    {
      title: 'Judges & Adjudication — Frame 02',
      subtitle: 'Adjudication core panel deliberation and ballot verification',
      previewBg: HOME_SECTION_BACKGROUNDS.digitalGlobe,
    },
    {
      title: 'Judges & Adjudication — Frame 03',
      subtitle: 'Constructive oral adjudication and feedback session for debaters',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
  ],
  FINAL_EVENT: [
    {
      title: 'Grand Final Event — Frame 01',
      subtitle: 'Main auditorium stage prepared for the Championship Grand Final',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
    {
      title: 'Grand Final Event — Frame 02',
      subtitle: 'Finalist squads delivering closing rebuttals before full auditorium',
      previewBg: HOME_SECTION_BACKGROUNDS.debateSpeaker,
    },
    {
      title: 'Grand Final Event — Frame 03',
      subtitle: 'Chief Guest, Faculty Advisors, and CSE Department leadership at Grand Final',
      previewBg: HOME_SECTION_BACKGROUNDS.registrationCountdownBg,
    },
  ],
  AWARDS: [
    {
      title: 'Award Ceremony — Frame 01',
      subtitle: 'Official Championship Trophy, Runner-Up crests, and medals on stage',
      previewBg: HOME_SECTION_BACKGROUNDS.protocolCard,
    },
    {
      title: 'Award Ceremony — Frame 02',
      subtitle: 'Conferral of Best Tournament Debater and Emerging Team honors',
      previewBg: HOME_SECTION_BACKGROUNDS.countdownThumbnail,
    },
    {
      title: 'Award Ceremony — Frame 03',
      subtitle: 'Champions celebrating on stage with faculty and organizing committee',
      previewBg: HOME_SECTION_BACKGROUNDS.heroArena,
    },
  ],
};

interface GalleryLightboxModalProps {
  photo: GalleryPhoto;
  initialIndex?: number;
  validImages: string[];
  onMarkUrlBroken?: (url: string) => void;
  onClose: () => void;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  photo,
  initialIndex = 0,
  validImages,
  onMarkUrlBroken,
  onClose,
}) => {
  const fallbackSlides =
    SEGMENT_FALLBACK_SLIDES[photo.category] || SEGMENT_FALLBACK_SLIDES.WORKSHOP;

  const hasUploadedPhotos = validImages.length > 0;
  const totalSlides = hasUploadedPhotos ? validImages.length : fallbackSlides.length;

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    totalSlides > 0 ? initialIndex % totalSlides : 0
  );
  const [slideDirection, setSlideDirection] = useState<number>(1);

  useEffect(() => {
    setCurrentIndex(totalSlides > 0 ? initialIndex % totalSlides : 0);
  }, [photo.id, initialIndex, totalSlides]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (totalSlides <= 1) return;
      setSlideDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (totalSlides <= 1) return;
      setSlideDirection(1);
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    },
    [totalSlides]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext, onClose]);

  const safeIdx = totalSlides > 0 ? currentIndex % totalSlides : 0;
  const categoryLabel =
    GALLERY_CATEGORY_LABELS[photo.category] || photo.category.replace('_', ' ');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#020817]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#0b1f47] via-[#071533] to-[#040c20] border border-cyan-400/40 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.2)] overflow-hidden"
      >
        {/* Top Neon Accent Line */}
        <div className="
          absolute top-0 left-0 right-0 h-[2px]
          bg-gradient-to-r from-transparent via-cyan-400 to-transparent
          shadow-[0_0_12px_#22d3ee]
        " />

        {/* 1. Modal Header with Category, Title, Counter & Cross (X) Cancel Button */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-cyan-500/20 bg-[#051129]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <span>{categoryLabel}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  {photo.date}
                </span>
              </div>
              <h3 className="font-display text-sm sm:text-lg font-extrabold text-white truncate">
                {photo.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#091e46] border border-cyan-400/35 text-xs font-mono font-bold text-cyan-300">
              {safeIdx + 1} / {totalSlides}
            </span>

            {/* Prominent Cross (X) Button to Close Popup */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gallery popup"
              title="Close (Esc)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-400/50 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 2. Main Interactive Picture Slider Stage with Left & Right Buttons */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#030a1c] overflow-hidden flex items-center justify-center select-none">
          <AnimatePresence mode="wait" custom={slideDirection}>
            {hasUploadedPhotos ? (
              <motion.img
                key={`uploaded-${safeIdx}-${validImages[safeIdx]}`}
                src={validImages[safeIdx]}
                alt={`${photo.title} - Photo ${safeIdx + 1}`}
                referrerPolicy="no-referrer"
                onError={() => onMarkUrlBroken?.(validImages[safeIdx])}
                initial={{ opacity: 0, x: slideDirection * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection * -40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full h-full object-contain"
              />
            ) : (
              <motion.div
                key={`fallback-${safeIdx}`}
                initial={{ opacity: 0, x: slideDirection * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection * -40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden"
              >
                {/* Curated Thematic Background Preview for Each Slide */}
                <img
                  src={fallbackSlides[safeIdx]?.previewBg || HOME_SECTION_BACKGROUNDS.heroArena}
                  alt={fallbackSlides[safeIdx]?.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030a1c] via-[#061534]/75 to-[#030a1c]/80" />

                {/* Center Upload Soon & Slide Frame Info */}
                <div className="relative z-10 max-w-lg mx-auto space-y-3 p-6 rounded-3xl bg-[#071738]/85 border border-cyan-400/35 backdrop-blur-md shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                    <ImageIcon className="w-7 h-7 text-cyan-300" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-extrabold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span>UPLOAD SOON • ALBUM SLOT {safeIdx + 1} OF {totalSlides}</span>
                  </div>

                  <h4 className="font-display text-base sm:text-xl font-bold text-white">
                    {fallbackSlides[safeIdx]?.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {fallbackSlides[safeIdx]?.subtitle}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Slider Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous picture"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#05122e]/90 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Right Slider Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next picture"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#05122e]/90 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Dot Indicators on Stage Bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040f25]/85 border border-cyan-500/30 backdrop-blur-md">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSlideDirection(idx > safeIdx ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === safeIdx
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    : 'w-2 bg-slate-500 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3. Thumbnail Strip & Footer Details */}
        <div className="p-4 sm:p-5 bg-[#051129]/95 border-t border-cyan-500/20 space-y-3 overflow-y-auto">
          {/* Interactive Thumbnail Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const thumbSrc = hasUploadedPhotos
                ? validImages[idx]
                : fallbackSlides[idx]?.previewBg || HOME_SECTION_BACKGROUNDS.heroArena;
              const isSelected = idx === safeIdx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSlideDirection(idx > safeIdx ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105'
                      : 'border-slate-700/80 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumbSrc}
                    alt={`Slide ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#030a1c]/85 text-[9px] font-mono font-bold text-cyan-300">
                    #{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Caption & Prev/Next Quick Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {hasUploadedPhotos
                ? photo.caption
                : fallbackSlides[safeIdx]?.subtitle || photo.caption}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl bg-[#0a1d42] hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-3.5 py-2 rounded-xl bg-[#0a1d42] hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
