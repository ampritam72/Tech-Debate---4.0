import React, { useState, useEffect } from 'react';
import {
  Power,
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import {
  DEFAULT_PORTAL_SETTINGS,
  PortalSettings,
  TimelineStageItem,
  usePortalSettings,
  savePortalSettingsClient,
  formatCloseDateLabelsFromDate,
} from '../../config/portalSettings';

interface RegistrationControlSectionProps {
  compact?: boolean;
  onOpenFullSettings?: () => void;
}

export const RegistrationControlSection: React.FC<RegistrationControlSectionProps> = ({
  compact = false,
  onOpenFullSettings,
}) => {
  const liveSettings = usePortalSettings();

  const [formState, setFormState] = useState<PortalSettings>({
    isRegistrationOpen: liveSettings.rawIsRegistrationOpen,
    autoCloseEnabled: liveSettings.autoCloseEnabled !== false,
    registrationOpenDateLabel: liveSettings.registrationOpenDateLabel,
    registrationCloseDateIso: liveSettings.registrationCloseDateIso,
    registrationCloseDateLabel: liveSettings.registrationCloseDateLabel,
    registrationCloseTimeLabel: liveSettings.registrationCloseTimeLabel,
    kitDistributionDateLabel: liveSettings.kitDistributionDateLabel,
    playoffStartDateLabel: liveSettings.playoffStartDateLabel,
    registrationFeeBdt: liveSettings.registrationFeeBdt,
    mfsNumber: liveSettings.mfsNumber,
    timelineStages: liveSettings.timelineStages,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState({
      isRegistrationOpen: liveSettings.rawIsRegistrationOpen,
      autoCloseEnabled: liveSettings.autoCloseEnabled !== false,
      registrationOpenDateLabel: liveSettings.registrationOpenDateLabel,
      registrationCloseDateIso: liveSettings.registrationCloseDateIso,
      registrationCloseDateLabel: liveSettings.registrationCloseDateLabel,
      registrationCloseTimeLabel: liveSettings.registrationCloseTimeLabel,
      kitDistributionDateLabel: liveSettings.kitDistributionDateLabel,
      playoffStartDateLabel: liveSettings.playoffStartDateLabel,
      registrationFeeBdt: liveSettings.registrationFeeBdt,
      mfsNumber: liveSettings.mfsNumber,
      timelineStages: liveSettings.timelineStages,
    });
  }, [
    liveSettings.rawIsRegistrationOpen,
    liveSettings.autoCloseEnabled,
    liveSettings.registrationOpenDateLabel,
    liveSettings.registrationCloseDateIso,
    liveSettings.registrationCloseDateLabel,
    liveSettings.registrationCloseTimeLabel,
    liveSettings.kitDistributionDateLabel,
    liveSettings.playoffStartDateLabel,
    liveSettings.registrationFeeBdt,
    liveSettings.mfsNumber,
    liveSettings.timelineStages,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const saveSettingsToBackend = async (nextSettings: PortalSettings, customSuccessMsg?: string) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await savePortalSettingsClient(nextSettings);
      setFormState(saved);
      showToast(customSuccessMsg || 'Registration status & auto-close timestamp saved!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update registration settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRegistrationStatus = async (openState: boolean) => {
    let nextCloseIso = formState.registrationCloseDateIso;
    let nextCloseDateLabel = formState.registrationCloseDateLabel;
    let nextCloseTimeLabel = formState.registrationCloseTimeLabel;
    let bumpedFutureNote = '';

    // If Admin turns Registration ON while the auto-close timestamp is in the past,
    // advance the default auto-close timestamp to 7 days from now at 11:59 PM so it opens immediately.
    if (openState && formState.autoCloseEnabled !== false) {
      const currentCloseMs = new Date(nextCloseIso).getTime();
      if (isNaN(currentCloseMs) || currentCloseMs <= Date.now()) {
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        futureDate.setHours(23, 59, 0, 0);
        const formatted = formatCloseDateLabelsFromDate(futureDate);
        nextCloseIso = formatted.registrationCloseDateIso;
        nextCloseDateLabel = formatted.registrationCloseDateLabel;
        nextCloseTimeLabel = formatted.registrationCloseTimeLabel;
        bumpedFutureNote = ` Auto-close timestamp set to ${nextCloseDateLabel} (${nextCloseTimeLabel}).`;
      }
    }

    const updated: PortalSettings = {
      ...formState,
      isRegistrationOpen: openState,
      registrationCloseDateIso: nextCloseIso,
      registrationCloseDateLabel: nextCloseDateLabel,
      registrationCloseTimeLabel: nextCloseTimeLabel,
    };
    setFormState(updated);
    await saveSettingsToBackend(
      updated,
      openState
        ? `Registration is now OPEN on the website!${bumpedFutureNote}`
        : 'Registration is now CLOSED on the website! Visitors will see "Registration Closed".'
    );
  };

  const handleToggleAutoClose = async (enabled: boolean) => {
    const updated: PortalSettings = {
      ...formState,
      autoCloseEnabled: enabled,
    };
    setFormState(updated);
    await saveSettingsToBackend(
      updated,
      enabled
        ? 'Auto-close by timestamp ENABLED. Registration will automatically close when the deadline is reached.'
        : 'Auto-close by timestamp DISABLED. Registration stays open until manually closed.'
    );
  };

  const handleStageChange = (
    idx: number,
    field: keyof TimelineStageItem,
    value: string | boolean
  ) => {
    setFormState((prev) => {
      const nextStages = prev.timelineStages.map((st, i) => {
        if (i !== idx) {
          if (field === 'active' && value === true) {
            return { ...st, active: false };
          }
          return st;
        }
        return { ...st, [field]: value };
      });
      return { ...prev, timelineStages: nextStages };
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettingsToBackend(formState);
  };

  const handleResetDefaults = async () => {
    await saveSettingsToBackend(
      DEFAULT_PORTAL_SETTINGS,
      'Restored default Tech Debate 4.0 registration & timeline settings.'
    );
  };

  // Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm)
  const datetimeLocalValue = (() => {
    try {
      const d = new Date(formState.registrationCloseDateIso);
      if (isNaN(d.getTime())) return '2026-11-15T23:59';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    } catch {
      return '2026-11-15T23:59';
    }
  })();

  const handleDatetimeLocalChange = (val: string) => {
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    const formatted = formatCloseDateLabelsFromDate(d);

    setFormState((prev) => ({
      ...prev,
      registrationCloseDateIso: formatted.registrationCloseDateIso,
      registrationCloseDateLabel: formatted.registrationCloseDateLabel,
      registrationCloseTimeLabel: formatted.registrationCloseTimeLabel,
    }));
  };

  const handleSaveAutoCloseTimestamp = async () => {
    await saveSettingsToBackend(
      formState,
      `Auto-close timestamp updated to ${formState.registrationCloseDateLabel} at ${formState.registrationCloseTimeLabel}!`
    );
  };

  const effectiveIsOpen = liveSettings.isRegistrationOpen;
  const isAutoClosed = liveSettings.isAutoClosedByTimestamp;

  return (
    <div className="space-y-8">
      {/* 1. Master Registration Status Toggle & Auto-Close Timestamp Card */}
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>REGISTRATION STATUS & AUTO-CLOSE MANAGEMENT</span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3 flex-wrap">
              <span>Registration Status:</span>
              {effectiveIsOpen ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Unlock className="w-3.5 h-3.5" />
                  <span>OPEN (FORM VISIBLE)</span>
                </span>
              ) : isAutoClosed ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs sm:text-sm font-mono font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>AUTO-CLOSED (DEADLINE PASSED)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs sm:text-sm font-mono font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>CLOSED (FORM HIDDEN)</span>
                </span>
              )}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Toggle registration <strong>Open</strong> or <strong>Closed</strong> and set an <strong>Auto-Close Timestamp</strong>. The Registration Page automatically hides or displays the 3-step registration form in real time based on these settings.
            </p>
          </div>

          {/* Toggle Switch + Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Interactive Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={formState.isRegistrationOpen}
              disabled={isSaving}
              onClick={() => handleToggleRegistrationStatus(!formState.isRegistrationOpen)}
              className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.isRegistrationOpen
                  ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900 border-slate-700'
              }`}
              title="Toggle Registration Open / Closed"
            >
              <span
                className={`pointer-events-none inline-block h-8 w-8 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center mt-0.5 ${
                  formState.isRegistrationOpen
                    ? 'translate-x-10 bg-emerald-400 text-slate-950'
                    : 'translate-x-0.5 bg-rose-500 text-white'
                }`}
              >
                {formState.isRegistrationOpen ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleToggleRegistrationStatus(true)}
              className={`px-4 py-3 rounded-2xl font-mono text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                formState.isRegistrationOpen
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.45)] ring-2 ring-emerald-300'
                  : 'bg-slate-900 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>Open Registration</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleToggleRegistrationStatus(false)}
              className={`px-4 py-3 rounded-2xl font-mono text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                !formState.isRegistrationOpen
                  ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.45)] ring-2 ring-rose-300'
                  : 'bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>Close Registration</span>
            </button>
          </div>
        </div>

        {/* Auto-Close Timestamp Date & Time Picker Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/90 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-5">
            <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto-Close Timestamp (Date & Time Picker)</span>
            </label>
            <input
              type="datetime-local"
              value={datetimeLocalValue}
              onChange={(e) => handleDatetimeLocalChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="block text-[11px] font-mono text-slate-400 mt-1">
              Formatted Deadline: <strong className="text-cyan-300">{formState.registrationCloseDateLabel} at {formState.registrationCloseTimeLabel}</strong>
            </span>
          </div>

          <div className="lg:col-span-4">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formState.autoCloseEnabled !== false}
                onChange={(e) => handleToggleAutoClose(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="block text-xs font-mono font-bold text-white">
                  Auto-Close at Timestamp
                </span>
                <span className="block text-[10px] font-mono text-slate-400">
                  Automatically hide registration form once deadline passes
                </span>
              </div>
            </label>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAutoCloseTimestamp}
              className="w-full px-4 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Timestamp'}</span>
            </button>

            {compact && onOpenFullSettings && (
              <button
                type="button"
                onClick={onOpenFullSettings}
                className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                All Dates →
              </button>
            )}
          </div>
        </div>

        {toastMessage && (
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-mono font-bold">
            {errorMessage}
          </div>
        )}
      </GlassCard>

      {!compact && (
        <>
          {/* 2. Deadlines, Dates & Payment Configuration Form */}
          <form onSubmit={handleSubmitForm} className="space-y-8">
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="font-display text-base sm:text-lg font-bold text-white">
                      Registration Deadline Labels, Milestones & Payment Info
                    </h4>
                    <p className="text-xs text-slate-400">
                      Customize the displayed date labels, Kit Distribution Date, Play-Off Start Date, Fee, and bKash/Nagad Number.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    disabled={isSaving}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    Auto-Close Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={datetimeLocalValue}
                    onChange={(e) => handleDatetimeLocalChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="block text-[10px] font-mono text-slate-400 mt-1">
                    Used for live countdown & automatic registration closing
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    Registration Close Date Label
                  </label>
                  <input
                    type="text"
                    value={formState.registrationCloseDateLabel}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, registrationCloseDateLabel: e.target.value }))
                    }
                    placeholder="e.g. 25 October"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="block text-[10px] font-mono text-slate-400 mt-1">
                    Displayed on Home card & Registration Closed page
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    Registration Close Time Label
                  </label>
                  <input
                    type="text"
                    value={formState.registrationCloseTimeLabel}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, registrationCloseTimeLabel: e.target.value }))
                    }
                    placeholder="e.g. 11:59 PM BST"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    Kit Distribution Date Label
                  </label>
                  <input
                    type="text"
                    value={formState.kitDistributionDateLabel}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, kitDistributionDateLabel: e.target.value }))
                    }
                    placeholder="e.g. 27 October"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    Play-Off Start Date Label
                  </label>
                  <input
                    type="text"
                    value={formState.playoffStartDateLabel}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, playoffStartDateLabel: e.target.value }))
                    }
                    placeholder="e.g. 28 October"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                      Reg Fee (BDT)
                    </label>
                    <input
                      type="number"
                      value={formState.registrationFeeBdt}
                      onChange={(e) =>
                        setFormState((p) => ({
                          ...p,
                          registrationFeeBdt: Number(e.target.value) || 350,
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                      bKash / Nagad No.
                    </label>
                    <input
                      type="text"
                      value={formState.mfsNumber}
                      onChange={(e) => setFormState((p) => ({ ...p, mfsNumber: e.target.value }))}
                      placeholder="01718169072"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 3. Important Dates & Milestones 8-Stage Timeline Editor */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="font-display text-base sm:text-lg font-bold text-white">
                      Important Dates & Milestones Timeline (Home Page)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Edit the 8 tournament stages, dates, and mark which stages are completed or currently active.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Timeline</span>
                </button>
              </div>

              <div className="space-y-3">
                {formState.timelineStages.map((stageItem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {stageItem.stage}
                      </span>
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={stageItem.date}
                        onChange={(e) => handleStageChange(idx, 'date', e.target.value)}
                        placeholder="Date (e.g. 25 October)"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={stageItem.title}
                        onChange={(e) => handleStageChange(idx, 'title', e.target.value)}
                        placeholder="Milestone Title"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-4 justify-end">
                      <label className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(stageItem.completed)}
                          onChange={(e) => handleStageChange(idx, 'completed', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                        />
                        <span>Completed</span>
                      </label>

                      <label className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(stageItem.active)}
                          onChange={(e) => handleStageChange(idx, 'active', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Active Next</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </form>
        </>
      )}
    </div>
  );
};
