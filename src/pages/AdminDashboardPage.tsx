import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw,
  Crown,
  FileSpreadsheet,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { GoogleSheetBackupSection } from '../components/admin/GoogleSheetBackupSection';
import { GalleryEditorSection } from '../components/admin/GalleryEditorSection';
import { useTournament } from '../context/TournamentContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MatchFixture, RoundKey } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { 
    teams, 
    fixtures, 
    hallOfFame,
    inquiries,
    updatePaymentStatus, 
    deleteTeam,
    updateFixture,
    createFixture,
    deleteFixture,
    updateHallOfFame4,
    updateInquiryStatus,
    deleteInquiry,
    resetDatabase,
    clearAllRegistrations
  } = useTournament();

  const { adminUser, logout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'payments' | 'fixtures' | 'googlesheet' | 'gallery' | 'inquiries' | 'hof'>('overview');

  // Search & filter for Teams
  const [teamSearch, setTeamSearch] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>('ALL');

  // Confirmation Modals State
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{
    type: 'VERIFY_TEAM' | 'DELETE_TEAM' | 'APPROVE_PAYMENT' | 'REJECT_PAYMENT';
    teamId: string;
    teamName: string;
    batch?: string;
    paymentMethod?: string;
    transactionId?: string;
    senderNumber?: string;
    amount?: number;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Mismatched transaction ID');
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [showResetDbConfirmModal, setShowResetDbConfirmModal] = useState(false);
  const [clearSuccessToast, setClearSuccessToast] = useState<string | null>(null);

  // Modal / Editing states
  const [editingFixture, setEditingFixture] = useState<MatchFixture | null>(null);

  // Hall of Fame 4.0 editing state
  const current4 = hallOfFame.find(h => h.edition === '4.0') || hallOfFame[3];
  const [hof4ChampionTeam, setHof4ChampionTeam] = useState(current4.champion.teamName);
  const [hof4ChampionMembers, setHof4ChampionMembers] = useState(current4.champion.members.join(', '));
  const [hof4ChampionPhoto, setHof4ChampionPhoto] = useState(current4.champion.photoUrl || '');
  const [hof4RunnerUpTeam, setHof4RunnerUpTeam] = useState(current4.runnerUp.teamName);
  const [hof4RunnerUpMembers, setHof4RunnerUpMembers] = useState(current4.runnerUp.members.join(', '));
  const [hof4RunnerUpPhoto, setHof4RunnerUpPhoto] = useState(current4.runnerUp.photoUrl || '');
  const [hof4EmergingTeam, setHof4EmergingTeam] = useState(current4.emergingTeam?.teamName || 'Emerging Team TBD');
  const [hof4EmergingMembers, setHof4EmergingMembers] = useState(
    (current4.emergingTeam?.members || ['Rising Debaters Award', 'Breakout Performance', 'VU Central Auditorium']).join(', ')
  );
  const [hof4EmergingPhoto, setHof4EmergingPhoto] = useState(current4.emergingTeam?.photoUrl || '');
  const [hof4BestDebaterName, setHof4BestDebaterName] = useState(current4.bestTournamentDebater.name);
  const [hof4BestDebaterId, setHof4BestDebaterId] = useState(current4.bestTournamentDebater.studentId);
  const [hof4BestDebaterPhoto, setHof4BestDebaterPhoto] = useState(current4.bestTournamentDebater.photoUrl || '');
  const [hofSavedMessage, setHofSavedMessage] = useState(false);

  // Compute Metrics
  const totalTeams = teams.length;
  const verifiedPayments = teams.filter(t => t.payment.status === 'VERIFIED').length;
  const pendingPayments = teams.filter(t => t.payment.status === 'PENDING').length;
  const completedMatches = fixtures.filter(f => f.status === 'Completed').length;
  const upcomingMatches = fixtures.filter(f => f.status === 'Upcoming' || f.status === 'Live').length;
  const totalRevenue = verifiedPayments * 350;

  // Filtered Teams
  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      team.id.toLowerCase().includes(teamSearch.toLowerCase()) ||
      team.members.some(m => m.fullName.toLowerCase().includes(teamSearch.toLowerCase()) || m.studentId.includes(teamSearch));
    
    const matchesStatus = teamStatusFilter === 'ALL' || team.status === teamStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export all registered team data as a 22-column CSV matching the Google Sheet layout (A1:V1)
  const handleExportCSV = () => {
    const escapeCsvField = (value: unknown): string => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

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
      'Speaker 3 Phone',
    ];

    const rows = teams.map(t => {
      const s1 = t.members.find(m => m.speakerRole === 1) || t.members[0];
      const s2 = t.members.find(m => m.speakerRole === 2) || t.members[1];
      const s3 = t.members.find(m => m.speakerRole === 3) || t.members[2];

      return [
        escapeCsvField(t.registrationDate || new Date().toISOString()),
        escapeCsvField(t.id),
        escapeCsvField(t.name),
        escapeCsvField(t.batch),
        escapeCsvField(t.department || 'Department of CSE, Varendra University, Rajshahi'),
        escapeCsvField(t.payment?.method || 'bKash'),
        escapeCsvField(t.payment?.senderNumber || ''),
        escapeCsvField(t.payment?.transactionId || ''),
        escapeCsvField(t.payment?.amount ?? 350),
        escapeCsvField(t.payment?.status || t.status || 'PENDING'),
        escapeCsvField(s1?.fullName || ''),
        escapeCsvField(s1?.studentId || ''),
        escapeCsvField(s1?.batch || t.batch || ''),
        escapeCsvField(s1?.phone || ''),
        escapeCsvField(s2?.fullName || ''),
        escapeCsvField(s2?.studentId || ''),
        escapeCsvField(s2?.batch || t.batch || ''),
        escapeCsvField(s2?.phone || ''),
        escapeCsvField(s3?.fullName || ''),
        escapeCsvField(s3?.studentId || ''),
        escapeCsvField(s3?.batch || t.batch || ''),
        escapeCsvField(s3?.phone || ''),
      ].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel & Google Sheets open UTF-8 characters cleanly
    const csvString = '\uFEFF' + [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tech_debate_4_registered_teams_22col_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setClearSuccessToast(`Exported ${teams.length} registered ${teams.length === 1 ? 'team' : 'teams'} (22 columns A1:V1) to CSV.`);
    setTimeout(() => setClearSuccessToast(null), 4000);
  };

  const handleHofImageFile = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    file?: File | null
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setter(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          setter(String(ev.target?.result || ''));
        }
      };
      img.src = String(ev.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHOF4 = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHallOfFame4({
      status: 'COMPLETED',
      champion: {
        teamName: hof4ChampionTeam,
        batch: '2026 Champions',
        members: hof4ChampionMembers.split(',').map(m => m.trim()),
        photoUrl: hof4ChampionPhoto,
      },
      runnerUp: {
        teamName: hof4RunnerUpTeam,
        batch: '2026 Finalists',
        members: hof4RunnerUpMembers.split(',').map(m => m.trim()),
        photoUrl: hof4RunnerUpPhoto,
      },
      emergingTeam: {
        teamName: hof4EmergingTeam,
        batch: '2026 Rising Star',
        members: hof4EmergingMembers.split(',').map(m => m.trim()),
        photoUrl: hof4EmergingPhoto,
      },
      bestTournamentDebater: {
        name: hof4BestDebaterName,
        batch: 'CSE Department',
        studentId: hof4BestDebaterId,
        achievement: 'Conferred Best Tournament Debater of Tech Debate 4.0.',
        photoUrl: hof4BestDebaterPhoto,
      }
    });
    setHofSavedMessage(true);
    setTimeout(() => setHofSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Success Notification Banner */}
      {clearSuccessToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{clearSuccessToast}</span>
          </div>
          <button onClick={() => setClearSuccessToast(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>OPERATIONAL ADMIN CONSOLE</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Tech Debate 4.0 Management Suite
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Signed in as: <strong className="text-cyan-700 dark:text-cyan-300">{adminUser?.email}</strong> ({adminUser?.role})
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 border border-cyan-300 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.25)] active:scale-95"
            title="Download all registered team data as a CSV file for offline record keeping"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Teams CSV ({totalTeams})</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="px-3.5 py-2 text-xs font-mono font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Clear all registered teams and payments from database"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Registrations ({totalTeams})</span>
          </button>

          <button
            onClick={() => setShowResetDbConfirmModal(true)}
            className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset database to default seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-900/50 rounded-xl transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-nowrap items-center gap-2 mb-8 p-1.5 bg-[#051336]/90 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,140,255,0.15)] overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Trophy },
          { id: 'teams', label: `Teams (${totalTeams})`, icon: Users },
          { id: 'payments', label: `Payments (${pendingPayments} Pending)`, icon: CreditCard },
          { id: 'fixtures', label: `Tournament Bracket (${fixtures.length})`, icon: Calendar },
          { id: 'googlesheet', label: 'Google Sheets Backup', icon: FileSpreadsheet },
          { id: 'gallery', label: 'Gallery Editor', icon: ImageIcon },
          { id: 'inquiries', label: `Helpdesk (${inquiries.filter(i => i.status === 'NEW').length} New)`, icon: MessageSquare },
          { id: 'hof', label: `Publish TD 4.0 Hall of Fame`, icon: Crown },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <GlassCard className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Teams</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">{totalTeams}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Registered in DB</span>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Verified Fees</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-300 mt-1 tabular-nums">{verifiedPayments}</div>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">{totalRevenue} BDT collected</span>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Pending Fees</span>
              <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300 mt-1 tabular-nums">{pendingPayments}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Awaiting audit</span>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">Upcoming Clashes</span>
              <div className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-300 mt-1 tabular-nums">{upcomingMatches}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Scheduled on stage</span>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">Completed</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-300 mt-1 tabular-nums">{completedMatches}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Scores recorded</span>
            </GlassCard>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6" glow>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">
                Pending Verification Queue ({pendingPayments})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Teams waiting for their bKash or Nagad TrxID confirmation.
              </p>
              
              <div className="space-y-3">
                {teams.filter(t => t.payment.status === 'PENDING').slice(0, 3).map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                      <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {t.payment.method} · {t.payment.transactionId} · {t.payment.senderNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setActionConfirmModal({
                            type: 'VERIFY_TEAM',
                            teamId: t.id,
                            teamName: t.name,
                            batch: t.batch,
                            paymentMethod: t.payment.method,
                            transactionId: t.payment.transactionId,
                            senderNumber: t.payment.senderNumber,
                            amount: t.payment.amount || 350,
                          })
                        }
                        className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-200 transition-colors font-mono cursor-pointer font-semibold"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionReasonInput('Mismatched transaction ID');
                          setActionConfirmModal({
                            type: 'REJECT_PAYMENT',
                            teamId: t.id,
                            teamName: t.name,
                            batch: t.batch,
                            paymentMethod: t.payment.method,
                            transactionId: t.payment.transactionId,
                            senderNumber: t.payment.senderNumber,
                            amount: t.payment.amount || 350,
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 hover:bg-rose-200 transition-colors font-mono cursor-pointer font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}

                {pendingPayments === 0 && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 py-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All submitted team payments have been verified!</span>
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">
                Tournament Fixture Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Active knockout tree and scoring pipeline.
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Quarter Finals</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">2 / 4 Matches Completed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Semi Finals</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">Scheduled for Oct 17</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">Grand Final</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Scheduled for Oct 18</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('fixtures')}
                  className="w-full py-2 text-center text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer font-bold"
                >
                  Open Match Scoring & Fixtures Editor →
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* 2. TEAMS TAB */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search squad name, team ID, debater, student ID..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Status filter + Export */}
            <div className="flex items-center gap-3">
              <select
                value={teamStatusFilter}
                onChange={e => setTeamStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified Teams</option>
                <option value="PENDING">Pending Verification</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 text-xs font-mono font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download all registered teams as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All CSV ({totalTeams})</span>
              </button>
            </div>
          </div>

          {/* Mobile & Web Table with Horizontal & Vertical Sliders */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#070d1f]/95 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[72vh] admin-table-scroll overscroll-contain touch-pan-x touch-pan-y">
              <table className="w-full min-w-[920px] text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[#050a18] font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800/90">
                  <tr>
                    <th className="py-3.5 px-5 whitespace-nowrap">Squad ID &amp; Name</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Batch</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Debaters (1, 2, 3)</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">MFS Fee</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredTeams.map((team) => (
                    <tr
                      key={team.id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-4 px-5 whitespace-nowrap align-middle">
                        <span className="font-mono text-cyan-400 font-semibold text-xs block">
                          {team.id}
                        </span>
                        <span className="font-bold text-white text-sm block mt-0.5">
                          {team.name}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-slate-300 whitespace-nowrap align-middle">
                        {team.batch}
                      </td>
                      <td className="py-4 px-5 space-y-1.5 whitespace-nowrap align-middle">
                        {team.members.map((m, idx) => (
                          <div key={m.id || idx} className="text-xs leading-snug whitespace-nowrap">
                            <span className="text-white font-semibold">{m.fullName}</span>{' '}
                            <span className="font-mono text-cyan-400 font-semibold">
                              ({m.studentId} • {m.batch || team.batch})
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-5 font-mono whitespace-nowrap align-middle">
                        <div className="font-bold text-white text-xs">
                          {team.payment.method} • BDT {team.payment.amount || 350}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {team.payment.transactionId}
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap align-middle">
                        <StatusBadge status={team.status} type="team" />
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-2.5">
                          {team.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() =>
                                setActionConfirmModal({
                                  type: 'VERIFY_TEAM',
                                  teamId: team.id,
                                  teamName: team.name,
                                  batch: team.batch,
                                  paymentMethod: team.payment.method,
                                  transactionId: team.payment.transactionId,
                                  senderNumber: team.payment.senderNumber,
                                  amount: team.payment.amount || 350,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-700/70 rounded hover:bg-emerald-900/80 cursor-pointer font-bold transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setActionConfirmModal({
                                type: 'DELETE_TEAM',
                                teamId: team.id,
                                teamName: team.name,
                                batch: team.batch,
                                paymentMethod: team.payment.method,
                                transactionId: team.payment.transactionId,
                                senderNumber: team.payment.senderNumber,
                                amount: team.payment.amount || 350,
                              })
                            }
                            className="px-2.5 py-1 text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/70 hover:bg-rose-900/80 hover:text-white rounded flex items-center gap-1 transition-colors cursor-pointer font-bold"
                            title="Delete team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Mobile Financial Service (MFS) Transaction Ledger
            </h3>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                Verified Revenue: {totalRevenue} BDT
              </span>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map(team => (
              <GlassCard
                key={team.id}
                className="p-5 space-y-3"
                glow={team.payment.status === 'PENDING'}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{team.id}</span>
                  <StatusBadge status={team.payment.status} type="payment" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{team.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{team.batch}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{team.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{team.payment.amount} BDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sender:</span>
                    <span className="text-slate-700 dark:text-slate-300">{team.payment.senderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TrxID:</span>
                    <span className="text-cyan-600 dark:text-cyan-300 font-bold">{team.payment.transactionId}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  {team.payment.status === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActionConfirmModal({
                            type: 'APPROVE_PAYMENT',
                            teamId: team.id,
                            teamName: team.name,
                            batch: team.batch,
                            paymentMethod: team.payment.method,
                            transactionId: team.payment.transactionId,
                            senderNumber: team.payment.senderNumber,
                            amount: team.payment.amount || 350,
                          })
                        }
                        className="flex-1 py-1.5 text-xs font-mono font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors cursor-pointer"
                      >
                        Approve Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionReasonInput('Mismatched transaction ID');
                          setActionConfirmModal({
                            type: 'REJECT_PAYMENT',
                            teamId: team.id,
                            teamName: team.name,
                            batch: team.batch,
                            paymentMethod: team.payment.method,
                            transactionId: team.payment.transactionId,
                            senderNumber: team.payment.senderNumber,
                            amount: team.payment.amount || 350,
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-mono text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer font-bold"
                      >
                        Reject
                      </button>
                    </>
                  ) : team.payment.status === 'VERIFIED' ? (
                    <div className="w-full text-center text-xs font-mono text-emerald-700 dark:text-emerald-400 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900/50 font-bold">
                      Payment Confirmed & Verified
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setActionConfirmModal({
                          type: 'APPROVE_PAYMENT',
                          teamId: team.id,
                          teamName: team.name,
                          batch: team.batch,
                          paymentMethod: team.payment.method,
                          transactionId: team.payment.transactionId,
                          senderNumber: team.payment.senderNumber,
                          amount: team.payment.amount || 350,
                        })
                      }
                      className="w-full py-1.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 rounded border border-cyan-300 dark:border-cyan-800/40 cursor-pointer font-bold"
                    >
                      Re-verify Payment
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* 4. FIXTURES TAB */}
      {activeTab === 'fixtures' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                64-Team Knockout Fixture & Match Schedule Editor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage team pairings, venue rooms, match times, motions, and live scores for all 63 matches.
              </p>
            </div>

            <button
              onClick={async () => {
                const nextMatchNum = fixtures.length + 1;
                const newF = await createFixture({
                  matchNumber: nextMatchNum,
                  roundKey: 'R64',
                  roundName: 'Round of 64',
                  govTeam: `Team ${nextMatchNum}`,
                  govShort: `T${nextMatchNum}`,
                  oppTeam: `Team ${nextMatchNum + 1}`,
                  oppShort: `T${nextMatchNum + 1}`,
                  venue: 'Gallery Room 304, CSE Building',
                  datetime: 'Nov 20, 2025 · 10:00 AM',
                  status: 'Upcoming'
                });
                setEditingFixture(newF);
              }}
              className="px-3.5 py-2 text-xs font-mono text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Match</span>
            </button>
          </div>

          {/* Search & Round Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search match ID or team (e.g. M1, Team 64)..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <select
              value={teamStatusFilter}
              onChange={e => setTeamStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono"
            >
              <option value="ALL">All Rounds ({fixtures.length})</option>
              <option value="R64">Round of 64</option>
              <option value="R32">Round of 32</option>
              <option value="R16">Round of 16</option>
              <option value="QF">Quarter Finals</option>
              <option value="SF">Semi Finals</option>
              <option value="GF">Grand Finale</option>
            </select>
          </div>

          {/* Match Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixtures
              .filter(f => {
                const q = teamSearch.trim().toLowerCase();
                const matchesSearch = !q || 
                  f.id.toLowerCase().includes(q) || 
                  f.govTeam.toLowerCase().includes(q) || 
                  f.oppTeam.toLowerCase().includes(q) ||
                  f.venue.toLowerCase().includes(q);
                const matchesRound = teamStatusFilter === 'ALL' || f.roundKey === teamStatusFilter;
                return matchesSearch && matchesRound;
              })
              .map(f => (
                <GlassCard key={f.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{f.id} · {f.roundName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      f.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      f.status === 'Live' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {f.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold">{f.govShort}</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{f.govTeam}</span>
                      </div>
                      {f.govScore !== undefined && <span className="font-mono text-cyan-400 font-bold">{f.govScore}</span>}
                    </div>

                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">{f.oppShort}</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{f.oppTeam}</span>
                      </div>
                      {f.oppScore !== undefined && <span className="font-mono text-cyan-400 font-bold">{f.oppScore}</span>}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-1">
                    <div>Venue: <span className="text-slate-300 font-semibold">{f.venue}</span></div>
                    <div>Schedule: <span className="text-slate-300 font-semibold">{f.datetime}</span></div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => setEditingFixture(f)}
                      className="flex-1 py-1.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Match Details</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete match ${f.id}?`)) {
                          deleteFixture(f.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
          </div>

          {/* Edit Fixture Modal */}
          {editingFixture && (
            <div 
              onClick={() => setEditingFixture(null)}
              className="fixed inset-0 z-50 bg-[#02040b]/85 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div 
                onClick={e => e.stopPropagation()}
                className="relative max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl clay-panel p-6 space-y-4 shadow-2xl text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Edit Match Fixture: {editingFixture.id} ({editingFixture.roundName})
                  </h4>
                  <button 
                    onClick={() => setEditingFixture(null)}
                    className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Round Selection */}
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase font-semibold">Tournament Round</label>
                    <select
                      value={editingFixture.roundKey}
                      onChange={e => {
                        const rKey = e.target.value as any;
                        const rNames: Record<string, string> = {
                          R64: 'Round of 64',
                          R32: 'Round of 32',
                          R16: 'Round of 16',
                          QF: 'Quarter Final',
                          SF: 'Semi Final',
                          GF: 'Grand Finale'
                        };
                        setEditingFixture({ ...editingFixture, roundKey: rKey, roundName: rNames[rKey] || rKey });
                      }}
                      className="w-full px-3 py-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="R64">Round of 64</option>
                      <option value="R32">Round of 32</option>
                      <option value="R16">Round of 16</option>
                      <option value="QF">Quarter Final</option>
                      <option value="SF">Semi Final</option>
                      <option value="GF">Grand Finale</option>
                    </select>
                  </div>

                  {/* Team 1 Details */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-cyan-400 font-mono block uppercase">Team 1 (Government)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-slate-400 mb-0.5">Team Name</label>
                        <input
                          type="text"
                          value={editingFixture.govTeam || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, govTeam: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Tag Code</label>
                        <input
                          type="text"
                          value={editingFixture.govShort || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, govShort: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team 2 Details */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-blue-400 font-mono block uppercase">Team 2 (Opposition)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-slate-400 mb-0.5">Team Name</label>
                        <input
                          type="text"
                          value={editingFixture.oppTeam || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, oppTeam: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Tag Code</label>
                        <input
                          type="text"
                          value={editingFixture.oppShort || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, oppShort: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Venue & Time Schedule */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase font-semibold">Room / Venue Allocation</label>
                      <input
                        type="text"
                        placeholder="e.g. Gallery Room 304, CSE Building"
                        value={editingFixture.venue || ''}
                        onChange={e => setEditingFixture({ ...editingFixture, venue: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase font-semibold">Match Time & Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Nov 20, 2025 · 10:00 AM"
                        value={editingFixture.datetime || ''}
                        onChange={e => setEditingFixture({ ...editingFixture, datetime: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Match Status */}
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase font-semibold">Match Status</label>
                    <select
                      value={editingFixture.status}
                      onChange={e => setEditingFixture({ ...editingFixture, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Live">Live Round</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Motion Topic */}
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase font-semibold">Motion Topic</label>
                    <textarea
                      rows={2}
                      placeholder="Enter debate motion topic..."
                      value={editingFixture.motion || ''}
                      onChange={e => setEditingFixture({ ...editingFixture, motion: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Scores & Winner (Optional) */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-amber-400 font-mono block uppercase">Scoring & Winner (Optional)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-0.5">Gov Score</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editingFixture.govScore ?? ''}
                          onChange={e => setEditingFixture({ ...editingFixture, govScore: parseFloat(e.target.value) || undefined })}
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Opp Score</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editingFixture.oppScore ?? ''}
                          onChange={e => setEditingFixture({ ...editingFixture, oppScore: parseFloat(e.target.value) || undefined })}
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Winner Side</label>
                        <select
                          value={editingFixture.winner || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, winner: (e.target.value || undefined) as any })}
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono"
                        >
                          <option value="">None / TBD</option>
                          <option value="GOV">Gov (Team 1)</option>
                          <option value="OPP">Opp (Team 2)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-cyan-500/20">
                  <button
                    onClick={() => setEditingFixture(null)}
                    className="clay-btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateFixture(editingFixture.id, editingFixture);
                      setEditingFixture(null);
                    }}
                    className="clay-btn-primary px-5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Save Match Fixture
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. GOOGLE SHEETS BACKUP TAB */}
      {activeTab === 'googlesheet' && (
        <GoogleSheetBackupSection teams={teams} />
      )}

      {/* 6. GALLERY EDITOR TAB */}
      {activeTab === 'gallery' && (
        <GalleryEditorSection />
      )}

      {/* 6. HOF 4.0 PUBLISHER TAB */}
      {activeTab === 'hof' && (
        <GlassCard className="p-8" glow>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Crown className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Tech Debate 4.0 Hall of Fame Publisher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update and permanently record the official 2026 Champion, Runner-up, and Best Debaters when the Grand Final concludes.
              </p>
            </div>
          </div>

          {hofSavedMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Tech Debate 4.0 Hall of Fame records updated and published to the live public portal!</span>
            </div>
          )}

          <form onSubmit={handleSaveHOF4} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Champion Team */}
              <div className="p-5 rounded-xl bg-amber-50/60 dark:bg-slate-950/80 border border-amber-300 dark:border-amber-500/30 space-y-4">
                <span className="font-mono text-xs text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider block">
                  1. Champion Team
                </span>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Team Name</label>
                  <input
                    type="text"
                    value={hof4ChampionTeam}
                    onChange={e => setHof4ChampionTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">3 Debater Names (Comma separated)</label>
                  <input
                    type="text"
                    value={hof4ChampionMembers}
                    onChange={e => setHof4ChampionMembers(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Champion Picture Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleHofImageFile(setHof4ChampionPhoto, e.target.files?.[0])}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Runners Up Team */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 space-y-4">
                <span className="font-mono text-xs text-slate-700 dark:text-sky-300 font-bold uppercase tracking-wider block">
                  2. Runners Up Team
                </span>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Team Name</label>
                  <input
                    type="text"
                    value={hof4RunnerUpTeam}
                    onChange={e => setHof4RunnerUpTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">3 Debater Names (Comma separated)</label>
                  <input
                    type="text"
                    value={hof4RunnerUpMembers}
                    onChange={e => setHof4RunnerUpMembers(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Runners Up Picture Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleHofImageFile(setHof4RunnerUpPhoto, e.target.files?.[0])}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:font-bold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                  />
                </div>
              </div>

              {/* 3. Emerging Team */}
              <div className="p-5 rounded-xl bg-emerald-50/60 dark:bg-slate-950/80 border border-emerald-300 dark:border-emerald-500/30 space-y-4">
                <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider block">
                  3. Emerging Team
                </span>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Team Name</label>
                  <input
                    type="text"
                    value={hof4EmergingTeam}
                    onChange={e => setHof4EmergingTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">3 Debater Names (Comma separated)</label>
                  <input
                    type="text"
                    value={hof4EmergingMembers}
                    onChange={e => setHof4EmergingMembers(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Emerging Team Picture Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleHofImageFile(setHof4EmergingPhoto, e.target.files?.[0])}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Best Tournament Debater */}
              <div className="p-5 rounded-xl bg-cyan-50/60 dark:bg-slate-950/80 border border-cyan-300 dark:border-cyan-500/30 space-y-4">
                <span className="font-mono text-xs text-cyan-700 dark:text-cyan-300 font-bold uppercase tracking-wider block">
                  4. Best Tournament Debater
                </span>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Best Tournament Debater Name
                  </label>
                  <input
                    type="text"
                    value={hof4BestDebaterName}
                    onChange={e => setHof4BestDebaterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Best Debater Student ID
                  </label>
                  <input
                    type="text"
                    value={hof4BestDebaterId}
                    onChange={e => setHof4BestDebaterId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-medium">Best Debater Picture Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleHofImageFile(setHof4BestDebaterPhoto, e.target.files?.[0])}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-95 uppercase"
              >
                Publish Hall of Fame 4.0
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* HELPDESK INQUIRIES TAB */}
      {activeTab === 'inquiries' && (
        <GlassCard className="p-6 sm:p-8" glow>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Helpdesk & MFS Verification Tickets ({inquiries.length})</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Real-time student inquiries submitted from the Contact & Helpdesk page via Cloud Firestore.
              </p>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400">
              No helpdesk inquiries submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    inq.status === 'NEW'
                      ? 'bg-[#081b42]/90 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                      : 'bg-slate-950/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          inq.status === 'NEW'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        }`}
                      >
                        {inq.status}
                      </span>
                      <span className="font-display text-sm font-bold text-white">{inq.name}</span>
                      <a
                        href={`tel:${inq.phone}`}
                        className="font-mono text-xs text-cyan-300 hover:underline font-semibold"
                      >
                        {inq.phone}
                      </a>
                      {inq.studentId && (
                        <span className="font-mono text-[11px] text-slate-400">
                          • ID: {inq.studentId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateInquiryStatus(
                            inq.id,
                            inq.status === 'NEW' ? 'RESOLVED' : 'NEW'
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                      >
                        {inq.status === 'NEW' ? 'Mark Resolved' : 'Reopen'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteInquiry(inq.id)}
                        className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 cursor-pointer transition-colors"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="text-xs font-mono font-semibold text-amber-300">
                      Category: {inq.subject}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* CONFIRMATION MODAL: CLEAR ALL REGISTRATIONS */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/50 bg-[#0a132c] p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.35)] text-center space-y-5 overflow-hidden">
            
            {/* Background ambient glow */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400/80 flex items-center justify-center text-rose-300 mx-auto shadow-[0_0_25px_rgba(244,63,94,0.4)]">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-[10px] font-mono font-bold tracking-widest text-rose-300 uppercase">
                CRITICAL ADMIN ACTION
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                Clear All Registrations?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Are you sure you want to clear all registered squads from the database? This action will permanently delete all <strong className="text-rose-300">{totalTeams}</strong> registered teams, debaters, and payment records.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await clearAllRegistrations();
                  setShowClearConfirmModal(false);
                  setClearSuccessToast('All registered squads and payment data have been completely cleared!');
                  setTimeout(() => setClearSuccessToast(null), 5000);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer transition-all shadow-lg shadow-rose-600/30 active:scale-95"
              >
                Yes, Clear All Registrations
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UNIFIED CONFIRMATION POP-UP MODAL: TEAM VERIFY / TEAM DELETE / PAYMENT APPROVE / PAYMENT REJECT */}
      {actionConfirmModal && (
        <div
          onClick={() => {
            if (!isActionSubmitting) setActionConfirmModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 text-center space-y-5 shadow-2xl overflow-hidden bg-[#0a132c] ${
              actionConfirmModal.type === 'DELETE_TEAM' || actionConfirmModal.type === 'REJECT_PAYMENT'
                ? 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
                : 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
            }`}
          >
            {/* Icon Badge */}
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mx-auto ${
                actionConfirmModal.type === 'DELETE_TEAM' || actionConfirmModal.type === 'REJECT_PAYMENT'
                  ? 'bg-rose-500/20 border-rose-400/80 text-rose-300'
                  : 'bg-emerald-500/20 border-emerald-400/80 text-emerald-300'
              }`}
            >
              {actionConfirmModal.type === 'DELETE_TEAM' ? (
                <Trash2 className="w-7 h-7" />
              ) : actionConfirmModal.type === 'APPROVE_PAYMENT' || actionConfirmModal.type === 'REJECT_PAYMENT' ? (
                <CreditCard className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-2">
              <span
                className={`inline-block px-3 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase ${
                  actionConfirmModal.type === 'DELETE_TEAM' || actionConfirmModal.type === 'REJECT_PAYMENT'
                    ? 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                }`}
              >
                {actionConfirmModal.type === 'VERIFY_TEAM' && 'TEAM VERIFICATION CONFIRMATION'}
                {actionConfirmModal.type === 'DELETE_TEAM' && 'TEAM DELETION CONFIRMATION'}
                {actionConfirmModal.type === 'APPROVE_PAYMENT' && 'PAYMENT APPROVAL CONFIRMATION'}
                {actionConfirmModal.type === 'REJECT_PAYMENT' && 'PAYMENT REJECTION CONFIRMATION'}
              </span>

              <h3 className="font-display text-xl font-extrabold text-white">
                {actionConfirmModal.type === 'VERIFY_TEAM' && 'Verify This Squad?'}
                {actionConfirmModal.type === 'DELETE_TEAM' && 'Delete This Squad?'}
                {actionConfirmModal.type === 'APPROVE_PAYMENT' && 'Approve Payment Transaction?'}
                {actionConfirmModal.type === 'REJECT_PAYMENT' && 'Reject Payment Transaction?'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {actionConfirmModal.type === 'VERIFY_TEAM' && (
                  <>
                    Are you sure you want to verify squad{' '}
                    <strong className="text-emerald-300">{actionConfirmModal.teamName}</strong> (
                    <span className="font-mono text-cyan-300">{actionConfirmModal.teamId}</span>)? Confirming will update the team and payment status to <strong className="text-emerald-300">VERIFIED</strong> in the database.
                  </>
                )}
                {actionConfirmModal.type === 'DELETE_TEAM' && (
                  <>
                    Are you sure you want to permanently delete squad{' '}
                    <strong className="text-rose-300">{actionConfirmModal.teamName}</strong> (
                    <span className="font-mono text-cyan-300">{actionConfirmModal.teamId}</span>)? Confirming will remove this squad from the database.
                  </>
                )}
                {actionConfirmModal.type === 'APPROVE_PAYMENT' && (
                  <>
                    Are you sure you want to approve the payment for{' '}
                    <strong className="text-emerald-300">{actionConfirmModal.teamName}</strong> (
                    <span className="font-mono text-cyan-300">{actionConfirmModal.teamId}</span>)? Confirming will mark the payment and squad as <strong className="text-emerald-300">VERIFIED</strong> in the database.
                  </>
                )}
                {actionConfirmModal.type === 'REJECT_PAYMENT' && (
                  <>
                    Are you sure you want to reject the payment for{' '}
                    <strong className="text-rose-300">{actionConfirmModal.teamName}</strong> (
                    <span className="font-mono text-cyan-300">{actionConfirmModal.teamId}</span>)?
                  </>
                )}
              </p>
            </div>

            {/* Summary Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Squad:</span>
                <span className="text-white font-bold">{actionConfirmModal.teamName} ({actionConfirmModal.teamId})</span>
              </div>
              {actionConfirmModal.batch && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Batch:</span>
                  <span className="text-slate-200">{actionConfirmModal.batch}</span>
                </div>
              )}
              {actionConfirmModal.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway & Fee:</span>
                  <span className="text-emerald-400 font-bold">
                    {actionConfirmModal.paymentMethod} • {actionConfirmModal.amount || 350} BDT
                  </span>
                </div>
              )}
              {actionConfirmModal.senderNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Number:</span>
                  <span className="text-slate-200">{actionConfirmModal.senderNumber}</span>
                </div>
              )}
              {actionConfirmModal.transactionId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">TrxID:</span>
                  <span className="text-cyan-300 font-bold">{actionConfirmModal.transactionId}</span>
                </div>
              )}
            </div>

            {actionConfirmModal.type === 'REJECT_PAYMENT' && (
              <div className="text-left space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">Rejection Reason</label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Mismatched transaction ID"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={() => setActionConfirmModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={async () => {
                  setIsActionSubmitting(true);
                  try {
                    if (actionConfirmModal.type === 'VERIFY_TEAM') {
                      await updatePaymentStatus(actionConfirmModal.teamId, 'VERIFIED');
                      setClearSuccessToast(
                        `Squad "${actionConfirmModal.teamName}" (${actionConfirmModal.teamId}) verified and updated in the database.`
                      );
                    } else if (actionConfirmModal.type === 'APPROVE_PAYMENT') {
                      await updatePaymentStatus(actionConfirmModal.teamId, 'VERIFIED');
                      setClearSuccessToast(
                        `Payment for "${actionConfirmModal.teamName}" (TrxID: ${actionConfirmModal.transactionId}) approved and updated in the database.`
                      );
                    } else if (actionConfirmModal.type === 'REJECT_PAYMENT') {
                      await updatePaymentStatus(
                        actionConfirmModal.teamId,
                        'REJECTED',
                        rejectionReasonInput.trim() || 'Mismatched transaction ID'
                      );
                      setClearSuccessToast(
                        `Payment for "${actionConfirmModal.teamName}" marked as REJECTED in the database.`
                      );
                    } else if (actionConfirmModal.type === 'DELETE_TEAM') {
                      await deleteTeam(actionConfirmModal.teamId);
                      setClearSuccessToast(
                        `Squad "${actionConfirmModal.teamName}" (${actionConfirmModal.teamId}) permanently deleted from the database.`
                      );
                    }
                    setTimeout(() => setClearSuccessToast(null), 4000);
                    setActionConfirmModal(null);
                  } finally {
                    setIsActionSubmitting(false);
                  }
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                  actionConfirmModal.type === 'DELETE_TEAM' || actionConfirmModal.type === 'REJECT_PAYMENT'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {isActionSubmitting
                  ? 'Updating DB...'
                  : actionConfirmModal.type === 'VERIFY_TEAM'
                  ? 'Confirm & Verify'
                  : actionConfirmModal.type === 'APPROVE_PAYMENT'
                  ? 'Confirm & Approve'
                  : actionConfirmModal.type === 'REJECT_PAYMENT'
                  ? 'Confirm Reject'
                  : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE SINGLE TEAM (LEGACY FALLBACK) */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/40 bg-[#0a132c] p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Delete Squad?</h3>
            <p className="text-xs text-slate-300">
              Permanently delete squad <strong className="text-cyan-300">{teamToDelete.name}</strong> ({teamToDelete.id})?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteTeam(teamToDelete.id);
                  setTeamToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                Delete Squad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESET DEMO DATABASE */}
      {showResetDbConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-sky-500/40 bg-[#0a132c] p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Reset Local Database?</h3>
            <p className="text-xs text-slate-300">
              Reset local database to seeded tournament demo dataset?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetDbConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDatabase();
                  setShowResetDbConfirmModal(false);
                  setClearSuccessToast('Database reset to initial demo dataset.');
                  setTimeout(() => setClearSuccessToast(null), 4000);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
