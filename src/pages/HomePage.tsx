import React from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/home/HeroSection';
import { StatisticsCounter } from '../components/home/StatisticsCounter';
import { RegistrationCountdownCard } from '../components/home/RegistrationCountdownCard';
import { TournamentFormat } from '../components/home/TournamentFormat';
import { KeyInformationSection } from '../components/home/KeyInformationSection';
import { ImportantDatesSection } from '../components/home/ImportantDatesSection';
import { HallOfFameSection } from '../components/home/HallOfFameSection';
import { GallerySection } from '../components/home/GallerySection';
import { CommitteeSection } from '../components/home/CommitteeSection';
import { SectionDivider } from '../components/common/SectionDivider';

interface HomePageProps {
  onSelectTab: (tab: string, extra?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Hero Section */}
      <HeroSection
        onRegisterClick={() => onSelectTab('registration')}
        onHallOfFameClick={() => onSelectTab('hall-of-fame')}
      />

      {/* Animated Neon-Cyan Gradient Divider */}
      <SectionDivider />

      {/* Statistics Cards (40+ Teams, 120+ Participants, 35+ Matches, 4 Editions) */}
      <StatisticsCounter />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* Countdown Timer (Glowing Hourglass Ring, Real-time Countdown, Register Now CTA) */}
      <RegistrationCountdownCard
        onRegisterClick={() => onSelectTab('registration')}
      />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 5. Tournament Journey (6-Stage Progression From Registration to the Grand Stage) */}
      <TournamentFormat />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 6. Key Information (4 Cards: Format, Teams, Time Limits, Criteria) */}
      <KeyInformationSection
        onViewRulesClick={(ruleId) => onSelectTab('about', ruleId)}
      />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 7. Important Dates (Interactive Timeline with Glowing Nodes + Protocol Card) */}
      <ImportantDatesSection
        onViewScheduleClick={() => onSelectTab('about')}
      />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 9. Hall of Fame Preview (4 Edition Cards: 1.0, 2.0, 3.0, 4.0) */}
      <HallOfFameSection
        onViewAllClick={() => onSelectTab('hall-of-fame')}
      />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 10. Gallery Preview (6 Photo Category Cards with Hover Lift) */}
      <GallerySection
        onViewMoreClick={() => onSelectTab('gallery')}
      />

      {/* Subtle Glowing Gradient Divider */}
      <SectionDivider />

      {/* 11. Committee Preview (5 Leadership Cards with Avatars & Social Links) */}
      <CommitteeSection
        onViewAllClick={() => onSelectTab('committee')}
      />
    </motion.div>
  );
};
