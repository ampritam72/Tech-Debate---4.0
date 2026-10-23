import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { db, withDbRetry } from './src/db/index.ts';
import crypto from 'crypto';
import { 
  teams, 
  teamMembers, 
  payments, 
  fixtures, 
  notices, 
  hallOfFame, 
  users,
  appSettings,
  adminAccounts
} from './src/db/schema.ts';
import { eq, desc, asc } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Application Settings DB Helpers
async function getSetting(key: string, defaultVal: string = ''): Promise<string> {
  try {
    const row = await withDbRetry(() => db.select().from(appSettings).where(eq(appSettings.key, key)));
    return row.length > 0 ? row[0].value : defaultVal;
  } catch {
    return defaultVal;
  }
}

async function setSetting(key: string, value: string): Promise<void> {
  try {
    await withDbRetry(async () => {
      const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, updatedAt: new Date() }).where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value });
      }
    });
  } catch (err) {
    console.error('Failed to set setting:', key, err);
  }
}

// Background Google Sheet Sync Helper
async function syncTeamToGoogleSheet(teamPayload: {
  teamId: string;
  name: string;
  batch: string;
  department: string;
  members: Array<{ fullName: string; studentId: string; phone: string; speakerRole?: number; isLeader?: boolean }>;
  payment: { method: string; senderNumber: string; transactionId: string; amount: number };
  registrationDate?: string;
}) {
  try {
    const webhookUrl = await getSetting('google_sheet_webhook_url', '');
    const autoSync = await getSetting('google_sheet_auto_sync', 'true');
    if (!webhookUrl || autoSync === 'false') return;

    const row = {
      timestamp: teamPayload.registrationDate || new Date().toISOString(),
      teamId: teamPayload.teamId,
      teamName: teamPayload.name,
      batch: teamPayload.batch,
      department: teamPayload.department || 'Computer Science & Engineering',
      paymentMethod: teamPayload.payment.method,
      senderNumber: teamPayload.payment.senderNumber,
      transactionId: teamPayload.payment.transactionId,
      amount: teamPayload.payment.amount || 350,
      paymentStatus: 'PENDING',
      speaker1Name: teamPayload.members[0]?.fullName || '',
      speaker1Id: teamPayload.members[0]?.studentId || '',
      speaker1Batch: (teamPayload.members[0] as any)?.batch || teamPayload.batch,
      speaker1Phone: teamPayload.members[0]?.phone || '',
      speaker2Name: teamPayload.members[1]?.fullName || '',
      speaker2Id: teamPayload.members[1]?.studentId || '',
      speaker2Batch: (teamPayload.members[1] as any)?.batch || teamPayload.batch,
      speaker2Phone: teamPayload.members[1]?.phone || '',
      speaker3Name: teamPayload.members[2]?.fullName || '',
      speaker3Id: teamPayload.members[2]?.studentId || '',
      speaker3Batch: (teamPayload.members[2] as any)?.batch || teamPayload.batch,
      speaker3Phone: teamPayload.members[2]?.phone || '',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'new_registration', team: row })
    });

    if (response.ok) {
      await setSetting('google_sheet_last_sync', new Date().toISOString());
      await setSetting('google_sheet_last_status', 'SUCCESS');
    } else {
      await setSetting('google_sheet_last_status', `HTTP ${response.status}`);
    }
  } catch (err: any) {
    console.warn('Google Sheet auto-sync error:', err.message);
    await setSetting('google_sheet_last_status', `ERROR: ${err.message}`);
  }
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS so Vercel or external frontends can read/write the Cloud SQL database directly
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// High-concurrency Rate Limiter Middleware for Registration
const registrationRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const registrationLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
  const now = Date.now();
  const windowMs = 3 * 60 * 1000; // 3 minute window
  const maxRequests = 10; // Max 10 attempts per IP per 3 mins

  const record = registrationRateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    registrationRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too many registration attempts from your device/network. Please wait 3 minutes before trying again.'
    });
  }

  record.count += 1;
  next();
};

// ==========================================
// 1. TEAM REGISTRATION & RETRIEVAL APIS
// ==========================================

// GET /api/teams - Retrieve all registered squads with members & payments
app.get('/api/teams', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const { allTeams, allMembers, allPayments } = await withDbRetry(async () => {
      const allTeams = await db.select().from(teams).orderBy(desc(teams.registrationDate));
      const allMembers = await db.select().from(teamMembers);
      const allPayments = await db.select().from(payments);
      return { allTeams, allMembers, allPayments };
    });

    const normalizeServerTeamId = (rawId: string): string => {
      const m = String(rawId || '').match(/^TD4-TEAM-(\d+)$/i);
      if (!m) return rawId;
      let num = parseInt(m[1], 10);
      if (isNaN(num)) return rawId;
      if (num > 100) num = num - 100;
      return `TD4-TEAM-${String(num).padStart(2, '0')}`;
    };

    const populatedTeams = allTeams.map(t => {
      const normTeamId = normalizeServerTeamId(t.id);
      const members = allMembers.filter(m => m.teamId === t.id || m.teamId === normTeamId);
      const payment = allPayments.find(p => p.teamId === t.id || p.teamId === normTeamId) || {
        id: `p-${normTeamId}`,
        teamId: normTeamId,
        method: 'bKash' as const,
        senderNumber: '',
        transactionId: 'N/A',
        amount: 350,
        status: t.status as any,
        rejectionReason: null as string | null,
        submittedAt: t.registrationDate ? t.registrationDate : new Date(),
        verifiedAt: null as Date | null,
        verifiedBy: null as string | null
      };

      return {
        id: normTeamId,
        name: t.name,
        batch: t.batch,
        department: t.department,
        status: t.status,
        notes: t.notes,
        registrationDate: t.registrationDate ? t.registrationDate.toISOString() : new Date().toISOString(),
        leaderId: members.find(m => m.isLeader)?.id || members[0]?.id || '',
        members: members.map(m => ({
          id: m.id,
          teamId: normTeamId,
          speakerRole: m.speakerRole,
          fullName: m.fullName,
          studentId: m.studentId,
          batch: m.batch || t.batch,
          phone: m.phone,
          email: m.email,
          isLeader: m.isLeader
        })),
        payment: {
          id: payment.id,
          teamId: normTeamId,
          method: payment.method,
          senderNumber: payment.senderNumber,
          transactionId: payment.transactionId,
          amount: payment.amount,
          submittedAt: payment.submittedAt instanceof Date ? payment.submittedAt.toISOString() : String(payment.submittedAt || ''),
          verifiedAt: payment.verifiedAt instanceof Date ? payment.verifiedAt.toISOString() : undefined,
          status: payment.status,
          rejectionReason: payment.rejectionReason || undefined
        }
      };
    });

    res.json(populatedTeams);
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch teams' });
  }
});

// Sequential queue to prevent race conditions on team ID generation during concurrent registrations/syncs
let registrationMutex: Promise<any> = Promise.resolve();
function runWithRegistrationLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = registrationMutex.then(fn, fn);
  registrationMutex = next.catch(() => {});
  return next;
}

// POST /api/register - Register team into PostgreSQL database
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    const { id: requestedId, name, batch, department, status: requestedStatus, members: memberList, payment, userUid, isSync } = req.body;

    if (!name || !batch || !memberList || memberList.length !== 3 || !payment) {
      return res.status(400).json({ error: 'Missing mandatory registration fields or roster count' });
    }

    const cleanTeamName = name.trim();
    const cleanTrxId = payment.transactionId.trim().toUpperCase();

    const result = await runWithRegistrationLock(async () => {
      return await withDbRetry(async () => {
        // Check duplicate team name
        const existingTeam = await db.select().from(teams).where(eq(teams.name, cleanTeamName));
        if (existingTeam.length > 0) {
          if (isSync) {
            return { teamId: existingTeam[0].id, skipped: true };
          }
          throw new Error('DUPLICATE_TEAM_NAME');
        }

        // Check duplicate transaction ID
        const existingTrx = await db.select().from(payments).where(eq(payments.transactionId, cleanTrxId));
        if (existingTrx.length > 0) {
          if (isSync) {
            return { teamId: existingTrx[0].teamId, skipped: true };
          }
          throw new Error('DUPLICATE_TRX_ID');
        }

        // Check duplicate student IDs
        const studentIds = memberList.map((m: any) => m.studentId.trim());
        for (const sId of studentIds) {
          const existingMember = await db.select().from(teamMembers).where(eq(teamMembers.studentId, sId));
          if (existingMember.length > 0) {
            if (isSync) {
              return { teamId: existingMember[0].teamId, skipped: true };
            }
            throw new Error(`DUPLICATE_STUDENT_ID:${sId}`);
          }
        }

        // Generate collision-free TD4-TEAM-ID starting from TD4-TEAM-01
        const allExisting = await db.select({ id: teams.id }).from(teams);
        const rawIdSet = new Set(allExisting.map(t => String(t.id || '').trim().toUpperCase()));

        let teamId = '';
        if (requestedId && typeof requestedId === 'string' && requestedId.trim()) {
          const candidate = requestedId.trim();
          if (!rawIdSet.has(candidate.toUpperCase())) {
            teamId = candidate;
          }
        }

        if (!teamId) {
          const existingNums = allExisting
            .map(t => {
              const match = String(t.id || '').match(/TD4-TEAM-(\d+)/i);
              if (!match) return 0;
              let num = parseInt(match[1], 10);
              if (num > 100) num = num - 100;
              return num;
            })
            .filter(n => !isNaN(n) && n > 0);

          let nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
          while (
            rawIdSet.has(`TD4-TEAM-${String(nextNum).padStart(2, '0')}`.toUpperCase()) ||
            rawIdSet.has(`TD4-TEAM-${nextNum + 100}`.toUpperCase())
          ) {
            nextNum++;
          }
          teamId = `TD4-TEAM-${String(nextNum).padStart(2, '0')}`;
        }

        const resolvedTeamStatus =
          requestedStatus && ['VERIFIED', 'PENDING', 'REJECTED', 'DISQUALIFIED'].includes(requestedStatus)
            ? requestedStatus
            : 'PENDING';
        const resolvedPaymentStatus =
          payment.status && ['VERIFIED', 'PENDING', 'REJECTED'].includes(payment.status)
            ? payment.status
            : resolvedTeamStatus === 'VERIFIED'
            ? 'VERIFIED'
            : resolvedTeamStatus === 'REJECTED'
            ? 'REJECTED'
            : 'PENDING';

        const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        // 1. Insert team
        await db.insert(teams).values({
          id: teamId,
          name: cleanTeamName,
          batch,
          department: department || 'Computer Science & Engineering',
          status: resolvedTeamStatus,
          createdByUid: userUid || null,
          notes: 'Submitted via Web Portal'
        }).onConflictDoNothing();

        // 2. Insert members
        for (const [idx, m] of memberList.entries()) {
          await db.insert(teamMembers).values({
            id: `mem-${teamId}-${idx + 1}-${uniqueSuffix}`,
            teamId: teamId,
            speakerRole: m.speakerRole || (idx + 1),
            fullName: m.fullName.trim(),
            studentId: m.studentId.trim(),
            batch: (m.batch || batch || '').trim(),
            phone: (m.phone || '').trim(),
            email: (m.email && typeof m.email === 'string' && m.email.trim())
              ? m.email.trim()
              : `${(m.phone || m.studentId || idx).toString().replace(/\s+/g, '')}@debater.vu.edu.bd`,
            isLeader: !!m.isLeader
          }).onConflictDoNothing();
        }

        // 3. Insert payment
        await db.insert(payments).values({
          id: `pay-${teamId}-${uniqueSuffix}`,
          teamId: teamId,
          method: payment.method,
          senderNumber: payment.senderNumber.trim(),
          transactionId: cleanTrxId,
          amount: payment.amount || 350,
          status: resolvedPaymentStatus
        }).onConflictDoNothing();

        return { teamId, skipped: false };
      });
    });

    if (result.skipped) {
      return res.status(200).json({
        success: true,
        teamId: result.teamId,
        skipped: true,
        message: 'Team already synced in database'
      });
    }

    const newTeamId = result.teamId;

    // Trigger background sync to Google Sheet backup (if configured)
    if (!isSync) {
      syncTeamToGoogleSheet({
        teamId: newTeamId,
        name: cleanTeamName,
        batch,
        department: department || 'Computer Science & Engineering',
        members: memberList,
        payment: {
          method: payment.method,
          senderNumber: payment.senderNumber.trim(),
          transactionId: cleanTrxId,
          amount: payment.amount || 350,
        },
        registrationDate: new Date().toISOString()
      }).catch(err => console.warn('Background sheet sync non-fatal error:', err));
    }

    res.status(201).json({
      success: true,
      teamId: newTeamId,
      message: 'Team successfully registered in database'
    });
  } catch (error: any) {
    const errMsg = error.message || '';
    if (errMsg === 'DUPLICATE_TEAM_NAME') {
      return res.status(400).json({ error: 'A team with this name is already registered' });
    }
    if (errMsg === 'DUPLICATE_TRX_ID') {
      return res.status(400).json({ error: 'This Transaction ID has already been submitted' });
    }
    if (errMsg.startsWith('DUPLICATE_STUDENT_ID:')) {
      const sId = errMsg.split(':')[1];
      return res.status(400).json({ error: `Student ID ${sId} is already registered in another squad` });
    }

    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed. Please check your connection and try again.' });
  }
});

// ==========================================
// 2. ADMIN PAYMENT & SQUAD MANAGEMENT APIS
// ==========================================

// Helper to get both normalized (01+) and legacy (101+) team IDs
function getCandidateTeamIds(teamId: string): string[] {
  const ids = [teamId];
  const m = String(teamId || '').match(/^TD4-TEAM-(\d+)$/i);
  if (m) {
    const num = parseInt(m[1], 10);
    if (!isNaN(num)) {
      if (num > 100) ids.push(`TD4-TEAM-${String(num - 100).padStart(2, '0')}`);
      else ids.push(`TD4-TEAM-${num + 100}`);
    }
  }
  return Array.from(new Set(ids));
}

// PATCH /api/admin/payments/:teamId - Verify or reject payment
app.patch('/api/admin/payments/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, rejectionReason, verifiedBy } = req.body;

    if (!['VERIFIED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const candidateIds = getCandidateTeamIds(teamId);
    await withDbRetry(async () => {
      for (const cid of candidateIds) {
        await db.update(payments)
          .set({
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            verifiedAt: status === 'VERIFIED' ? new Date() : null,
            verifiedBy: verifiedBy || 'Event Admin'
          })
          .where(eq(payments.teamId, cid));

        await db.update(teams)
          .set({
            status: status === 'VERIFIED' ? 'VERIFIED' : (status === 'REJECTED' ? 'REJECTED' : 'PENDING')
          })
          .where(eq(teams.id, cid));
      }
    });

    res.json({ success: true, message: `Payment updated to ${status}` });
  } catch (error: any) {
    console.error('Payment update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment status' });
  }
});

// PATCH /api/admin/teams/:teamId - Update team details
app.patch('/api/admin/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, notes } = req.body;

    const candidateIds = getCandidateTeamIds(teamId);
    await withDbRetry(async () => {
      for (const cid of candidateIds) {
        await db.update(teams)
          .set({
            status: status || undefined,
            notes: notes !== undefined ? notes : undefined
          })
          .where(eq(teams.id, cid));
      }
    });

    res.json({ success: true, message: 'Team updated successfully' });
  } catch (error: any) {
    console.error('Team update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
});

// DELETE /api/admin/teams/clear-all - Clear all teams, members, and payment records
app.delete('/api/admin/teams/clear-all', async (req, res) => {
  try {
    await withDbRetry(async () => {
      await db.delete(payments);
      await db.delete(teamMembers);
      await db.delete(teams);
    });
    res.json({ success: true, message: 'All registered squads and payments have been completely cleared from the database.' });
  } catch (error: any) {
    console.error('Clear all teams error:', error);
    res.status(500).json({ error: error.message || 'Failed to clear registration data' });
  }
});

// DELETE /api/admin/teams/:teamId - Permanently remove team, members, and payment from database
app.delete('/api/admin/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const candidateIds = getCandidateTeamIds(teamId);
    await withDbRetry(async () => {
      for (const cid of candidateIds) {
        await db.delete(payments).where(eq(payments.teamId, cid));
        await db.delete(teamMembers).where(eq(teamMembers.teamId, cid));
        await db.delete(teams).where(eq(teams.id, cid));
      }
    });
    res.json({ success: true, message: 'Team permanently deleted from database' });
  } catch (error: any) {
    console.error('Team delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete team' });
  }
});

// GET /api/export/teams.csv - Export CSV of all registered teams with Google Sheets UTF-8 formatting
app.get('/api/export/teams.csv', async (req, res) => {
  try {
    const { allTeams, allMembers, allPayments } = await withDbRetry(async () => {
      const allTeams = await db.select().from(teams).orderBy(asc(teams.registrationDate));
      const allMembers = await db.select().from(teamMembers);
      const allPayments = await db.select().from(payments);
      return { allTeams, allMembers, allPayments };
    });

    const headers = [
      'Timestamp',
      'Team ID',
      'Team Name',
      'Batch',
      'Department',
      'Payment Method',
      'Sender Number',
      'Trx ID',
      'Amount (BDT)',
      'Payment Status',
      'Speaker 1 (Leader)',
      'Speaker 1 ID',
      'Speaker 1 Batch',
      'Speaker 1 Phone',
      'Speaker 2',
      'Speaker 2 ID',
      'Speaker 2 Batch',
      'Speaker 2 Phone',
      'Speaker 3',
      'Speaker 3 ID',
      'Speaker 3 Batch',
      'Speaker 3 Phone'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = allTeams.map(t => {
      const members = allMembers.filter(m => m.teamId === t.id).sort((a, b) => a.speakerRole - b.speakerRole);
      const payment = allPayments.find(p => p.teamId === t.id);
      return [
        escapeCsv(t.registrationDate ? t.registrationDate.toISOString() : ''),
        escapeCsv(t.id),
        escapeCsv(t.name),
        escapeCsv(t.batch),
        escapeCsv(t.department || 'Department of CSE, Varendra University, Rajshahi'),
        escapeCsv(payment?.method || 'bKash'),
        escapeCsv(payment?.senderNumber || ''),
        escapeCsv(payment?.transactionId || ''),
        escapeCsv(payment?.amount || 350),
        escapeCsv(payment?.status || t.status),
        escapeCsv(members[0]?.fullName || ''),
        escapeCsv(members[0]?.studentId || ''),
        escapeCsv(members[0]?.batch || t.batch),
        escapeCsv(members[0]?.phone || ''),
        escapeCsv(members[1]?.fullName || ''),
        escapeCsv(members[1]?.studentId || ''),
        escapeCsv(members[1]?.batch || t.batch),
        escapeCsv(members[1]?.phone || ''),
        escapeCsv(members[2]?.fullName || ''),
        escapeCsv(members[2]?.studentId || ''),
        escapeCsv(members[2]?.batch || t.batch),
        escapeCsv(members[2]?.phone || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="tech-debate-4-registrations.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).send('Error exporting teams CSV: ' + error.message);
  }
});

// GET /api/admin/google-sheet - Fetch current Google Sheet backup settings
app.get('/api/admin/google-sheet', async (req, res) => {
  try {
    const webhookUrl = await getSetting('google_sheet_webhook_url', '');
    const autoSync = (await getSetting('google_sheet_auto_sync', 'true')) === 'true';
    const lastSyncAt = await getSetting('google_sheet_last_sync', '');
    const lastStatus = await getSetting('google_sheet_last_status', 'IDLE');
    
    const host = req.get('host') || 'ais-dev-p3sggzvunae75w6qozcp3v-113423018580.asia-east1.run.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const liveCsvUrl = `${protocol}://${host}/api/export/teams.csv`;
    const googleSheetFormula = `=IMPORTDATA("${liveCsvUrl}")`;

    res.json({
      webhookUrl,
      autoSync,
      lastSyncAt: lastSyncAt || null,
      lastStatus: lastStatus || 'IDLE',
      liveCsvUrl,
      googleSheetFormula
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Google Sheet settings' });
  }
});

// POST /api/admin/google-sheet - Update Google Sheet backup settings
app.post('/api/admin/google-sheet', async (req, res) => {
  try {
    const { webhookUrl, autoSync } = req.body;
    if (webhookUrl !== undefined) {
      await setSetting('google_sheet_webhook_url', typeof webhookUrl === 'string' ? webhookUrl.trim() : '');
    }
    if (autoSync !== undefined) {
      await setSetting('google_sheet_auto_sync', autoSync ? 'true' : 'false');
    }
    res.json({ success: true, message: 'Google Sheet settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save Google Sheet settings' });
  }
});

// POST /api/admin/google-sheet/sync - Manually trigger bulk sync to Google Sheet
app.post('/api/admin/google-sheet/sync', async (req, res) => {
  try {
    const webhookUrl = await getSetting('google_sheet_webhook_url', '');
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Please enter and save your Google Sheet Webhook URL first.' });
    }

    const { allTeams, allMembers, allPayments } = await withDbRetry(async () => {
      const allTeams = await db.select().from(teams).orderBy(asc(teams.registrationDate));
      const allMembers = await db.select().from(teamMembers);
      const allPayments = await db.select().from(payments);
      return { allTeams, allMembers, allPayments };
    });

    const rows = allTeams.map(t => {
      const members = allMembers.filter(m => m.teamId === t.id).sort((a, b) => a.speakerRole - b.speakerRole);
      const payment = allPayments.find(p => p.teamId === t.id);
      return {
        timestamp: t.registrationDate ? t.registrationDate.toISOString() : new Date().toISOString(),
        teamId: t.id,
        teamName: t.name,
        batch: t.batch,
        department: t.department,
        paymentMethod: payment?.method || 'bKash',
        senderNumber: payment?.senderNumber || '',
        transactionId: payment?.transactionId || '',
        amount: payment?.amount || 350,
        paymentStatus: payment?.status || t.status,
        speaker1Name: members[0]?.fullName || '',
        speaker1Id: members[0]?.studentId || '',
        speaker1Batch: members[0]?.batch || t.batch,
        speaker1Phone: members[0]?.phone || '',
        speaker2Name: members[1]?.fullName || '',
        speaker2Id: members[1]?.studentId || '',
        speaker2Batch: members[1]?.batch || t.batch,
        speaker2Phone: members[1]?.phone || '',
        speaker3Name: members[2]?.fullName || '',
        speaker3Id: members[2]?.studentId || '',
        speaker3Batch: members[2]?.batch || t.batch,
        speaker3Phone: members[2]?.phone || ''
      };
    });

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk_sync', count: rows.length, teams: rows })
    });

    const now = new Date().toISOString();
    await setSetting('google_sheet_last_sync', now);
    if (resp.ok) {
      await setSetting('google_sheet_last_status', 'SUCCESS');
      res.json({ success: true, count: rows.length, message: `Successfully synced ${rows.length} squad(s) to Google Sheet!` });
    } else {
      await setSetting('google_sheet_last_status', `HTTP ${resp.status}`);
      res.status(502).json({ error: `Google Sheet responded with status ${resp.status}` });
    }
  } catch (error: any) {
    await setSetting('google_sheet_last_status', `ERROR: ${error.message}`);
    res.status(500).json({ error: error.message || 'Failed to sync with Google Sheet' });
  }
});

// ==========================================
// 3. TOURNAMENT FIXTURES & RESULT APIS
// ==========================================

// GET /api/fixtures - Retrieve all fixtures
app.get('/api/fixtures', async (req, res) => {
  try {
    const allFixtures = await withDbRetry(() => db.select().from(fixtures).orderBy(asc(fixtures.bracketPosition)));
    const parsed = allFixtures.map(f => {
      let adjs = [];
      try {
        adjs = JSON.parse(f.adjudicators || '[]');
      } catch {
        adjs = [f.adjudicators];
      }
      return {
        ...f,
        adjudicators: adjs,
        scoreTeam1: f.scoreTeam1 ? parseFloat(f.scoreTeam1) : undefined,
        scoreTeam2: f.scoreTeam2 ? parseFloat(f.scoreTeam2) : undefined,
      };
    });
    res.json(parsed);
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch fixtures' });
  }
});

// POST /api/admin/fixtures - Create match fixture
app.post('/api/admin/fixtures', async (req, res) => {
  try {
    const fixtureData = req.body;
    const newId = fixtureData.id || `M-${Date.now().toString().slice(-6)}`;

    await db.insert(fixtures).values({
      id: newId,
      round: fixtureData.round || 'ROUND_OF_32',
      bracketPosition: fixtureData.bracketPosition || 1,
      team1Id: fixtureData.team1Id || null,
      team2Id: fixtureData.team2Id || null,
      team1Name: fixtureData.team1Name || 'TBD',
      team2Name: fixtureData.team2Name || 'TBD',
      team1Role: fixtureData.team1Role || 'GOVERNMENT',
      team2Role: fixtureData.team2Role || 'OPPOSITION',
      motion: fixtureData.motion || null,
      scheduledTime: fixtureData.scheduledTime || new Date().toISOString(),
      venue: fixtureData.venue || 'Gallery Room 304, CSE Building',
      adjudicators: JSON.stringify(fixtureData.adjudicators || []),
      status: fixtureData.status || 'SCHEDULED',
      winnerTeamId: fixtureData.winnerTeamId || null,
      scoreTeam1: fixtureData.scoreTeam1 ? String(fixtureData.scoreTeam1) : null,
      scoreTeam2: fixtureData.scoreTeam2 ? String(fixtureData.scoreTeam2) : null,
      bestSpeakerName: fixtureData.bestSpeakerName || null
    });

    res.status(201).json({ success: true, id: newId });
  } catch (error: any) {
    console.error('Fixture create error:', error);
    res.status(500).json({ error: error.message || 'Failed to create fixture' });
  }
});

// PATCH /api/admin/fixtures/:id - Update fixture (scores, winner, status, motion)
app.patch('/api/admin/fixtures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const valuesToUpdate: any = {};
    if (updates.round !== undefined) valuesToUpdate.round = updates.round;
    if (updates.team1Name !== undefined) valuesToUpdate.team1Name = updates.team1Name;
    if (updates.team2Name !== undefined) valuesToUpdate.team2Name = updates.team2Name;
    if (updates.team1Id !== undefined) valuesToUpdate.team1Id = updates.team1Id;
    if (updates.team2Id !== undefined) valuesToUpdate.team2Id = updates.team2Id;
    if (updates.motion !== undefined) valuesToUpdate.motion = updates.motion;
    if (updates.status !== undefined) valuesToUpdate.status = updates.status;
    if (updates.winnerTeamId !== undefined) valuesToUpdate.winnerTeamId = updates.winnerTeamId;
    if (updates.scoreTeam1 !== undefined) valuesToUpdate.scoreTeam1 = updates.scoreTeam1 !== null ? String(updates.scoreTeam1) : null;
    if (updates.scoreTeam2 !== undefined) valuesToUpdate.scoreTeam2 = updates.scoreTeam2 !== null ? String(updates.scoreTeam2) : null;
    if (updates.bestSpeakerName !== undefined) valuesToUpdate.bestSpeakerName = updates.bestSpeakerName;
    if (updates.scheduledTime !== undefined) valuesToUpdate.scheduledTime = updates.scheduledTime;
    if (updates.venue !== undefined) valuesToUpdate.venue = updates.venue;
    if (updates.adjudicators !== undefined) {
      valuesToUpdate.adjudicators = Array.isArray(updates.adjudicators) ? JSON.stringify(updates.adjudicators) : updates.adjudicators;
    }

    await db.update(fixtures).set(valuesToUpdate).where(eq(fixtures.id, id));
    res.json({ success: true, message: 'Fixture updated successfully' });
  } catch (error: any) {
    console.error('Fixture update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update fixture' });
  }
});

// DELETE /api/admin/fixtures/:id
app.delete('/api/admin/fixtures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(fixtures).where(eq(fixtures.id, id));
    res.json({ success: true, message: 'Fixture deleted' });
  } catch (error: any) {
    console.error('Fixture delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete fixture' });
  }
});

// ==========================================
// 4. NOTICES APIS
// ==========================================

app.get('/api/notices', async (req, res) => {
  try {
    const allNotices = await withDbRetry(() => db.select().from(notices).orderBy(desc(notices.publishedAt)));
    res.json(allNotices.map(n => ({
      ...n,
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : new Date().toISOString()
    })));
  } catch (error: any) {
    console.error('Notices error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notices' });
  }
});

app.post('/api/admin/notices', async (req, res) => {
  try {
    const { title, category, content, isPinned } = req.body;
    const newId = `n-${Date.now()}`;
    await db.insert(notices).values({
      id: newId,
      title,
      category,
      content,
      isPinned: !!isPinned
    });
    res.status(201).json({ success: true, id: newId });
  } catch (error: any) {
    console.error('Notice create error:', error);
    res.status(500).json({ error: error.message || 'Failed to create notice' });
  }
});

app.delete('/api/admin/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(notices).where(eq(notices.id, id));
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    console.error('Notice delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete notice' });
  }
});

// ==========================================
// 5. HALL OF FAME APIS
// ==========================================

app.get('/api/hall-of-fame', async (req, res) => {
  try {
    const allHOF = await withDbRetry(() => db.select().from(hallOfFame).orderBy(asc(hallOfFame.year)));
    const parsed = allHOF.map(h => ({
      edition: h.edition,
      year: h.year,
      theme: h.theme,
      status: h.status,
      champion: {
        teamName: h.championTeam,
        batch: h.championBatch,
        members: JSON.parse(h.championMembers || '[]')
      },
      runnerUp: {
        teamName: h.runnerUpTeam,
        batch: h.runnerUpBatch,
        members: JSON.parse(h.runnerUpMembers || '[]')
      },
      bestTournamentDebater: {
        name: h.bestDebaterName,
        batch: h.bestDebaterBatch,
        studentId: h.bestDebaterId || '',
        achievement: h.bestDebaterAchievement || ''
      },
      finalMatchBestDebater: {
        name: h.finalBestDebaterName,
        batch: h.finalBestDebaterBatch,
        studentId: h.finalBestDebaterId || ''
      },
      committee: JSON.parse(h.committeeData || '[]')
    }));
    res.json(parsed);
  } catch (error: any) {
    console.error('HOF error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch hall of fame' });
  }
});

app.patch('/api/admin/hall-of-fame/:edition', async (req, res) => {
  try {
    const { edition } = req.params;
    const updates = req.body;

    const valuesToUpdate: any = {};
    if (updates.theme !== undefined) valuesToUpdate.theme = updates.theme;
    if (updates.status !== undefined) valuesToUpdate.status = updates.status;
    if (updates.champion?.teamName !== undefined) valuesToUpdate.championTeam = updates.champion.teamName;
    if (updates.champion?.batch !== undefined) valuesToUpdate.championBatch = updates.champion.batch;
    if (updates.champion?.members !== undefined) valuesToUpdate.championMembers = JSON.stringify(updates.champion.members);
    if (updates.runnerUp?.teamName !== undefined) valuesToUpdate.runnerUpTeam = updates.runnerUp.teamName;
    if (updates.runnerUp?.batch !== undefined) valuesToUpdate.runnerUpBatch = updates.runnerUp.batch;
    if (updates.runnerUp?.members !== undefined) valuesToUpdate.runnerUpMembers = JSON.stringify(updates.runnerUp.members);
    if (updates.bestTournamentDebater?.name !== undefined) valuesToUpdate.bestDebaterName = updates.bestTournamentDebater.name;
    if (updates.bestTournamentDebater?.batch !== undefined) valuesToUpdate.bestDebaterBatch = updates.bestTournamentDebater.batch;
    if (updates.bestTournamentDebater?.studentId !== undefined) valuesToUpdate.bestDebaterId = updates.bestTournamentDebater.studentId;
    if (updates.bestTournamentDebater?.achievement !== undefined) valuesToUpdate.bestDebaterAchievement = updates.bestTournamentDebater.achievement;
    if (updates.finalMatchBestDebater?.name !== undefined) valuesToUpdate.finalBestDebaterName = updates.finalMatchBestDebater.name;
    if (updates.finalMatchBestDebater?.batch !== undefined) valuesToUpdate.finalBestDebaterBatch = updates.finalMatchBestDebater.batch;
    if (updates.finalMatchBestDebater?.studentId !== undefined) valuesToUpdate.finalBestDebaterId = updates.finalMatchBestDebater.studentId;

    await db.update(hallOfFame).set(valuesToUpdate).where(eq(hallOfFame.edition, edition));
    res.json({ success: true, message: `Hall of Fame ${edition} updated` });
  } catch (error: any) {
    console.error('HOF update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update hall of fame' });
  }
});

// ==========================================
// 6. USER AUTHENTICATION SYNC API
// ==========================================

app.post('/api/auth/sync', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email required' });
    }

    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length === 0) {
      const isSuperAdmin = 
        email === 'abirmahmudpritam001@gmail.com' || 
        email.toLowerCase() === 'admin@techdebate4.com' || 
        email.includes('admin');
      const newUser = await db.insert(users).values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: isSuperAdmin ? 'ADMIN' : 'USER'
      }).returning();
      return res.json({ user: newUser[0] });
    }

    res.json({ user: existing[0] });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Database-backed Admin Authentication & Seeding
function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + ':' + salt).digest('hex');
}

async function ensureAdminAccounts() {
  try {
    const salt = 'td4_secure_salt_2026_cse';
    const passwordHash = hashPassword('techdebate4@!!', salt);
    const existing = await db.select().from(adminAccounts).where(eq(adminAccounts.email, 'admin@techdebate4.com'));
    if (existing.length === 0) {
      await db.insert(adminAccounts).values({
        email: 'admin@techdebate4.com',
        passwordHash,
        salt,
        role: 'Event Super Admin',
        displayName: 'Tech Debate 4.0 Super Admin'
      });
      console.log('Seeded admin@techdebate4.com in database admin_accounts table');
    } else {
      await db.update(adminAccounts)
        .set({ passwordHash, salt })
        .where(eq(adminAccounts.email, 'admin@techdebate4.com'));
    }
  } catch (err) {
    console.error('Error ensuring admin accounts in database:', err);
  }
}

// POST /api/auth/admin-login - Secure Database Verification
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const targetEmail = email || 'admin@techdebate4.com';

    // Query database for admin credentials
    const accounts = await withDbRetry(() => 
      db.select().from(adminAccounts).where(eq(adminAccounts.email, targetEmail))
    );

    if (accounts.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const account = accounts[0];
    const incomingHash = hashPassword(password, account.salt);

    if (incomingHash !== account.passwordHash) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update lastLoginAt
    await db.update(adminAccounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminAccounts.id, account.id));

    res.json({
      success: true,
      user: {
        email: account.email,
        role: account.role,
        displayName: account.displayName
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message || 'Authentication error' });
  }
});

// ==========================================
// 6.5 GALLERY EDITOR & PUBLIC/GALLERY STORAGE APIS
// ==========================================

const GALLERY_DIR = path.join(__dirname, 'public', 'gallery');
const GALLERY_MANIFEST_PATH = path.join(GALLERY_DIR, 'manifest.json');

const DEFAULT_GALLERY_SEGMENTS = [
  {
    id: 'g-workshop',
    title: 'Workshop - Debate Unlocked',
    category: 'WORKSHOP',
    imageUrl: '',
    images: [] as string[],
    caption: 'Faculty Convenor and advisors conducting the pre-tournament workshop on Asian Parliamentary debate structure.',
    date: '03 September'
  },
  {
    id: 'g-kit',
    title: 'Official Delegate Kit Distribution',
    category: 'KIT_DISTRIBUTION',
    imageUrl: '',
    images: [] as string[],
    caption: 'Participating CSE debaters receiving their official tournament badges, folders, and delegate kits.',
    date: '27 October'
  },
  {
    id: 'g-sessions',
    title: 'Parliamentary Debate Sessions & Rebuttals',
    category: 'DEBATE_SESSIONS',
    imageUrl: '',
    images: [] as string[],
    caption: 'Fierce debate sessions, constructive speeches, and sharp Point of Information (POI) exchanges on stage.',
    date: '28 October'
  },
  {
    id: 'g-judges',
    title: 'Adjudication Core Evaluation Panel',
    category: 'JUDGES',
    imageUrl: '',
    images: [] as string[],
    caption: 'Distinguished faculty adjudicators deliberating on speaker marks and motion interpretations.',
    date: 'October 2026'
  },
  {
    id: 'g-final',
    title: 'Grand Final Showdown on Stage',
    category: 'FINAL_EVENT',
    imageUrl: '',
    images: [] as string[],
    caption: 'Grand final clash in the central auditorium packed with CSE faculty and students.',
    date: 'Upcoming'
  },
  {
    id: 'g-awards',
    title: 'Championship Trophy & Award Ceremony',
    category: 'AWARDS',
    imageUrl: '',
    images: [] as string[],
    caption: 'Official conferral of Champion, Runners-Up, Emerging Team, and Best Tournament Debater awards.',
    date: 'Upcoming'
  }
];

function ensureGalleryDirectory() {
  try {
    if (!fs.existsSync(GALLERY_DIR)) {
      fs.mkdirSync(GALLERY_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create public/gallery directory:', err);
  }
}

async function loadGallerySegments(): Promise<any[]> {
  ensureGalleryDirectory();
  let savedSegments: any[] | null = null;

  try {
    if (fs.existsSync(GALLERY_MANIFEST_PATH)) {
      const raw = fs.readFileSync(GALLERY_MANIFEST_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        savedSegments = parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read public/gallery/manifest.json:', err);
  }

  if (!savedSegments) {
    try {
      const fromDb = await getSetting('gallery_segments_v1', '');
      if (fromDb) {
        const parsed = JSON.parse(fromDb);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedSegments = parsed;
        }
      }
    } catch {}
  }

  // Discover any .png, .jpg, .jpeg files present in public/gallery
  let diskFiles: string[] = [];
  try {
    diskFiles = fs
      .readdirSync(GALLERY_DIR)
      .filter((f) => /\.(png|jpe?g)$/i.test(f))
      .sort();
  } catch {}

  const diskUrlSet = new Set(diskFiles.map((f) => `/gallery/${f}`));

  const merged = DEFAULT_GALLERY_SEGMENTS.map((def) => {
    const existing = savedSegments?.find((s) => s.category === def.category) || def;
    const rawImages: string[] = Array.isArray(existing.images)
      ? existing.images
      : existing.imageUrl
      ? [existing.imageUrl]
      : [];

    // Keep valid images that exist in public/gallery (or valid data/http URLs if any, excluding old unsplash placeholders)
    const validImages = rawImages.filter((url) => {
      if (!url || typeof url !== 'string') return false;
      if (url.includes('images.unsplash.com')) return false;
      if (url.startsWith('/gallery/')) {
        return diskUrlSet.has(url);
      }
      return true;
    });

    // Also auto-attach any disk file in public/gallery whose filename starts with `<category>-` or `<category>_`
    const catPrefix = def.category.toLowerCase();
    for (const file of diskFiles) {
      const lower = file.toLowerCase();
      if (lower.startsWith(`${catPrefix}-`) || lower.startsWith(`${catPrefix}_`)) {
        const fileUrl = `/gallery/${file}`;
        if (!validImages.includes(fileUrl)) {
          validImages.push(fileUrl);
        }
      }
    }

    return {
      id: existing.id || def.id,
      title: existing.title || def.title,
      category: def.category,
      caption: existing.caption || def.caption,
      date: existing.date || def.date,
      images: validImages,
      imageUrl: validImages[0] || '',
    };
  });

  return merged;
}

async function saveGallerySegments(segments: any[]) {
  ensureGalleryDirectory();
  try {
    fs.writeFileSync(GALLERY_MANIFEST_PATH, JSON.stringify(segments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write public/gallery/manifest.json:', err);
  }
  await setSetting('gallery_segments_v1', JSON.stringify(segments));
}

// GET /api/gallery - Retrieve all 6 gallery segments and their uploaded pictures
app.get('/api/gallery', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const segments = await loadGallerySegments();
    res.json(segments);
  } catch (error: any) {
    console.error('Error loading gallery:', error);
    res.status(500).json({ error: error.message || 'Failed to load gallery' });
  }
});

// POST /api/admin/gallery/upload - Upload one or multiple (.png, .jpg, .jpeg) pictures to public/gallery
app.post('/api/admin/gallery/upload', async (req, res) => {
  try {
    ensureGalleryDirectory();
    const { category, files } = req.body;

    if (!category || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Category and at least one image file are required' });
    }

    const safeCategory = String(category)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');

    const savedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      const dataUrl = String(item?.dataUrl || '');
      const originalName = String(item?.fileName || `photo-${i + 1}.jpg`);

      const match = dataUrl.match(/^data:image\/(png|jpe?g);base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({
          error: `Unsupported image format for "${originalName}". Only PNG, JPG, and JPEG formats are allowed.`,
        });
      }

      const mimeSubtype = match[1].toLowerCase();
      const base64Data = match[2];

      // Preserve .png, .jpg, or .jpeg extension from original filename if valid
      const origExtMatch = originalName.match(/\.(png|jpg|jpeg)$/i);
      const ext = origExtMatch
        ? origExtMatch[1].toLowerCase()
        : mimeSubtype === 'png'
        ? 'png'
        : 'jpg';

      const baseSlug = originalName
        .replace(/\.(png|jpg|jpeg)$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 32) || 'photo';

      const uniqueFileName = `${safeCategory}-${Date.now()}-${i + 1}-${baseSlug}.${ext}`;
      const filePath = path.join(GALLERY_DIR, uniqueFileName);

      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      savedUrls.push(`/gallery/${uniqueFileName}`);
    }

    // Automatically append uploaded URLs to the segment and persist manifest
    const segments = await loadGallerySegments();
    const updatedSegments = segments.map((seg) => {
      if (seg.category !== category) return seg;
      const nextImages = Array.from(new Set([...(seg.images || []), ...savedUrls]));
      return {
        ...seg,
        images: nextImages,
        imageUrl: nextImages[0] || '',
      };
    });

    await saveGallerySegments(updatedSegments);

    res.status(201).json({
      success: true,
      urls: savedUrls,
      segments: updatedSegments,
      message: `Saved ${savedUrls.length} picture(s) to public/gallery`,
    });
  } catch (error: any) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload gallery pictures' });
  }
});

// PUT /api/admin/gallery - Save gallery segments (titles, captions, dates, ordered images)
app.put('/api/admin/gallery', async (req, res) => {
  try {
    const { segments } = req.body;
    if (!Array.isArray(segments)) {
      return res.status(400).json({ error: 'Segments array is required' });
    }
    await saveGallerySegments(segments);
    res.json({ success: true, segments });
  } catch (error: any) {
    console.error('Gallery update error:', error);
    res.status(500).json({ error: error.message || 'Failed to save gallery segments' });
  }
});

// DELETE /api/admin/gallery/file - Remove a specific picture from a segment and delete from public/gallery
app.delete('/api/admin/gallery/file', async (req, res) => {
  try {
    const { category, imageUrl } = req.body;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('/gallery/')) {
      const fileName = path.basename(imageUrl);
      const targetPath = path.join(GALLERY_DIR, fileName);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
    }

    const segments = await loadGallerySegments();
    const updatedSegments = segments.map((seg) => {
      if (category && seg.category !== category) return seg;
      const nextImages = (seg.images || []).filter((u: string) => u !== imageUrl);
      return {
        ...seg,
        images: nextImages,
        imageUrl: nextImages[0] || '',
      };
    });

    await saveGallerySegments(updatedSegments);
    res.json({ success: true, segments: updatedSegments });
  } catch (error: any) {
    console.error('Gallery file delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete gallery image' });
  }
});

// ==========================================
// 6.6 OFFICIAL RULEBOOK & CODE OF CONDUCT PDF DOWNLOAD API
// ==========================================

const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_RULEBOOK_PATH = path.join(PUBLIC_DIR, 'rulebook.pdf');
const DEFAULT_CONDUCT_PATH = path.join(PUBLIC_DIR, 'code-of-conduct.pdf');

function buildPdfBufferFromLines(lines: string[]): Buffer {
  const textOps = lines
    .map((line, idx) => {
      const safe = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      const y = 740 - idx * 24;
      const font = idx === 0 ? '/F1 14 Tf' : idx < 3 ? '/F1 11 Tf' : '/F1 10 Tf';
      return `BT ${font} 50 ${y} Td (${safe}) Tj ET`;
    })
    .join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(textOps, 'utf-8')} >>\nstream\n${textOps}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf-8');
}

function buildMinimalRulebookPdfBuffer(): Buffer {
  return buildPdfBufferFromLines([
    'TECH DEBATE 4.0 - PARLIAMENTARY DEBATE RULES & ADJUDICATION GUIDELINES',
    'Department of Computer Science & Engineering (CSE)',
    'Varendra University, Rajshahi',
    '------------------------------------------------------------',
    '1. FORMAT: Asian Parliamentary (3 vs 3) - Government vs Opposition',
    '2. SQUAD: 3 Active Speakers per Team (CSE Undergraduates)',
    '3. SUBSTANTIVE SPEECHES (4 MINUTES):',
    '   - 0:00 to 1:00 : Protected Time (No POIs)',
    '   - 1:00 Minute  : Single Bell (Floor Open for POIs)',
    '   - 3:00 Minutes : Single Bell (1-Min Warning / POIs Closed)',
    '   - 4:00 Minutes : Double Bell (Time Limit / 20s Grace Period)',
    '   - 4:20+ Minutes: Continuous Bell (Overtime Penalty)',
    '4. REPLY SPEECHES (3 MINUTES - 1st or 2nd Speaker Only, No POIs):',
    '   - 2:00 Minutes : Single Bell (1-Min Warning Bell)',
    '   - 3:00 Minutes : Double Bell (Time Limit / 20s Grace Period)',
    '   - 3:20+ Minutes: Continuous Bell (Overtime Penalty)',
    '5. ADJUDICATION RUBRIC: Matter (40%), Manner (40%), Method (20%)',
  ]);
}

function buildMinimalConductPdfBuffer(): Buffer {
  return buildPdfBufferFromLines([
    'TECH DEBATE 4.0 - OFFICIAL CODE OF CONDUCT & TOURNAMENT RULES',
    'Department of Computer Science & Engineering (CSE)',
    'Varendra University, Rajshahi',
    '------------------------------------------------------------',
    '1. ELIGIBILITY: Open exclusively to enrolled CSE students of Varendra University.',
    '2. PUNCTUALITY & REPORTING: Teams must report 20 minutes before scheduled rounds.',
    '3. ACADEMIC INTEGRITY & FAIR PLAY:',
    '   - Fabricating citations or statistics is strictly prohibited.',
    '   - Use of AI/internet devices during preparation or debate rounds is forbidden.',
    '4. DECORUM & EQUITY POLICY:',
    '   - Personal attacks, harassment, or discriminatory language leads to disqualification.',
    '   - Respectful parliamentary language must be maintained toward opponents and judges.',
    '5. DRESS CODE: Formal or smart academic attire is required on stage.',
    '6. ADJUDICATION FINALITY: Decisions of the Adjudication Core and Chief Adjudicator are final.',
  ]);
}

function ensureDefaultRulebookPdf() {
  try {
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    if (!fs.existsSync(DEFAULT_RULEBOOK_PATH)) {
      fs.writeFileSync(DEFAULT_RULEBOOK_PATH, buildMinimalRulebookPdfBuffer());
    }
    if (!fs.existsSync(DEFAULT_CONDUCT_PATH)) {
      fs.writeFileSync(DEFAULT_CONDUCT_PATH, buildMinimalConductPdfBuffer());
    }
  } catch (err) {
    console.error('Failed to ensure default rulebook PDFs:', err);
  }
}

function resolveDocumentPdfPath(docType: 'parliamentary' | 'conduct'): {
  filePath: string;
  downloadName: string;
} {
  ensureDefaultRulebookPdf();
  try {
    if (docType === 'conduct') {
      const candidates = ['code-of-conduct.pdf', 'tournament-rules.pdf', 'conduct.pdf'];
      for (const name of candidates) {
        const full = path.join(PUBLIC_DIR, name);
        if (fs.existsSync(full)) {
          return {
            filePath: full,
            downloadName: 'Tech-Debate-4.0-Code-of-Conduct-Tournament-Rules.pdf',
          };
        }
      }
      return {
        filePath: DEFAULT_CONDUCT_PATH,
        downloadName: 'Tech-Debate-4.0-Code-of-Conduct-Tournament-Rules.pdf',
      };
    } else {
      const candidates = ['parliamentary-rules.pdf', 'rulebook.pdf'];
      for (const name of candidates) {
        const full = path.join(PUBLIC_DIR, name);
        if (fs.existsSync(full)) {
          return {
            filePath: full,
            downloadName: 'Tech-Debate-4.0-Parliamentary-Debate-Rules-Adjudication-Guidelines.pdf',
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error scanning public/ for PDF:', err);
  }
  return {
    filePath: DEFAULT_RULEBOOK_PATH,
    downloadName: 'Tech-Debate-4.0-Parliamentary-Debate-Rules-Adjudication-Guidelines.pdf',
  };
}

app.get('/api/rulebook/download', (req, res) => {
  try {
    const rawType = String(req.query.type || 'parliamentary').toLowerCase();
    const docType: 'parliamentary' | 'conduct' =
      rawType === 'conduct' || rawType === 'code-of-conduct' ? 'conduct' : 'parliamentary';
    const { filePath, downloadName } = resolveDocumentPdfPath(docType);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${downloadName}"`
      );
      return res.sendFile(filePath);
    }
    const fallbackBuf =
      docType === 'conduct' ? buildMinimalConductPdfBuffer() : buildMinimalRulebookPdfBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadName}"`
    );
    return res.send(fallbackBuf);
  } catch (error: any) {
    console.error('Rulebook download error:', error);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

// ==========================================
// 7. VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  ensureGalleryDirectory();
  ensureDefaultRulebookPdf();
  await ensureAdminAccounts();

  // Serve static public assets (including /gallery/* from public/gallery and any PDF in public/)
  app.use(express.static(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tech Debate 4.0 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
