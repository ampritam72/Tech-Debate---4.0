import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface HeroBannerProps {
  /**
   * Optional custom/external image URL.
   * If provided, will be prioritized before local fallback candidates.
   */
  src?: string;
  imageUrl?: string;
  alt?: string;
  /**
   * Additional container classes.
   */
  className?: string;
  /**
   * Whether to display the animated cyber tech grid pattern.
   * Defaults to true.
   */
  showTechGrid?: boolean;
  /**
   * Whether to display the cyan and blue neon glow spheres.
   * Defaults to true.
   */
  showGlows?: boolean;
  /**
   * Base opacity of the loaded banner image (between 0 and 1).
   * Defaults to 0.9.
   */
  imageOpacity?: number;
  /**
   * Optional child elements to render above the background layers (with z-10).
   */
  children?: React.ReactNode;
}

const DEFAULT_CANDIDATES = [
  '/images/herobanner.png',
  '/herobanner.png',
  '/images/hero-debate.jpg',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  src,
  imageUrl,
  alt = 'Tech Debate 4.0 Championship Arena Hero Banner',
  className = '',
  showTechGrid = true,
  showGlows = true,
  imageOpacity = 0.9,
  children,
}) => {
  const customSrc = src || imageUrl;
  
  // Build fallback candidate queue with priority to external custom source
  const initialCandidates = customSrc
    ? [customSrc, ...DEFAULT_CANDIDATES.filter((c) => c !== customSrc)]
    : DEFAULT_CANDIDATES;

  const [candidates, setCandidates] = useState<string[]>(initialCandidates);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  // Update candidate list if external src changes
  useEffect(() => {
    const list = customSrc
      ? [customSrc, ...DEFAULT_CANDIDATES.filter((c) => c !== customSrc)]
      : DEFAULT_CANDIDATES;
    setCandidates(list);
    setCandidateIndex(0);
    setHasError(false);
  }, [customSrc]);

  const currentSrc = candidates[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden={!children}
    >
      {/* =========================================================================
          BACKGROUND LAYER 0: Responsive Imagery (z-0 / sits behind all content)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Base illuminated cyber backdrop */}
        <div className="absolute inset-0 bg-[#0a1b38]" />

        {!hasError && currentSrc && (
          <img
            key={currentSrc}
            src={currentSrc}
            alt={alt}
            onError={handleImageError}
            className="h-full w-full object-cover object-center select-none opacity-90 transition-opacity duration-700"
            loading="eager"
            decoding="async"
          />
        )}

        {/* Balanced Cinematic Arena Overlay:
            Soft illuminated royal azure overlay on the left for crisp typography contrast,
            while letting the central stage graphic and artwork shine through clearly */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(90deg,#0a1b38_0%,rgba(10,27,56,0.85)_40%,rgba(10,27,56,0.25)_70%,rgba(10,27,56,0.55)_100%)]
          "
        />

        {/* Soft Vignette to maintain focus while preventing oppressive darkness */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,27,56,0.30)_80%,rgba(8,20,44,0.75)_100%)]
          "
        />

        {/* Top Fade for Floating Navbar */}
        <div
          className="
            absolute inset-x-0 top-0 h-24
            bg-gradient-to-b from-[#0a1b38]/85 via-[#0a1b38]/40 to-transparent
          "
        />

        {/* Bottom Fade into Contained Card Base */}
        <div
          className="
            absolute inset-x-0 bottom-0 h-28
            bg-gradient-to-t from-[#0a1b38]/85 via-[#0a1b38]/40 to-transparent
          "
        />
      </div>

      {/* =========================================================================
          BACKGROUND LAYER 1: Ambient Neon Cyber Glow Spheres (z-[1], Balanced across screen)
          ========================================================================= */}
      {showGlows && (
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {/* Center-Top Ambient Glow */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full bg-cyan-400/22 blur-[130px]"
          />

          {/* Left-Accent Subtle Glow */}
          <div className="absolute -left-28 top-[28%] w-[460px] h-[460px] rounded-full bg-blue-500/22 blur-[120px]" />

          {/* Right-Accent Balanced Glow */}
          <div className="absolute -right-28 top-[35%] w-[460px] h-[460px] rounded-full bg-cyan-400/20 blur-[120px]" />
        </div>
      )}

      {/* =========================================================================
          BACKGROUND LAYER 2: Animated Tech Grid Pattern (z-[2])
          ========================================================================= */}
      {showTechGrid && (
        <motion.div
          aria-hidden
          animate={{ backgroundPosition: ['0px 0px', '56px 56px'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="
            absolute inset-0 z-[2] opacity-[0.08] pointer-events-none
            [background-image:linear-gradient(rgba(34,211,238,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.14)_1px,transparent_1px)]
            [background-size:56px_56px]
            [mask-image:linear-gradient(to_bottom,black,transparent_82%)]
          "
        />
      )}

      {/* =========================================================================
          FOREGROUND CONTENT LAYER: (z-10, sits cleanly above all background layers)
          ========================================================================= */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
