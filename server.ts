import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
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
    const row = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return row.length > 0 ? row[0].value : defaultVal;
  } catch {
    return defaultVal;
  }
}

async function setSetting(key: string, value: string): Promise<void> {
  try {
    const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));
    if (existing.length > 0) {
      await db.update(appSettings).set({ value, updatedAt: new Date() }).where(eq(appSettings.key, key));
    } else {
      await db.insert(appSettings).values({ key, value });
    }
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

app.use(express.json());

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

// POST /api/register - Register team into PostgreSQL database
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    const { name, batch, department, members: memberList, payment, userUid } = req.body;

    if (!name || !batch || !memberList || memberList.length !== 3 || !payment) {
      return res.status(400).json({ error: 'Missing mandatory registration fields or roster count' });
    }

    const cleanTeamName = name.trim();
    const cleanTrxId = payment.transactionId.trim().toUpperCase();

    const newTeamId = await withDbRetry(async () => {
      // Check duplicate team name
      const existingTeam = await db.select().from(teams).where(eq(teams.name, cleanTeamName));
      if (existingTeam.length > 0) {
        throw new Error('DUPLICATE_TEAM_NAME');
      }

      // Check duplicate transaction ID
      const existingTrx = await db.select().from(payments).where(eq(payments.transactionId, cleanTrxId));
      if (existingTrx.length > 0) {
        throw new Error('DUPLICATE_TRX_ID');
      }

      // Check duplicate student IDs
      const studentIds = memberList.map((m: any) => m.studentId.trim());
      for (const sId of studentIds) {
        const existingMember = await db.select().from(teamMembers).where(eq(teamMembers.studentId, sId));
        if (existingMember.length > 0) {
          throw new Error(`DUPLICATE_STUDENT_ID:${sId}`);
        }
      }

      // Generate TD4-TEAM-ID starting from TD4-TEAM-01
      const allExisting = await db.select({ id: teams.id }).from(teams);
      const existingIds = allExisting
        .map(t => {
          const match = t.id.match(/TD4-TEAM-(\d+)/i);
          if (!match) return 0;
          let num = parseInt(match[1], 10);
          if (num > 100) num = num - 100;
          return num;
        })
        .filter(n => !isNaN(n) && n > 0);
      const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const teamId = `TD4-TEAM-${String(nextNum).padStart(2, '0')}`;

      // 1. Insert team
      await db.insert(teams).values({
        id: teamId,
        name: cleanTeamName,
        batch,
        department: department || 'Computer Science & Engineering',
        status: 'PENDING',
        createdByUid: userUid || null,
        notes: 'Submitted via Web Portal'
      });

      // 2. Insert members
      for (const [idx, m] of memberList.entries()) {
        await db.insert(teamMembers).values({
          id: `mem-${Date.now()}-${idx}`,
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
        });
      }

      // 3. Insert payment
      await db.insert(payments).values({
        id: `p-${Date.now()}`,
        teamId: teamId,
        method: payment.method,
        senderNumber: payment.senderNumber.trim(),
        transactionId: cleanTrxId,
        amount: payment.amount || 350,
        status: 'PENDING'
      });

      return teamId;
    });

    // Trigger background sync to Google Sheet backup (if configured)
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

// PATCH /api/admin/payments/:teamId - Verify or reject payment
app.patch('/api/admin/payments/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, rejectionReason, verifiedBy } = req.body;

    if (!['VERIFIED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    await db.update(payments)
      .set({
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: verifiedBy || 'Event Admin'
      })
      .where(eq(payments.teamId, teamId));

    await db.update(teams)
      .set({
        status: status === 'VERIFIED' ? 'VERIFIED' : (status === 'REJECTED' ? 'REJECTED' : 'PENDING')
      })
      .where(eq(teams.id, teamId));

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

    await db.update(teams)
      .set({
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined
      })
      .where(eq(teams.id, teamId));

    res.json({ success: true, message: 'Team updated successfully' });
  } catch (error: any) {
    console.error('Team update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
});

// DELETE /api/admin/teams/:teamId - Remove team
app.delete('/api/admin/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    await db.delete(teams).where(eq(teams.id, teamId));
    res.json({ success: true, message: 'Team deleted' });
  } catch (error: any) {
    console.error('Team delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete team' });
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
// 7. VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  await ensureAdminAccounts();

  // Serve static public assets
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
