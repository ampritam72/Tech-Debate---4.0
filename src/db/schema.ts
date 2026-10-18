import { pgTable, text, serial, integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table (linked to Firebase / Supabase auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('USER'), // 'ADMIN' or 'USER'
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Teams table
export const teams = pgTable('teams', {
  id: text('id').primaryKey(), // e.g. "TD4-TEAM-101"
  name: text('name').notNull().unique(),
  batch: text('batch').notNull(),
  department: text('department').notNull().default('Computer Science & Engineering'),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'VERIFIED', 'REJECTED', 'DISQUALIFIED'
  notes: text('notes'),
  createdByUid: text('created_by_uid'),
  registrationDate: timestamp('registration_date').defaultNow(),
});

// 3. Team Members table
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  speakerRole: integer('speaker_role').notNull(), // 1, 2, 3
  fullName: text('full_name').notNull(),
  studentId: text('student_id').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  batch: text('batch'),
  isLeader: boolean('is_leader').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  method: text('method').notNull(), // 'bKash', 'Nagad', 'Rocket'
  senderNumber: text('sender_number').notNull(),
  transactionId: text('transaction_id').notNull().unique(),
  amount: integer('amount').notNull().default(350),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'VERIFIED', 'REJECTED'
  rejectionReason: text('rejection_reason'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by'),
});

// 5. Match Fixtures table
export const fixtures = pgTable('fixtures', {
  id: text('id').primaryKey(), // e.g. "M-QF-01"
  round: text('round').notNull(), // 'PLAYOFF', 'ROUND_OF_32', 'QUARTER_FINAL', 'SEMI_FINAL', 'GRAND_FINAL'
  bracketPosition: integer('bracket_position').notNull().default(1),
  team1Id: text('team1_id').references(() => teams.id, { onDelete: 'set null' }),
  team2Id: text('team2_id').references(() => teams.id, { onDelete: 'set null' }),
  team1Name: text('team1_name'),
  team2Name: text('team2_name'),
  team1Role: text('team1_role').notNull().default('GOVERNMENT'),
  team2Role: text('team2_role').notNull().default('OPPOSITION'),
  motion: text('motion'),
  scheduledTime: text('scheduled_time').notNull(),
  venue: text('venue').notNull(),
  adjudicators: text('adjudicators').notNull().default('[]'),
  status: text('status').notNull().default('SCHEDULED'), // 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'
  winnerTeamId: text('winner_team_id'),
  scoreTeam1: numeric('score_team1'),
  scoreTeam2: numeric('score_team2'),
  bestSpeakerName: text('best_speaker_name'),
});

// 6. Notices table
export const notices = pgTable('notices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'ANNOUNCEMENT', 'RULES', 'FIXTURE', 'URGENT'
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  publishedAt: timestamp('published_at').defaultNow(),
});

// 7. Hall of Fame table
export const hallOfFame = pgTable('hall_of_fame', {
  edition: text('edition').primaryKey(), // '1.0', '2.0', '3.0', '4.0'
  year: integer('year').notNull(),
  theme: text('theme').notNull(),
  status: text('status').notNull().default('COMPLETED'),
  championTeam: text('champion_team').notNull(),
  championBatch: text('champion_batch').notNull(),
  championMembers: text('champion_members').notNull(), // JSON string array
  runnerUpTeam: text('runner_up_team').notNull(),
  runnerUpBatch: text('runner_up_batch').notNull(),
  runnerUpMembers: text('runner_up_members').notNull(), // JSON string array
  bestDebaterName: text('best_debater_name').notNull(),
  bestDebaterBatch: text('best_debater_batch').notNull(),
  bestDebaterId: text('best_debater_id'),
  bestDebaterAchievement: text('best_debater_achievement'),
  finalBestDebaterName: text('final_best_debater_name').notNull(),
  finalBestDebaterBatch: text('final_best_debater_batch').notNull(),
  finalBestDebaterId: text('final_best_debater_id'),
  committeeData: text('committee_data').notNull(), // JSON string array
});

// 8. App Settings table (Google Sheets Webhook, Tournament status, etc.)
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 9. Admin Accounts table (secure password hash and salt stored in database)
export const adminAccounts = pgTable('admin_accounts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  role: text('role').notNull().default('Event Super Admin'),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

// Drizzle Relations
export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  payment: one(payments, {
    fields: [teams.id],
    references: [payments.teamId],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  team: one(teams, {
    fields: [payments.teamId],
    references: [teams.id],
  }),
}));
