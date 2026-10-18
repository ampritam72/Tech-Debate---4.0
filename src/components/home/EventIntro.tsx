import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Terminal, Scale, Brain } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';

export const EventIntro: React.FC = () => {
  const pillars = [
    {
      icon: Terminal,
      title: 'Algorithmic Conviction',
      subtitle: 'Logic Trees & Fallacy Detection',
      description: 'Debating is not mere oratory; it is constructing non-contradictory logic trees, detecting cognitive fallacies in real-time, and verifying assumptions under strict temporal constraints.'
    },
    {
      icon: Scale,
      title: 'Ethical & Policy Intersections',
      subtitle: 'Socio-Technical Governance',
      description: 'From autonomous AI liability to quantum cryptography sovereignty, students confront the regulatory, socioeconomic, and ethical dilemmas shaping modern computing.'
    },
    {
      icon: Brain,
      title: 'Parliamentary Discipline',
      subtitle: 'Asian Parliamentary Rigor',
      description: 'Asian Parliamentary format compels speakers to dissect counter-models, deliver sharp Points of Information (POIs), and defend team lines without hesitation.'
    }
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.55,
        ease: 'easeOut'
      }
    })
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24"
    >
      <SectionHeader
        badge="THE CHAMPIONSHIP ESSENCE"
        title="Where Computational Rigor Meets Rhetorical Mastery"
        subtitle="Tech Debate was founded to eliminate the false dichotomy between engineer and orator. True technical leadership demands not merely writing code, but defending its societal imperative."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <motion.div 
              key={idx}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative p-7 rounded-[22px] clay-card transition-all duration-300 group overflow-hidden select-none"
            >
              {/* Top subtle neon hairline */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

              <div className="w-12 h-12 rounded-xl clay-tab flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-105 transition-all">
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                {pillar.title}
              </h3>
              <div className="text-xs font-mono font-medium text-sky-600 dark:text-cyan-300 mb-3">
                {pillar.subtitle}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
