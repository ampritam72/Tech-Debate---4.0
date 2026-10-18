import { Team, MatchFixture, HallOfFameEdition, Notice } from '../types';
import { StorageService } from './storage';
import {
  db,
  doc,
  getDoc,
  setDoc,
  sanitizeGoogleSheetSettingsForFirestore,
  formatTeamForGoogleSheet,
  dispatchToGoogleSheetWebhook,
  GoogleSheetCloudSettings,
} from '../lib/firebase';

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 2000; // 2 seconds in-memory cache for rapid deduplication

// Live Cloud Run PostgreSQL backend URL for cross-origin fallback when frontend is hosted on Vercel static
const REMOTE_API_BASE =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) ||
  'https://ais-pre-p3sggzvunae75w6qozcp3v-113423018580.asia-east1.run.app';

let useRemoteBackend = false;

/**
 * Safely reads a Response body and parses JSON without throwing
 * "SyntaxError: Unexpected token '<'" when Vercel returns HTML for /api/* routes.
 */
async function safeParseJson<T = any>(res: Response): Promise<{ isJson: boolean; data: T | null; rawText: string }> {
  try {
    const rawText = await res.text();
    const trimmed = rawText.trim();
    if (!trimmed || trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
      return { isJson: false, data: null, rawText };
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return { isJson: false, data: null, rawText };
    }
    const data = JSON.parse(trimmed) as T;
    return { isJson: true, data, rawText };
  } catch {
    return { isJson: false, data: null, rawText: '' };
  }
}

/**
 * Smart API fetcher that tries same-origin /api/* first, and if hosted on a static
 * CDN (like Vercel where /api/* returns HTML or 404), automatically routes the request
 * to the live Cloud Run PostgreSQL backend.
 */
async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ res: Response; isJson: boolean; data: T | null; rawText: string }> {
  const isSameOriginAsRemote =
    typeof window !== 'undefined' &&
    window.location.origin.replace(/\/$/, '') === REMOTE_API_BASE.replace(/\/$/, '');

  if (!useRemoteBackend || isSameOriginAsRemote) {
    try {
      const localRes = await fetch(path, {
        ...options,
        cache: options?.method && options.method !== 'GET' ? options.cache : 'no-store',
      });
      const parsed = await safeParseJson<T>(localRes);

      // If same-origin returned valid JSON, use it directly
      if (parsed.isJson) {
        return { res: localRes, ...parsed };
      }

      // If same-origin returned HTML or non-JSON (static host like Vercel), switch to remote Cloud Run DB backend
      if (!isSameOriginAsRemote) {
        useRemoteBackend = true;
      } else {
        return { res: localRes, ...parsed };
      }
    } catch (err) {
      if (isSameOriginAsRemote) throw err;
      useRemoteBackend = true;
    }
  }

  // Fallback to live Cloud Run PostgreSQL backend
  const remoteUrl = `${REMOTE_API_BASE.replace(/\/$/, '')}${path}`;
  const remoteRes = await fetch(remoteUrl, {
    ...options,
    cache: options?.method && options.method !== 'GET' ? options.cache : 'no-store',
  });
  const parsedRemote = await safeParseJson<T>(remoteRes);
  return { res: remoteRes, ...parsedRemote };
}

async function fetchWithCache<T>(url: string, forceRefresh = false): Promise<T> {
  const cached = apiCache.get(url);
  const now = Date.now();
  if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data as T;
  }

  const { res, isJson, data } = await apiFetch<T>(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ${url}`);
  if (!isJson || data === null) {
    throw new Error(`Non-JSON response from ${url}`);
  }
  apiCache.set(url, { data, timestamp: now });
  return data;
}

function invalidateCache(urlPrefix?: string) {
  if (!urlPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      apiCache.delete(key);
    }
  }
}

export const ApiService = {
  // Teams
  getTeams: async (forceRefresh = true): Promise<Team[]> => {
    return fetchWithCache<Team[]>('/api/teams', forceRefresh);
  },

  registerTeam: async (payload: any): Promise<{ success: boolean; teamId: string; isLocalFallback?: boolean }> => {
    try {
      const { res, isJson, data } = await apiFetch<{ success?: boolean; teamId?: string; error?: string }>(
        '/api/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!isJson || !data) {
        return { success: true, teamId: '', isLocalFallback: true };
      }

      if (!res.ok) {
        // Genuine business validation error from the PostgreSQL database (HTTP 400 / 429)
        if ((res.status === 400 || res.status === 429) && data.error) {
          throw new Error(data.error);
        }
        return { success: true, teamId: '', isLocalFallback: true };
      }

      if (!data.teamId) {
        return { success: true, teamId: '', isLocalFallback: true };
      }

      invalidateCache('/api/teams');
      return {
        success: true,
        teamId: data.teamId,
        isLocalFallback: false,
      };
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.includes('already registered') ||
        msg.includes('already been submitted') ||
        msg.includes('Too many registration') ||
        msg.includes('Incomplete registration')
      ) {
        throw err;
      }
      console.warn('API route unreachable, engaging hybrid registration fallback:', msg);
      return { success: true, teamId: '', isLocalFallback: true };
    }
  },

  /**
   * Cloud-backed Google Sheet webhook sync for both new registrations and status updates.
   * Reads the active webhook URL from Cloud Firestore (settings/google_sheet) so any student
   * registering from any device automatically appends/updates their row in the live Google Sheet.
   */
  syncTeamToGoogleSheetClient: async (
    team: Team,
    action: 'new_registration' | 'update_team' = 'new_registration'
  ): Promise<boolean> => {
    let webhookUrl = StorageService.getGoogleSheetWebhook();
    let autoSync = true;
    let directSheetUrl = '';

    try {
      const snap = await getDoc(doc(db, 'settings', 'google_sheet'));
      if (snap.exists()) {
        const data = snap.data() as GoogleSheetCloudSettings;
        if (data.webhookUrl) {
          webhookUrl = data.webhookUrl;
          StorageService.saveGoogleSheetWebhook(webhookUrl);
        }
        if (data.autoSync !== undefined) {
          autoSync = Boolean(data.autoSync);
        }
        if (data.directSheetUrl) {
          directSheetUrl = data.directSheetUrl;
        }
      }
    } catch (err) {
      console.warn('Could not read settings/google_sheet from Firestore, using local webhook cache:', err);
    }

    if (!autoSync || !webhookUrl || !webhookUrl.startsWith('http')) return false;

    const row = formatTeamForGoogleSheet(team);
    const ok = await dispatchToGoogleSheetWebhook(webhookUrl, {
      action,
      team: row,
    });

    if (ok) {
      const nowIso = new Date().toISOString();
      setDoc(
        doc(db, 'settings', 'google_sheet'),
        sanitizeGoogleSheetSettingsForFirestore({
          webhookUrl,
          directSheetUrl,
          autoSync,
          lastSyncAt: nowIso,
          lastStatus: 'SUCCESS',
        })
      ).catch(() => {});
    }

    return ok;
  },

  updatePaymentStatus: async (teamId: string, status: string, rejectionReason?: string): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/payments/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason }),
    });
    invalidateCache('/api/teams');
    if (!res.ok) throw new Error('Failed to update payment status');
    return data || { success: true };
  },

  updateTeamStatus: async (teamId: string, status: string, notes?: string): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    invalidateCache('/api/teams');
    if (!res.ok) throw new Error('Failed to update team');
    return data || { success: true };
  },

  deleteTeam: async (teamId: string): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/teams/${teamId}`, {
      method: 'DELETE',
    });
    invalidateCache('/api/teams');
    if (!res.ok) throw new Error('Failed to delete team');
    return data || { success: true };
  },

  clearAllTeams: async (): Promise<any> => {
    const { res, data } = await apiFetch('/api/admin/teams/clear-all', {
      method: 'DELETE',
    });
    invalidateCache('/api/teams');
    if (!res.ok) throw new Error('Failed to clear registration data');
    return data || { success: true };
  },

  // Google Sheet Backup & Sync (Cloud Firestore + Server Hybrid)
  getGoogleSheetSettings: async (): Promise<{
    webhookUrl: string;
    directSheetUrl?: string;
    autoSync: boolean;
    lastSyncAt: string | null;
    lastStatus: string;
    liveCsvUrl: string;
    googleSheetFormula: string;
  }> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let firestoreSettings: GoogleSheetCloudSettings | null = null;

    try {
      const snap = await getDoc(doc(db, 'settings', 'google_sheet'));
      if (snap.exists()) {
        firestoreSettings = snap.data() as GoogleSheetCloudSettings;
        if (firestoreSettings.webhookUrl) {
          StorageService.saveGoogleSheetWebhook(firestoreSettings.webhookUrl);
        }
      }
    } catch {}

    try {
      const { res, isJson, data } = await apiFetch<any>('/api/admin/google-sheet');
      if (res.ok && isJson && data) {
        const mergedWebhook = firestoreSettings?.webhookUrl || data.webhookUrl || StorageService.getGoogleSheetWebhook();
        if (mergedWebhook) {
          StorageService.saveGoogleSheetWebhook(mergedWebhook);
        }
        return {
          webhookUrl: mergedWebhook,
          directSheetUrl: firestoreSettings?.directSheetUrl || '',
          autoSync: firestoreSettings?.autoSync !== undefined ? firestoreSettings.autoSync : (data.autoSync ?? true),
          lastSyncAt: firestoreSettings?.lastSyncAt || data.lastSyncAt || null,
          lastStatus: firestoreSettings?.lastStatus || data.lastStatus || (mergedWebhook ? 'ACTIVE' : 'NOT_CONFIGURED'),
          liveCsvUrl: data.liveCsvUrl || `${origin}/api/export/teams.csv`,
          googleSheetFormula: data.googleSheetFormula || `=IMPORTDATA("${origin}/api/export/teams.csv")`,
        };
      }
    } catch {}

    const resolvedWebhook = firestoreSettings?.webhookUrl || StorageService.getGoogleSheetWebhook();
    return {
      webhookUrl: resolvedWebhook,
      directSheetUrl: firestoreSettings?.directSheetUrl || '',
      autoSync: firestoreSettings?.autoSync !== undefined ? firestoreSettings.autoSync : true,
      lastSyncAt: firestoreSettings?.lastSyncAt || null,
      lastStatus: firestoreSettings?.lastStatus || (resolvedWebhook ? 'ACTIVE' : 'NOT_CONFIGURED'),
      liveCsvUrl: `${origin}/api/export/teams.csv`,
      googleSheetFormula: `=IMPORTDATA("${origin}/api/export/teams.csv")`,
    };
  },

  saveGoogleSheetSettings: async (settings: {
    webhookUrl: string;
    directSheetUrl?: string;
    autoSync?: boolean;
  }): Promise<any> => {
    const cleanWebhook = (settings.webhookUrl || '').trim();
    StorageService.saveGoogleSheetWebhook(cleanWebhook);

    const sanitized = sanitizeGoogleSheetSettingsForFirestore({
      webhookUrl: cleanWebhook,
      directSheetUrl: settings.directSheetUrl,
      autoSync: settings.autoSync ?? true,
      lastStatus: cleanWebhook ? 'ACTIVE' : 'NOT_CONFIGURED',
    });

    await setDoc(doc(db, 'settings', 'google_sheet'), sanitized);

    try {
      const { res, isJson, data } = await apiFetch('/api/admin/google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok && isJson) return data;
    } catch {}

    return { success: true, webhookUrl: cleanWebhook };
  },

  syncAllToGoogleSheet: async (teamsList?: Team[]): Promise<{ success: boolean; count: number; message: string }> => {
    let webhookUrl = StorageService.getGoogleSheetWebhook();
    let directSheetUrl = '';
    let autoSync = true;

    try {
      const snap = await getDoc(doc(db, 'settings', 'google_sheet'));
      if (snap.exists()) {
        const data = snap.data() as GoogleSheetCloudSettings;
        if (data.webhookUrl) webhookUrl = data.webhookUrl;
        if (data.directSheetUrl) directSheetUrl = data.directSheetUrl;
        if (data.autoSync !== undefined) autoSync = Boolean(data.autoSync);
      }
    } catch {}

    if (teamsList && webhookUrl && webhookUrl.startsWith('http')) {
      const formattedRows = teamsList.map(formatTeamForGoogleSheet);
      const ok = await dispatchToGoogleSheetWebhook(webhookUrl, {
        action: 'bulk_sync',
        teams: formattedRows,
      });

      if (ok) {
        const nowIso = new Date().toISOString();
        await setDoc(
          doc(db, 'settings', 'google_sheet'),
          sanitizeGoogleSheetSettingsForFirestore({
            webhookUrl,
            directSheetUrl,
            autoSync,
            lastSyncAt: nowIso,
            lastStatus: 'SUCCESS',
          })
        ).catch(() => {});

        return {
          success: true,
          count: formattedRows.length,
          message: `Successfully synced ${formattedRows.length} squads to your Google Sheet!`,
        };
      }
    }

    const { res, isJson, data } = await apiFetch<any>('/api/admin/google-sheet/sync', {
      method: 'POST',
    });
    if (!isJson || !data) {
      throw new Error('Please configure a valid Google Apps Script Web App URL first.');
    }
    if (!res.ok) throw new Error(data.error || 'Failed to sync with Google Sheet');
    return data;
  },

  // Fixtures
  getFixtures: async (): Promise<MatchFixture[]> => {
    return fetchWithCache<MatchFixture[]>('/api/fixtures');
  },

  createFixture: async (fixture: any): Promise<any> => {
    const { res, data } = await apiFetch('/api/admin/fixtures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixture),
    });
    if (!res.ok) throw new Error('Failed to create fixture');
    invalidateCache('/api/fixtures');
    return data || { success: true };
  },

  updateFixture: async (id: string, updates: any): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/fixtures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update fixture');
    invalidateCache('/api/fixtures');
    return data || { success: true };
  },

  deleteFixture: async (id: string): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/fixtures/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete fixture');
    invalidateCache('/api/fixtures');
    return data || { success: true };
  },

  // Notices
  getNotices: async (): Promise<Notice[]> => {
    return fetchWithCache<Notice[]>('/api/notices');
  },

  createNotice: async (notice: any): Promise<any> => {
    const { res, data } = await apiFetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    if (!res.ok) throw new Error('Failed to create notice');
    invalidateCache('/api/notices');
    return data || { success: true };
  },

  deleteNotice: async (id: string): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/notices/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete notice');
    invalidateCache('/api/notices');
    return data || { success: true };
  },

  // Hall of Fame
  getHallOfFame: async (): Promise<HallOfFameEdition[]> => {
    return fetchWithCache<HallOfFameEdition[]>('/api/hall-of-fame');
  },

  updateHallOfFame: async (edition: string, updates: any): Promise<any> => {
    const { res, data } = await apiFetch(`/api/admin/hall-of-fame/${edition}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update hall of fame');
    return data || { success: true };
  },

  // Auth sync
  syncAuthUser: async (user: { uid: string; email: string; displayName?: string }): Promise<any> => {
    const { res, data } = await apiFetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to sync auth user');
    return data || { success: true };
  },

  // Database-backed admin login (with fallback support if offline/static)
  loginAdmin: async (credentials: {
    email?: string;
    password: string;
  }): Promise<{ success: boolean; user: { email: string; role: string; displayName: string } }> => {
    try {
      const { res, isJson, data } = await apiFetch<any>('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (isJson && data) {
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        return data;
      }
    } catch (err: any) {
      if (err?.message === 'Invalid admin credentials' || err?.message === 'Password is required') {
        throw err;
      }
    }

    throw new Error('Database server unreachable');
  },
};

