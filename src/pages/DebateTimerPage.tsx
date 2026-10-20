import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Bell,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DebateTimerPageProps {
  onBack: () => void;
}

type SpeechType = 'substantive' | 'reply';

export const DebateTimerPage: React.FC<DebateTimerPageProps> = ({ onBack }) => {
  const [speechType, setSpeechType] = useState<SpeechType>('substantive');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastBellFired, setLastBellFired] = useState<string | null>(null);
  const [bellFlashActive, setBellFlashActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [enable2MinSubBell, setEnable2MinSubBell] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const totalSpeechSeconds = speechType === 'substantive' ? 4 * 60 : 3 * 60;
  const gracePeriodSeconds = 20;

  // Initialize and unlock Web Audio API
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // High-clarity, loud tournament brass bell synthesizer for laptop stage speakers
  const playBellChime = (strikeCount: number = 1) => {
    setBellFlashActive(true);
    setTimeout(() => setBellFlashActive(false), 1800);

    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const strikeAtTime = (delaySec: number) => {
        const startTime = ctx.currentTime + delaySec;

        // Rich metallic brass bell partials (audible across a debate room on laptop speakers)
        const frequencies = [784, 1568, 2352, 3136, 3920];
        const gains = [0.65, 0.45, 0.25, 0.14, 0.08];

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(gains[idx], startTime + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 1.6);
        });
      };

      for (let i = 0; i < strikeCount; i++) {
        strikeAtTime(i * 0.34);
      }
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  };

  // Automatic rule-based bell triggers
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;

          if (speechType === 'substantive') {
            // 4-Minute Substantive Speech Official Rules
            if (next === 60) {
              playBellChime(1);
              setLastBellFired('1:00 Min — Single Bell (POIs Open)');
            } else if (next === 120 && enable2MinSubBell) {
              playBellChime(1);
              setLastBellFired('2:00 Min — Single Bell (Mid-Speech Checkpoint)');
            } else if (next === 180) {
              playBellChime(1);
              setLastBellFired('3:00 Min — Single Bell (1-Min Warning • POIs Closed)');
            } else if (next === 240) {
              playBellChime(2);
              setLastBellFired('4:00 Min — Double Bell (Official Time Limit Reached)');
            } else if (next === 260) {
              playBellChime(3);
              setLastBellFired('4:20+ Min — Continuous Bell (Overtime Penalty!)');
            } else if (next > 260 && (next - 260) % 5 === 0) {
              playBellChime(3);
              setLastBellFired('4:20+ Min — Continuous Bell (Overtime Penalty!)');
            }
          } else {
            // 3-Minute Reply Speech Official Rules
            if (next === 60) {
              playBellChime(1);
              setLastBellFired('1:00 Min — Single Bell (1st Minute Milestone)');
            } else if (next === 120) {
              playBellChime(1);
              setLastBellFired('2:00 Min — Single Bell (1-Min Warning Bell)');
            } else if (next === 180) {
              playBellChime(2);
              setLastBellFired('3:00 Min — Double Bell (Official Time Limit Reached)');
            } else if (next === 200) {
              playBellChime(3);
              setLastBellFired('3:20+ Min — Continuous Bell (Overtime Penalty!)');
            } else if (next > 200 && (next - 200) % 5 === 0) {
              playBellChime(3);
              setLastBellFired('3:20+ Min — Continuous Bell (Overtime Penalty!)');
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, speechType, soundEnabled, enable2MinSubBell]);

  // Keyboard shortcuts for effortless laptop operation (Space = Start/Stop, R = Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        getAudioContext();
        setIsRunning((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsRunning(false);
        setSecondsElapsed(0);
        setLastBellFired(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle not supported:', err);
    }
  };

  const handleStartStop = () => {
    getAudioContext();
    setIsRunning((prev) => !prev);
  };

  const handleResetOff = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    setLastBellFired(null);
    setBellFlashActive(false);
  };

  const handleSwitchSpeechType = (type: SpeechType) => {
    setSpeechType(type);
    setIsRunning(false);
    setSecondsElapsed(0);
    setLastBellFired(null);
    setBellFlashActive(false);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, totalSpeechSeconds - secondsElapsed);
  const isGracePeriod =
    secondsElapsed > totalSpeechSeconds &&
    secondsElapsed <= totalSpeechSeconds + gracePeriodSeconds;
  const isSevereOvertime = secondsElapsed > totalSpeechSeconds + gracePeriodSeconds;

  let phaseStatus = {
    title: 'PROTECTED TIME (NO POIs)',
    desc: 'Opening arguments phase. Points of Information (POIs) are strictly prohibited.',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
    ringColor: '#22d3ee',
    clockColor: 'text-white drop-shadow-[0_0_35px_rgba(34,211,238,0.45)]',
    icon: ShieldCheck,
  };

  if (speechType === 'substantive') {
    if (secondsElapsed < 60) {
      phaseStatus = {
        title: 'PROTECTED TIME (0:00 – 1:00 • NO POIs)',
        desc: 'Opening argument phase. Points of Information (POIs) are protected.',
        badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
        ringColor: '#22d3ee',
        clockColor: 'text-white drop-shadow-[0_0_35px_rgba(34,211,238,0.45)]',
        icon: ShieldCheck,
      };
    } else if (secondsElapsed >= 60 && secondsElapsed < 180) {
      phaseStatus = {
        title: 'FLOOR OPEN FOR POIs (1:00 – 3:00)',
        desc: '1st Bell sounded at 1:00. Opposing debaters may offer Points of Information.',
        badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60',
        ringColor: '#10b981',
        clockColor: 'text-emerald-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]',
        icon: CheckCircle2,
      };
    } else if (secondsElapsed >= 180 && secondsElapsed < 240) {
      phaseStatus = {
        title: 'WARNING: 1 MINUTE LEFT (3:00 – 4:00 • POIs CLOSED)',
        desc: 'Warning Bell sounded at 3:00. POIs are now closed — wrap up key arguments.',
        badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
        ringColor: '#fbbf24',
        clockColor: 'text-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.55)]',
        icon: AlertTriangle,
      };
    } else if (isGracePeriod) {
      phaseStatus = {
        title: 'TIME UP! 20s GRACE PERIOD (4:00 – 4:20)',
        desc: 'Double Bell sounded at 4:00! Conclude your final sentence immediately.',
        badgeClass: 'bg-rose-500/30 text-rose-200 border-rose-400 animate-pulse',
        ringColor: '#f43f5e',
        clockColor: 'text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.75)]',
        icon: Bell,
      };
    } else {
      phaseStatus = {
        title: 'OVERTIME PENALTY! (4:20+ CONTINUOUS BELL)',
        desc: 'Grace period exceeded! Continuous bell ringing — stop speaking immediately.',
        badgeClass: 'bg-rose-600/40 text-white border-rose-400 animate-pulse',
        ringColor: '#e11d48',
        clockColor: 'text-rose-500 animate-pulse drop-shadow-[0_0_50px_rgba(225,29,72,0.95)]',
        icon: AlertTriangle,
      };
    }
  } else {
    if (secondsElapsed < 60) {
      phaseStatus = {
        title: 'REPLY SPEECH OPENING (0:00 – 1:00 • NO POIs)',
        desc: 'Delivered by 1st or 2nd speaker only. No POIs allowed in Reply Speeches.',
        badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
        ringColor: '#22d3ee',
        clockColor: 'text-white drop-shadow-[0_0_35px_rgba(34,211,238,0.45)]',
        icon: Mic,
      };
    } else if (secondsElapsed >= 60 && secondsElapsed < 120) {
      phaseStatus = {
        title: 'REPLY COMPARATIVE PHASE (1:00 – 2:00 • NO POIs)',
        desc: '1:00 Milestone Bell sounded. Weigh both teams’ clashes for the adjudicators.',
        badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60',
        ringColor: '#10b981',
        clockColor: 'text-emerald-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]',
        icon: CheckCircle2,
      };
    } else if (secondsElapsed >= 120 && secondsElapsed < 180) {
      phaseStatus = {
        title: 'WARNING: 1 MINUTE LEFT (2:00 – 3:00)',
        desc: 'Warning Bell sounded at 2:00. Finalize your comparative summary.',
        badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
        ringColor: '#fbbf24',
        clockColor: 'text-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.55)]',
        icon: AlertTriangle,
      };
    } else if (isGracePeriod) {
      phaseStatus = {
        title: 'TIME UP! 20s GRACE PERIOD (3:00 – 3:20)',
        desc: 'Double Bell sounded at 3:00! Conclude your reply speech immediately.',
        badgeClass: 'bg-rose-500/30 text-rose-200 border-rose-400 animate-pulse',
        ringColor: '#f43f5e',
        clockColor: 'text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.75)]',
        icon: Bell,
      };
    } else {
      phaseStatus = {
        title: 'OVERTIME PENALTY! (3:20+ CONTINUOUS BELL)',
        desc: 'Reply speech exceeds grace period! Continuous bell ringing.',
        badgeClass: 'bg-rose-600/40 text-white border-rose-400 animate-pulse',
        ringColor: '#e11d48',
        clockColor: 'text-rose-500 animate-pulse drop-shadow-[0_0_50px_rgba(225,29,72,0.95)]',
        icon: AlertTriangle,
      };
    }
  }

  const PhaseIcon = phaseStatus.icon;

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#04122c] via-[#020b1c] to-[#010611] text-white px-4 sm:px-8 py-4 sm:py-6 select-none relative overflow-x-hidden overflow-y-auto"
    >
      {/* Visual Screen Flash when Bell Rings */}
      {bellFlashActive && (
        <div className="pointer-events-none fixed inset-0 z-50 border-[10px] sm:border-[16px] border-amber-400/80 bg-amber-400/10 animate-pulse" />
      )}

      {/* Top Stage Header Bar */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-500/25">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              onBack();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/35 text-cyan-200 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Home</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                TECH DEBATE 4.0 • STAGE PROJECTION CLOCK
              </span>
              <h1 className="font-display text-sm sm:text-base font-extrabold text-white">
                Official Automated Debate Timer & Bell System
              </h1>
            </div>
          </div>
        </div>

        {/* Speech Mode Selector (4 Mins Substantive vs 3 Mins Reply) */}
        <div className="flex items-center gap-2 bg-[#040f25] p-1.5 rounded-2xl border border-cyan-500/30">
          <button
            type="button"
            onClick={() => handleSwitchSpeechType('substantive')}
            className={`px-4 py-2 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              speechType === 'substantive'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>4 Mins (Substantive Speech)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchSpeechType('reply')}
            className={`px-4 py-2 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              speechType === 'reply'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3 Mins (Reply Speech)</span>
          </button>
        </div>

        {/* Right Utility Controls: Test Bell, Mute, Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              getAudioContext();
              playBellChime(1);
              setLastBellFired('Bell Sound Test — Single Bell (🔔)');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
            title="Test Bell Speaker Volume"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Test Bell</span>
          </button>

          <button
            type="button"
            onClick={() => {
              getAudioContext();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
            }`}
            title={soundEnabled ? 'Auto-Bells Audio ON' : 'Auto-Bells Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/35 text-cyan-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen for Laptop Stage Display"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Giant Stage Display Centerpiece */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto flex flex-col items-center justify-center my-5">
        <div className="w-full min-h-[66vh] sm:min-h-[72vh] rounded-[36px] sm:rounded-[48px] border-2 border-cyan-400/40 bg-[#051431]/90 backdrop-blur-2xl px-6 sm:px-14 py-12 sm:py-16 shadow-[0_0_110px_rgba(0,229,255,0.22)] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Top Progress Bar */}
          <div className="w-full max-w-5xl mb-8 sm:mb-10">
            <div className="relative w-full h-4 sm:h-5 rounded-full bg-slate-900 border border-cyan-500/35 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (secondsElapsed / totalSpeechSeconds) * 100)}%`,
                  backgroundColor: phaseStatus.ringColor,
                }}
              />
            </div>
          </div>

          {/* Current Speech Phase Status Pill */}
          <div
            className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl border text-sm sm:text-lg md:text-xl font-mono font-extrabold tracking-wider uppercase mb-5 ${phaseStatus.badgeClass}`}
          >
            <PhaseIcon className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
            <span>{phaseStatus.title}</span>
          </div>

          {/* GIANT STAGE CLOCK FOR LAPTOP & PODIUM */}
          <div className="flex flex-col sm:flex-row items-baseline justify-center gap-3 sm:gap-6 my-4 sm:my-6">
            <span
              className={`font-mono text-[6.5rem] sm:text-[11rem] md:text-[14.5rem] lg:text-[17rem] font-black tracking-tight tabular-nums leading-none ${phaseStatus.clockColor}`}
            >
              {formatTime(secondsElapsed)}
            </span>
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-bold text-slate-400 tabular-nums">
                / {formatTime(totalSpeechSeconds)}
              </span>
              <span className="font-mono text-xs sm:text-base text-cyan-300/90 uppercase tracking-widest mt-1.5">
                {secondsElapsed <= totalSpeechSeconds
                  ? `${formatTime(remainingSeconds)} Left`
                  : `+${formatTime(secondsElapsed - totalSpeechSeconds)} Overtime`}
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl font-sans font-medium mt-3">
            {phaseStatus.desc}
          </p>

          {/* Last Bell Fired Alert Banner */}
          {lastBellFired && (
            <div className="mt-6 py-3 px-7 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 text-sm sm:text-lg md:text-xl font-mono font-bold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(251,191,36,0.35)]">
              <Bell className="w-6 h-6 text-amber-300 animate-bounce shrink-0" />
              <span>{lastBellFired}</span>
            </div>
          )}
        </div>
      </div>

      {/* Simple START & OFF Controls Bar */}
      <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 pb-8">
        <button
          type="button"
          onClick={handleStartStop}
          className={`w-full sm:w-auto min-w-[260px] sm:min-w-[320px] py-5 px-10 rounded-2xl font-display text-lg sm:text-2xl font-black tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xl active:scale-95 ${
            isRunning
              ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/35'
              : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white shadow-cyan-500/35'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-6 h-6 fill-current" />
              <span>OFF / STOP TIMER</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>{secondsElapsed > 0 ? 'RESUME TIMER' : 'START TIMER'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleResetOff}
          className="w-full sm:w-auto py-5 px-8 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset (00:00)</span>
        </button>
      </div>

      {/* Automated Bell Schedule Milestones Row (Below the fold - requires scroll to view) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto mt-10 pt-8 pb-10 border-t border-cyan-500/20 text-center">
        <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-3">
          AUTOMATIC BELL SCHEDULE (RINGS AUTOMATICALLY BY RULES)
        </div>

        {speechType === 'substantive' ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-left">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 60
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-cyan-300">
                <span>01:00 Min</span>
                <span>🔔 1 Bell</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">POIs Open</div>
              <div className="text-[10px] text-slate-400">Auto Single Bell</div>
            </div>

            <button
              type="button"
              onClick={() => setEnable2MinSubBell((v) => !v)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                enable2MinSubBell
                  ? secondsElapsed >= 120
                    ? 'bg-cyan-500/25 border-cyan-400 text-white'
                    : 'bg-cyan-950/60 border-cyan-400/50 text-cyan-200'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
              title="Click to enable/disable optional 2:00 Min checkpoint bell"
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold">
                <span>02:00 Min</span>
                <span>{enable2MinSubBell ? '🔔 1 Bell ON' : 'Optional'}</span>
              </div>
              <div className="text-xs font-semibold mt-1">Halfway Mark</div>
              <div className="text-[10px] opacity-80">
                {enable2MinSubBell ? 'Auto Bell Active' : 'Click to enable bell'}
              </div>
            </button>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 180
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-amber-300">
                <span>03:00 Min</span>
                <span>🔔 1 Bell</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">Warning (POIs Close)</div>
              <div className="text-[10px] text-slate-400">Auto Single Bell</div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 240
                  ? 'bg-rose-500/25 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-rose-300">
                <span>04:00 Min</span>
                <span>🔔🔔 2 Bells</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">Time Limit Reached</div>
              <div className="text-[10px] text-slate-400">Auto Double Bell</div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
                secondsElapsed >= 260
                  ? 'bg-rose-600/35 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-rose-400">
                <span>04:20+ Min</span>
                <span>🔔🔔🔔 Auto</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">Overtime Penalty</div>
              <div className="text-[10px] text-slate-400">Continuous Bell</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 60
                  ? 'bg-emerald-500/20 border-emerald-400 text-white'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-cyan-300">
                <span>01:00 Min</span>
                <span>🔔 1 Bell</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">1st Minute Mark</div>
              <div className="text-[10px] text-slate-400">Auto Single Bell</div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 120
                  ? 'bg-amber-500/20 border-amber-400 text-white'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-amber-300">
                <span>02:00 Min</span>
                <span>🔔 1 Bell</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">1-Min Warning Bell</div>
              <div className="text-[10px] text-slate-400">Auto Single Bell</div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 180
                  ? 'bg-rose-500/25 border-rose-400 text-white'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-rose-300">
                <span>03:00 Min</span>
                <span>🔔🔔 2 Bells</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">Time Limit Reached</div>
              <div className="text-[10px] text-slate-400">Auto Double Bell</div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                secondsElapsed >= 200
                  ? 'bg-rose-600/35 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-rose-400">
                <span>03:20+ Min</span>
                <span>🔔🔔🔔 Auto</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">Overtime Penalty</div>
              <div className="text-[10px] text-slate-400">Continuous Bell</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
