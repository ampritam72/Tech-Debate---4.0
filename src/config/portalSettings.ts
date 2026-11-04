import { useState, useEffect } from 'react';

export interface TimelineStageItem {
  date: string;
  title: string;
  stage: string;
  completed: boolean;
  active?: boolean;
}

export interface PortalSettings {
  isRegistrationOpen: boolean;
  autoCloseEnabled?: boolean;
  registrationOpenDateLabel: string;
  registrationCloseDateIso: string;
  registrationCloseDateLabel: string;
  registrationCloseTimeLabel: string;
  kitDistributionDateLabel: string;
  playoffStartDateLabel: string;
  registrationFeeBdt: number;
  mfsNumber: string;
  timelineStages: TimelineStageItem[];
}

export interface ComputedPortalSettings extends PortalSettings {
  /** The raw manual toggle state set by Admin */
  rawIsRegistrationOpen: boolean;
  /** True when Admin toggle is ON, autoCloseEnabled is true, and current time >= registrationCloseDateIso */
  isAutoClosedByTimestamp: boolean;
  /** Effective registration state (true only when toggled ON and not auto-closed by timestamp) */
  isRegistrationOpen: boolean;
}

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  isRegistrationOpen: false,
  autoCloseEnabled: true,
  registrationOpenDateLabel: '17 October',
  registrationCloseDateIso: '2026-10-25T23:59:59+06:00',
  registrationCloseDateLabel: '25 October',
  registrationCloseTimeLabel: '11:59 PM BST',
  kitDistributionDateLabel: '27 October',
  playoffStartDateLabel: '28 October',
  registrationFeeBdt: 350,
  mfsNumber: '01718169072',
  timelineStages: [
    { date: '03 September', title: 'Workshop - Debate Unlocked', stage: 'Stage 01', completed: true },
    { date: '17 October', title: 'Registration Opens', stage: 'Stage 02', completed: true },
    { date: '25 October', title: 'Registration Closes', stage: 'Stage 03', completed: true },
    { date: '27 October', title: 'Kit Distribution', stage: 'Stage 04', active: true, completed: false },
    { date: '28 October', title: 'Play-Off - Rounds of 32 Start', stage: 'Stage 05', completed: false },
    { date: 'Upcoming', title: 'Round of 16', stage: 'Stage 06', completed: false },
    { date: 'Upcoming', title: 'Quarter & Semi Finals', stage: 'Stage 07', completed: false },
    { date: 'Upcoming', title: 'Grand Final', stage: 'Stage 08', completed: false },
  ],
};

const PORTAL_SETTINGS_CACHE_KEY = 'td4_portal_settings_v1';

export function formatCloseDateLabelsFromDate(d: Date): {
  registrationCloseDateIso: string;
  registrationCloseDateLabel: string;
  registrationCloseTimeLabel: string;
} {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayStr = String(d.getDate()).padStart(2, '0');
  const monthStr = months[d.getMonth()];
  const registrationCloseDateLabel = `${dayStr} ${monthStr}`;

  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const registrationCloseTimeLabel = `${hours}:${mins} ${ampm} BST`;

  return {
    registrationCloseDateIso: d.toISOString(),
    registrationCloseDateLabel,
    registrationCloseTimeLabel,
  };
}

export function computeEffectivePortalSettings(
  base: PortalSettings,
  nowMs: number = Date.now()
): ComputedPortalSettings {
  const rawIsRegistrationOpen = Boolean(base.isRegistrationOpen);
  const autoCloseEnabled = base.autoCloseEnabled !== false;
  let isAutoClosedByTimestamp = false;

  if (rawIsRegistrationOpen && autoCloseEnabled && base.registrationCloseDateIso) {
    const closeMs = new Date(base.registrationCloseDateIso).getTime();
    if (!isNaN(closeMs) && nowMs >= closeMs) {
      isAutoClosedByTimestamp = true;
    }
  }

  return {
    ...base,
    autoCloseEnabled,
    rawIsRegistrationOpen,
    isAutoClosedByTimestamp,
    isRegistrationOpen: rawIsRegistrationOpen && !isAutoClosedByTimestamp,
  };
}

export function getCachedPortalSettings(): PortalSettings {
  try {
    const raw = localStorage.getItem(PORTAL_SETTINGS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_PORTAL_SETTINGS,
          ...parsed,
          autoCloseEnabled: parsed.autoCloseEnabled !== false,
          timelineStages:
            Array.isArray(parsed.timelineStages) && parsed.timelineStages.length > 0
              ? parsed.timelineStages
              : DEFAULT_PORTAL_SETTINGS.timelineStages,
        };
      }
    }
  } catch {}
  return DEFAULT_PORTAL_SETTINGS;
}

export function notifyPortalSettingsUpdated(settings: PortalSettings) {
  const clean: PortalSettings = {
    isRegistrationOpen: Boolean(settings.isRegistrationOpen),
    autoCloseEnabled: settings.autoCloseEnabled !== false,
    registrationOpenDateLabel: settings.registrationOpenDateLabel,
    registrationCloseDateIso: settings.registrationCloseDateIso,
    registrationCloseDateLabel: settings.registrationCloseDateLabel,
    registrationCloseTimeLabel: settings.registrationCloseTimeLabel,
    kitDistributionDateLabel: settings.kitDistributionDateLabel,
    playoffStartDateLabel: settings.playoffStartDateLabel,
    registrationFeeBdt: Number(settings.registrationFeeBdt) || 350,
    mfsNumber: settings.mfsNumber || '01718169072',
    timelineStages:
      Array.isArray(settings.timelineStages) && settings.timelineStages.length > 0
        ? settings.timelineStages
        : DEFAULT_PORTAL_SETTINGS.timelineStages,
  };
  try {
    localStorage.setItem(PORTAL_SETTINGS_CACHE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('portal-settings-updated', { detail: clean }));
  } catch {}
}

export async function savePortalSettingsClient(nextSettings: PortalSettings): Promise<PortalSettings> {
  const clean: PortalSettings = {
    isRegistrationOpen: Boolean(nextSettings.isRegistrationOpen),
    autoCloseEnabled: nextSettings.autoCloseEnabled !== false,
    registrationOpenDateLabel: nextSettings.registrationOpenDateLabel,
    registrationCloseDateIso: nextSettings.registrationCloseDateIso,
    registrationCloseDateLabel: nextSettings.registrationCloseDateLabel,
    registrationCloseTimeLabel: nextSettings.registrationCloseTimeLabel,
    kitDistributionDateLabel: nextSettings.kitDistributionDateLabel,
    playoffStartDateLabel: nextSettings.playoffStartDateLabel,
    registrationFeeBdt: Number(nextSettings.registrationFeeBdt) || 350,
    mfsNumber: nextSettings.mfsNumber || '01718169072',
    timelineStages:
      Array.isArray(nextSettings.timelineStages) && nextSettings.timelineStages.length > 0
        ? nextSettings.timelineStages
        : DEFAULT_PORTAL_SETTINGS.timelineStages,
  };

  const res = await fetch('/api/admin/portal-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings: clean }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to save registration settings');
  }
  const saved: PortalSettings = {
    ...DEFAULT_PORTAL_SETTINGS,
    ...(data.settings || clean),
  };
  notifyPortalSettingsUpdated(saved);
  return saved;
}

export function usePortalSettings(): ComputedPortalSettings {
  const [baseSettings, setBaseSettings] = useState<PortalSettings>(() => getCachedPortalSettings());
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let mounted = true;
    fetch('/api/portal-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data && data.settings && typeof data.settings === 'object') {
          const merged: PortalSettings = {
            ...DEFAULT_PORTAL_SETTINGS,
            ...data.settings,
            autoCloseEnabled: data.settings.autoCloseEnabled !== false,
            timelineStages:
              Array.isArray(data.settings.timelineStages) && data.settings.timelineStages.length > 0
                ? data.settings.timelineStages
                : DEFAULT_PORTAL_SETTINGS.timelineStages,
          };
          setBaseSettings(merged);
          try {
            localStorage.setItem(PORTAL_SETTINGS_CACHE_KEY, JSON.stringify(merged));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<PortalSettings>;
      if (custom.detail && typeof custom.detail === 'object') {
        setBaseSettings({ ...custom.detail });
      }
    };
    window.addEventListener('portal-settings-updated', handleUpdate);

    // Tick every second so auto-close timestamp triggers live without reload
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      mounted = false;
      window.removeEventListener('portal-settings-updated', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  return computeEffectivePortalSettings(baseSettings, nowMs);
}
