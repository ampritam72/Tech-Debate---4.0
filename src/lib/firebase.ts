import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDocsFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Team,
  MatchFixture,
  Notice,
  ContactInquiry,
  HallOfFameEdition,
  ScheduleItem
} from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Sanitizes a Team object so it strictly adheres to firebase-blueprint.json
 * and firestore.rules without any undefined fields.
 */
export function sanitizeTeamForFirestore(team: Team): Record<string, any> {
  const rawMembers = Array.isArray(team.members) ? team.members.slice(0, 3) : [];
  while (rawMembers.length < 3) {
    const idx = rawMembers.length + 1;
    rawMembers.push({
      id: `mem-${team.id}-${idx}`,
      teamId: team.id,
      speakerRole: idx as 1 | 2 | 3,
      fullName: `Speaker ${idx}`,
      studentId: 'N/A',
      batch: team.batch || 'N/A',
      semester: 'N/A',
      phone: '01700000000',
      email: '',
      isLeader: idx === 1,
    });
  }

  const cleanMembers = rawMembers.map((m, idx) => ({
    id: String(m.id || `mem-${team.id}-${idx + 1}`).slice(0, 64),
    teamId: String(team.id).slice(0, 64),
    speakerRole: (m.speakerRole === 1 || m.speakerRole === 2 || m.speakerRole === 3 ? m.speakerRole : (idx + 1)) as 1 | 2 | 3,
    fullName: String(m.fullName || `Speaker ${idx + 1}`).trim().slice(0, 120),
    studentId: String(m.studentId || 'N/A').trim().slice(0, 64),
    batch: String(m.batch || team.batch || 'N/A').trim().slice(0, 64),
    semester: String((m as any).semester || '').trim().slice(0, 64),
    phone: String(m.phone || '01700000000').trim().slice(0, 32),
    email: String(m.email || '').trim().slice(0, 120),
    isLeader: Boolean(m.isLeader ?? idx === 0),
  }));

  const validMethod =
    team.payment?.method === 'bKash' || team.payment?.method === 'Nagad' || team.payment?.method === 'Rocket'
      ? team.payment.method
      : 'bKash';

  const validPaymentStatus =
    team.payment?.status === 'VERIFIED' || team.payment?.status === 'REJECTED'
      ? team.payment.status
      : 'PENDING';

  const cleanPayment: Record<string, any> = {
    id: String(team.payment?.id || `pay-${team.id}`).slice(0, 64),
    teamId: String(team.id).slice(0, 64),
    method: validMethod,
    senderNumber: String(team.payment?.senderNumber || '01700000000').trim().slice(0, 32),
    transactionId: String(team.payment?.transactionId || 'TRX-UNKNOWN').trim().toUpperCase().slice(0, 64),
    amount: Number(team.payment?.amount || 350),
    submittedAt: String(team.payment?.submittedAt || team.registrationDate || new Date().toISOString()).slice(0, 64),
    status: validPaymentStatus,
  };

  if (team.payment?.verifiedAt) {
    cleanPayment.verifiedAt = String(team.payment.verifiedAt).slice(0, 64);
  }
  if (team.payment?.rejectionReason) {
    cleanPayment.rejectionReason = String(team.payment.rejectionReason).slice(0, 250);
  }

  const validTeamStatuses = [
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'DISQUALIFIED',
    'ELIMINATED',
    'CHAMPION',
    'RUNNER_UP',
  ];
  const cleanStatus = validTeamStatuses.includes(team.status) ? team.status : 'PENDING';

  const docData: Record<string, any> = {
    id: String(team.id).trim().slice(0, 64),
    name: String(team.name || 'Unnamed Squad').trim().slice(0, 120),
    batch: String(team.batch || 'N/A').trim().slice(0, 64),
    department: String(team.department || 'Computer Science & Engineering (CSE)').trim().slice(0, 150),
    leaderId: String(team.leaderId || cleanMembers[0].id).trim().slice(0, 100),
    registrationDate: String(team.registrationDate || new Date().toISOString()).trim().slice(0, 64),
    status: cleanStatus,
    members: cleanMembers,
    payment: cleanPayment,
  };

  if (typeof team.notes === 'string' && team.notes.trim()) {
    docData.notes = team.notes.trim().slice(0, 500);
  }

  return docData;
}

export function sanitizeFixtureForFirestore(fixture: MatchFixture): Record<string, any> {
  const docData: Record<string, any> = {
    id: String(fixture.id).trim().slice(0, 64),
    matchNumber: Number(fixture.matchNumber || 1),
    roundKey: String(fixture.roundKey || 'QF').trim().slice(0, 16),
    roundName: String(fixture.roundName || 'Quarter-Finals').trim().slice(0, 64),
    govTeam: String(fixture.govTeam || 'TBD').trim().slice(0, 120),
    govShort: String(fixture.govShort || 'TBD').trim().slice(0, 32),
    oppTeam: String(fixture.oppTeam || 'TBD').trim().slice(0, 120),
    oppShort: String(fixture.oppShort || 'TBD').trim().slice(0, 32),
    venue: String(fixture.venue || 'Main Auditorium').trim().slice(0, 120),
    datetime: String(fixture.datetime || 'TBA').trim().slice(0, 100),
    status: ['Upcoming', 'Live', 'Completed', 'Cancelled'].includes(fixture.status)
      ? fixture.status
      : 'Upcoming',
  };
  if (typeof fixture.govScore === 'number') docData.govScore = fixture.govScore;
  if (typeof fixture.oppScore === 'number') docData.oppScore = fixture.oppScore;
  if (fixture.winner) docData.winner = String(fixture.winner).slice(0, 16);
  if (fixture.motion) docData.motion = String(fixture.motion).slice(0, 500);
  if (fixture.bestSpeaker) docData.bestSpeaker = String(fixture.bestSpeaker).slice(0, 120);
  if (Array.isArray(fixture.adjudicators)) docData.adjudicators = fixture.adjudicators.slice(0, 10);
  if (fixture.nextMatchId) docData.nextMatchId = String(fixture.nextMatchId).slice(0, 64);
  return docData;
}

export function sanitizeNoticeForFirestore(notice: Notice): Record<string, any> {
  return {
    id: String(notice.id).trim().slice(0, 64),
    title: String(notice.title || 'Notice').trim().slice(0, 200),
    category: String(notice.category || 'ANNOUNCEMENT').trim().slice(0, 64),
    publishedAt: String(notice.publishedAt || new Date().toISOString()).trim().slice(0, 64),
    content: String(notice.content || '').trim().slice(0, 2000),
    isPinned: Boolean(notice.isPinned),
  };
}

export function sanitizeInquiryForFirestore(inquiry: ContactInquiry): Record<string, any> {
  return {
    id: String(inquiry.id).trim().slice(0, 64),
    name: String(inquiry.name || 'Anonymous').trim().slice(0, 120),
    phone: String(inquiry.phone || 'N/A').trim().slice(0, 32),
    studentId: String(inquiry.studentId || '').trim().slice(0, 64),
    subject: String(inquiry.subject || 'General Inquiry').trim().slice(0, 150),
    message: String(inquiry.message || '').trim().slice(0, 2000),
    createdAt: String(inquiry.createdAt || new Date().toISOString()).trim().slice(0, 64),
    status: inquiry.status === 'RESOLVED' ? 'RESOLVED' : 'NEW',
  };
}

export function sanitizeHallOfFameForFirestore(hof: HallOfFameEdition): Record<string, any> {
  return {
    edition: String(hof.edition || '4.0').trim().slice(0, 16),
    year: Number(hof.year || 2026),
    theme: String(hof.theme || '').trim().slice(0, 300),
    status: hof.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
    champion: {
      teamName: String(hof.champion?.teamName || 'TBD').trim().slice(0, 120),
      batch: String(hof.champion?.batch || '2026').trim().slice(0, 64),
      members: Array.isArray(hof.champion?.members)
        ? hof.champion.members.slice(0, 5).map((m) => String(m).trim().slice(0, 100))
        : ['TBD'],
    },
    runnerUp: {
      teamName: String(hof.runnerUp?.teamName || 'TBD').trim().slice(0, 120),
      batch: String(hof.runnerUp?.batch || '2026').trim().slice(0, 64),
      members: Array.isArray(hof.runnerUp?.members)
        ? hof.runnerUp.members.slice(0, 5).map((m) => String(m).trim().slice(0, 100))
        : ['TBD'],
    },
    bestTournamentDebater: {
      name: String(hof.bestTournamentDebater?.name || 'TBD').trim().slice(0, 120),
      batch: String(hof.bestTournamentDebater?.batch || 'CSE Department').trim().slice(0, 64),
      studentId: String(hof.bestTournamentDebater?.studentId || '').trim().slice(0, 64),
      achievement: String(hof.bestTournamentDebater?.achievement || '').trim().slice(0, 300),
    },
    finalMatchBestDebater: {
      name: String(hof.finalMatchBestDebater?.name || 'TBD').trim().slice(0, 120),
      batch: String(hof.finalMatchBestDebater?.batch || 'CSE Department').trim().slice(0, 64),
      studentId: String(hof.finalMatchBestDebater?.studentId || '').trim().slice(0, 64),
    },
    committee: Array.isArray(hof.committee)
      ? hof.committee.slice(0, 15).map((c) => ({
          name: String(c.name || '').trim().slice(0, 120),
          position: String(c.position || '').trim().slice(0, 120),
          batch: String(c.batch || '').trim().slice(0, 64),
        }))
      : [],
  };
}

export function sanitizeScheduleForFirestore(item: ScheduleItem): Record<string, any> {
  return {
    id: String(item.id).trim().slice(0, 64),
    title: String(item.title || 'Event').trim().slice(0, 150),
    date: String(item.date || 'TBA').trim().slice(0, 64),
    timeRange: String(item.timeRange || 'TBA').trim().slice(0, 64),
    venue: String(item.venue || 'Varendra University, Rajshahi').trim().slice(0, 120),
    description: String(item.description || '').trim().slice(0, 500),
    isCompleted: Boolean(item.isCompleted),
    isActive: Boolean(item.isActive),
  };
}

export {
  doc,
  getDocFromServer,
  getDocsFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
};
