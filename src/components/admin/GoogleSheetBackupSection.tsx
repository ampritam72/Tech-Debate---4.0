import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Cloud, 
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
  Sparkles,
  Link2,
  CheckCheck
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ApiService } from '../../services/api';
import { GoogleSheetsService } from '../../services/googleSheets';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Team } from '../../types';

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
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => GoogleSheetsService.getCachedToken());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isDirectSyncing, setIsDirectSyncing] = useState(false);
  const [directSyncResult, setDirectSyncResult] = useState<string | null>(null);

  // Webhook & Formula States
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string>('IDLE');
  const [googleSheetFormula, setGoogleSheetFormula] = useState('');
  const [liveCsvUrl, setLiveCsvUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isWebhookSyncing, setIsWebhookSyncing] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Extract spreadsheet ID
  const extractedSheetId = GoogleSheetsService.extractSpreadsheetId(directSheetUrl);

  // Load current settings from backend
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getGoogleSheetSettings();
      setWebhookUrl(data.webhookUrl || '');
      setAutoSync(data.autoSync ?? true);
      setLastSyncAt(data.lastSyncAt);
      setLastStatus(data.lastStatus || 'IDLE');
      setGoogleSheetFormula(data.googleSheetFormula || `=IMPORTDATA("${window.location.origin}/api/export/teams.csv")`);
      setLiveCsvUrl(data.liveCsvUrl || `${window.location.origin}/api/export/teams.csv`);
    } catch {
      const fallbackUrl = `${window.location.origin}/api/export/teams.csv`;
      setGoogleSheetFormula(`=IMPORTDATA("${fallbackUrl}")`);
      setLiveCsvUrl(fallbackUrl);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveDirectSheetUrl = (val: string) => {
    setDirectSheetUrl(val);
    try {
      localStorage.setItem(STORAGE_DIRECT_SHEET_KEY, val.trim());
    } catch {}
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

  // Direct Sync to User's Google Sheet URL
  const handleDirectSyncToSheet = async () => {
    if (!extractedSheetId) {
      setFeedbackMessage({ 
        text: 'Please enter a valid Google Sheet URL (e.g. https://docs.google.com/spreadsheets/d/.../edit)', 
        isError: true 
      });
      return;
    }

    // MANDATORY Confirmation dialog before mutating Workspace data
    const confirmed = window.confirm(
      `Write header row and data for ${teams.length} teams to your Google Sheet?\n\nSpreadsheet ID: ${extractedSheetId}`
    );
    if (!confirmed) return;

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
      setFeedbackMessage({ text: `Successfully added ${result.count} teams to your specified sheet!` });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      console.error('Direct sheet sync error:', err);
      // If token expired, clear cache
      if (err.message && err.message.includes('401')) {
        GoogleSheetsService.clearCachedToken();
        setGoogleAccessToken(null);
      }
      setFeedbackMessage({ 
        text: err.message || 'Failed to write data to Google Sheet. Please verify that your sheet has Editor permissions.', 
        isError: true 
      });
    } finally {
      setIsDirectSyncing(false);
    }
  };

  // Save Webhook Settings
  const handleSaveWebhookSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingWebhook(true);
    setFeedbackMessage(null);
    try {
      await ApiService.saveGoogleSheetSettings({
        webhookUrl: webhookUrl.trim(),
        autoSync
      });
      setFeedbackMessage({ text: 'Google Sheet webhook settings saved successfully!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to save settings', isError: true });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  // Trigger Bulk Sync to Webhook
  const handleTriggerWebhookSync = async () => {
    if (!webhookUrl.trim()) {
      setFeedbackMessage({ text: 'Please enter and save your Google Apps Script Web App URL first.', isError: true });
      return;
    }
    setIsWebhookSyncing(true);
    setFeedbackMessage(null);
    try {
      const res = await ApiService.syncAllToGoogleSheet();
      setLastSyncAt(new Date().toISOString());
      setLastStatus('SUCCESS');
      setFeedbackMessage({ text: res.message || 'Successfully synced with Google Sheet Webhook!' });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setLastStatus('ERROR');
      setFeedbackMessage({ text: err.message || 'Sync failed. Ensure your script is deployed as "Anyone".', isError: true });
    } finally {
      setIsWebhookSyncing(false);
    }
  };

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(googleSheetFormula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2500);
  };

  const appsScriptCode = `// Tech Debate 4.0 - Google Sheets Live Registration Backup Script
// 1. Open Google Sheets -> Extensions -> Apps Script
// 2. Replace all code in editor with this script
// 3. Click 'Deploy' -> 'New deployment' -> Select 'Web app'
// 4. Set 'Execute as': 'Me' & 'Who has access': 'Anyone'
// 5. Copy the generated Web App URL and paste it in your Admin Dashboard

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);

    // Auto-create styled header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp", "Team ID", "Team Name", "Batch", "Department",
        "Payment Method", "Sender Number", "Trx ID", "Amount (BDT)", "Payment Status",
        "Speaker 1 (Leader)", "Speaker 1 ID", "Speaker 1 Phone",
        "Speaker 2", "Speaker 2 ID", "Speaker 2 Phone",
        "Speaker 3", "Speaker 3 ID", "Speaker 3 Phone"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#051638");
      headerRange.setFontColor("#38bdf8");
      sheet.setFrozenRows(1);
    }

    // 1. Single Live Team Registration
    if (payload.action === "new_registration" && payload.team) {
      var t = payload.team;
      sheet.appendRow([
        t.timestamp, t.teamId, t.teamName, t.batch, t.department,
        t.paymentMethod, t.senderNumber, t.transactionId, t.amount, t.paymentStatus,
        t.speaker1Name, t.speaker1Id, t.speaker1Phone,
        t.speaker2Name, t.speaker2Id, t.speaker2Phone,
        t.speaker3Name, t.speaker3Id, t.speaker3Phone
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", teamId: t.teamId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Full Bulk Sync
    if (payload.action === "bulk_sync" && payload.teams) {
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      for (var i = 0; i < payload.teams.length; i++) {
        var t = payload.teams[i];
        sheet.appendRow([
          t.timestamp, t.teamId, t.teamName, t.batch, t.department,
          t.paymentMethod, t.senderNumber, t.transactionId, t.amount, t.paymentStatus,
          t.speaker1Name, t.speaker1Id, t.speaker1Phone,
          t.speaker2Name, t.speaker2Id, t.speaker2Phone,
          t.speaker3Name, t.speaker3Id, t.speaker3Phone
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "bulk_success", count: payload.teams.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          feedbackMessage.isError 
            ? 'bg-rose-950/70 border-rose-500/40 text-rose-200' 
            : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
        } shadow-lg transition-all animate-in fade-in`}>
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Google Sheets Integration & Live Backup
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Google Workspace OAuth Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Paste your Google Sheet link here to write data directly to your sheet from the website. You can also connect your sheet using a live formula without coding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              href="/api/export/teams.csv"
              download="tech-debate-4-registrations.csv"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-slate-500"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </a>

            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>New Google Sheet</span>
            </a>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Database Squads</span>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">{teams.length}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Ready to sync</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Google Auth</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${googleAccessToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold text-white font-mono truncate">
                {googleAccessToken ? 'CONNECTED' : (adminUser?.email ? 'AUTHENTICATED' : 'NOT CONNECTED')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Google Sheets Scope</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Direct Sheet ID</span>
            <div className="text-xs font-bold font-mono mt-1 truncate text-cyan-300">
              {extractedSheetId ? `${extractedSheetId.slice(0, 10)}...` : 'None Set'}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Target spreadsheet</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Direct Sync Status</span>
            <div className="text-xs font-bold font-mono text-slate-300 mt-1 truncate">
              {directSyncResult ? 'SUCCESS' : 'IDLE'}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Live Google API</span>
          </div>
        </div>
      </GlassCard>

      {/* FEATURE A: DIRECT GOOGLE SHEET LINK UPDATE (WHAT USER ASKED FOR) */}
      <GlassCard className="p-6 sm:p-7 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              ★
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Update Data Directly to Your Google Sheet Link
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Recommended
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Paste your Google Sheet link below. Clicking <strong>"Sync to My Google Sheet Now"</strong> will write all team details and columns directly to your sheet.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                Paste Your Google Sheet URL:
              </span>
              {extractedSheetId && (
                <span className="text-[11px] font-mono text-emerald-400 font-normal">
                  Detected Sheet ID: {extractedSheetId}
                </span>
              )}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={directSheetUrl}
                onChange={e => handleSaveDirectSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="flex-1 px-4 py-3 rounded-xl bg-[#030e22] border border-emerald-500/30 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400 shadow-inner"
              />

              {directSheetUrl && extractedSheetId && (
                <a
                  href={directSheetUrl.startsWith('http') ? directSheetUrl : `https://docs.google.com/spreadsheets/d/${extractedSheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Open this sheet in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Sheet</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAuthorizeGoogle}
                disabled={isAuthorizing}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>
                  {googleAccessToken ? 'Google Account Connected' : 'Authorize Google Account'}
                </span>
                {googleAccessToken && <CheckCheck className="w-4 h-4 text-emerald-600" />}
              </button>

              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                (Google Sheets write permission)
              </span>
            </div>

            <button
              type="button"
              onClick={handleDirectSyncToSheet}
              disabled={isDirectSyncing || !extractedSheetId}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 shrink-0 uppercase tracking-wide"
            >
              <RefreshCw className={`w-4 h-4 ${isDirectSyncing ? 'animate-spin' : ''}`} />
              <span>{isDirectSyncing ? 'Writing to Google Sheet...' : 'Sync to My Google Sheet Now'}</span>
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

      {/* FEATURE B: INSTANT DYNAMIC FORMULA (=IMPORTDATA) */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              02
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Alternative Method: Live Google Sheet Formula (=IMPORTDATA)
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Zero Login Needed
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste this formula into cell <strong>A1</strong> of any Google Sheet to automatically sync live data:
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-3">
          <div className="flex items-center gap-2 p-3 sm:p-3.5 rounded-xl bg-[#030d22] border border-cyan-500/30 font-mono text-xs sm:text-sm text-cyan-200 overflow-x-auto shadow-inner">
            <span className="text-slate-500 select-none">$</span>
            <span className="truncate select-all flex-1">{googleSheetFormula}</span>
            <button
              onClick={handleCopyFormula}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
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

      {/* FEATURE C: GOOGLE APPS SCRIPT WEBHOOK */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 font-mono font-bold text-xs">
              03
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Google Apps Script Webhook (Auto-push on registration)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically sends a backup payload to this Webhook URL whenever a new squad registers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowScriptModal(!showScriptModal)}
            className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>{showScriptModal ? 'Hide Code' : 'View Apps Script Code'}</span>
            {showScriptModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showScriptModal && (
          <div className="mb-6 p-5 rounded-2xl bg-[#020b1e] border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-purple-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Apps Script Template
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  In Google Sheets, go to <strong>Extensions &gt; Apps Script</strong>, paste the code, and click <strong>Deploy &gt; Web app (Anyone)</strong>.
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Script</span>
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
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium">
              Google Apps Script Web App URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={isSavingWebhook}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
              >
                {isSavingWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Save Webhook</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => setAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                Automatically send backup to sheet whenever a new team registers (Auto-sync)
              </span>
            </label>

            <button
              type="button"
              onClick={handleTriggerWebhookSync}
              disabled={isWebhookSyncing || !webhookUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isWebhookSyncing ? 'animate-spin' : ''}`} />
              <span>{isWebhookSyncing ? 'Syncing...' : 'Sync to Webhook Now'}</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
