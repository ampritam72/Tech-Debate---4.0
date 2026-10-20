import { 
  Team, 
  MatchFixture, 
  HallOfFameEdition, 
  Notice, 
  ScheduleItem, 
  GalleryPhoto, 
  CommitteeMember,
  ContactInquiry
} from '../types';
import { 
  INITIAL_FIXTURES, 
  HALL_OF_FAME, 
  NOTICES, 
  SCHEDULE, 
  GALLERY_ITEMS, 
  COMMITTEE_MEMBERS 
} from './mockData';

const STORAGE_KEYS = {
  TEAMS: 'tech_debate_teams_v2',
  UNSYNCED_TEAMS: 'tech_debate_unsynced_teams_v1',
  DELETED_TEAMS: 'tech_debate_deleted_team_ids_v1',
  FIXTURES: 'tech_debate_fixtures_v2',
  HALL_OF_FAME: 'tech_debate_hof_v2',
  NOTICES: 'tech_debate_notices_v2',
  SCHEDULE: 'tech_debate_schedule_v2',
  GALLERY: 'tech_debate_gallery_v3',
  COMMITTEE: 'tech_debate_committee_v3',
  INQUIRIES: 'tech_debate_inquiries_v1',
  GOOGLE_SHEET_WEBHOOK: 'tech_debate_gsheet_webhook_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist key ${key}:`, err);
  }
}

export const StorageService = {
  getTeams: (): Team[] => safeGet(STORAGE_KEYS.TEAMS, []),
  saveTeams: (teams: Team[]) => safeSet(STORAGE_KEYS.TEAMS, teams),
  getUnsyncedTeams: (): Team[] => safeGet(STORAGE_KEYS.UNSYNCED_TEAMS, []),
  saveUnsyncedTeams: (teams: Team[]) => safeSet(STORAGE_KEYS.UNSYNCED_TEAMS, teams),
  getDeletedTeamIds: (): string[] => safeGet(STORAGE_KEYS.DELETED_TEAMS, []),
  addDeletedTeamId: (teamId: string) => {
    const current = new Set(safeGet<string[]>(STORAGE_KEYS.DELETED_TEAMS, []));
    current.add(teamId);
    const m = String(teamId || '').match(/^TD4-TEAM-(\d+)$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num)) {
        if (num > 100) current.add(`TD4-TEAM-${String(num - 100).padStart(2, '0')}`);
        else current.add(`TD4-TEAM-${num + 100}`);
      }
    }
    safeSet(STORAGE_KEYS.DELETED_TEAMS, Array.from(current));
  },
  removeDeletedTeamId: (teamId: string) => {
    const current = new Set(safeGet<string[]>(STORAGE_KEYS.DELETED_TEAMS, []));
    current.delete(teamId);
    const m = String(teamId || '').match(/^TD4-TEAM-(\d+)$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num)) {
        if (num > 100) current.delete(`TD4-TEAM-${String(num - 100).padStart(2, '0')}`);
        else current.delete(`TD4-TEAM-${num + 100}`);
      }
    }
    safeSet(STORAGE_KEYS.DELETED_TEAMS, Array.from(current));
  },
  clearTeams: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.UNSYNCED_TEAMS);
      localStorage.removeItem('tech_debate_teams_v1');
    } catch {}
  },

  getFixtures: (): MatchFixture[] => safeGet(STORAGE_KEYS.FIXTURES, INITIAL_FIXTURES),
  saveFixtures: (fixtures: MatchFixture[]) => safeSet(STORAGE_KEYS.FIXTURES, fixtures),

  getHallOfFame: (): HallOfFameEdition[] => safeGet(STORAGE_KEYS.HALL_OF_FAME, HALL_OF_FAME),
  saveHallOfFame: (hof: HallOfFameEdition[]) => safeSet(STORAGE_KEYS.HALL_OF_FAME, hof),

  getNotices: (): Notice[] => safeGet(STORAGE_KEYS.NOTICES, NOTICES),
  saveNotices: (notices: Notice[]) => safeSet(STORAGE_KEYS.NOTICES, notices),

  getSchedule: (): ScheduleItem[] => safeGet(STORAGE_KEYS.SCHEDULE, SCHEDULE),
  saveSchedule: (schedule: ScheduleItem[]) => safeSet(STORAGE_KEYS.SCHEDULE, schedule),

  getGallery: (): GalleryPhoto[] => safeGet(STORAGE_KEYS.GALLERY, GALLERY_ITEMS),
  saveGallery: (gallery: GalleryPhoto[]) => safeSet(STORAGE_KEYS.GALLERY, gallery),

  getCommittee: (): CommitteeMember[] => safeGet(STORAGE_KEYS.COMMITTEE, COMMITTEE_MEMBERS),
  saveCommittee: (committee: CommitteeMember[]) => safeSet(STORAGE_KEYS.COMMITTEE, committee),

  getInquiries: (): ContactInquiry[] => safeGet(STORAGE_KEYS.INQUIRIES, []),
  saveInquiries: (inquiries: ContactInquiry[]) => safeSet(STORAGE_KEYS.INQUIRIES, inquiries),

  getGoogleSheetWebhook: (): string => safeGet(STORAGE_KEYS.GOOGLE_SHEET_WEBHOOK, (import.meta as any).env?.VITE_GOOGLE_SHEET_WEBHOOK_URL || ''),
  saveGoogleSheetWebhook: (url: string) => safeSet(STORAGE_KEYS.GOOGLE_SHEET_WEBHOOK, url),

  // Reset to original seeded data
  resetAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
};
