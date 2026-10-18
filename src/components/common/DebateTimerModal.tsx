import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
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
  Plus,
  Minus
} from 'lucide-react';

interface DebateTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SpeechType = 'substantive' | 'reply';

export const DebateTimerModal: React.FC<DebateTimerModalProps> = ({ isOpen, onClose }) => {
  const [speechType, setSpeechType] = useState<SpeechType>('substantive');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastBellFired, setLastBellFired] = useState<string | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalSpeechSeconds = speechType === 'substantive' ? 4 * 60 : 3 * 60; // 4 mins or 3 mins
  const gracePeriodSeconds = 20;

  // Initialize Web Audio API
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

  // Synthesize realistic brass tournament debate bell
  const playBellChime = (strikeCount: number = 1) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const strikeAtTime = (delaySec: number) => {
        const startTime = ctx.currentTime + delaySec;
        
        // Fundamental and bright partial frequencies of a tournament bell
        const frequencies = [880, 1760, 2640, 3520];
        const gains = [0.4, 0.25, 0.12, 0.06];

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          // Attack and exponential decay
          gain.gain.setValueAtTime(gains[idx], startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 1.25);
        });
      };

      for (let i = 0; i < strikeCount; i++) {
        strikeAtTime(i * 0.3);
      }
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  };

  // Timer interval loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const next = prev + 1;

          // Check timed bells triggers for Substantive Speech (4 Mins)
          if (speechType === 'substantive') {
            if (next === 60) {
              // 1:00 Single Bell - POIs open
              playBellChime(1);
              setLastBellFired('1:00 Min — Single Bell (POIs Open)');
            } else if (next === 180) {
              // 3:00 Single Bell - POIs close / 1m warning
              playBellChime(1);
              setLastBellFired('3:00 Min — Single Bell (POIs Closed, 1m Warning)');
            } else if (next === 240) {
              // 4:00 Double Bell - Time Limit Reached
              playBellChime(2);
              setLastBellFired('4:00 Min — Double Bell (Time Limit Reached)');
            } else if (next === 260) {
              // 4:20 Continuous Overtime Bell
              playBellChime(3);
              setLastBellFired('4:20+ Min — Continuous Bell (Overtime Penalty)');
            }
          }

          // Check timed bells triggers for Reply Speech (3 Mins)
          if (speechType === 'reply') {
            if (next === 120) {
              // 2:00 Single Bell - 1m warning
              playBellChime(1);
              setLastBellFired('2:00 Min — Single Bell (1m Warning)');
            } else if (next === 180) {
              // 3:00 Double Bell - Time Limit Reached
              playBellChime(2);
              setLastBellFired('3:00 Min — Double Bell (Time Limit Reached)');
            } else if (next === 200) {
              // 3:20 Continuous Overtime Bell
              playBellChime(3);
              setLastBellFired('3:20+ Min — Continuous Bell (Overtime Penalty)');
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, speechType, soundEnabled]);

  const handleStartPause = () => {
    getAudioContext(); // Ensure AudioContext unlocked by user gesture
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    setLastBellFired(null);
  };

  const handleAdjustSeconds = (delta: number) => {
    setSecondsElapsed(prev => Math.max(0, prev + delta));
  };

  const handleSwitchSpeechType = (type: SpeechType) => {
    setSpeechType(type);
    setIsRunning(false);
    setSecondsElapsed(0);
    setLastBellFired(null);
  };

  // Helper formatting
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, totalSpeechSeconds - secondsElapsed);
  const isOvertime = secondsElapsed > totalSpeechSeconds;
  const isGracePeriod = secondsElapsed > totalSpeechSeconds && secondsElapsed <= totalSpeechSeconds + gracePeriodSeconds;
  const isSevereOvertime = secondsElapsed > totalSpeechSeconds + gracePeriodSeconds;

  // Phase calculation
  let phaseStatus = {
    title: 'Protected Time',
    desc: 'Opening arguments. Points of Information (POIs) not allowed.',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    ringColor: '#00e5ff',
    icon: ShieldCheck
  };

  if (speechType === 'substantive') {
    if (secondsElapsed < 60) {
      phaseStatus = {
        title: 'Protected Time (0:00 – 1:00)',
        desc: 'Opening argument phase. POIs are protected and strictly prohibited.',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        ringColor: '#00e5ff',
        icon: ShieldCheck
      };
    } else if (secondsElapsed >= 60 && secondsElapsed < 180) {
      phaseStatus = {
        title: 'Floor Open for POIs (1:00 – 3:00)',
        desc: 'Opposing bench may rise and offer Points of Information.',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
        ringColor: '#10b981',
        icon: CheckCircle2
      };
    } else if (secondsElapsed >= 180 && secondsElapsed < 240) {
      phaseStatus = {
        title: '1-Min Warning / Concluding (3:00 – 4:00)',
        desc: 'POIs closed. Conclude team substantives and summarize key clashes.',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
        ringColor: '#fbbf24',
        icon: AlertTriangle
      };
    } else if (isGracePeriod) {
      phaseStatus = {
        title: 'Time Limit (4:00 – 4:20 Grace)',
        desc: 'Double bell sounded. Wrap up concluding sentence immediately.',
        badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-400/50 animate-pulse',
        ringColor: '#f43f5e',
        icon: Bell
      };
    } else {
      phaseStatus = {
        title: 'Overtime Penalty (4:20+)',
        desc: 'Speech exceeds allowable grace period. Adjudicator penalty applies.',
        badgeClass: 'bg-rose-600/30 text-rose-200 border-rose-500 animate-pulse',
        ringColor: '#e11d48',
        icon: AlertTriangle
      };
    }
  } else {
    // Reply speech
    if (secondsElapsed < 120) {
      phaseStatus = {
        title: 'Reply Comparative (0:00 – 2:00)',
        desc: 'Delivered by 1st or 2nd speaker only. No POIs allowed in reply speeches.',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        ringColor: '#00e5ff',
        icon: Mic
      };
    } else if (secondsElapsed >= 120 && secondsElapsed < 180) {
      phaseStatus = {
        title: '1-Min Warning (2:00 – 3:00)',
        desc: 'Single bell sounded. Finalize team comparative and holistic adjudication picture.',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
        ringColor: '#fbbf24',
        icon: AlertTriangle
      };
    } else if (isGracePeriod) {
      phaseStatus = {
        title: 'Time Limit (3:00 – 3:20 Grace)',
        desc: 'Double bell sounded. Conclude reply speech immediately.',
        badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-400/50 animate-pulse',
        ringColor: '#f43f5e',
        icon: Bell
      };
    } else {
      phaseStatus = {
        title: 'Overtime Penalty (3:20+)',
        desc: 'Reply speech exceeds allowable duration. Incurring overtime deduction.',
        badgeClass: 'bg-rose-600/30 text-rose-200 border-rose-500 animate-pulse',
        ringColor: '#e11d48',
        icon: AlertTriangle
      };
    }
  }

  const PhaseIcon = phaseStatus.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-cyan-400/40 bg-gradient-to-b from-[#0a1838] via-[#07132e] to-[#040c1d] p-5 sm:p-7 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-center space-y-5 overflow-hidden">
        
        {/* Background ambient accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                OFFICIAL DEBATE TIMER & TIMED BELLS
              </span>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-white">
                Tech Debate 4.0 Adjudication Clock
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Mute/Unmute */}
            <button
              onClick={() => {
                getAudioContext();
                setSoundEnabled(!soundEnabled);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Bells Sound Enabled (Click to Mute)' : 'Bells Sound Muted (Click to Unmute)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Speech Mode Selector (4 Mins Substantive vs 3 Mins Reply) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#040e24] border border-cyan-500/20">
          <button
            type="button"
            onClick={() => handleSwitchSpeechType('substantive')}
            className={`py-2 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              speechType === 'substantive'
                ? 'bg-cyan-500/25 border border-cyan-400 text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>4 Mins (Substantive)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchSpeechType('reply')}
            className={`py-2 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              speechType === 'reply'
                ? 'bg-cyan-500/25 border border-cyan-400 text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3 Mins (Reply Speech)</span>
          </button>
        </div>

        {/* Live Main Time Display */}
        <div className="relative py-4 px-6 rounded-3xl bg-[#06122b]/90 border border-cyan-500/30 shadow-inner flex flex-col items-center justify-center space-y-2">
          
          {/* Phase Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold tracking-wider ${phaseStatus.badgeClass}`}>
            <PhaseIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{phaseStatus.title}</span>
          </div>

          {/* Big Digital Clock */}
          <div className="flex items-baseline justify-center gap-2 select-none">
            <span className={`font-mono text-5xl sm:text-7xl font-black tracking-tight tabular-nums ${
              isSevereOvertime 
                ? 'text-rose-500 animate-pulse drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]' 
                : isGracePeriod 
                ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                : 'text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]'
            }`}>
              {formatTime(secondsElapsed)}
            </span>
            <span className="font-mono text-xs sm:text-sm text-slate-400 uppercase">
              / {formatTime(totalSpeechSeconds)}
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-sm font-sans">
            {phaseStatus.desc}
          </p>

          {/* Bell Cue Milestone Visual Track */}
          <div className="w-full pt-3">
            <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (secondsElapsed / totalSpeechSeconds) * 100)}%`,
                  backgroundColor: phaseStatus.ringColor
                }}
              />
            </div>

            {/* Bell points along the track */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1.5 px-0.5">
              <span>0:00</span>
              {speechType === 'substantive' ? (
                <>
                  <span className={secondsElapsed >= 60 ? 'text-cyan-400 font-bold' : ''}>1:00 (🔔 1)</span>
                  <span className={secondsElapsed >= 180 ? 'text-amber-400 font-bold' : ''}>3:00 (🔔 1)</span>
                  <span className={secondsElapsed >= 240 ? 'text-rose-400 font-bold' : ''}>4:00 (🔔🔔 2)</span>
                </>
              ) : (
                <>
                  <span className={secondsElapsed >= 120 ? 'text-amber-400 font-bold' : ''}>2:00 (🔔 1)</span>
                  <span className={secondsElapsed >= 180 ? 'text-rose-400 font-bold' : ''}>3:00 (🔔🔔 2)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Last Bell Alert Banner */}
        {lastBellFired && (
          <div className="py-2 px-3 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
            <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{lastBellFired}</span>
          </div>
        )}

        {/* Main Controls: Play/Pause, Reset, Adjust */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleAdjustSeconds(-15)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Subtract 15 seconds"
          >
            <Minus className="w-4 h-4" />
            <span>15s</span>
          </button>

          <button
            type="button"
            onClick={handleStartPause}
            className={`min-w-[150px] sm:min-w-[170px] py-3.5 px-6 rounded-2xl font-display text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>{secondsElapsed > 0 ? 'Resume' : 'Start Speech'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleAdjustSeconds(15)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Add 15 seconds"
          >
            <Plus className="w-4 h-4" />
            <span>15s</span>
          </button>
        </div>

        {/* Manual Bell Sound Triggers (For Adjudicator / Timekeeper) */}
        <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="font-mono text-slate-400 text-[11px]">
            Manual Bells:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                getAudioContext();
                playBellChime(1);
                setLastBellFired('Manual Strike — Single Bell');
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-mono font-bold cursor-pointer transition-all flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ring 1 Bell</span>
            </button>

            <button
              type="button"
              onClick={() => {
                getAudioContext();
                playBellChime(2);
                setLastBellFired('Manual Strike — Double Bell');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-mono font-bold cursor-pointer transition-all flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ring 2 Bells</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
