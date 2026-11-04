/**
 * Developer Configuration for Home Page & About Page Section Backgrounds
 * -------------------------------------------------------------------------
 * All images placed in `public/assets/aistudio/` or `public/images/`
 * are automatically served in lightweight WebP format by the backend (`server.ts`).
 */

export const HOME_SECTION_BACKGROUNDS = {
  // 1. Hero Section Main Arena Banner
  heroArena: '/assets/aistudio/hero-arena_f3b6da3b.webp',

  // 2. Registration Countdown / Closed Section Main Background & Left Thumbnail
  registrationCountdownBg: '/assets/aistudio/registration-countdown-bg_15202b7d.webp',
  countdownThumbnail: '/assets/aistudio/countdown-thumbnail_273299cf.webp',

  // 3. Div 1 (section 4 > div 2): Tournament Progression 6-Stage Timeline Box
  timelineBox: '/assets/aistudio/bg-timeline_560c0f66.webp',

  // 4. Div 2 (section 5 > div 1): Key Information Section Main Panel
  keyInfoPanel: '/assets/aistudio/bg-key-info_ee2586c9.webp',

  // 5. Div 3 (section 6 > div 1): Important Dates & Milestones Main Panel
  importantDatesPanel: '/assets/aistudio/bg-important-dates_194ae563.webp',

  // 6. Div 4 (section 6 > ... > div 1): Stage 1 to Stage 8 Picture Frame on Right
  protocolCard: '/assets/aistudio/bg-protocol-card_1f19a0f6.webp',
  roadmapCard: '/assets/aistudio/bg-protocol-card_1f19a0f6.webp',

  // 7. Div 5 (section 7 > div 1): Official Rulebook & Stage Debate Timer Panel
  rulebookTimerPanel: '/assets/aistudio/bg-rulebook-timer_fc68259f.webp',

  // 8. About Page Section Backgrounds & Showcase Images
  debateSpeaker: '/assets/aistudio/debate-speaker_1e14f663.webp',
  digitalGlobe: '/assets/aistudio/digital-globe_2952dca1.webp',
  aboutHeroImage: '/assets/aistudio/debate-speaker_1e14f663.webp',
  aboutStoryImage: '/assets/aistudio/hero-arena_f3b6da3b.webp',
  aboutRuleCardBg: '/assets/aistudio/registration-countdown-bg_15202b7d.webp',

  // Default fallback background
  fallbackBanner: '/assets/aistudio/hero-arena_f3b6da3b.webp',
} as const;

/**
 * Helper that builds the exact CSS background style matching the Registration Closed card
 * with automatic fallback.
 */
export function getSectionBgStyle(
  customImagePath: string,
  overlayOpacity: 'standard' | 'medium' | 'light' | 'vivid' = 'standard'
): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  const gradient =
    overlayOpacity === 'vivid'
      ? 'linear-gradient(90deg, rgba(6,18,42,0.72) 0%, rgba(10,28,62,0.62) 50%, rgba(6,18,42,0.72) 100%)'
      : overlayOpacity === 'light'
      ? 'linear-gradient(90deg, rgba(10,25,47,0.84) 0%, rgba(13,38,76,0.76) 50%, rgba(10,25,47,0.84) 100%)'
      : overlayOpacity === 'medium'
      ? 'linear-gradient(90deg, rgba(10,25,47,0.88) 0%, rgba(13,38,76,0.82) 50%, rgba(10,25,47,0.88) 100%)'
      : 'linear-gradient(90deg, rgba(10,25,47,0.91) 0%, rgba(13,38,76,0.85) 50%, rgba(10,25,47,0.91) 100%)';

  return {
    backgroundImage: `${gradient}, url(${customImagePath}), url(${HOME_SECTION_BACKGROUNDS.fallbackBanner}), url(/images/herobanner.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
