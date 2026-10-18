import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Brain, 
  Users, 
  Award, 
  Sparkles, 
  Eye, 
  Target, 
  Mic, 
  Trophy, 
  Compass, 
  Briefcase, 
  Network,
  Globe,
  Scale,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Layers,
  ChevronDown,
  BookOpen,
  Zap,
  Bell,
  Play
} from 'lucide-react';
import { DebateTimerModal } from '../components/common/DebateTimerModal';

interface AboutPageProps {
  targetRuleId?: string;
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ 
  targetRuleId,
  onRegisterClick = () => window.location.hash = 'registration',
  onExploreClick = () => window.location.hash = 'home'
}) => {
  const [selectedRuleTab, setSelectedRuleTab] = useState<string>(targetRuleId || 'all');
  const [highlightedCard, setHighlightedCard] = useState<string | null>(targetRuleId || null);
  const [expandedSection, setExpandedSection] = useState<string | null>(targetRuleId || null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (targetRuleId) {
      setSelectedRuleTab(targetRuleId);
      setHighlightedCard(targetRuleId);
      setExpandedSection(targetRuleId);
      
      const timer = setTimeout(() => {
        const el = document.getElementById(`rule-${targetRuleId}`) || document.getElementById('tournament-rules-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 180);

      const clearHighlight = setTimeout(() => {
        setHighlightedCard(null);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearHighlight);
      };
    }
  }, [targetRuleId]);

  const heroPillars = [
    { title: 'Critical Thinking', desc: 'Analytical mindset & argument breakdown', icon: Brain },
    { title: 'Community', desc: 'Connect with 200+ passionate tech debaters', icon: Users },
    { title: 'Leadership', desc: 'Public speaking & persuasive discourse', icon: Award },
    { title: 'Real Impact', desc: 'Drive technology & society conversations', icon: Sparkles },
  ];

  const missionList = [
    { title: 'Intellectual Rigor', desc: 'Deep dive into tech ethics and policy', icon: Brain },
    { title: 'Open Dialogue', desc: 'Constructive debate across perspectives', icon: Users },
    { title: 'Leadership Training', desc: 'Empower student voices and advocates', icon: Award },
    { title: 'Academic Excellence', desc: 'Dept. of CSE, Varendra University flagship event', icon: ShieldCheck },
  ];

  const storyStats = [
    { value: '4th', label: 'Annual Edition', icon: Trophy },
    { value: '200+', label: 'Debaters', icon: Users },
    { value: '50+', label: 'Batch Teams', icon: Network },
    { value: '1', label: 'Grand Champion', icon: Compass },
  ];

  const whyCards = [
    {
      title: 'Real-World Tech Issues',
      desc: 'Debate cutting-edge topics in AI, cybersecurity, software ethics, and modern society.',
      icon: Brain,
      badge: 'Curated Motions'
    },
    {
      title: 'Batch Rivalry & Unity',
      desc: 'Represent your academic batch from CSE Dept. while building lasting collegiate friendships.',
      icon: Users,
      badge: 'Inter-Batch'
    },
    {
      title: 'Faculty Adjudication',
      desc: 'Evaluated by experienced debaters, faculty adjudicators, and distinguished alumni.',
      icon: Trophy,
      badge: 'Expert Feedback'
    },
    {
      title: 'Professional Networking',
      desc: 'Connect with peers, alumni mentors, and leaders across academia and industry.',
      icon: Network,
      badge: 'Networking'
    },
    {
      title: 'Career Advancement',
      desc: 'Sharpen articulation, quick reasoning, and confidence highly valued by top employers.',
      icon: Briefcase,
      badge: 'Skill Boost'
    },
    {
      title: 'Official Recognition',
      desc: 'Win prestigious trophies, crests, certificates, and recognition in CSE Hall of Fame.',
      icon: Award,
      badge: 'Prizes & Honor'
    }
  ];

  const ruleTabs = [
    { id: 'format', label: 'Debate Format', icon: Scale },
    { id: 'team', label: 'Squad & Members', icon: Users },
    { id: 'timings', label: 'Time & Bells', icon: Clock },
    { id: 'judging', label: 'Judging Rubric', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
      
      {/* 1. HERO SECTION - Clean, High Impact Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1d42] via-[#0a1633] to-[#071026] border border-cyan-500/20 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider max-w-full">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Tech Debate 4.0 • Dept. of CSE</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Where Ideas Collide & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                Future Leaders Emerge
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-2xl">
              Tech Debate 4.0 is Department of CSE, Varendra University, Rajshahi's flagship parliamentary debate tournament. 
              We bring together brilliant minds, structured arguments, and critical thinking to address the most pressing technological, ethical, and societal challenges.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Register Team Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('tournament-rules-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Read Official Rules</span>
              </button>
            </div>
          </motion.div>

          {/* Right Visual Highlight Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-cyan-500/30 bg-[#091530]/90 p-6 shadow-xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                  Tournament Overview
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold border border-cyan-400/30">
                  3v3 Asian Parliamentary
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0e214d] border border-cyan-500/20">
                  <div className="text-slate-400 font-mono text-[11px] mb-1">Format</div>
                  <div className="font-bold text-white text-sm">3 vs 3 AP Debate</div>
                  <div className="text-cyan-300/80 text-[11px] mt-0.5">Gov vs Opp</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e214d] border border-cyan-500/20">
                  <div className="text-slate-400 font-mono text-[11px] mb-1">Speeches</div>
                  <div className="font-bold text-white text-sm">4 Mins + 3m Reply</div>
                  <div className="text-cyan-300/80 text-[11px] mt-0.5">Timed Bells</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e214d] border border-cyan-500/20">
                  <div className="text-slate-400 font-mono text-[11px] mb-1">Eligibility</div>
                  <div className="font-bold text-white text-sm">CSE Undergraduates</div>
                  <div className="text-cyan-300/80 text-[11px] mt-0.5">Batch Teams</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e214d] border border-cyan-500/20">
                  <div className="text-slate-400 font-mono text-[11px] mb-1">Evaluation</div>
                  <div className="font-bold text-white text-sm">Matter, Manner, Method</div>
                  <div className="text-cyan-300/80 text-[11px] mt-0.5">40% / 40% / 20%</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Grand Trophy + Crests + Certificates</span>
                  </div>
                  <span className="text-cyan-300 font-bold font-mono">Edition 4</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Hero Pillars Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-cyan-500/15">
          {heroPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl clay-tab select-none">
                <div className="p-2 rounded-lg clay-badge text-cyan-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. VISION & MISSION - Balanced 2-Column Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
            OUR PURPOSE & DRIVING FORCES
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Vision & Mission
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Building a culture of intellectual inquiry, debate excellence, and technological leadership.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Our Vision Card */}
          <div className="rounded-3xl clay-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group select-none">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full clay-badge text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>OUR VISION</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                A Platform for Student Change-Makers
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                To create a vibrant academic ecosystem where computer science students engage in structured, high-stakes dialogue — challenging perspectives and transforming complex tech concepts into actionable societal progress.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-cyan-500/20 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl clay-tab space-y-1">
                <span className="text-cyan-400 font-bold block">Impact</span>
                <span className="text-slate-300">Fostering deep analytical problem solving</span>
              </div>
              <div className="p-3.5 rounded-xl clay-tab space-y-1">
                <span className="text-cyan-400 font-bold block">Future</span>
                <span className="text-slate-300">Preparing leaders for global tech challenges</span>
              </div>
            </div>
          </div>

          {/* Our Mission Card */}
          <div className="rounded-3xl clay-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group select-none">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full clay-badge text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>OUR MISSION</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Empower Minds, Cultivate Leadership
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                We empower students by providing world-class parliamentary debate training, structured competition, and constructive mentorship to turn ideas into impactful communication.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {missionList.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl clay-tab text-xs min-w-0">
                    <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">{m.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 3. OFFICIAL TOURNAMENT HANDBOOK - Clean Interactive Explorer */}
      <section 
        id="tournament-rules-section" 
        className="rounded-3xl clay-panel p-6 sm:p-10 relative overflow-hidden space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cyan-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-badge text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>TOURNAMENT HANDBOOK</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rules & Regulations
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-sans max-w-xl">
              Official specifications for Asian Parliamentary debate format, squad eligibility, time allocation, and judging criteria.
            </p>
          </div>

          <button
            onClick={onRegisterClick}
            className="clay-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>Register Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {ruleTabs.map((tab) => {
            const isSelected = selectedRuleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRuleTab(tab.id)}
                className={`
                  px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 select-none
                  ${isSelected 
                    ? 'clay-tab-active text-cyan-200' 
                    : 'clay-tab text-slate-300 hover:text-white'
                  }
                `}
              >
                {tab.icon && React.createElement(tab.icon, { className: 'w-3.5 h-3.5 text-cyan-400' })}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Rule Cards Grid */}
        <div className="space-y-4">

          {/* CARD 1: Parliamentary Debate Format */}
          {(selectedRuleTab === 'all' || selectedRuleTab === 'format') && (
            <motion.div
              id="rule-format"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl transition-all p-5 sm:p-6 select-none
                ${highlightedCard === 'format'
                  ? 'clay-card-glow'
                  : 'clay-card'
                }
              `}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'format' ? null : 'format')}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white">
                      Asian Parliamentary Format (3 vs 3)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Government (Proposition) vs Opposition (Negative)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-mono font-semibold border border-cyan-500/20">
                    Standard Rules
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'format' ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>
              </div>

              {/* Expandable Content */}
              <AnimatePresence>
                {(expandedSection === 'format' || selectedRuleTab === 'format' || selectedRuleTab === 'all') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 pt-4 border-t border-slate-800 space-y-4"
                  >
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      The championship follows standard <strong>Asian Parliamentary (AP) debate rules</strong>, pitting two 3-member teams against each other on complex policy and philosophical motions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CARD 2: Squad & Team Rules */}
          {(selectedRuleTab === 'all' || selectedRuleTab === 'team') && (
            <motion.div
              id="rule-team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl transition-all p-5 sm:p-6 select-none
                ${highlightedCard === 'team'
                  ? 'clay-card-glow'
                  : 'clay-card'
                }
              `}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'team' ? null : 'team')}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white">
                      Squad Roster & Academic Eligibility
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Department of Computer Science & Engineering (CSE)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-mono font-semibold border border-cyan-500/20">
                    3 Members
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'team' ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {(expandedSection === 'team' || selectedRuleTab === 'team' || selectedRuleTab === 'all') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 pt-4 border-t border-slate-800 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-bold text-cyan-300">Squad Roster</div>
                        <p className="text-slate-300 leading-relaxed">
                          3 active speakers + 1 optional registered substitute debater.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-bold text-cyan-300">CSE Department Eligibility</div>
                        <p className="text-slate-300 leading-relaxed">
                          Open to registered undergraduate students of CSE, Varendra University, Rajshahi.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-bold text-cyan-300">Reply Speech Rule</div>
                        <p className="text-slate-300 leading-relaxed">
                          Delivered by 1st or 2nd speaker only. 3rd speaker (Whip) is ineligible.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CARD 3: Time Limits & Bells */}
          {(selectedRuleTab === 'all' || selectedRuleTab === 'timings') && (
            <motion.div
              id="rule-timings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl transition-all p-5 sm:p-6 select-none
                ${highlightedCard === 'timings'
                  ? 'clay-card-glow'
                  : 'clay-card'
                }
              `}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'timings' ? null : 'timings')}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white">
                      Speech Time Allocations & Timed Bells
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Substantive Speeches: 4 Mins | Reply Speeches: 3 Mins | Timed Bells
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-mono font-semibold border border-cyan-500/20">
                    Timed Bells
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'timings' ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {(expandedSection === 'timings' || selectedRuleTab === 'timings' || selectedRuleTab === 'all') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 pt-4 border-t border-slate-800 space-y-5"
                  >
                    {/* 4 Mins Substantive Speeches */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-cyan-400" />
                          <span>1. Substantive Speeches (4 Minutes)</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Gov & Opp (All 6 Speakers)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-cyan-400 font-bold">1:00 Min</div>
                          <div className="text-white font-semibold mt-0.5">Single Bell (1st Bell)</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Floor open for POIs</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-cyan-400 font-bold">3:00 Min</div>
                          <div className="text-white font-semibold mt-0.5">Single Bell (Warning Bell)</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">POIs close; 1-min warning</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-amber-400 font-bold">4:00 Min</div>
                          <div className="text-white font-semibold mt-0.5">Double Bell (Final Bell)</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Time limit; 20s grace period</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-red-400 font-bold">4:20+ Min</div>
                          <div className="text-white font-semibold mt-0.5">Continuous Bell</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Overtime penalty applies</p>
                        </div>
                      </div>
                    </div>

                    {/* 3 Mins Reply Speeches */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>2. Reply Speeches (3 Minutes)</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">1st or 2nd Speaker Only (No POIs)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-cyan-400 font-bold">2:00 Min</div>
                          <div className="text-white font-semibold mt-0.5">Single Bell (Warning Bell)</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">1-min warning to conclude</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="font-mono text-amber-400 font-bold">3:00 Min</div>
                          <div className="text-white font-semibold mt-0.5">Double Bell (Final Bell)</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Time limit; conclude remarks</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                          <div className="font-mono text-red-400 font-bold">3:20+ Min</div>
                          <div className="text-white font-semibold mt-0.5">Continuous Bell</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Overtime penalty applies</p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Timer CTA */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Official Timed Bells Adjudication Clock</span>
                          <span className="text-[11px] text-slate-400">Realistic sound synthesizer for 4m & 3m timed bells</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsTimerModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Debate Timer</span>
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CARD 4: Judging Criteria */}
          {(selectedRuleTab === 'all' || selectedRuleTab === 'judging') && (
            <motion.div
              id="rule-judging"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl transition-all p-5 sm:p-6 select-none
                ${highlightedCard === 'judging'
                  ? 'clay-card-glow'
                  : 'clay-card'
                }
              `}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'judging' ? null : 'judging')}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl clay-badge flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white">
                      Adjudication Rubric & Scoring Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Matter (40%) • Manner (40%) • Method (20%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full clay-badge text-cyan-300 text-[11px] font-mono font-semibold">
                    Official Rubric
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'judging' ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {(expandedSection === 'judging' || selectedRuleTab === 'judging' || selectedRuleTab === 'all') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 pt-4 border-t border-cyan-500/20 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl clay-tab space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-cyan-300">Matter</span>
                          <span className="px-2 py-0.5 rounded-lg clay-badge text-cyan-300 font-mono font-bold">40%</span>
                        </div>
                        <p className="text-slate-300">Logic, causality, evidence, real-world examples, and rebuttal quality.</p>
                      </div>

                      <div className="p-4 rounded-xl clay-tab space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-cyan-300">Manner</span>
                          <span className="px-2 py-0.5 rounded-lg clay-badge text-cyan-300 font-mono font-bold">40%</span>
                        </div>
                        <p className="text-slate-300">Vocal modulation, persuasive poise, rhetorical delivery, and POI handling.</p>
                      </div>

                      <div className="p-4 rounded-xl clay-tab space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-cyan-300">Method</span>
                          <span className="px-2 py-0.5 rounded-lg clay-badge text-cyan-300 font-mono font-bold">20%</span>
                        </div>
                        <p className="text-slate-300">Structure, roadmap, time allocation, and team consistency.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </section>

      {/* 4. OUR STORY & MILESTONES - Clean Impact Narrative */}
      <section className="rounded-3xl clay-panel p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block">
              OUR JOURNEY & LEGACY
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              From an Initiative to a Grand Stage
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              What began as a small departmental debate session has grown into Varendra University's most celebrated annual parliamentary debate tournament. 
              Tech Debate 4.0 carries forward this rich legacy — inspiring critical thinking, public speaking mastery, and collaborative spirit.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {storyStats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl clay-tab text-center select-none">
                    <Icon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <div className="font-display text-lg font-extrabold text-white leading-tight">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="p-6 rounded-2xl clay-card text-center space-y-3 max-w-sm w-full select-none">
              <div className="w-12 h-12 rounded-full clay-badge text-cyan-300 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <blockquote className="text-sm font-serif italic text-cyan-200">
                "Better Arguments. Brighter Future."
              </blockquote>
              <p className="text-xs text-slate-400">
                Empowering the next generation of computer scientists and articulators.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. WHY TECH DEBATE? - Balanced Responsive Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
            BENEFITS & EXPERIENCE
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Why Participate in Tech Debate 4.0?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            More than a trophy — a transformative experience for every participant.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div 
                key={i} 
                className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-[#0a1633] hover:border-cyan-500/40 transition-all group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-cyan-300 border border-slate-800">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER - Sleek Final CTA */}
      <section className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-[#0c2254] via-[#09173b] to-[#060e24] p-8 sm:p-12 shadow-2xl overflow-hidden text-center sm:text-left">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block">
            READY TO TAKE THE STAGE?
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Your Voice. Your Batch. <span className="text-cyan-400">Our Platform.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Form your 3-member team, pick your batch representation, and register for Tech Debate 4.0 today.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            <button
              onClick={onRegisterClick}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Register Your Team</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Debate Timer Modal */}
      <DebateTimerModal 
        isOpen={isTimerModalOpen} 
        onClose={() => setIsTimerModalOpen(false)} 
      />

    </div>
  );
};
