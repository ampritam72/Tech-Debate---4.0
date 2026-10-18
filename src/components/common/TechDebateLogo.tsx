import React, { useState } from 'react';

interface TechDebateLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
}

/**
 * Measured properties of user's uploaded transparent logo ("Logo Trans Low.png"):
 * Width: 1280px
 * Height: 426px
 * Exact Aspect Ratio: 3.005 : 1 (approx. 3:1 horizontal)
 */
const LOGO_CANDIDATE_PATHS = [
  '/Logo.png',
  '/logo.png',
  '/images/Logo.png',
  '/images/Logo Trans Low.png',
  '/images/logo.png',
  '/Logo Trans Low.png',
];

export const TechDebateLogo: React.FC<TechDebateLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const sizeClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-10 md:h-11',
    md: 'h-11 sm:h-13 md:h-15',
    lg: 'h-16 sm:h-18 md:h-20',
    hero: 'h-16 sm:h-20 md:h-24 lg:h-28',
  };

  const handleImageError = () => {
    if (candidateIndex < LOGO_CANDIDATE_PATHS.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <img
        src={LOGO_CANDIDATE_PATHS[candidateIndex]}
        alt="Tech Debate 4.0 Logo"
        onError={handleImageError}
        className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain select-none transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(0,180,255,0.25)]`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

export default TechDebateLogo;
