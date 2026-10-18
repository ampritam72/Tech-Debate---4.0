import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { Team } from '../types';

let cachedAccessToken: string | null = null;

export const GoogleSheetsService = {
  // Extract spreadsheet ID from link or raw ID
  extractSpreadsheetId: (input: string): string | null => {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    // Match docs.google.com/spreadsheets/d/([a-zA-Z0-9-_]+)
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // If user provided raw ID (usually 44 chars alphanumeric with hyphens/underscores)
    if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  },

  getCachedToken: (): string | null => cachedAccessToken,
  clearCachedToken: () => { cachedAccessToken = null; },

  // Sign in / authorize Google Sheets scope to obtain OAuth access token
  authorizeGoogleSheets: async (): Promise<string> => {
    if (cachedAccessToken) return cachedAccessToken;

    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Sheets access token.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  },

  // Format team into sheet row array
  formatTeamRow: (t: Team): (string | number)[] => {
    const payment = t.payment;
    const m1 = t.members[0];
    const m2 = t.members[1];
    const m3 = t.members[2];

    return [
      t.registrationDate || new Date().toISOString(),
      t.id,
      t.name,
      t.batch,
      t.department,
      payment.method,
      payment.senderNumber,
      payment.transactionId,
      payment.amount || 350,
      payment.status,
      m1 ? m1.fullName : '',
      m1 ? m1.studentId : '',
      m1 ? (m1.batch || t.batch) : '',
      m1 ? m1.phone : '',
      m2 ? m2.fullName : '',
      m2 ? m2.studentId : '',
      m2 ? (m2.batch || t.batch) : '',
      m2 ? m2.phone : '',
      m3 ? m3.fullName : '',
      m3 ? m3.studentId : '',
      m3 ? (m3.batch || t.batch) : '',
      m3 ? m3.phone : ''
    ];
  },

  // Check if spreadsheet is accessible & initialize header if empty
  initializeSpreadsheetHeaders: async (spreadsheetId: string, token: string): Promise<void> => {
    const getRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:V1`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!getRes.ok) {
      if (getRes.status === 404) {
        throw new Error('Spreadsheet not found. Please check your sheet link.');
      }
      if (getRes.status === 403) {
        throw new Error('Permission denied. Please ensure your Google account has Editor access to this spreadsheet.');
      }
      const err = await getRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${getRes.status}: Unable to read spreadsheet.`);
    }

    const data = await getRes.json();
    const hasHeader = data.values && data.values.length > 0 && data.values[0].length > 0;

    if (!hasHeader) {
      const headers = [
        'Timestamp', 'Team ID', 'Team Name', 'Batch', 'Department',
        'Payment Method', 'Sender Number', 'Trx ID', 'Amount (BDT)', 'Payment Status',
        'Speaker 1 (Leader)', 'Speaker 1 ID', 'Speaker 1 Batch', 'Speaker 1 Phone',
        'Speaker 2', 'Speaker 2 ID', 'Speaker 2 Batch', 'Speaker 2 Phone',
        'Speaker 3', 'Speaker 3 ID', 'Speaker 3 Batch', 'Speaker 3 Phone'
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );
    }
  },

  // Append new registered team row to user's sheet
  appendTeamToSheet: async (spreadsheetId: string, team: Team, token?: string): Promise<any> => {
    const accessToken = token || cachedAccessToken;
    if (!accessToken) {
      throw new Error('Google authorization required. Please authorize Google Sheets first.');
    }

    await GoogleSheetsService.initializeSpreadsheetHeaders(spreadsheetId, accessToken);
    const row = GoogleSheetsService.formatTeamRow(team);

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [row] })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to append row to Google Sheet.');
    }

    return res.json();
  },

  // Bulk sync all database teams into the user's specific spreadsheet
  syncAllTeamsToSheet: async (
    spreadsheetId: string, 
    teams: Team[], 
    token?: string
  ): Promise<{ count: number }> => {
    const accessToken = token || cachedAccessToken;
    if (!accessToken) {
      throw new Error('Google authorization required. Please authorize Google Sheets first.');
    }

    await GoogleSheetsService.initializeSpreadsheetHeaders(spreadsheetId, accessToken);

    if (teams.length === 0) {
      return { count: 0 };
    }

    const rows = teams.map(t => GoogleSheetsService.formatTeamRow(t));

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: rows })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to sync squads to Google Sheet.');
    }

    return { count: rows.length };
  }
};
