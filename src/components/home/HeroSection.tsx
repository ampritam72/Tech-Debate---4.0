import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  Mic2,
  Lightbulb,
  Target,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { TechDebateLogo } from '../common/TechDebateLogo';
import { HeroBanner } from './HeroBanner';
import { TextEffect, MagneticButton } from '../motion';
import { MottoTypewriter } from './MottoTypewriter';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

interface HeroSectionProps {
  onRegisterClick?: () => void;
  onHallOfFameClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onHallOfFameClick,
}) => {
  return (
    <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-4 sm:pb-6 text-white">
      {/* Container aligned equally with all sections below (max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contained Hero Banner Box */}
        <div
          className="
            relative min-h-[520px] sm:min-h-[620px] lg:min-h-[720px]
            w-full overflow-hidden
            rounded-[24px] sm:rounded-[36px]
            clay-panel
            flex items-center
          "
        >
          {/* Dedicated Tournament Hero Imagery & Layering Manager */}
          <HeroBanner />

          {/* Main Hero Content Viewport */}
          <div className="relative z-10 w-full px-5 py-8 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <div className="w-full max-w-4xl">
              {/* Left Column: Branding, Title, Motto, CTAs, Features */}
              <motion.div
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.18 }}
                className="max-w-[820px] flex flex-col items-start"
              >
                {/* Official Transparent Championship Logo Banner */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8 }}
                  className="relative mb-3 sm:mb-4 inline-flex items-center select-none max-w-full"
                >
                  <TechDebateLogo size="hero" className="hover:scale-[1.02] transition-transform duration-300 relative z-10" />
                </motion.div>

            {/* Main Headline with Synchronized Dual-Line Typewriter Animation */}
            <motion.div variants={fadeUp} transition={{ duration: 1.0 }} className="w-full">
              <h1 className="text-[clamp(2.1rem,5.6vw,5.2rem)] font-black leading-[1.06] tracking-[-0.03em] text-slate-900 dark:text-white">
                <MottoTypewriter delay={300} />
              </h1>
            </motion.div>

            {/* Lead Description */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 1.0 }}
              className="
                mt-6 max-w-2xl
                text-base leading-8 text-slate-700 dark:text-slate-300
                md:text-lg
              "
            >
              Where sharp arguments meet sharper minds. Step into the arena,
              challenge ideas, defend your position and compete for the
              championship stage.
            </motion.p>

            {/* CTAs with MagneticButton Motion Primitives & Mobile Hit Area Optimization */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="
                mt-8 flex flex-col gap-3.5
                sm:flex-row items-stretch sm:items-center
              "
            >
              <MagneticButton onClick={onRegisterClick}>
                <div
                  className="
                    clay-btn-primary
                    group inline-flex w-full items-center justify-center
                    gap-2.5 rounded-2xl
                    px-7 py-3.5 sm:px-8 sm:py-4 text-base font-bold
                    min-h-[48px] sm:w-auto cursor-pointer shadow-lg shadow-cyan-500/20
                    touch-manipulation active:scale-[0.98] transition-all
                  "
                >
                  <span>Register Your Team</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </MagneticButton>

              <MagneticButton onClick={onHallOfFameClick}>
                <div
                  className="
                    clay-btn-secondary
                    inline-flex w-full items-center justify-center
                    gap-2.5 rounded-2xl
                    px-7 py-3.5 sm:px-8 sm:py-4 text-base font-bold
                    min-h-[48px] sm:w-auto cursor-pointer
                    touch-manipulation active:scale-[0.98] transition-all
                  "
                >
                  <Trophy size={18} className="text-amber-400" />
                  <span>Explore Hall of Fame</span>
                </div>
              </MagneticButton>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="
                mt-10 flex flex-wrap
                gap-x-6 gap-y-4
                text-sm text-slate-300
              "
            >
              <Feature icon={<Mic2 size={17} />} label="Bold Arguments" />
              <Feature icon={<Lightbulb size={17} />} label="Sharper Minds" />
              <Feature icon={<Target size={17} />} label="Future Leaders" />
            </motion.div>

            {/* Info Chips */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="
                mt-8 flex flex-wrap gap-3
                text-xs text-slate-400
              "
            >
              <InfoChip
                icon={<MapPin size={14} />}
                text="Varendra University"
              />

              <InfoChip
                icon={<CalendarDays size={14} />}
                text="Intra-CSE Championship 2026"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

function Feature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-2"
    >
      <span
        className="
          grid h-8 w-8 place-items-center
          rounded-lg border border-cyan-300/15
          bg-cyan-300/[0.06]
          text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]
        "
      >
        {icon}
      </span>
      <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
    </motion.div>
  );
}

function InfoChip({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        inline-flex items-center gap-2
        clay-pill
        px-4 py-2 text-xs
      "
    >
      <span className="text-sky-600 dark:text-cyan-300">{icon}</span>
      <span className="text-slate-800 dark:text-slate-200 font-semibold">{text}</span>
    </div>
  );
}

export default HeroSection;
