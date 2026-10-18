import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  Phone,
  Code2,
  X,
  Facebook,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  GraduationCap,
  Cpu,
  IdCard,
} from 'lucide-react';
import { TechDebateLogo } from '../common/TechDebateLogo';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

const PRITAM_PHOTO_CANDIDATES = [
  '/images/committee/pritam.jpg',
  '/images/committee/pritam.png',
  '/pritam.png',
  '/images/committee/pritam.jpeg',
];

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const avatarFallback =
    'https://ui-avatars.com/api/?name=Abir+Mahmud+Pritam&background=0a1c3c&color=38bdf8&size=512';
  const currentPhotoSrc =
    !imgError && PRITAM_PHOTO_CANDIDATES[photoIdx]
      ? PRITAM_PHOTO_CANDIDATES[photoIdx]
      : avatarFallback;

  const handleImageError = () => {
    if (photoIdx + 1 < PRITAM_PHOTO_CANDIDATES.length) {
      setPhotoIdx((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  const socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/abir.mahmud.pritam',
      icon: Facebook,
      active: true,
      style:
        'bg-[#1877F2]/20 hover:bg-[#1877F2]/35 border-[#1877F2]/50 text-sky-200 hover:text-white shadow-[0_0_20px_rgba(24,119,242,0.25)]',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com',
      icon: Linkedin,
      active: true,
      style:
        'bg-[#0A66C2]/20 hover:bg-[#0A66C2]/35 border-[#0A66C2]/50 text-sky-200 hover:text-white',
    },
    {
      label: 'GitHub',
      href: 'https://github.com',
      icon: Github,
      active: true,
      style:
        'bg-slate-800/80 hover:bg-slate-700/90 border-cyan-400/35 text-slate-200 hover:text-white',
    },
    {
      label: 'Website',
      href: 'https://www.facebook.com/abir.mahmud.pritam',
      icon: Globe,
      active: true,
      style:
        'bg-cyan-500/15 hover:bg-cyan-500/30 border-cyan-400/45 text-cyan-200 hover:text-white',
    },
  ];

  return (
    <>
      <footer className="relative border-t border-sky-200/90 dark:border-sky-400/25 bg-gradient-to-b from-white via-sky-50/60 to-blue-50/80 dark:from-[#0c2246]/95 dark:via-[#091a38]/98 dark:to-[#06142c] text-slate-600 dark:text-slate-300 text-xs mt-20 transition-colors backdrop-blur-xl overflow-hidden">
        {/* Top glowing cyan hairline & ambient light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.3)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-400/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Main Footer Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-sky-200/80 dark:border-sky-500/20">
            {/* Left: Logo & Motto */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <button
                onClick={() => onSelectTab('home')}
                className="focus:outline-none cursor-pointer hover:scale-[1.03] transition-transform"
                aria-label="Return to Tech Debate Home"
              >
                <TechDebateLogo size="sm" />
              </button>
              <div className="border-l-0 sm:border-l border-sky-300 dark:border-cyan-400/40 sm:pl-4 space-y-0.5">
                <p className="text-slate-900 dark:text-white font-semibold text-sm tracking-tight">
                  Intra-CSE Parliamentary Debate Championship 2026
                </p>
                <p className="text-sky-600 dark:text-cyan-300 font-serif italic text-xs sm:text-sm">
                  Defend your stance with logic.
                </p>
              </div>
            </div>

            {/* Right: Contact Numbers & Back to Top */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-cyan-500/25 text-xs font-mono text-cyan-300">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400">Contact:</span>
                <a
                  href="tel:01718169072"
                  className="hover:text-white font-bold transition-colors"
                >
                  01718169072
                </a>
                <span className="text-slate-600">|</span>
                <a
                  href="tel:+8801849315117"
                  className="hover:text-white font-bold transition-colors"
                >
                  +880 1849-315117
                </a>
              </div>

              {/* Back to Top Button */}
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={scrollToTop}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full clay-btn-primary p-0 flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-md shadow-cyan-500/20"
                title="Back to Top"
                aria-label="Back to top"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Developer Profile Modal Trigger */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-slate-600 dark:text-slate-200 font-medium">
              © 2026 Tech Debate 4.0. All rights reserved.
            </p>
            <button
              type="button"
              onClick={() => setShowDeveloperModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 hover:border-cyan-300 text-cyan-300 hover:text-white font-mono text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]"
              title="View Developer Profile - Abir Mahmud Pritam"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Development by Abir Mahmud Pritam</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Developer Profile Popup Modal */}
      <AnimatePresence>
        {showDeveloperModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowDeveloperModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-cyan-400/45 bg-gradient-to-b from-[#0b2149] via-[#081938] to-[#051026] p-6 sm:p-7 shadow-[0_0_70px_rgba(0,229,255,0.3)] text-center overflow-hidden"
            >
              {/* Top Glowing Hairline */}
              <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

              {/* Ambient Glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowDeveloperModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-900/70 hover:bg-rose-500/20 border border-cyan-400/25 hover:border-rose-400/50 text-slate-300 hover:text-rose-200 flex items-center justify-center transition-all cursor-pointer z-10"
                aria-label="Close Developer Popup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Developer Role Kicker */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-300 mb-4">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lead Developer • Organizing Head</span>
              </div>

              {/* Developer Portrait Frame */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-4 rounded-2xl p-1 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_35px_rgba(6,182,212,0.4)]">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#06132c]">
                  <img
                    src={currentPhotoSrc}
                    alt="Abir Mahmud Pritam"
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Developer Name */}
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Abir Mahmud Pritam
              </h3>

              {/* Academic Credentials */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#06132c]/90 border border-cyan-400/25 space-y-2 text-xs">
                <div className="flex items-center justify-center gap-2 font-mono font-bold text-cyan-300 text-sm">
                  <IdCard className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>ID: 231311070</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-200 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                    8th Semester
                  </span>
                  <span aria-hidden="true" className="text-cyan-400 font-bold">
                    •
                  </span>
                  <span>32nd Batch</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-sky-300 font-mono text-[11px] uppercase tracking-wider pt-0.5 border-t border-cyan-500/15">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Dept. of CSE • Varendra University</span>
                </div>
              </div>

              {/* Social & Profile Buttons */}
              <div className="mt-5">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2.5">
                  Connect with Developer
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3.5 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${item.style}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-70 ml-auto shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
