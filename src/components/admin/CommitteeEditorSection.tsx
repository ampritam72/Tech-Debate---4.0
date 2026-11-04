import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Upload,
  Trash2,
  CheckCircle2,
  Shield,
  Search,
  Sparkles,
  Plus,
  Edit3,
  Save,
  X,
  RotateCcw,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import {
  LEADERSHIP_CARDS,
  SORTED_STUDENT_MEMBERS,
  CommitteeMemberData,
  useCommitteeRoster,
  notifyCommitteePhotosUpdated,
  notifyCommitteeRosterUpdated,
} from '../../data/committeeMembers';

interface AdminMemberRowCardProps {
  member: CommitteeMemberData;
  isLeadership?: boolean;
  overrideUrl?: string;
  isUploading: boolean;
  compressionStats?: { originalKB: number; compressedKB: number; savedPercent: number };
  onUploadFile: (member: CommitteeMemberData, file: File) => void;
  onRemovePhoto: (member: CommitteeMemberData) => void;
  onSaveEdit: (updatedMember: CommitteeMemberData, isLeadership: boolean) => void;
  onDeleteMember: (memberId: string, isLeadership: boolean) => void;
}

const AdminMemberRowCard: React.FC<AdminMemberRowCardProps> = ({
  member,
  isLeadership = false,
  overrideUrl,
  isUploading,
  compressionStats,
  onUploadFile,
  onRemovePhoto,
  onSaveEdit,
  onDeleteMember,
}) => {
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(member.name);
  const [editPosition, setEditPosition] = useState(member.position || 'Executive Member');
  const [editSemester, setEditSemester] = useState(member.semester || '35th Batch');
  const [editStudentId, setEditStudentId] = useState(member.studentId || '');

  useEffect(() => {
    setEditName(member.name);
    setEditPosition(member.position || 'Executive Member');
    setEditSemester(member.semester || '35th Batch');
    setEditStudentId(member.studentId || '');
  }, [member]);

  const candidates = useMemo(() => {
    const list: string[] = [];
    if (overrideUrl) list.push(overrideUrl);
    if (member.photoCandidates && member.photoCandidates.length > 0) {
      for (const c of member.photoCandidates) {
        if (!list.includes(c)) list.push(c);
      }
    }
    if (member.photoUrl && !list.includes(member.photoUrl)) {
      list.push(member.photoUrl);
    }
    return list;
  }, [member, overrideUrl]);

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    member.name
  )}&background=0a1c3c&color=38bdf8&size=512`;
  const currentSrc =
    !imgError && candidates[candidateIdx] ? candidates[candidateIdx] : avatarFallback;

  const handleImageError = () => {
    if (candidateIdx + 1 < candidates.length) {
      setCandidateIdx((p) => p + 1);
    } else {
      setImgError(true);
    }
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    onSaveEdit(
      {
        ...member,
        name: editName.trim(),
        position: editPosition.trim() || 'Executive Member',
        semester: editSemester.trim() || 'CSE Batch',
        studentId: editStudentId.trim() || (isLeadership ? 'FACULTY' : ''),
      },
      isLeadership
    );
    setIsEditing(false);
  };

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all ${
        isLeadership
          ? 'bg-[#091d42]/90 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
          : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 border border-cyan-400/30 shrink-0 relative">
          <img
            src={currentSrc}
            alt={member.name}
            onError={handleImageError}
            className="w-full h-full object-cover object-top"
          />
          {overrideUrl && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500/90 text-[9px] font-mono font-bold text-slate-950">
              WebP
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {member.position || 'Executive Member'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] font-mono text-slate-400">{member.semester}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Edit Name, Role, Batch & ID"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMember(member.id, isLeadership)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-400/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Committee Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-display text-sm font-bold text-white mt-0.5 line-clamp-2">
                {member.name}
              </h4>

              {member.studentId && member.studentId !== 'FACULTY' && (
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                  ID: {member.studentId}
                </div>
              )}

              {compressionStats && (
                <div className="mt-1.5 text-[10px] font-mono text-emerald-300 tabular-nums">
                  {compressionStats.originalKB} KB → {compressionStats.compressedKB} KB WebP (
                  {compressionStats.savedPercent}% saved)
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] font-mono uppercase text-cyan-400 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Member Name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-cyan-400 mb-0.5">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    placeholder="e.g. Coordinator"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-cyan-400 mb-0.5">
                    Batch / Designation
                  </label>
                  <input
                    type="text"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    placeholder="e.g. 33rd Batch"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase text-cyan-400 mb-0.5">
                  Student ID / Tag (Optional)
                </label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="e.g. 232311242 or FACULTY"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <label
          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            isUploading
              ? 'bg-slate-800 border-slate-700 text-slate-400 pointer-events-none'
              : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-400/40 text-cyan-200 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{isUploading ? 'Compressing WebP...' : 'Upload Photo'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setCandidateIdx(0);
                setImgError(false);
                onUploadFile(member, file);
              }
              e.target.value = '';
            }}
            className="hidden"
          />
        </label>

        {overrideUrl && (
          <button
            type="button"
            onClick={() => onRemovePhoto(member)}
            className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Reset to default folder photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const CommitteeEditorSection: React.FC = () => {
  const { leadership, students, photoOverrides } = useCommitteeRoster();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);
  const [statsByMember, setStatsByMember] = useState<
    Record<string, { originalKB: number; compressedKB: number; savedPercent: number }>
  >({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add New Committee Member Modal / Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<'leadership' | 'student'>('student');
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('Executive Member');
  const [newSemester, setNewSemester] = useState('35th Batch');
  const [newStudentId, setNewStudentId] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [isSavingRoster, setIsSavingRoster] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(String(ev.target?.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });

  const persistRosterToBackend = async (
    nextLeadership: CommitteeMemberData[],
    nextStudents: CommitteeMemberData[],
    successText: string
  ) => {
    setIsSavingRoster(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/committee/roster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadership: nextLeadership,
          students: nextStudents,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save committee roster');
      }
      notifyCommitteeRosterUpdated({
        leadership: nextLeadership,
        students: nextStudents,
        photos: data.photos || photoOverrides,
      });
      showToast(successText);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save committee changes.');
    } finally {
      setIsSavingRoster(false);
    }
  };

  const handleSaveMemberEdit = async (
    updatedMember: CommitteeMemberData,
    isLeadership: boolean
  ) => {
    if (isLeadership) {
      const nextLeadership = leadership.map((m) =>
        m.id === updatedMember.id ? updatedMember : m
      );
      await persistRosterToBackend(
        nextLeadership,
        students,
        `Updated "${updatedMember.name}" (${updatedMember.position} · ${updatedMember.semester})`
      );
    } else {
      const nextStudents = students.map((m) =>
        m.id === updatedMember.id ? updatedMember : m
      );
      await persistRosterToBackend(
        leadership,
        nextStudents,
        `Updated "${updatedMember.name}" (${updatedMember.position} · ${updatedMember.semester})`
      );
    }
  };

  const handleDeleteMember = async (memberId: string, isLeadership: boolean) => {
    const target = (isLeadership ? leadership : students).find((m) => m.id === memberId);
    if (!target) return;
    if (isLeadership) {
      const nextLeadership = leadership.filter((m) => m.id !== memberId);
      await persistRosterToBackend(
        nextLeadership,
        students,
        `Removed "${target.name}" from Executive Leadership.`
      );
    } else {
      const nextStudents = students.filter((m) => m.id !== memberId);
      await persistRosterToBackend(
        leadership,
        nextStudents,
        `Removed "${target.name}" from Organizing Committee.`
      );
    }
  };

  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMessage('Member Full Name is required.');
      return;
    }

    const generatedId =
      newCategory === 'leadership'
        ? `lead-${Date.now()}`
        : `stu-${newStudentId.trim() || Date.now()}`;

    const newMemberObj: CommitteeMemberData = {
      id: generatedId,
      name: newName.trim(),
      studentId: newStudentId.trim() || (newCategory === 'leadership' ? 'FACULTY' : ''),
      semester: newSemester.trim() || (newCategory === 'leadership' ? 'Faculty Member' : '35th Batch'),
      semesterNumber: newCategory === 'leadership' ? 99 : 5,
      contactNumber: '',
      photoUrl: '',
      photoCandidates: [],
      position: newPosition.trim() || (newCategory === 'leadership' ? 'Coordinator' : 'Executive Member'),
      isPlaceholder: false,
    };

    const nextLeadership =
      newCategory === 'leadership' ? [...leadership, newMemberObj] : leadership;
    const nextStudents =
      newCategory === 'student' ? [newMemberObj, ...students] : students;

    await persistRosterToBackend(
      nextLeadership,
      nextStudents,
      `Added new committee member: "${newMemberObj.name}" (${newMemberObj.position})`
    );

    if (newPhotoFile) {
      await handleUploadMemberPhoto(newMemberObj, newPhotoFile);
    }

    setNewName('');
    setNewPosition('Executive Member');
    setNewSemester('35th Batch');
    setNewStudentId('');
    setNewPhotoFile(null);
    setShowAddForm(false);
  };

  const handleResetDefaultRoster = async () => {
    await persistRosterToBackend(
      LEADERSHIP_CARDS,
      SORTED_STUDENT_MEMBERS,
      'Restored default Tech Debate 4.0 Committee Roster.'
    );
  };

  const handleUploadMemberPhoto = async (member: CommitteeMemberData, file: File) => {
    setUploadingMemberId(member.id);
    setErrorMessage(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch('/api/admin/committee/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          fileName: file.name,
          dataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to compress and upload photo');
      }

      if (data.photos) {
        notifyCommitteePhotosUpdated(data.photos);
      }
      setStatsByMember((prev) => ({
        ...prev,
        [member.id]: {
          originalKB: data.originalKB || 0,
          compressedKB: data.compressedKB || 0,
          savedPercent: data.savedPercent || 0,
        },
      }));
      showToast(
        `${member.name}: Compressed to WebP on backend (${data.originalKB} KB → ${data.compressedKB} KB, ${data.savedPercent}% smaller)`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload committee member photo.');
    } finally {
      setUploadingMemberId(null);
    }
  };

  const handleRemoveMemberPhoto = async (member: CommitteeMemberData) => {
    try {
      const res = await fetch('/api/admin/committee/photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (res.ok && data.photos) {
        notifyCommitteePhotosUpdated(data.photos);
        showToast(`Reset photo for "${member.name}" to default.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset member photo.');
    }
  };

  const filteredLeadership = leadership.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.semester.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.semester.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <GlassCard className="p-6" glow>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>FULL COMMITTEE ROSTER & WEBP PORTRAIT MANAGER</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Committee Members Management ({leadership.length + students.length} Members)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Add new members, edit <strong>Name, Role/Position, Batch/Semester, Student ID</strong>, or upload photos directly from the Admin Panel without touching code. Every photo is automatically compressed to lightweight <strong className="text-cyan-300">WebP</strong> on the backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, role, batch..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.25)]"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Close Form' : 'Add Member'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaultRoster}
              disabled={isSavingRoster}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset committee list to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Add New Committee Member Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddNewMember}
            className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end"
          >
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 mb-1">
                Section / Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => {
                  const val = e.target.value as 'leadership' | 'student';
                  setNewCategory(val);
                  if (val === 'leadership') {
                    setNewPosition('Coordinator');
                    setNewSemester('Faculty Member');
                  } else {
                    setNewPosition('Executive Member');
                    setNewSemester('35th Batch');
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="student">Organizing Committee</option>
                <option value="leadership">Executive Leadership (Top 4)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Farhan Ahamed"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 mb-1">
                Role / Position *
              </label>
              <input
                type="text"
                required
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g. Organizing Secretary"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 mb-1">
                Batch / Semester *
              </label>
              <input
                type="text"
                required
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                placeholder="e.g. 33rd Batch or Faculty Member"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 mb-1">
                Student ID (Optional)
              </label>
              <input
                type="text"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                placeholder="e.g. 232311242"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer truncate">
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{newPhotoFile ? newPhotoFile.name : 'Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={isSavingRoster}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>
        )}

        {toastMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-mono font-bold">
            {errorMessage}
          </div>
        )}
      </GlassCard>

      {/* 1. Executive Leadership & Advisory Board */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h4 className="font-display text-base sm:text-lg font-bold text-white">
              Executive Leadership & Advisory Board ({filteredLeadership.length})
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click the pencil icon on any card to edit Name, Role, or Batch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLeadership.map((member) => (
            <AdminMemberRowCard
              key={member.id}
              member={member}
              isLeadership
              overrideUrl={photoOverrides[member.id]}
              isUploading={uploadingMemberId === member.id}
              compressionStats={statsByMember[member.id]}
              onUploadFile={handleUploadMemberPhoto}
              onRemovePhoto={handleRemoveMemberPhoto}
              onSaveEdit={handleSaveMemberEdit}
              onDeleteMember={handleDeleteMember}
            />
          ))}
        </div>
      </GlassCard>

      {/* 2. Organizing Committee Members */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-400" />
            <h4 className="font-display text-base sm:text-lg font-bold text-white">
              Organizing Committee Members ({filteredStudents.length})
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Updates sync immediately to Home & Committee pages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((member) => (
            <AdminMemberRowCard
              key={member.id}
              member={member}
              overrideUrl={photoOverrides[member.id]}
              isUploading={uploadingMemberId === member.id}
              compressionStats={statsByMember[member.id]}
              onUploadFile={handleUploadMemberPhoto}
              onRemovePhoto={handleRemoveMemberPhoto}
              onSaveEdit={handleSaveMemberEdit}
              onDeleteMember={handleDeleteMember}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
