import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X, Bell, Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TechDebateLogo } from '../common/TechDebateLogo';
import { MagneticButton } from '../motion';

export interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenAdminModal?: () => void;
  onOpenTimer?: () => void;
}

const links = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/about', id: 'about' },
  { label: 'Registration', href: '/registration', id: 'registration' },
  { label: 'Hall of Fame', href: '/hall-of-fame', id: 'hall-of-fame' },
  { label: 'Gallery', href: '/gallery', id: 'gallery' },
  { label: 'Committee', href: '/committee', id: 'committee' },
  { label: 'Contact', href: '/contact', id: 'contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab = 'home',
  onSelectTab,
  onOpenAdminModal,
  onOpenTimer,
}) => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();

  const handleNavClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-1/2 top-5 z-50 w-[94%] max-w-7xl -translate-x-1/2"
    >
      <div
        className="
          flex items-center justify-between
          rounded-[24px]
          clay-card
          px-5 py-3
          transition-colors
          md:px-7
        "
      >
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center cursor-pointer group py-1"
          aria-label="Tech Debate 4.0 Home"
        >
          <TechDebateLogo size="sm" className="group-hover:scale-105 transition-transform" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`
                  relative text-sm font-medium transition-colors duration-300 cursor-pointer
                  ${isActive ? 'text-sky-700 dark:text-white font-bold drop-shadow-sm' : 'text-slate-600 dark:text-slate-200 hover:text-sky-600 dark:hover:text-cyan-200'}
                  after:absolute after:-bottom-2 after:left-1/2
                  after:h-[2px] after:-translate-x-1/2
                  after:rounded-full after:bg-sky-500 dark:after:bg-cyan-300
                  after:shadow-[0_0_10px_rgba(14,165,233,0.8)]
                  after:transition-all after:duration-300
                  ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
                `}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action Block (Controls + Register CTA) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Admin Panel Login / Dashboard Button (Always visible on Desktop) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleNavClick(e, 'admin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-xl clay-tab-active text-cyan-200 transition-all cursor-pointer"
              >
                <Shield size={14} className="text-cyan-300" />
                <span>Admin Panel</span>
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer"
                title="Sign Out"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAdminModal?.()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 transition-all cursor-pointer"
              title="Open Admin Panel Login"
            >
              <Shield size={14} className="text-cyan-300" />
              <span>Admin</span>
            </button>
          )}

          {/* Primary Action Button: Register Now */}
          <MagneticButton>
            <a
              href="/registration"
              onClick={(e) => handleNavClick(e, 'registration')}
              className="
                clay-btn-primary
                group inline-flex items-center gap-2
                rounded-xl
                px-5 py-2.5
                text-sm font-bold
                cursor-pointer
                shadow-md shadow-cyan-500/20
              "
            >
              Register Now
              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </MagneticButton>
        </div>

        {/* Mobile Right Controls: Quick Admin Button + Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={(e) => {
              if (isAuthenticated) {
                handleNavClick(e, 'admin');
              } else {
                onOpenAdminModal?.();
              }
            }}
            className="
              inline-flex items-center gap-1.5 h-11 px-3
              rounded-xl border border-cyan-400/35
              bg-cyan-500/15 text-cyan-200 hover:text-white
              text-xs font-mono font-bold
              cursor-pointer transition-all touch-manipulation active:scale-95
            "
            aria-label="Admin Panel"
          >
            <Shield size={15} className="text-cyan-300 shrink-0" />
            <span>{isAuthenticated ? 'Admin' : 'Admin'}</span>
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="
              grid h-12 w-12 min-h-[48px] min-w-[48px] place-items-center
              rounded-xl border border-sky-200/90 dark:border-slate-700/80 hover:border-sky-400/60
              bg-sky-50/80 dark:bg-slate-800/80 text-sky-700 dark:text-cyan-200 hover:text-sky-900 dark:hover:text-white
              cursor-pointer transition-all touch-manipulation active:scale-95
            "
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} className="text-sky-600 dark:text-cyan-300" /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with 48px Touch Target Architecture */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="
              mt-3 overflow-hidden rounded-2xl
              clay-card
              p-3 sm:p-4
              space-y-1
              lg:hidden
            "
          >
            {links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`
                  flex items-center min-h-[48px] rounded-xl px-4 py-3.5
                  text-sm sm:text-base font-semibold transition cursor-pointer
                  touch-manipulation active:scale-[0.99]
                  ${currentTab === item.id ? 'clay-tab-active text-white font-bold' : 'text-slate-700 dark:text-slate-200 hover:text-white hover:bg-white/5'}
                `}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 space-y-2">
              <a
                href="/registration"
                onClick={(e) => handleNavClick(e, 'registration')}
                className="
                  flex items-center justify-center gap-2 min-h-[50px]
                  rounded-xl clay-btn-primary
                  px-6 py-3.5 font-bold text-sm sm:text-base text-white cursor-pointer
                  touch-manipulation active:scale-[0.99] shadow-lg shadow-cyan-500/20
                "
              >
                <span>Register Now (350tk)</span>
                <ArrowUpRight size={18} />
              </a>

              {onOpenTimer && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTimer();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-cyan-300 min-h-[44px] py-2.5 px-4 rounded-xl bg-cyan-500/15 border border-cyan-400/30 cursor-pointer font-bold text-xs font-mono touch-manipulation active:scale-[0.98]"
                >
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span>Debate Timer (4m + 3m Bells)</span>
                </button>
              )}
            </div>

            {/* Mobile Admin Panel Controls (Always visible for both logged-out and logged-in states) */}
            <div className="pt-3.5 mt-2.5 border-t border-sky-200 dark:border-cyan-400/20 px-1">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleNavClick(e, 'admin')}
                    className="flex-1 flex items-center justify-center gap-2 text-cyan-200 min-h-[44px] py-2.5 px-4 rounded-xl clay-tab-active cursor-pointer font-semibold touch-manipulation active:scale-[0.98]"
                  >
                    <Shield className="w-4 h-4 text-cyan-300" />
                    <span>Open Admin Panel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold text-xs cursor-pointer touch-manipulation active:scale-[0.98]"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminModal?.();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sky-700 dark:text-cyan-200 hover:text-sky-900 min-h-[44px] py-2.5 px-4 rounded-xl bg-sky-100 dark:bg-cyan-400/15 border border-sky-200 dark:border-cyan-400/30 cursor-pointer font-semibold touch-manipulation active:scale-[0.98]"
                >
                  <Shield className="w-4 h-4 text-sky-600 dark:text-cyan-300" />
                  <span>Admin Panel Login</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
