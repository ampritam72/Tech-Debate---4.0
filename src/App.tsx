import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { CyberBackground } from './components/layout/CyberBackground';
import { ChampionshipTopTicker } from './components/layout/ChampionshipTopTicker';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ScrollProgress } from './components/motion';
import { InitialLoader } from './components/common/InitialLoader';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { HallOfFamePage } from './pages/HallOfFamePage';
import { GalleryPage } from './pages/GalleryPage';
import { CommitteePage } from './pages/CommitteePage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DebateTimerPage } from './pages/DebateTimerPage';

// Stagger container animation variants optimized for fluid 60fps mobile & desktop transitions
const pageContainerVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const pageChildVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [aboutTargetSection, setAboutTargetSection] = useState<string | undefined>(undefined);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const { isAuthenticated } = useAdminAuth();
  const { refreshFromDatabase } = useTournament();

  const handleSelectTab = (tab: string, extra?: string) => {
    if (tab === 'admin' && !isAuthenticated) {
      setAdminModalOpen(true);
      return;
    }
    if (tab === 'about') {
      setAboutTargetSection(extra);
    }
    if (tab === 'home' || tab === 'admin') {
      refreshFromDatabase();
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail) {
        handleSelectTab(customEv.detail);
      }
    };
    window.addEventListener('navigate-tab', handleNavEvent);
    return () => window.removeEventListener('navigate-tab', handleNavEvent);
  }, []);

  const handleAdminSuccess = () => {
    refreshFromDatabase();
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#051838] via-[#031028] to-[#020a1b] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300">
      {/* Global Initial Motion Loading Screen */}
      {isLoading && <InitialLoader onComplete={() => setIsLoading(false)} />}

      {/* Global Scroll Progress Bar */}
      <ScrollProgress />

      {/* Background cyber grid & glow */}
      <CyberBackground />

      {/* Main Sticky Navigation with Official Logo (hidden on full-screen stage timer page) */}
      {currentTab !== 'timer' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenAdminModal={() => setAdminModalOpen(true)}
        />
      )}

      {/* Primary Page Viewport with Staggered Fluid Transitions */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            variants={pageContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={currentTab === 'home' || currentTab === 'timer' ? '' : 'pt-24 sm:pt-28 lg:pt-32'}
          >
            <motion.div variants={pageChildVariants} className="w-full">
              {currentTab === 'home' && <HomePage onSelectTab={handleSelectTab} />}
              {currentTab === 'about' && (
                <AboutPage
                  targetRuleId={aboutTargetSection}
                  onRegisterClick={() => handleSelectTab('registration')}
                  onExploreClick={() => handleSelectTab('home')}
                  onOpenTimerPage={() => handleSelectTab('timer')}
                />
              )}
              {currentTab === 'timer' && (
                <DebateTimerPage onBack={() => handleSelectTab('home')} />
              )}
              {currentTab === 'registration' && (
                <RegistrationPage onGoHome={() => handleSelectTab('home')} />
              )}
              {currentTab === 'hall-of-fame' && <HallOfFamePage />}
              {currentTab === 'gallery' && <GalleryPage />}
              {currentTab === 'committee' && <CommitteePage />}
              {currentTab === 'contact' && <ContactPage />}
              {currentTab === 'admin' && (
                isAuthenticated ? <AdminDashboardPage /> : <HomePage onSelectTab={handleSelectTab} />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent University Footer (hidden on full-screen stage timer page) */}
      {currentTab !== 'timer' && <Footer onSelectTab={handleSelectTab} />}

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <TournamentProvider>
          <AppContent />
        </TournamentProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
