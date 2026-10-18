import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Team,
  MatchFixture,
  HallOfFameEdition,
  Notice,
  ScheduleItem,
  GalleryPhoto,
  CommitteeMember,
  PaymentStatus,
  TeamStatus,
  ContactInquiry,
} from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import {
  db,
  doc,
  collection,
  getDocFromServer,
  getDocsFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  sanitizeTeamForFirestore,
  sanitizeFixtureForFirestore,
  sanitizeNoticeForFirestore,
  sanitizeInquiryForFirestore,
  sanitizeHallOfFameForFirestore,
  sanitizeScheduleForFirestore,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

interface RegisterTeamPayload {
  name: string;
  batch: string;
  department: string;
  members: Array<{
    fullName: string;
    studentId: string;
    batch?: string;
    phone: string;
    email: string;
    speakerRole: 1 | 2 | 3;
    isLeader: boolean;
    semester?: string;
  }>;
  payment: {
    method: 'bKash' | 'Nagad' | 'Rocket';
    senderNumber: string;
    transactionId: string;
    amount: number;
  };
  userUid?: string;
}

interface TournamentContextType {
  teams: Team[];
  fixtures: MatchFixture[];
  hallOfFame: HallOfFameEdition[];
  notices: Notice[];
  schedule: ScheduleItem[];
  gallery: GalleryPhoto[];
  committee: CommitteeMember[];
  inquiries: ContactInquiry[];
  isLoading: boolean;

  // Registration
  registerTeam: (payload: RegisterTeamPayload) => Promise<Team>;

  // Admin Operations
  updatePaymentStatus: (teamId: string, status: PaymentStatus, rejectionReason?: string) => Promise<void>;
  updateTeamStatus: (teamId: string, status: TeamStatus, notes?: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;

  // Fixture Management
  updateFixture: (id: string, updates: Partial<MatchFixture>) => Promise<void>;
  createFixture: (fixture: Omit<MatchFixture, 'id'>) => Promise<MatchFixture>;
  deleteFixture: (id: string) => Promise<void>;

  // Content Management
  addNotice: (notice: Omit<Notice, 'id' | 'publishedAt'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id' | 'date'>) => void;
  updateHallOfFame4: (updates: Partial<HallOfFameEdition>) => Promise<void>;

  // Helpdesk Inquiries
  submitInquiry: (payload: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => Promise<ContactInquiry>;
  updateInquiryStatus: (id: string, status: 'NEW' | 'RESOLVED') => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Refresh & Reset
  refreshFromDatabase: () => Promise<void>;
  resetDatabase: () => void;
  clearAllRegistrations: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function sortTeamsDesc(list: Team[]): Team[] {
  return [...list].sort((a, b) => {
    const tA = new Date(a.registrationDate || 0).getTime();
    const tB = new Date(b.registrationDate || 0).getTime();
    return tB - tA;
  });
}

function mergeTeamsList(primary: Team[], secondary: Team[], deletedIds: Set<string>): Team[] {
  const byId = new Map<string, Team>();
  const byName = new Set<string>();

  for (const t of primary) {
    if (!t || !t.id || deletedIds.has(t.id)) continue;
    byId.set(t.id, t);
    if (t.name) byName.add(t.name.trim().toLowerCase());
  }

  for (const t of secondary) {
    if (!t || !t.id || deletedIds.has(t.id)) continue;
    const normName = (t.name || '').trim().toLowerCase();
    if (!byId.has(t.id) && (!normName || !byName.has(normName))) {
      byId.set(t.id, t);
      if (normName) byName.add(normName);
    }
  }

  return sortTeamsDesc(Array.from(byId.values()));
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(() => StorageService.getTeams());
  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => StorageService.getFixtures());
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEdition[]>(() => StorageService.getHallOfFame());
  const [notices, setNotices] = useState<Notice[]>(() => StorageService.getNotices());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => StorageService.getSchedule());
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => StorageService.getGallery());
  const [committee, setCommittee] = useState<CommitteeMember[]>(() => StorageService.getCommittee());
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => StorageService.getInquiries());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialMigrationDone = useRef(false);
  const deletedTeamIdsRef = useRef<Set<string>>(new Set());
  const pgTeamsCacheRef = useRef<Team[]>([]);
  const firestoreTeamsCacheRef = useRef<Team[]>([]);

  const generateNextTeamId = (existingTeams: Team[]): string => {
    let maxNum = 100;
    existingTeams.forEach((t) => {
      const match = String(t.id || '').match(/TD4-TEAM-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `TD4-TEAM-${maxNum + 1}`;
  };

  // Bidirectional sync between Cloud Firestore, legacy localStorage unsynced queue, and PostgreSQL backend
  const refreshFromDatabase = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [firestoreResult, pgTeamsResult, pgFixtures, pgNotices, pgHof] = await Promise.all([
        getDocs(collection(db, 'teams')).catch((err) => {
          console.warn('Firestore getDocs warning:', err);
          return null;
        }),
        ApiService.getTeams(true).catch(() => null),
        !initialMigrationDone.current ? ApiService.getFixtures().catch(() => null) : Promise.resolve(null),
        !initialMigrationDone.current ? ApiService.getNotices().catch(() => null) : Promise.resolve(null),
        !initialMigrationDone.current ? ApiService.getHallOfFame().catch(() => null) : Promise.resolve(null),
      ]);

      const firestoreTeamsMap = new Map<string, Team>();
      const firestoreNamesSet = new Set<string>();
      const firestoreTrxSet = new Set<string>();

      if (firestoreResult) {
        firestoreResult.forEach((docSnap) => {
          const t = docSnap.data() as Team;
          if (t && t.id && !deletedTeamIdsRef.current.has(t.id)) {
            firestoreTeamsMap.set(t.id, t);
            if (t.name) firestoreNamesSet.add(t.name.trim().toLowerCase());
            if (t.payment?.transactionId) {
              firestoreTrxSet.add(t.payment.transactionId.trim().toUpperCase());
            }
          }
        });
        firestoreTeamsCacheRef.current = Array.from(firestoreTeamsMap.values());
      }

      if (Array.isArray(pgTeamsResult)) {
        pgTeamsCacheRef.current = pgTeamsResult.filter((t) => t && t.id && !deletedTeamIdsRef.current.has(t.id));
      }

      // Immediately update UI state with merged teams from both databases so counters are instant
      const immediateMerged = mergeTeamsList(
        Array.from(firestoreTeamsMap.values()),
        pgTeamsCacheRef.current,
        deletedTeamIdsRef.current
      );
      if (firestoreResult !== null || Array.isArray(pgTeamsResult)) {
        setTeams(immediateMerged);
        StorageService.saveTeams(immediateMerged);
      }

      // 2. Migrate any legacy unsynced localStorage teams into Cloud Firestore
      const unsynced = StorageService.getUnsyncedTeams();
      if (unsynced.length > 0) {
        const remainingUnsynced: Team[] = [];
        for (const offlineTeam of unsynced) {
          if (deletedTeamIdsRef.current.has(offlineTeam.id)) continue;
          try {
            const cleanName = offlineTeam.name.trim().toLowerCase();
            const cleanTrx = offlineTeam.payment?.transactionId?.trim().toUpperCase() || '';
            if (!firestoreNamesSet.has(cleanName) && !firestoreTrxSet.has(cleanTrx)) {
              const targetId = firestoreTeamsMap.has(offlineTeam.id)
                ? generateNextTeamId(Array.from(firestoreTeamsMap.values()))
                : offlineTeam.id;
              const teamToSave: Team = { ...offlineTeam, id: targetId };
              await setDoc(doc(db, 'teams', targetId), sanitizeTeamForFirestore(teamToSave));
              firestoreTeamsMap.set(targetId, teamToSave);
              firestoreNamesSet.add(cleanName);
              if (cleanTrx) firestoreTrxSet.add(cleanTrx);
            }
          } catch {
            remainingUnsynced.push(offlineTeam);
          }
        }
        StorageService.saveUnsyncedTeams(remainingUnsynced);
      }

      // 3. Synchronize any differences between PostgreSQL and Cloud Firestore
      if (Array.isArray(pgTeamsResult) && pgTeamsResult.length > 0) {
        const pgNames = new Set(pgTeamsResult.map((t) => t.name.trim().toLowerCase()));

        for (const pgTeam of pgTeamsResult) {
          if (deletedTeamIdsRef.current.has(pgTeam.id)) continue;
          const lowerName = pgTeam.name.trim().toLowerCase();
          if (!firestoreTeamsMap.has(pgTeam.id) && !firestoreNamesSet.has(lowerName)) {
            try {
              await setDoc(doc(db, 'teams', pgTeam.id), sanitizeTeamForFirestore(pgTeam));
              firestoreTeamsMap.set(pgTeam.id, pgTeam);
              firestoreNamesSet.add(lowerName);
            } catch (err) {
              console.warn('Could not seed PG team to Firestore:', err);
            }
          }
        }

        for (const fsTeam of firestoreTeamsMap.values()) {
          if (!pgNames.has(fsTeam.name.trim().toLowerCase())) {
            ApiService.registerTeam({
              name: fsTeam.name,
              batch: fsTeam.batch,
              department: fsTeam.department,
              members: fsTeam.members.map((m) => ({
                fullName: m.fullName,
                studentId: m.studentId,
                batch: m.batch || fsTeam.batch,
                phone: m.phone,
                email: m.email || '',
                speakerRole: m.speakerRole,
                isLeader: m.isLeader,
                semester: (m as any).semester,
              })),
              payment: {
                method: fsTeam.payment.method,
                senderNumber: fsTeam.payment.senderNumber,
                transactionId: fsTeam.payment.transactionId,
                amount: fsTeam.payment.amount || 350,
              },
            }).catch(() => {});
          }
        }
      } else if (firestoreTeamsMap.size > 0 && Array.isArray(pgTeamsResult) && pgTeamsResult.length === 0) {
        for (const fsTeam of firestoreTeamsMap.values()) {
          ApiService.registerTeam({
            name: fsTeam.name,
            batch: fsTeam.batch,
            department: fsTeam.department,
            members: fsTeam.members.map((m) => ({
              fullName: m.fullName,
              studentId: m.studentId,
              batch: m.batch || fsTeam.batch,
              phone: m.phone,
              email: m.email || '',
              speakerRole: m.speakerRole,
              isLeader: m.isLeader,
              semester: (m as any).semester,
            })),
            payment: {
              method: fsTeam.payment.method,
              senderNumber: fsTeam.payment.senderNumber,
              transactionId: fsTeam.payment.transactionId,
              amount: fsTeam.payment.amount || 350,
            },
          }).catch(() => {});
        }
      }

      if (!initialMigrationDone.current) {
        initialMigrationDone.current = true;
        if (pgFixtures && pgFixtures.length > 0) setFixtures(pgFixtures);
        if (pgNotices && pgNotices.length > 0) setNotices(pgNotices);
        if (pgHof && pgHof.length > 0) setHallOfFame(pgHof);
      }

      firestoreTeamsCacheRef.current = Array.from(firestoreTeamsMap.values());
      const finalMerged = mergeTeamsList(
        firestoreTeamsCacheRef.current,
        pgTeamsCacheRef.current,
        deletedTeamIdsRef.current
      );
      if (firestoreResult !== null || Array.isArray(pgTeamsResult)) {
        setTeams(finalMerged);
        StorageService.saveTeams(finalMerged);
      }
    } catch (err) {
      console.warn('Database refresh warning:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Real-time Firebase Cloud Firestore listeners (works simultaneously on Vercel and AI Studio)
  useEffect(() => {
    const teamsUnsub = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const firestoreTeams: Team[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Team;
          if (data && data.id && !deletedTeamIdsRef.current.has(data.id)) {
            firestoreTeams.push(data);
          }
        });
        firestoreTeamsCacheRef.current = firestoreTeams;

        const combined =
          firestoreTeams.length > 0 || initialMigrationDone.current
            ? mergeTeamsList(firestoreTeams, pgTeamsCacheRef.current, deletedTeamIdsRef.current)
            : mergeTeamsList(pgTeamsCacheRef.current, StorageService.getTeams(), deletedTeamIdsRef.current);

        setTeams(combined);
        StorageService.saveTeams(combined);
      },
      (err) => {
        console.warn('Firestore teams listener warning:', err);
      }
    );

    const fixturesUnsub = onSnapshot(
      collection(db, 'fixtures'),
      (snapshot) => {
        if (snapshot.empty) return;
        const firestoreFixtures: MatchFixture[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as MatchFixture;
          if (data && data.id) firestoreFixtures.push(data);
        });
        if (firestoreFixtures.length > 0) {
          firestoreFixtures.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
          setFixtures(firestoreFixtures);
          StorageService.saveFixtures(firestoreFixtures);
        }
      },
      (err) => {
        console.warn('Firestore fixtures listener warning:', err);
      }
    );

    const noticesUnsub = onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        if (snapshot.empty) return;
        const firestoreNotices: Notice[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Notice;
          if (data && data.id) firestoreNotices.push(data);
        });
        if (firestoreNotices.length > 0) {
          firestoreNotices.sort(
            (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
          );
          setNotices(firestoreNotices);
          StorageService.saveNotices(firestoreNotices);
        }
      },
      (err) => {
        console.warn('Firestore notices listener warning:', err);
      }
    );

    const inquiriesUnsub = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const firestoreInquiries: ContactInquiry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ContactInquiry;
          if (data && data.id) firestoreInquiries.push(data);
        });
        firestoreInquiries.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setInquiries(firestoreInquiries);
        StorageService.saveInquiries(firestoreInquiries);
      },
      (err) => {
        console.warn('Firestore inquiries listener warning:', err);
      }
    );

    const hofUnsub = onSnapshot(
      collection(db, 'hallOfFame'),
      (snapshot) => {
        if (snapshot.empty) return;
        const hofUpdates = new Map<string, HallOfFameEdition>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as HallOfFameEdition;
          if (data && data.edition) {
            hofUpdates.set(data.edition, data);
          }
        });
        if (hofUpdates.size > 0) {
          setHallOfFame((prev) => {
            const updated = prev.map((item) => hofUpdates.get(item.edition) || item);
            StorageService.saveHallOfFame(updated);
            return updated;
          });
        }
      },
      (err) => {
        console.warn('Firestore hallOfFame listener warning:', err);
      }
    );

    const scheduleUnsub = onSnapshot(
      collection(db, 'schedule'),
      (snapshot) => {
        if (snapshot.empty) return;
        const scheduleUpdates = new Map<string, ScheduleItem>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ScheduleItem;
          if (data && data.id) {
            scheduleUpdates.set(data.id, data);
          }
        });
        if (scheduleUpdates.size > 0) {
          setSchedule((prev) => {
            const updated = prev.map((item) => scheduleUpdates.get(item.id) || item);
            StorageService.saveSchedule(updated);
            return updated;
          });
        }
      },
      (err) => {
        console.warn('Firestore schedule listener warning:', err);
      }
    );

    const settingsUnsub = onSnapshot(
      doc(db, 'settings', 'google_sheet'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && typeof data.webhookUrl === 'string') {
            StorageService.saveGoogleSheetWebhook(data.webhookUrl);
          }
        }
      },
      (err) => {
        console.warn('Firestore settings listener warning:', err);
      }
    );

    return () => {
      teamsUnsub();
      fixturesUnsub();
      noticesUnsub();
      inquiriesUnsub();
      hofUnsub();
      scheduleUnsub();
      settingsUnsub();
    };
  }, []);

  // Initial load + continuous real-time heartbeat & cross-tab sync
  useEffect(() => {
    refreshFromDatabase(false);

    const interval = setInterval(() => {
      refreshFromDatabase(true);
    }, 8000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshFromDatabase(true);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tech_debate_teams_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Team[];
          if (Array.isArray(parsed)) {
            setTeams(sortTeamsDesc(parsed));
          }
        } catch {}
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshFromDatabase]);

  // Save to local storage as cache
  useEffect(() => {
    StorageService.saveTeams(teams);
  }, [teams]);

  useEffect(() => {
    StorageService.saveFixtures(fixtures);
  }, [fixtures]);

  useEffect(() => {
    StorageService.saveHallOfFame(hallOfFame);
  }, [hallOfFame]);

  useEffect(() => {
    StorageService.saveNotices(notices);
  }, [notices]);

  useEffect(() => {
    StorageService.saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    StorageService.saveInquiries(inquiries);
  }, [inquiries]);

  /**
   * Strict Cloud Registration:
   * Guarantees the team is written and verified on the live Firebase Cloud Firestore server
   * BEFORE returning success. Blocks any fake local-only success screen if offline or unreachable.
   */
  const registerTeam = async (payload: RegisterTeamPayload): Promise<Team> => {
    let liveServerTeams: Team[] = [];
    try {
      const serverSnap = await withTimeout(
        getDocsFromServer(collection(db, 'teams')),
        12000,
        'Connection timed out while reaching the cloud registration database. Please check your internet connection and try again.'
      );
      serverSnap.forEach((docSnap) => {
        const data = docSnap.data() as Team;
        if (data && data.id) liveServerTeams.push(data);
      });
    } catch (err: any) {
      console.error('Live Firestore server check failed:', err);
      throw new Error(
        'Unable to connect to the live cloud database. Your registration was NOT saved. Please check your internet connection and try again.'
      );
    }

    const allKnownTeams = mergeTeamsList(liveServerTeams, teams, deletedTeamIdsRef.current);

    const cleanName = payload.name.trim();
    const cleanTrx = payload.payment.transactionId.trim().toUpperCase();

    const duplicateName = allKnownTeams.find(
      (t) => t.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicateName) {
      throw new Error(`A squad named "${cleanName}" is already registered in the database.`);
    }

    const duplicateTrx = allKnownTeams.find(
      (t) => t.payment?.transactionId?.trim().toUpperCase() === cleanTrx
    );
    if (duplicateTrx) {
      throw new Error(`Transaction ID (${cleanTrx}) has already been submitted by another squad.`);
    }

    for (const member of payload.members) {
      const cleanSid = member.studentId.trim().toLowerCase();
      for (const existingTeam of allKnownTeams) {
        const conflictMember = existingTeam.members?.find(
          (m) => m.studentId.trim().toLowerCase() === cleanSid
        );
        if (conflictMember) {
          throw new Error(
            `Student ID ${member.studentId.trim()} (${member.fullName.trim()}) is already registered in squad "${existingTeam.name}".`
          );
        }
      }
    }

    const assignedTeamId = generateNextTeamId(allKnownTeams);
    const nowIso = new Date().toISOString();

    const memberEntities = payload.members.map((m, idx) => ({
      id: `mem-${assignedTeamId}-${idx + 1}`,
      teamId: assignedTeamId,
      speakerRole: m.speakerRole,
      fullName: m.fullName.trim(),
      studentId: m.studentId.trim(),
      batch: (m.batch || payload.batch).trim(),
      phone: m.phone.trim(),
      email: (m.email || '').trim(),
      isLeader: m.isLeader,
      semester: (m.semester || '').trim(),
    }));

    const leader = memberEntities.find((m) => m.isLeader) || memberEntities[0];

    const newTeam: Team = {
      id: assignedTeamId,
      name: cleanName,
      batch: payload.batch.trim(),
      department: payload.department || 'Computer Science & Engineering (CSE)',
      leaderId: leader.id,
      members: memberEntities,
      registrationDate: nowIso,
      status: 'PENDING',
      payment: {
        id: `pay-${assignedTeamId}`,
        teamId: assignedTeamId,
        method: payload.payment.method,
        senderNumber: payload.payment.senderNumber.trim(),
        transactionId: cleanTrx,
        amount: payload.payment.amount || 350,
        submittedAt: nowIso,
        status: 'PENDING',
      },
    };

    try {
      const sanitizedDoc = sanitizeTeamForFirestore(newTeam);
      await withTimeout(
        setDoc(doc(db, 'teams', assignedTeamId), sanitizedDoc),
        12000,
        'Cloud database write timed out. Please verify your internet connection and try submitting again.'
      );

      const verifiedServerDoc = await withTimeout(
        getDocFromServer(doc(db, 'teams', assignedTeamId)),
        10000,
        'Could not verify registration on the cloud server. Please check your internet connection and try again.'
      );

      if (!verifiedServerDoc.exists()) {
        throw new Error('Cloud database verification failed. Please try submitting again.');
      }
    } catch (err: any) {
      if (err?.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.CREATE, `teams/${assignedTeamId}`);
      }
      throw new Error(
        err?.message ||
          'Failed to save registration to the cloud database. Please check your connection and try again.'
      );
    }

    ApiService.registerTeam(payload).catch(() => {});
    ApiService.syncTeamToGoogleSheetClient(newTeam).catch(() => {});

    firestoreTeamsCacheRef.current = [
      newTeam,
      ...firestoreTeamsCacheRef.current.filter((t) => t.id !== newTeam.id),
    ];
    pgTeamsCacheRef.current = [
      newTeam,
      ...pgTeamsCacheRef.current.filter((t) => t.id !== newTeam.id),
    ];
    setTeams((prev) => {
      const filtered = prev.filter((t) => t.id !== newTeam.id);
      const updated = sortTeamsDesc([newTeam, ...filtered]);
      StorageService.saveTeams(updated);
      return updated;
    });

    return newTeam;
  };

  const updatePaymentStatus = async (
    teamId: string,
    status: PaymentStatus,
    rejectionReason?: string
  ) => {
    let updatedTeamObj: Team | null = null;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const updated: Team = {
          ...t,
          payment: {
            ...t.payment,
            status,
            verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
            rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
          },
          status:
            status === 'VERIFIED' ? 'VERIFIED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        };
        updatedTeamObj = updated;
        return updated;
      })
    );

    if (updatedTeamObj) {
      firestoreTeamsCacheRef.current = firestoreTeamsCacheRef.current.map((t) =>
        t.id === teamId ? updatedTeamObj! : t
      );
      pgTeamsCacheRef.current = pgTeamsCacheRef.current.map((t) =>
        t.id === teamId ? updatedTeamObj! : t
      );
      try {
        await setDoc(doc(db, 'teams', teamId), sanitizeTeamForFirestore(updatedTeamObj));
      } catch (err) {
        console.error('Failed to update payment status in Cloud Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
      }
      ApiService.syncTeamToGoogleSheetClient(updatedTeamObj, 'update_team').catch(() => {});
    }

    ApiService.updatePaymentStatus(teamId, status, rejectionReason).catch(() => {});
  };

  const updateTeamStatus = async (teamId: string, status: TeamStatus, notes?: string) => {
    let updatedTeamObj: Team | null = null;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const updated: Team = {
          ...t,
          status,
          notes: notes !== undefined ? notes : t.notes,
        };
        updatedTeamObj = updated;
        return updated;
      })
    );

    if (updatedTeamObj) {
      firestoreTeamsCacheRef.current = firestoreTeamsCacheRef.current.map((t) =>
        t.id === teamId ? updatedTeamObj! : t
      );
      pgTeamsCacheRef.current = pgTeamsCacheRef.current.map((t) =>
        t.id === teamId ? updatedTeamObj! : t
      );
      try {
        await setDoc(doc(db, 'teams', teamId), sanitizeTeamForFirestore(updatedTeamObj));
      } catch (err) {
        console.error('Failed to update team status in Cloud Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
      }
      ApiService.syncTeamToGoogleSheetClient(updatedTeamObj, 'update_team').catch(() => {});
    }

    ApiService.updateTeamStatus(teamId, status, notes).catch(() => {});
  };

  const deleteTeam = async (teamId: string) => {
    deletedTeamIdsRef.current.add(teamId);
    firestoreTeamsCacheRef.current = firestoreTeamsCacheRef.current.filter((t) => t.id !== teamId);
    pgTeamsCacheRef.current = pgTeamsCacheRef.current.filter((t) => t.id !== teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (err) {
      console.error('Failed to delete team from Cloud Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `teams/${teamId}`);
    }
    ApiService.deleteTeam(teamId).catch(() => {});
  };

  const updateFixture = async (id: string, updates: Partial<MatchFixture>) => {
    let updatedFixtureObj: MatchFixture | null = null;
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        updatedFixtureObj = { ...f, ...updates };
        return updatedFixtureObj;
      })
    );

    if (updatedFixtureObj) {
      try {
        await setDoc(doc(db, 'fixtures', id), sanitizeFixtureForFirestore(updatedFixtureObj));
      } catch (err) {
        console.warn('Failed to update fixture in Firestore:', err);
      }
    }

    ApiService.updateFixture(id, updates).catch(() => {});
  };

  const createFixture = async (fixture: Omit<MatchFixture, 'id'>): Promise<MatchFixture> => {
    const newId = `M-${Date.now().toString().slice(-6)}`;
    const newFixture: MatchFixture = {
      ...fixture,
      id: newId,
    };
    setFixtures((prev) => [...prev, newFixture]);

    try {
      await setDoc(doc(db, 'fixtures', newId), sanitizeFixtureForFirestore(newFixture));
    } catch (err) {
      console.warn('Failed to create fixture in Firestore:', err);
    }

    ApiService.createFixture(newFixture).catch(() => {});
    return newFixture;
  };

  const deleteFixture = async (id: string) => {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteDoc(doc(db, 'fixtures', id));
    } catch (err) {
      console.warn('Failed to delete fixture in Firestore:', err);
    }
    ApiService.deleteFixture(id).catch(() => {});
  };

  const addNotice = async (notice: Omit<Notice, 'id' | 'publishedAt'>) => {
    const newNotice: Notice = {
      ...notice,
      id: `n-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setNotices((prev) => [newNotice, ...prev]);

    try {
      await setDoc(doc(db, 'notices', newNotice.id), sanitizeNoticeForFirestore(newNotice));
    } catch (err) {
      console.warn('Failed to create notice in Firestore:', err);
    }

    ApiService.createNotice(newNotice).catch(() => {});
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.warn('Failed to delete notice in Firestore:', err);
    }
    ApiService.deleteNotice(id).catch(() => {});
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    let updatedItem: ScheduleItem | null = null;
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        updatedItem = { ...s, ...updates };
        return updatedItem;
      })
    );
    if (updatedItem) {
      setDoc(doc(db, 'schedule', id), sanitizeScheduleForFirestore(updatedItem)).catch((err) => {
        console.warn('Failed to sync schedule item to Firestore:', err);
      });
    }
  };

  const addGalleryPhoto = (photo: Omit<GalleryPhoto, 'id' | 'date'>) => {
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: `g-${Date.now()}`,
      date: 'October 2026',
    };
    setGallery((prev) => [newPhoto, ...prev]);
  };

  const updateHallOfFame4 = async (updates: Partial<HallOfFameEdition>) => {
    let updatedHof4: HallOfFameEdition | null = null;
    setHallOfFame((prev) =>
      prev.map((h) => {
        if (h.edition !== '4.0') return h;
        updatedHof4 = { ...h, ...updates };
        return updatedHof4;
      })
    );

    if (updatedHof4) {
      try {
        await setDoc(doc(db, 'hallOfFame', '4.0'), sanitizeHallOfFameForFirestore(updatedHof4));
      } catch (err) {
        console.warn('Failed to sync Hall of Fame 4.0 to Firestore:', err);
      }
    }

    ApiService.updateHallOfFame('4.0', updates).catch(() => {});
  };

  const submitInquiry = async (
    payload: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<ContactInquiry> => {
    const newInquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      studentId: (payload.studentId || '').trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };

    try {
      await setDoc(doc(db, 'inquiries', newInquiry.id), sanitizeInquiryForFirestore(newInquiry));
    } catch (err) {
      console.warn('Could not save inquiry to Firestore, keeping in local state:', err);
    }

    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  };

  const updateInquiryStatus = async (id: string, status: 'NEW' | 'RESOLVED') => {
    let target: ContactInquiry | null = null;
    setInquiries((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        target = { ...item, status };
        return target;
      })
    );
    if (target) {
      try {
        await setDoc(doc(db, 'inquiries', id), sanitizeInquiryForFirestore(target));
      } catch (err) {
        console.warn('Failed to update inquiry status in Firestore:', err);
      }
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      console.warn('Failed to delete inquiry from Firestore:', err);
    }
  };

  const clearAllRegistrations = async () => {
    teams.forEach((t) => deletedTeamIdsRef.current.add(t.id));
    firestoreTeamsCacheRef.current = [];
    pgTeamsCacheRef.current = [];
    setTeams([]);
    StorageService.clearTeams();
    try {
      const snap = await getDocs(collection(db, 'teams'));
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        deletedTeamIdsRef.current.add(docSnap.id);
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Failed to clear teams in Cloud Firestore:', err);
    }
    ApiService.clearAllTeams().catch(() => {});
  };

  const resetDatabase = () => {
    StorageService.resetAll();
    setTeams(StorageService.getTeams());
    setFixtures(StorageService.getFixtures());
    setHallOfFame(StorageService.getHallOfFame());
    setNotices(StorageService.getNotices());
    setSchedule(StorageService.getSchedule());
    setGallery(StorageService.getGallery());
    setCommittee(StorageService.getCommittee());
    setInquiries(StorageService.getInquiries());
  };

  return (
    <TournamentContext.Provider
      value={{
        teams,
        fixtures,
        hallOfFame,
        notices,
        schedule,
        gallery,
        committee,
        inquiries,
        isLoading,
        registerTeam,
        updatePaymentStatus,
        updateTeamStatus,
        deleteTeam,
        updateFixture,
        createFixture,
        deleteFixture,
        addNotice,
        deleteNotice,
        updateScheduleItem,
        addGalleryPhoto,
        updateHallOfFame4,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        refreshFromDatabase: () => refreshFromDatabase(false),
        resetDatabase,
        clearAllRegistrations,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
