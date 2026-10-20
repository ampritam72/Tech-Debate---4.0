export type SpeakerRole = 1 | 2 | 3; // 1 = Prime Minister / Leader of Opposition, 2 = Deputy, 3 = Whip / Member

export interface TeamMember {
  id: string;
  teamId: string;
  speakerRole: SpeakerRole;
  fullName: string;
  studentId: string;
  phone: string;
  email: string;
  isLeader: boolean;
  semester?: string;
  batch?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Payment {
  id: string;
  teamId: string;
  method: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  amount: number;
  submittedAt: string;
  verifiedAt?: string;
  status: PaymentStatus;
  rejectionReason?: string;
}

export type TeamStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DISQUALIFIED';

export interface Team {
  id: string; // e.g. "TD4-TEAM-101"
  name: string;
  batch: string; // e.g. "25th", "26th", "27th", "28th"
  department: string;
  leaderId: string;
  members: TeamMember[];
  payment: Payment;
  registrationDate: string;
  status: TeamStatus;
  notes?: string;
}

export type RoundKey = 'R64' | 'R32' | 'R16' | 'QF' | 'SF' | 'GF';

export type MatchStatus = 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';

export interface MatchFixture {
  id: string;
  matchNumber: number;
  roundKey: RoundKey;
  roundName: string;
  govTeam: string;
  govShort: string;
  oppTeam: string;
  oppShort: string;
  govScore?: number;
  oppScore?: number;
  winner?: 'GOV' | 'OPP';
  venue: string;
  datetime: string;
  status: MatchStatus;
  motion?: string;
  bestSpeaker?: string;
  adjudicators?: string[];
  nextMatchId?: string;
}

export interface HallOfFameEdition {
  edition: '1.0' | '2.0' | '3.0' | '4.0';
  year: number;
  theme: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  champion: {
    teamName: string;
    members: string[];
    batch: string;
    photoUrl?: string;
  };
  runnerUp: {
    teamName: string;
    members: string[];
    batch: string;
    photoUrl?: string;
  };
  emergingTeam?: {
    teamName: string;
    members: string[];
    batch: string;
    photoUrl?: string;
  };
  bestTournamentDebater: {
    name: string;
    batch: string;
    studentId: string;
    photoUrl?: string;
    achievement: string;
  };
  finalMatchBestDebater: {
    name: string;
    batch: string;
    studentId: string;
    photoUrl?: string;
  };
  committee: Array<{
    name: string;
    position: string;
    batch: string;
    photoUrl?: string;
  }>;
}

export interface Notice {
  id: string;
  title: string;
  category: 'ANNOUNCEMENT' | 'RULES' | 'FIXTURE' | 'URGENT';
  content: string;
  isPinned: boolean;
  publishedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  venue: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export type GalleryCategory =
  | 'WORKSHOP'
  | 'KIT_DISTRIBUTION'
  | 'OPENING'
  | 'DEBATE_SESSIONS'
  | 'JUDGES'
  | 'FINAL_EVENT'
  | 'AWARDS';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  images?: string[];
  caption: string;
  date: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  studentId: string;
  batch: string;
  email: string;
  phone: string;
  photoUrl?: string;
  bio?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  studentId: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'NEW' | 'RESOLVED';
}
