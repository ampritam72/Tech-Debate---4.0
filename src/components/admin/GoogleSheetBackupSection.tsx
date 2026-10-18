import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Code2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Link2,
  CheckCheck,
  Send,
  Zap,
  Table,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ApiService } from '../../services/api';
import { GoogleSheetsService } from '../../services/googleSheets';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Team } from '../../types';
import {
  db,
  doc,
  onSnapshot,
  setDoc,
  sanitizeGoogleSheetSettingsForFirestore,
  dispatchToGoogleSheetWebhook,
  GoogleSheetCloudSettings,
  GOOGLE_SHEET_22_HEADERS,
  formatTeamAs22ColumnArray,
} from '../../lib/firebase';
import { StorageService } from '../../services/storage';

interface GoogleSheetBackupSectionProps {
  teams: Team[];
}

const STORAGE_DIRECT_SHEET_KEY = 'tech_debate_target_sheet_url_v1';

export const GoogleSheetBackupSection: React.FC<GoogleSheetBackupSectionProps> = ({ teams }) => {
  const { adminUser } = useAdminAuth();

  // Direct Sheet Link States
  const [directSheetUrl, setDirectSheetUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_DIRECT_SHEET_KEY) || '';
    } catch {
      return '';
    }
  });
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() =>
    GoogleSheetsService.getCachedToken()
  );
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isDirectSyncing, setIsDirectSyncing] = useState(false);
  const [directSyncResult, setDirectSyncResult] = useState<string | null>(null);

  // Cloud Webhook & Auto-Backup States
  const [webhookUrl, setWebhookUrl] = useState<string>(() => StorageService.getGoogleSheetWebhook());
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string>('IDLE');
  const [googleSheetFormula, setGoogleSheetFormula] = useState('');

  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isWebhookSyncing, setIsWebhookSyncing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  const extractedSheetId = GoogleSheetsService.extractSpreadsheetId(directSheetUrl);

  // Subscribe to Cloud Firestore settings/google_sheet in real time
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setGoogleSheetFormula(`=IMPORTDATA("${origin}/api/export/teams.csv")`);

    const unsub = onSnapshot(
      doc(db, 'settings', 'google_sheet'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as GoogleSheetCloudSettings;
          if (data.webhookUrl !== undefined) {
            setWebhookUrl(data.webhookUrl);
            StorageService.saveGoogleSheetWebhook(data.webhookUrl);
          }
          if (data.directSheetUrl) {
            setDirectSheetUrl(data.directSheetUrl);
            try {
              localStorage.setItem(STORAGE_DIRECT_SHEET_KEY, data.directSheetUrl);
            } catch {}
          }
          if (data.autoSync !== undefined) {
            setAutoSync(Boolean(data.autoSync));
          }
          if (data.lastSyncAt) {
            setLastSyncAt(data.lastSyncAt);
          }
          if (data.lastStatus) {
            setLastStatus(data.lastStatus);
          }
        }
      },
      (err) => {
        console.warn('Google Sheet cloud settings listener warning:', err);
      }
    );

    ApiService.getGoogleSheetSettings()
      .then((data) => {
        if (data.webhookUrl) setWebhookUrl((prev) => prev || data.webhookUrl);
        if (data.directSheetUrl) setDirectSheetUrl((prev) => prev || data.directSheetUrl || '');
        if (data.lastSyncAt) setLastSyncAt((prev) => prev || data.lastSyncAt);
        if (data.lastStatus && data.lastStatus !== 'NOT_CONFIGURED') {
          setLastStatus(data.lastStatus);
        }
      })
      .catch(() => {});

    return () => unsub();
  }, []);

  const handleSaveDirectSheetUrl = (val: string) => {
    setDirectSheetUrl(val);
    try {
      localStorage.setItem(STORAGE_DIRECT_SHEET_KEY, val.trim());
    } catch {}
  };

  // Instant Client-Side 22-Column CSV Export (matches user's exact 22 columns A1:V1)
  const handleDownloadCsvClient = () => {
    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = teams.map((t) =>
      formatTeamAs22ColumnArray(t).map(escapeCsv).join(',')
    );

    const csvContent =
      '\uFEFF' +
      [GOOGLE_SHEET_22_HEADERS.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `tech-debate-4.0-squads-22col-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Authorize Google Sheets Account
  const handleAuthorizeGoogle = async () => {
    setIsAuthorizing(true);
    setFeedbackMessage(null);
    try {
      const token = await GoogleSheetsService.authorizeGoogleSheets();
      setGoogleAccessToken(token);
      setFeedbackMessage({ text: 'Google Account successfully authorized for Google Sheets!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Google authorization failed.', isError: true });
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Direct Sync to User's Google Sheet URL via OAuth
  const handleDirectSyncToSheet = async () => {
    if (!extractedSheetId) {
      setFeedbackMessage({
        text: 'Please enter a valid Google Sheet URL (e.g. https://docs.google.com/spreadsheets/d/.../edit)',
        isError: true,
      });
      return;
    }

    setIsDirectSyncing(true);
    setFeedbackMessage(null);
    setDirectSyncResult(null);

    try {
      let token = googleAccessToken;
      if (!token) {
        token = await GoogleSheetsService.authorizeGoogleSheets();
        setGoogleAccessToken(token);
      }

      const result = await GoogleSheetsService.syncAllTeamsToSheet(extractedSheetId, teams, token);
      setDirectSyncResult(`Successfully synced ${result.count} teams to your Google Sheet!`);
      setFeedbackMessage({
        text: `Successfully added ${result.count} teams across all 22 columns (A1:V1) to your specified sheet!`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      console.error('Direct sheet sync error:', err);
      if (err.message && err.message.includes('401')) {
        GoogleSheetsService.clearCachedToken();
        setGoogleAccessToken(null);
      }
      setFeedbackMessage({
        text:
          err.message ||
          'Failed to write data to Google Sheet. Please verify that your sheet has Editor permissions.',
        isError: true,
      });
    } finally {
      setIsDirectSyncing(false);
    }
  };

  // Save Webhook Settings to Cloud Firestore (so all student devices auto-push on registration)
  const handleSaveWebhookSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = webhookUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith('https://script.google.com/')) {
      setFeedbackMessage({
        text: 'Please enter a valid Google Apps Script Web App URL starting with https://script.google.com/macros/s/...',
        isError: true,
      });
      return;
    }

    setIsSavingWebhook(true);
    setFeedbackMessage(null);
    try {
      await ApiService.saveGoogleSheetSettings({
        webhookUrl: cleanUrl,
        directSheetUrl: directSheetUrl.trim(),
        autoSync,
      });
      setLastStatus(cleanUrl ? 'ACTIVE' : 'NOT_CONFIGURED');
      setFeedbackMessage({
        text: cleanUrl
          ? '24/7 Cloud Auto-Backup Activated! Every new squad registration on any device will now automatically append a 22-column row to your Google Sheet.'
          : 'Webhook settings updated.',
      });
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to save cloud settings', isError: true });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  // Toggle Auto-Sync and immediately persist in Firestore
  const handleToggleAutoSync = async (checked: boolean) => {
    setAutoSync(checked);
    const cleanUrl = webhookUrl.trim();
    if (!cleanUrl) return;
    try {
      await setDoc(
        doc(db, 'settings', 'google_sheet'),
        sanitizeGoogleSheetSettingsForFirestore({
          webhookUrl: cleanUrl,
          directSheetUrl: directSheetUrl.trim(),
          autoSync: checked,
          lastSyncAt: lastSyncAt || undefined,
          lastStatus: checked ? 'ACTIVE' : 'PAUSED',
        })
      );
    } catch {}
  };

  // Trigger Full Bulk Sync to Webhook (Works on Vercel static + Local Server)
  const handleTriggerWebhookSync = async () => {
    const cleanUrl = webhookUrl.trim();
    if (!cleanUrl) {
      setFeedbackMessage({
        text: 'Please paste and save your Google Apps Script Web App URL first.',
        isError: true,
      });
      return;
    }
    setIsWebhookSyncing(true);
    setFeedbackMessage(null);
    try {
      await ApiService.saveGoogleSheetSettings({
        webhookUrl: cleanUrl,
        directSheetUrl: directSheetUrl.trim(),
        autoSync,
      });
      const res = await ApiService.syncAllToGoogleSheet(teams);
      const nowIso = new Date().toISOString();
      setLastSyncAt(nowIso);
      setLastStatus('SUCCESS');
      setFeedbackMessage({
        text:
          res.message ||
          `Successfully synced all ${teams.length} registered squads (22 columns A1:V1) to your Google Sheet!`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setLastStatus('ERROR');
      setFeedbackMessage({
        text: err.message || 'Sync failed. Ensure your Apps Script is deployed as "Anyone".',
        isError: true,
      });
    } finally {
      setIsWebhookSyncing(false);
    }
  };

  // Send a Test / Latest Squad Verification Row to the Google Sheet
  const handleSendTestRow = async () => {
    const cleanUrl = webhookUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      setFeedbackMessage({
        text: 'Please paste your Google Apps Script Web App URL first.',
        isError: true,
      });
      return;
    }

    setIsSendingTest(true);
    setFeedbackMessage(null);
    try {
      await ApiService.saveGoogleSheetSettings({
        webhookUrl: cleanUrl,
        directSheetUrl: directSheetUrl.trim(),
        autoSync,
      });

      if (teams.length > 0) {
        await ApiService.syncTeamToGoogleSheetClient(teams[0], 'new_registration');
        setFeedbackMessage({
          text: `Sent squad "${teams[0].name}" (${teams[0].id}) across all 22 columns to your Google Sheet! Check your spreadsheet now.`,
        });
      } else {
        const sampleRow = {
          timestamp: new Date().toISOString(),
          teamId: 'TD4-TEST-001',
          teamName: 'Varendra Cyber Logicians (Test)',
          batch: '32nd Batch',
          department: 'Department of CSE, Varendra University, Rajshahi',
          paymentMethod: 'bKash',
          senderNumber: '01718169072',
          transactionId: 'TEST8899TX',
          amount: 350,
          paymentStatus: 'VERIFIED',
          speaker1Name: 'Abir Mahmud Pritam',
          speaker1Id: '231311070',
          speaker1Batch: '32nd Batch',
          speaker1Phone: '01718169072',
          speaker2Name: 'Farhan Ahamed',
          speaker2Id: '232311001',
          speaker2Batch: '33rd Batch',
          speaker2Phone: '01700000002',
          speaker3Name: 'Sumsuzzoha',
          speaker3Id: '232311242',
          speaker3Batch: '33rd Batch',
          speaker3Phone: '01700000003',
        };
        await dispatchToGoogleSheetWebhook(cleanUrl, {
          action: 'new_registration',
          team: sampleRow,
        });
        const nowIso = new Date().toISOString();
        setLastSyncAt(nowIso);
        setLastStatus('SUCCESS');
        setFeedbackMessage({
          text: 'Test row (TD4-TEST-001) dispatched across all 22 columns to your Google Sheet!',
        });
      }
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || 'Failed to dispatch test row.',
        isError: true,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(googleSheetFormula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2500);
  };

  // Exact 22-Column Apps Script matching user's sheet headers A1:V1
  const appsScriptCode = `// ============================================================================
// Tech Debate 4.0 — Real-Time 22-Column Google Sheet Auto-Backup Script
// Department of CSE, Varendra University, Rajshahi
// Matches Exact 22 Columns (A1:V1) of Your Google Sheet
// ============================================================================
// HOW TO ACTIVATE (Takes 60 Seconds):
// 1. Open your Google Sheet -> Click "Extensions" -> "Apps Script"
// 2. Delete any existing code and paste this entire script
// 3. Click "Deploy" (top right) -> "New deployment"
// 4. Select type: "Web app"
// 5. Set "Execute as": "Me"
// 6. Set "Who has access": "Anyone" (CRITICAL so student phones can auto-push)
// 7. Click "Deploy", copy the Web App URL, and save it in your Admin Console!
// ============================================================================

var HEADERS = [
  "Timestamp", "Team ID", "Team Name", "Batch", "Department",
  "Payment Method", "Sender Number", "Trx ID", "Amount (BDT)", "Payment Status",
  "Speaker 1 (Leader)", "Speaker 1 ID", "Speaker 1 Batch", "Speaker 1 Phone",
  "Speaker 2", "Speaker 2 ID", "Speaker 2 Batch", "Speaker 2 Phone",
  "Speaker 3", "Speaker 3 ID", "Speaker 3 Batch", "Speaker 3 Phone"
];

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#051638");
    headerRange.setFontColor("#38bdf8");
    sheet.setFrozenRows(1);
  }
}

function teamToRowArray(t) {
  return [
    t.timestamp || new Date().toISOString(),
    t.teamId || "",
    t.teamName || "",
    t.batch || "",
    t.department || "Department of CSE, Varendra University, Rajshahi",
    t.paymentMethod || "",
    "'" + (t.senderNumber || t.senderPhone || ""),
    t.transactionId || "",
    t.amount || 350,
    t.paymentStatus || "PENDING",
    t.speaker1Name || "",
    "'" + (t.speaker1Id || ""),
    t.speaker1Batch || t.batch || "",
    "'" + (t.speaker1Phone || ""),
    t.speaker2Name || "",
    "'" + (t.speaker2Id || ""),
    t.speaker2Batch || t.batch || "",
    "'" + (t.speaker2Phone || ""),
    t.speaker3Name || "",
    "'" + (t.speaker3Id || ""),
    t.speaker3Batch || t.batch || "",
    "'" + (t.speaker3Phone || "")
  ];
}

function styleStatusCell(sheet, rowIndex, paymentStatus) {
  // Column 10 (Column J) is "Payment Status"
  var statusCell = sheet.getRange(rowIndex, 10);
  statusCell.setFontWeight("bold");
  if (paymentStatus === "VERIFIED") {
    statusCell.setBackground("#d1fae5");
    statusCell.setFontColor("#065f46");
  } else if (paymentStatus === "REJECTED") {
    statusCell.setBackground("#ffe4e6");
    statusCell.setFontColor("#9f1239");
  } else {
    statusCell.setBackground("#fef3c7");
    statusCell.setFontColor("#92400e");
  }
}

function upsertTeamRow(sheet, t) {
  var lastRow = sheet.getLastRow();
  var targetRowIndex = -1;

  if (lastRow > 1 && t.teamId) {
    var idValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === String(t.teamId).trim()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }

  var rowValues = teamToRowArray(t);
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    styleStatusCell(sheet, targetRowIndex, t.paymentStatus || "PENDING");
  } else {
    sheet.appendRow(rowValues);
    var newRowIndex = sheet.getLastRow();
    styleStatusCell(sheet, newRowIndex, t.paymentStatus || "PENDING");
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    ensureHeaderRow(sheet);

    var rawBody = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(rawBody);

    // 1. Instant Auto-Backup on New Registration or Status Update
    if ((payload.action === "new_registration" || payload.action === "update_team") && payload.team) {
      upsertTeamRow(sheet, payload.team);
      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", action: payload.action, teamId: payload.team.teamId })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Full Bulk Reconciliation Sync from Admin Panel
    if (payload.action === "bulk_sync" && Array.isArray(payload.teams)) {
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      for (var i = 0; i < payload.teams.length; i++) {
        var t = payload.teams[i];
        var rowValues = teamToRowArray(t);
        sheet.appendRow(rowValues);
        styleStatusCell(sheet, sheet.getLastRow(), t.paymentStatus || "PENDING");
      }
      return ContentService.createTextOutput(
        JSON.stringify({ status: "bulk_success", count: payload.teams.length })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ignored" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const isWebhookConfigured = Boolean(webhookUrl.trim() && webhookUrl.trim().startsWith('http'));

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            feedbackMessage.isError
              ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
          } shadow-lg transition-all animate-in fade-in`}
        >
          {feedbackMessage.isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  22-Column Google Sheet Live Auto-Backup
                </h2>
                <span className="text-xs font-mono text-emerald-300">
                  · Columns A1:V1 Exact Match
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Configured to match the exact 22 columns of your Google Sheet (
                <code className="text-cyan-300 font-mono">Timestamp</code> through{' '}
                <code className="text-cyan-300 font-mono">Speaker 3 Phone</code>). Every new
                registration in Firestore is automatically pushed as a live row.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadCsvClient}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-emerald-400 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download 22-Col CSV ({teams.length})</span>
            </button>

            <a
              href={
                directSheetUrl && extractedSheetId
                  ? directSheetUrl
                  : 'https://sheets.new'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>
                {directSheetUrl && extractedSheetId ? 'Open Linked Sheet' : 'Open Google Sheets'}
              </span>
            </a>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Firestore Squads
            </span>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-1">
              {teams.length}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">22 columns per row</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              24/7 Auto-Push Engine
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isWebhookConfigured && autoSync ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-white font-mono truncate">
                {isWebhookConfigured
                  ? autoSync
                    ? 'AUTO-PUSH ACTIVE'
                    : 'PAUSED'
                  : 'PASTE WEB APP URL'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Instant on registration
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Last Backup Push
            </span>
            <div className="text-xs font-bold font-mono tabular-nums mt-1 truncate text-cyan-300">
              {lastSyncAt
                ? new Date(lastSyncAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'No push yet'}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {lastSyncAt ? new Date(lastSyncAt).toLocaleDateString() : 'Waiting for event'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Column Schema
            </span>
            <div className="text-xs font-bold font-mono text-emerald-300 mt-1 truncate">
              22 Columns (A1:V1)
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              100% Matched to Sheet
            </span>
          </div>
        </div>
      </GlassCard>

      {/* PRIMARY FEATURE: CLOUD-SYNCED REAL-TIME APPS SCRIPT WEBHOOK */}
      <GlassCard className="p-6 sm:p-7 border border-emerald-500/35 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shrink-0">
              01
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  Connect Your Google Sheet via Apps Script Web App URL (24/7 Auto-Push)
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  · Recommended
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Paste the Apps Script below into your Google Sheet once, deploy it as a Web App, and
                save the URL here. It will be stored in{' '}
                <strong className="text-white">Firebase Cloud Firestore</strong> so every student
                registration automatically writes to your 22-column sheet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowScriptModal(!showScriptModal)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>{showScriptModal ? 'Hide Apps Script Code' : '1. Copy Apps Script Code'}</span>
            {showScriptModal ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Step-by-Step Guide + Copyable 22-Column Apps Script */}
        {showScriptModal && (
          <div className="mb-6 p-5 rounded-2xl bg-[#020b1e] border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  How to Link Your 22-Column Google Sheet (60 Seconds):
                </h4>
                <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside font-sans">
                  <li>
                    In your Google Sheet (with the 22 columns{' '}
                    <code className="text-cyan-300 font-mono">Timestamp ... Speaker 3 Phone</code>),
                    click <strong className="text-white">Extensions &gt; Apps Script</strong>.
                  </li>
                  <li>
                    Click <strong className="text-emerald-300">Copy 22-Column Script</strong> on the
                    right, paste it in the Apps Script editor, and press Save (Ctrl+S).
                  </li>
                  <li>
                    Click <strong className="text-white">Deploy &gt; New deployment</strong> &rarr;
                    Select type: <strong className="text-white">Web app</strong>.
                  </li>
                  <li>
                    Set <em>Execute as</em>: <strong className="text-white">Me</strong> and{' '}
                    <em>Who has access</em>:{' '}
                    <strong className="text-emerald-300">Anyone</strong>, then click Deploy.
                  </li>
                  <li>
                    Copy the generated <strong className="text-white">Web App URL</strong> (
                    <code className="text-cyan-300 font-mono">
                      https://script.google.com/macros/s/.../exec
                    </code>
                    ) and save it below!
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={handleCopyScript}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 whitespace-nowrap"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied 22-Column Script!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy 22-Column Script</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 scrollbar-thin">
              <code>{appsScriptCode}</code>
            </pre>
          </div>
        )}

        <form onSubmit={handleSaveWebhookSettings} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium">
                Google Apps Script Web App URL (Required for 24/7 Auto-Push):
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-4 py-2.5 rounded-xl bg-[#030e22] border border-emerald-500/30 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium">
                Your Google Sheet URL (Optional — for 1-click open &amp; OAuth sync):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directSheetUrl}
                  onChange={(e) => handleSaveDirectSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#030e22] border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
                />
                {directSheetUrl && (
                  <a
                    href={directSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-200 font-medium">
                Instantly append 22-column row when a new team registers &amp; update row when
                payment is verified
              </span>
            </label>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="submit"
                disabled={isSavingWebhook}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0 whitespace-nowrap active:scale-95"
              >
                {isSavingWebhook ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Save &amp; Activate Cloud Auto-Backup</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestRow}
                disabled={isSendingTest || !webhookUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 disabled:opacity-40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSendingTest ? 'Sending...' : 'Send Test Row'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerWebhookSync}
                disabled={isWebhookSyncing || !webhookUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0 whitespace-nowrap active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isWebhookSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isWebhookSyncing
                    ? 'Syncing All Squads...'
                    : `Sync All Existing Squads (${teams.length})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* LIVE 22-COLUMN SHEET PREVIEW (A1:V1) */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Live 22-Column Google Sheet Row Preview (A1:V1)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact 22-column structure sent to your Google Sheet on every registration (
                {teams.length} squads currently in Firestore).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsvClient}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 22-Column CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#030b1c]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#051638] border-b border-slate-800 text-[11px] font-mono text-cyan-300 uppercase">
                {GOOGLE_SHEET_22_HEADERS.map((col, idx) => (
                  <th
                    key={col}
                    className="py-2.5 px-3 whitespace-nowrap border-r border-slate-800/70 last:border-r-0"
                  >
                    <span className="text-slate-500 mr-1.5">
                      {String.fromCharCode(65 + idx)}1:
                    </span>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono tabular-nums text-slate-200">
              {teams.length === 0 ? (
                <tr>
                  <td
                    colSpan={22}
                    className="py-8 px-4 text-center text-slate-400 font-sans text-xs"
                  >
                    No squads registered yet. As soon as a team registers, their 22-column row will
                    appear here and push to your Google Sheet automatically.
                  </td>
                </tr>
              ) : (
                teams.slice(0, 10).map((t) => {
                  const rowArr = formatTeamAs22ColumnArray(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                      {rowArr.map((cell, cellIdx) => {
                        const isStatus = cellIdx === 9;
                        const statusStr = String(cell);
                        return (
                          <td
                            key={cellIdx}
                            className={`py-2 px-3 whitespace-nowrap border-r border-slate-800/40 last:border-r-0 ${
                              isStatus
                                ? statusStr === 'VERIFIED'
                                  ? 'text-emerald-300 font-bold'
                                  : statusStr === 'REJECTED'
                                    ? 'text-rose-300 font-bold'
                                    : 'text-amber-300 font-bold'
                                : ''
                            }`}
                          >
                            {String(cell || '—')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {teams.length > 10 && (
          <p className="text-[11px] font-mono text-slate-400 mt-2 text-right">
            Showing latest 10 of {teams.length} squads · All {teams.length} squads are included in
            auto-push &amp; CSV export.
          </p>
        )}
      </GlassCard>

      {/* SECONDARY FEATURE: DIRECT GOOGLE WORKSPACE OAUTH SYNC */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              02
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Manual Direct OAuth Push to Google Sheet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Alternatively, sign in with your Google Account to write all {teams.length} squads
                directly to your sheet URL via the Google Sheets API.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                Target Google Sheet URL:
              </span>
              {extractedSheetId && (
                <span className="text-[11px] font-mono text-cyan-400 font-normal">
                  Sheet ID: {extractedSheetId}
                </span>
              )}
            </label>

            <input
              type="text"
              value={directSheetUrl}
              onChange={(e) => handleSaveDirectSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              className="w-full px-4 py-2.5 rounded-xl bg-[#030e22] border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAuthorizeGoogle}
                disabled={isAuthorizing}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {googleAccessToken ? 'Google Account Connected' : 'Authorize Google Account'}
                </span>
                {googleAccessToken && <CheckCheck className="w-4 h-4 text-emerald-600" />}
              </button>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                {adminUser?.email ? `Admin: ${adminUser.email}` : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDirectSyncToSheet}
              disabled={isDirectSyncing || !extractedSheetId}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isDirectSyncing ? 'animate-spin' : ''}`} />
              <span>{isDirectSyncing ? 'Writing to Sheet...' : 'Push via Google OAuth'}</span>
            </button>
          </div>

          {directSyncResult && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{directSyncResult}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* FEATURE C: INSTANT DYNAMIC FORMULA (=IMPORTDATA) */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 font-mono font-bold text-xs">
              03
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Live Google Sheet Formula (=IMPORTDATA)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Or paste this formula into cell <strong>A1</strong> of any Google Sheet to pull live
                CSV data:
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-3">
          <div className="flex items-center gap-2 p-3 sm:p-3.5 rounded-xl bg-[#030d22] border border-purple-500/30 font-mono text-xs sm:text-sm text-purple-200 overflow-x-auto shadow-inner">
            <span className="text-slate-500 select-none">$</span>
            <span className="truncate select-all flex-1">{googleSheetFormula}</span>
            <button
              type="button"
              onClick={handleCopyFormula}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 whitespace-nowrap"
            >
              {copiedFormula ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formula</span>
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
