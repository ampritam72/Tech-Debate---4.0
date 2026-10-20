import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  Users, 
  CreditCard, 
  Printer, 
  Copy, 
  FileText, 
  Trophy, 
  Calendar, 
  CheckSquare, 
  Square,
  Check,
  Phone,
  Info,
  Sparkles,
  X,
  Loader2,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTournament } from '../../context/TournamentContext';
import { Validator } from '../../services/validator';
import { PaymentMethod, Team } from '../../types';

const BATCH_OPTIONS = [
  '32nd Batch',
  '33rd Batch',
  '34th Batch',
  '35th Batch',
  '36th Batch',
  '37th Batch',
  '38th Batch',
  '39th Batch'
];

const SEMESTER_OPTIONS = [
  '7th Semester',
  '6th Semester',
  '5th Semester',
  '4th Semester',
  '3rd Semester',
  '2nd Semester',
  '1st Semester',
  '8th Semester'
];

interface RegistrationWizardProps {
  onGoHome?: () => void;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ onGoHome }) => {
  const { teams, registerTeam } = useTournament();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'home' }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 3-Step Wizard state: 1 = Team Info, 2 = Members, 3 = Payment & Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [activeMemberTab, setActiveMemberTab] = useState<number>(0); // 0, 1, 2 for member focus

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedMfsNumber, setCopiedMfsNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Step 1: Team Information
  const [teamName, setTeamName] = useState('');
  const [batch, setBatch] = useState('');
  const [department] = useState('Computer Science & Engineering (CSE)');
  const [teamLeaderName, setTeamLeaderName] = useState('');

  // Step 2: 3 Team Members (No pre-selected batch/semester; user selects upon clicking)
  const [members, setMembers] = useState([
    {
      fullName: '',
      studentId: '',
      batch: '',
      semester: '',
      phone: '',
      email: '',
      speakerRole: 1 as const,
      roleName: 'Speaker 1 (Prime Minister / Leader)',
      isLeader: true
    },
    {
      fullName: '',
      studentId: '',
      batch: '',
      semester: '',
      phone: '',
      email: '',
      speakerRole: 2 as const,
      roleName: 'Speaker 2 (Deputy Prime Minister)',
      isLeader: false
    },
    {
      fullName: '',
      studentId: '',
      batch: '',
      semester: '',
      phone: '',
      email: '',
      speakerRole: 3 as const,
      roleName: 'Speaker 3 (Government Whip / Member)',
      isLeader: false
    }
  ]);

  // Step 3: Payment Information
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount] = useState(350);

  // Official MFS recipient numbers (bKash / Nagad: 01718169072)
  const MFS_ACCOUNTS: Record<'bKash' | 'Nagad', { number: string; recipientName: string; type: string; logo: string }> = {
    bKash: {
      number: '01718169072',
      recipientName: 'Organizing Committee (Tech Debate 4.0)',
      type: 'Personal (Send Money)',
      logo: '/images/bikash.png'
    },
    Nagad: {
      number: '01718169072',
      recipientName: 'Organizing Committee (Tech Debate 4.0)',
      type: 'Personal (Send Money)',
      logo: '/images/nagad.png'
    }
  };

  // Auto-scroll and focus on the first field with a validation error
  const scrollToFirstError = (errs: Record<string, string>) => {
    const firstKey = Object.keys(errs)[0];
    if (!firstKey) return;

    // If error belongs to a specific member card in Step 2, highlight that member tab
    const memberMatch = firstKey.match(/^member_(\d+)_/);
    if (memberMatch) {
      const memberIdx = parseInt(memberMatch[1], 10) - 1;
      if (memberIdx >= 0 && memberIdx <= 2) {
        setActiveMemberTab(memberIdx);
      }
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        const errorContainer = document.querySelector<HTMLElement>(
          `[data-error-field="${firstKey}"]`
        );
        if (errorContainer) {
          errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const focusableInput = errorContainer.querySelector<HTMLElement>(
            'input, select, textarea, button'
          );
          if (focusableInput) {
            focusableInput.focus({ preventScroll: true });
          }
        }
      }, 40);
    });
  };

  const handleCopyMfs = (num: string, method: string) => {
    navigator.clipboard.writeText(num);
    setCopiedMfsNumber(method);
    setTimeout(() => setCopiedMfsNumber(null), 2000);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (index === 0 && field === 'fullName') {
      setTeamLeaderName(value);
    }

    // Clear field-specific error
    const errKey = `member_${index + 1}_${field}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };

  // Validation for Step 1: Team Info
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!teamName.trim()) {
      errs.teamName = 'Team name is required.';
    } else if (teamName.trim().length < 3) {
      errs.teamName = 'Team name must be at least 3 characters.';
    } else {
      const isDuplicate = teams.some(
        t => t.name.trim().toLowerCase() === teamName.trim().toLowerCase()
      );
      if (isDuplicate) {
        errs.teamName = 'A squad with this name is already registered.';
      }
    }

    if (!teamLeaderName.trim()) {
      errs.teamLeaderName = 'Team leader name is required.';
    }

    if (!batch || !batch.trim()) {
      errs.batch = 'Academic Batch selection is required.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
  };

  // Validation for Step 2: 3 Members (Student ID, Batch, Semester, Mobile Phone)
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    const seenIds = new Set<string>();

    members.forEach((m, idx) => {
      const p = `member_${idx + 1}`;
      
      if (!m.fullName.trim()) {
        errs[`${p}_fullName`] = `Speaker ${idx + 1} name is required.`;
      }

      if (!m.studentId.trim()) {
        errs[`${p}_studentId`] = `Student ID is required.`;
      } else if (!Validator.isValidStudentId(m.studentId)) {
        errs[`${p}_studentId`] = `Please enter a valid Student ID.`;
      } else {
        const id = m.studentId.trim();
        if (seenIds.has(id.toLowerCase())) {
          errs[`${p}_studentId`] = `Duplicate Student ID in the same squad.`;
        } else {
          const isRegisteredInOtherTeam = teams.some(t =>
            t.members.some(tm => tm.studentId.trim().toLowerCase() === id.toLowerCase())
          );
          if (isRegisteredInOtherTeam) {
            errs[`${p}_studentId`] = `Student ID ${id} is already registered in another squad.`;
          }
        }
        seenIds.add(id.toLowerCase());
      }

      if (!m.batch || !m.batch.trim()) {
        errs[`${p}_batch`] = `Please select Academic Batch for Speaker ${idx + 1}.`;
      }

      if (!m.phone.trim()) {
        errs[`${p}_phone`] = `Mobile number is required.`;
      } else if (!Validator.isValidPhone(m.phone)) {
        errs[`${p}_phone`] = `Please enter a valid 11-digit mobile number.`;
      }

      if (!m.semester || !m.semester.trim()) {
        errs[`${p}_semester`] = `Please select Semester for Speaker ${idx + 1}.`;
      }
    });

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
  };

  // Validation for Step 3: Payment & Agreement
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!senderNumber.trim()) {
      errs.senderNumber = 'Sender phone number is required.';
    } else if (!Validator.isValidPhone(senderNumber)) {
      errs.senderNumber = 'Please enter a valid 11-digit mobile number.';
    }

    if (!transactionId.trim()) {
      errs.transactionId = 'Transaction ID (TrxID) is required.';
    } else if (transactionId.trim().length < 6) {
      errs.transactionId = 'Transaction ID must be at least 6 characters.';
    } else {
      const cleanTrx = transactionId.trim().toUpperCase();
      const isDuplicateTrx = teams.some(
        t => t.payment?.transactionId?.trim().toUpperCase() === cleanTrx
      );
      if (isDuplicateTrx) {
        errs.transactionId = 'This Transaction ID has already been submitted by another squad.';
      }
    }

    if (!agreedToRules) {
      errs.agreement = 'You must agree to the tournament rules and code of conduct.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      handleMemberChange(0, 'fullName', teamLeaderName.trim());
      setCurrentStep(2);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerTeam({
        name: teamName.trim(),
        batch: batch,
        department: department,
        members: members.map((m, idx) => ({
          fullName: m.fullName.trim(),
          studentId: m.studentId.trim(),
          batch: (m.batch || batch).trim(),
          semester: m.semester.trim(),
          email: '',
          phone: m.phone.trim(),
          speakerRole: m.speakerRole,
          isLeader: idx === 0
        })),
        payment: {
          method: paymentMethod,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          amount: amount
        }
      });

      if (res) {
        setRegisteredTeam(res);
        setShowSuccessModal(true);
        try {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#00e5ff', '#3b82f6', '#10b981', '#fbbf24', '#f43f5e']
          });
        } catch {
          // ignore confetti if blocked
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const rawMsg = err?.message || '';
      const cleanMsg =
        rawMsg.includes('Unexpected token') || rawMsg.includes('is not valid JSON')
          ? 'Unable to reach the cloud registration database. Your registration was NOT saved. Please check your internet connection and try again.'
          : rawMsg || 'Registration submission failed. Your data was not saved to the database. Please try again.';
      const formErr = { form: cleanMsg };
      setErrors(formErr);
      scrollToFirstError(formErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTeamId = () => {
    if (registeredTeam) {
      navigator.clipboard.writeText(registeredTeam.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // If already registered and showing voucher
  if (registeredTeam) {
    const selectedMfsLogo = paymentMethod === 'Nagad' ? '/images/nagad.png' : '/images/bikash.png';
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-12 relative">
        
        {/* REGISTRATION & PAYMENT PENDING POPUP MODAL (Phone & Web Responsive) */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-[#091738] p-5 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center space-y-4 sm:space-y-5">
              
              {/* Background Glows */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated Pending Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase mb-2">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  REGISTRATION & PAYMENT PENDING
                </span>
                <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white leading-tight">
                  Registration & Payment Status Pending
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
                  Team <strong className="text-cyan-300">{registeredTeam.name}</strong> has been submitted for verification.
                </p>
              </div>

              {/* SMS Notification Banner (Phone & Web) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-left flex items-start gap-3 shadow-inner">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 block">
                    SMS Confirmation Notice
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-white leading-relaxed break-words">
                    Registration and payment status pending. You will get a SMS from <strong className="font-mono text-amber-300 underline decoration-amber-400/60">01718169072</strong> when your registration is complete.
                  </p>
                </div>
              </div>

              {/* Official Squad ID Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#061128] border border-cyan-500/30 flex items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Official Squad ID
                  </span>
                  <span className="font-mono text-lg sm:text-2xl font-extrabold text-cyan-300 truncate block">
                    {registeredTeam.id}
                  </span>
                </div>
                <button
                  onClick={copyTeamId}
                  className="px-3 sm:px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              {/* Details Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                <div className="p-3 rounded-xl bg-[#061128]/70 border border-cyan-500/20">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Registration & Payment Status</span>
                  <span className="font-bold text-amber-300 block mt-0.5">PENDING VERIFICATION</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061128]/70 border border-cyan-500/20">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Payment (MFS)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={selectedMfsLogo} alt={paymentMethod} className="h-5 w-auto object-contain rounded" />
                    <span className="font-mono font-bold text-cyan-300">BDT 350</span>
                  </div>
                </div>
              </div>

              {/* 3 Debaters Overview */}
              <div className="p-3.5 rounded-2xl bg-[#061128]/80 border border-cyan-500/20 text-left space-y-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                  Squad Debaters (3 Members):
                </span>
                {members.map((m, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2 text-xs py-1.5 border-b border-cyan-500/10 last:border-0">
                    <span className="font-semibold text-white truncate max-w-full sm:max-w-[170px]">{m.fullName || `Speaker ${idx + 1}`}</span>
                    <span className="font-mono text-[11px] text-cyan-300 shrink-0">ID: {m.studentId} • {m.batch || registeredTeam.batch}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-cyan-500/25 cursor-pointer hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Home</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Full Page Voucher (Phone & Web Responsive) */}
        <div className="printable-voucher rounded-2xl sm:rounded-3xl border border-amber-500/35 bg-[#091738]/95 p-5 sm:p-10 backdrop-blur-2xl shadow-2xl text-center space-y-5 sm:space-y-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 uppercase mb-2">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              REGISTRATION & PAYMENT STATUS: PENDING
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white">
              Welcome, {registeredTeam.name}!
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-amber-200/90 font-medium max-w-lg mx-auto">
              Registration and payment status pending. You will get a SMS from <strong className="font-mono text-amber-300">01718169072</strong> when your registration is complete.
            </p>
          </div>

          {/* Pending Status & SMS Confirmation Notice Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-400/50 max-w-lg mx-auto text-left flex items-start gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-300 block">
                Registration & Payment Status Pending
              </span>
              <p className="text-xs sm:text-sm text-white leading-relaxed font-medium break-words">
                Registration and payment status pending. You will get a SMS from <strong className="font-mono text-amber-300 underline decoration-amber-400/60">01718169072</strong> when your registration is complete.
              </p>
            </div>
          </div>

          {/* Registration ID Voucher Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#061128] border border-cyan-500/25 max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="text-left min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Official Squad ID
              </span>
              <span className="font-mono text-lg sm:text-2xl font-extrabold text-cyan-300 truncate block">
                {registeredTeam.id}
              </span>
            </div>
            <button
              onClick={copyTeamId}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Squad Roster Overview */}
          <div className="p-4 rounded-2xl bg-[#061128]/80 border border-cyan-500/20 max-w-lg mx-auto text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                Squad Debaters (3 Members):
              </span>
              <span className="text-[10px] font-mono text-slate-400">{registeredTeam.batch}</span>
            </div>
            {members.map((m, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs py-1.5 border-b border-cyan-500/15 last:border-0 min-w-0">
                <span className="font-semibold text-white truncate max-w-full sm:max-w-[160px]">{m.fullName || `Speaker ${idx + 1}`}</span>
                <span className="font-mono text-cyan-300 text-[11px] shrink-0">ID: {m.studentId} • Batch: {m.batch || registeredTeam.batch} • {m.phone}</span>
              </div>
            ))}
          </div>

          <div className="no-print pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setShowSuccessModal(true)}
              className="px-5 py-3 rounded-xl bg-amber-500/15 border border-amber-400/60 text-amber-300 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:bg-amber-500/25 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Show Status Popup</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={handleGoHome}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-cyan-500/25 cursor-pointer hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      
      {/* 1. Hero Header Banner */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-cyan-500/20">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block mb-1">
            INTRA-CSE PARLIAMENTARY DEBATE CHAMPIONSHIP 2026
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Squad <span className="text-cyan-400">Registration</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl font-sans">
            Register your team for Tech Debate 4.0 in 3 simple steps by providing individual details for all 3 squad debaters.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0a1a3a] border border-cyan-500/25 text-xs text-slate-200">
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>3 Debaters (Individual Student ID)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0a1a3a] border border-cyan-500/25 text-xs text-slate-200">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Mobile Number Verification</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0a1a3a] border border-cyan-500/25 text-xs text-slate-200">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Registration Fee: BDT 350</span>
            </div>
          </div>
        </div>

        {/* Right Deadline Badge Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-[#0a193d]/90 backdrop-blur-xl text-left shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REGISTRATION OPEN</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#07132e] border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Deadline</span>
              <span className="font-display text-sm font-bold text-white block">Oct 22</span>
              <span className="text-[10px] font-mono text-cyan-400">11:59 PM BST</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 3-Step Progress Indicator (Wizard Stepper) */}
      <div className="rounded-3xl clay-panel p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-6 relative">
          
          {/* Progress Bar line background */}
          <div className="hidden sm:block absolute top-1/2 left-[16%] right-[16%] -translate-y-1/2 h-1 bg-[#061126] rounded-full z-0 pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            />
          </div>

          {[
            { 
              step: 1, 
              title: 'Team Info', 
              sub: 'Step 1', 
              icon: FileText 
            },
            { 
              step: 2, 
              title: 'Debater Details', 
              sub: 'Step 2', 
              icon: Users 
            },
            { 
              step: 3, 
              title: 'Payment & Confirm', 
              sub: 'Step 3', 
              icon: CreditCard 
            },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step as 1 | 2 | 3);
                }}
                disabled={s.step > currentStep}
                className={`relative z-10 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                  s.step > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 !p-0 rounded-2xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400'
                      : isCurrent
                      ? 'clay-btn-primary !p-0 text-white font-extrabold scale-105'
                      : 'clay-tab !p-0 text-cyan-300 border border-cyan-400/40'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white shrink-0 stroke-[2.75]" />
                  ) : (
                    <Icon className="w-5 h-5 text-current shrink-0 stroke-[2.25]" />
                  )}
                </div>

                <div className="text-center">
                  <span className={`block font-display text-[11px] sm:text-sm font-bold ${
                    isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    {s.title}
                  </span>
                  <span className="hidden sm:block text-[11px] font-mono text-slate-400">
                    {s.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Form Error Banner */}
      {errors.form && (
        <div
          data-error-field="form"
          className="p-4 rounded-xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* 3. Main Form Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Wizard Column (8 Cols) */}
        <div className="lg:col-span-8">
          
          {/* STEP 1: Team Information */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep1} autoComplete="off" className="rounded-3xl clay-panel p-5 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/20">
                <div className="w-9 h-9 rounded-xl clay-badge text-cyan-300 font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                  01
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                    Team Information
                  </h3>
                  <p className="text-xs text-slate-300">
                    Set your debate squad name, batch representation, and team leader name.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  data-error-field="teamName"
                  className={`rounded-2xl transition-all ${
                    errors.teamName ? 'p-3 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                  }`}
                >
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Team / Squad Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter squad name"
                    value={teamName}
                    onChange={e => {
                      setTeamName(e.target.value);
                      if (errors.teamName) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.teamName;
                          return next;
                        });
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    className={`w-full px-4 py-3 rounded-xl bg-[#071630]/90 border text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 transition-colors ${
                      errors.teamName ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                    }`}
                  />
                  {errors.teamName && (
                    <p className="text-[11px] font-semibold text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.teamName}</span>
                    </p>
                  )}
                </div>

                <div
                  data-error-field="teamLeaderName"
                  className={`rounded-2xl transition-all ${
                    errors.teamLeaderName ? 'p-3 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                  }`}
                >
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Team Leader Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter team leader full name"
                    value={teamLeaderName}
                    onChange={e => {
                      setTeamLeaderName(e.target.value);
                      handleMemberChange(0, 'fullName', e.target.value);
                      if (errors.teamLeaderName) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.teamLeaderName;
                          return next;
                        });
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    className={`w-full px-4 py-3 rounded-xl bg-[#071630]/90 border text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 ${
                      errors.teamLeaderName ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                    }`}
                  />
                  {errors.teamLeaderName && (
                    <p className="text-[11px] font-semibold text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.teamLeaderName}</span>
                    </p>
                  )}
                </div>

                <div
                  data-error-field="batch"
                  className={`rounded-2xl transition-all ${
                    errors.batch ? 'p-3 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                  }`}
                >
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Academic Batch <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={batch}
                    onChange={e => {
                      setBatch(e.target.value);
                      if (errors.batch) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.batch;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#071630]/90 border text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 ${
                      errors.batch ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                    }`}
                  >
                    <option value="" disabled className="text-slate-400 bg-[#06122b]">
                      -- Select Academic Batch --
                    </option>
                    {BATCH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#06122b] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.batch && (
                    <p className="text-[11px] font-semibold text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.batch}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={department}
                    className="w-full px-4 py-3 rounded-xl bg-[#051126]/60 border border-sky-500/20 text-sm text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Informational callout */}
              <div className="p-4 rounded-2xl bg-[#081836]/70 border border-sky-400/25 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  In the next step, you will enter individual Student IDs, semesters, and mobile numbers for all 3 squad members. Team members can be from any semester in CSE.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto clay-btn-primary px-8 py-3.5 rounded-2xl font-display text-sm font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Next: Debaters' Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 3 Members (Individual Student ID, Batch, Semester, Mobile Phone) */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} autoComplete="off" className="rounded-3xl clay-panel p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl clay-badge text-cyan-300 font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                    02
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      3 Debaters' Details (ID & Batch Required)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Leader and both other 2 members must fill up both their Student ID and Academic Batch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                  {members.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveMemberTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeMemberTab === idx
                          ? 'clay-tab-active text-cyan-200'
                          : 'clay-tab text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx === 0 ? '👑 Leader' : `Member ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informational banner highlighting ID & Batch requirement */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-start gap-2.5 text-xs text-cyan-200">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> Each member (Team Leader and both members) must select their <strong>Student ID</strong>, <strong>Academic Batch</strong>, and <strong>Semester</strong> from the dropdowns.
                </span>
              </div>

              {/* 3 Members Stacks */}
              <div className="space-y-6">
                {members.map((m, idx) => {
                  const p = `member_${idx + 1}`;
                  const isTabSelected = activeMemberTab === idx;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isTabSelected 
                          ? 'bg-[#0f2a58]/85 border-sky-400/50 shadow-[0_8px_30px_rgba(3,14,38,0.4)]' 
                          : 'bg-[#081834]/70 border-sky-500/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-sky-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 text-xs font-mono font-bold shrink-0">
                            #{idx + 1}
                          </div>
                          <span className="font-display text-sm font-bold text-white">
                            {m.roleName}
                          </span>
                          {idx === 0 ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-bold">
                              👑 LEADER (ID & BATCH REQUIRED)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400 text-sky-300 font-bold">
                              MEMBER (ID & BATCH REQUIRED)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveMemberTab(idx)}
                          className="text-[11px] font-mono text-sky-400 hover:text-sky-300 cursor-pointer self-start sm:self-auto"
                        >
                          {isTabSelected ? 'Active Editor' : 'Focus Member'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Member Full Name */}
                        <div
                          data-error-field={`${p}_fullName`}
                          className={`rounded-xl transition-all ${
                            errors[`${p}_fullName`] ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                          }`}
                        >
                          <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                            Full Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            value={m.fullName}
                            onChange={e => handleMemberChange(idx, 'fullName', e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            data-lpignore="true"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#071630]/90 border text-xs text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 ${
                              errors[`${p}_fullName`] ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                            }`}
                          />
                          {errors[`${p}_fullName`] && (
                            <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{errors[`${p}_fullName`]}</span>
                            </p>
                          )}
                        </div>

                        {/* Member Student ID - REQUIRED */}
                        <div
                          data-error-field={`${p}_studentId`}
                          className={`rounded-xl transition-all ${
                            errors[`${p}_studentId`] ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                          }`}
                        >
                          <label className="block text-[11px] font-mono text-cyan-300 mb-1 font-bold">
                            Student ID <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            name={`student_id_no_suggest_${idx}`}
                            placeholder="e.g. 211311001"
                            value={m.studentId}
                            onChange={e => handleMemberChange(idx, 'studentId', e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#071630]/90 border text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40 font-mono font-semibold ${
                              errors[`${p}_studentId`] ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                            }`}
                          />
                          {errors[`${p}_studentId`] && (
                            <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{errors[`${p}_studentId`]}</span>
                            </p>
                          )}
                        </div>

                        {/* Member Academic Batch - REQUIRED */}
                        <div
                          data-error-field={`${p}_batch`}
                          className={`rounded-xl transition-all ${
                            errors[`${p}_batch`] ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                          }`}
                        >
                          <label className="block text-[11px] font-mono text-cyan-300 mb-1 font-bold">
                            Academic Batch <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={m.batch}
                            onChange={e => handleMemberChange(idx, 'batch', e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#071630]/90 border text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40 font-semibold ${
                              errors[`${p}_batch`] ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                            }`}
                          >
                            <option value="" disabled className="text-slate-400 bg-[#06122b]">
                              -- Select Academic Batch --
                            </option>
                            {BATCH_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#06122b] text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                          {errors[`${p}_batch`] && (
                            <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{errors[`${p}_batch`]}</span>
                            </p>
                          )}
                        </div>

                        {/* Member Phone Number */}
                        <div
                          data-error-field={`${p}_phone`}
                          className={`rounded-xl transition-all ${
                            errors[`${p}_phone`] ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                          }`}
                        >
                          <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                            Mobile Number (WhatsApp-linked) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            name={`mobile_phone_no_suggest_${idx}`}
                            placeholder="01XXXXXXXXX"
                            value={m.phone}
                            onChange={e => handleMemberChange(idx, 'phone', e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#071630]/90 border text-xs text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 ${
                              errors[`${p}_phone`] ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                            }`}
                          />
                          {errors[`${p}_phone`] && (
                            <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{errors[`${p}_phone`]}</span>
                            </p>
                          )}
                        </div>

                        {/* Member Individual Semester Dropdown */}
                        <div
                          data-error-field={`${p}_semester`}
                          className={`sm:col-span-2 rounded-xl transition-all ${
                            errors[`${p}_semester`] ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                          }`}
                        >
                          <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                            Semester <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={m.semester}
                            onChange={e => handleMemberChange(idx, 'semester', e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#071630]/90 border text-xs text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 ${
                              errors[`${p}_semester`] ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                            }`}
                          >
                            <option value="" disabled className="text-slate-400 bg-[#06122b]">
                              -- Select Semester --
                            </option>
                            {SEMESTER_OPTIONS.map((sem) => (
                              <option key={sem} value={sem} className="bg-[#06122b] text-white">
                                {sem}
                              </option>
                            ))}
                          </select>
                          {errors[`${p}_semester`] && (
                            <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{errors[`${p}_semester`]}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 2 Navigation Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="clay-btn-secondary px-6 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Team Info</span>
                </button>

                <button
                  type="submit"
                  className="clay-btn-primary px-8 py-3.5 rounded-2xl font-display text-sm font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Next: Payment & Review (350tk)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Payment Verification & Final Confirmation */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitFinal} className="rounded-3xl clay-panel p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl clay-badge text-cyan-300 font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                    03
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      Payment Verification & Confirm
                    </h3>
                    <p className="text-xs text-slate-300">
                      Complete registration fee payment and enter TrxID.
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl clay-badge text-cyan-300 font-mono text-xs font-bold self-start sm:self-auto">
                  Fee: BDT 350 / Squad
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 sm:p-5 rounded-2xl clay-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/20 pb-2 gap-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Squad Roster Summary (ID & Batch Verified)
                  </span>
                  <span className="text-xs font-bold text-white">
                    Team: {teamName || 'Your Team'} ({batch})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {members.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0a1e42]/80 border border-sky-500/20 text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                        {idx === 0 ? '👑 Leader' : `Speaker ${idx + 1}`}
                      </span>
                      <strong className="text-white block mt-0.5 truncate">{m.fullName || '—'}</strong>
                      <span className="text-[11px] font-mono text-cyan-300 block font-semibold">ID: {m.studentId || '—'}</span>
                      <span className="text-[11px] font-mono text-slate-300 block">Batch: {m.batch || batch}</span>
                      <span className="text-[11px] font-mono text-slate-300 block">Ph: {m.phone || '—'}</span>
                      <span className="text-[11px] font-mono text-slate-400 block">{m.semester}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Select MFS Method <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  {(['bKash', 'Nagad'] as const).map(pm => {
                    const imgSrc = pm === 'bKash' ? '/images/bikash.png' : '/images/nagad.png';
                    const isSelected = paymentMethod === pm;
                    return (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => setPaymentMethod(pm)}
                        aria-label={pm}
                        className={`py-3 px-4 sm:px-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-center min-h-[64px] ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/25 text-white shadow-[0_0_20px_rgba(0,229,255,0.35)] scale-[1.02]'
                            : 'border-sky-500/25 bg-[#071630]/90 text-slate-300 hover:border-sky-400/50'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={pm}
                          className="h-10 sm:h-12 w-auto max-w-[150px] object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MFS Send Money Instruction Card */}
              {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && MFS_ACCOUNTS[paymentMethod] && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d2752]/90 via-[#0a1e42]/95 to-[#071630]/95 border border-sky-400/35 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={MFS_ACCOUNTS[paymentMethod].logo}
                          alt={paymentMethod}
                          className="h-7 w-auto object-contain rounded"
                        />
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400 text-slate-950 uppercase">
                          {paymentMethod} Send Money
                        </span>
                        <span className="text-xs text-slate-300 font-sans">
                          {MFS_ACCOUNTS[paymentMethod].type}
                        </span>
                      </div>
                      <div className="font-mono text-xl sm:text-2xl font-extrabold text-cyan-300 mt-1">
                        {MFS_ACCOUNTS[paymentMethod].number}
                      </div>
                      <span className="text-xs text-slate-300">
                        Recipient: {MFS_ACCOUNTS[paymentMethod].recipientName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyMfs(MFS_ACCOUNTS[paymentMethod].number, paymentMethod)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-sm"
                    >
                      {copiedMfsNumber === paymentMethod ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans pt-1">
                    * Send BDT 350 via 'Send Money' in your {paymentMethod} app to <strong className="text-cyan-300">01718169072</strong>, then enter the Transaction ID (TrxID) below.
                  </p>
                </div>
              )}

              {/* Transaction Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  data-error-field="senderNumber"
                  className={`rounded-xl transition-all ${
                    errors.senderNumber ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                  }`}
                >
                  <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">
                    Sender Mobile Number *
                  </label>
                  <input
                    type="text"
                    name="sender_phone_no_suggest"
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={e => {
                      setSenderNumber(e.target.value);
                      if (errors.senderNumber) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.senderNumber;
                          return next;
                        });
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    className={`w-full px-4 py-3 rounded-xl bg-[#071630]/90 border text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 ${
                      errors.senderNumber ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                    }`}
                  />
                  {errors.senderNumber && (
                    <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.senderNumber}</span>
                    </p>
                  )}
                </div>

                <div
                  data-error-field="transactionId"
                  className={`rounded-xl transition-all ${
                    errors.transactionId ? 'p-2.5 bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : ''
                  }`}
                >
                  <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter TrxID"
                    value={transactionId}
                    onChange={e => {
                      setTransactionId(e.target.value);
                      if (errors.transactionId) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.transactionId;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#071630]/90 border text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 font-mono uppercase ${
                      errors.transactionId ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-sky-500/25'
                    }`}
                  />
                  {errors.transactionId && (
                    <p className="text-[10px] font-semibold text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.transactionId}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">
                    Payment Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="BDT 350"
                    className="w-full px-4 py-3 rounded-xl bg-[#071630]/50 border border-sky-500/25 text-sm text-cyan-300 font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Tournament Rules Agreement Checkbox */}
              <div
                data-error-field="agreement"
                className={`p-4 rounded-2xl bg-[#071630]/70 border transition-all space-y-2 ${
                  errors.agreement
                    ? 'border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    : 'border-sky-500/25'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !agreedToRules;
                      setAgreedToRules(nextVal);
                      if (nextVal && errors.agreement) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.agreement;
                          return next;
                        });
                      }
                    }}
                    className="mt-0.5 text-cyan-400 focus:outline-none cursor-pointer shrink-0"
                  >
                    {agreedToRules ? <CheckSquare className="w-5 h-5 text-cyan-400" /> : <Square className="w-5 h-5 text-slate-500" />}
                  </button>
                  <label 
                    onClick={() => {
                      const nextVal = !agreedToRules;
                      setAgreedToRules(nextVal);
                      if (nextVal && errors.agreement) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.agreement;
                          return next;
                        });
                      }
                    }}
                    className="text-xs text-slate-300 leading-relaxed cursor-pointer font-sans"
                  >
                    I agree to abide by all rules and code of conduct of Tech Debate 4.0. I confirm that all provided student details and payment TrxID are accurate.
                  </label>
                </div>
                {errors.agreement && (
                  <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.agreement}</span>
                  </p>
                )}
              </div>

              {errors.form && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-mono font-bold uppercase tracking-wider text-rose-300 block">
                      Database Submission Blocked
                    </span>
                    <p className="leading-relaxed">{errors.form}</p>
                  </div>
                </div>
              )}

              {/* Navigation and Final Submit */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="clay-btn-secondary px-6 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Members</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="clay-btn-primary px-8 py-4 rounded-2xl font-display text-base font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Saving to Cloud Database...' : 'Submit Registration'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Information Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Registration Guidelines */}
          <div className="rounded-3xl clay-panel p-5 sm:p-6 space-y-4">
            <h4 className="font-display text-base font-bold text-white pb-3 border-b border-cyan-500/20">
              Registration Guidelines
            </h4>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <span className="font-mono text-cyan-400 font-bold block">Eligibility</span>
                <span className="text-slate-300">Undergraduate students of CSE Dept (32nd to 39th Batch), Varendra University.</span>
              </div>
              <div>
                <span className="font-mono text-cyan-400 font-bold block">Squad Composition</span>
                <span className="text-slate-300">Exactly 3 debaters. Members can be from different semesters.</span>
              </div>
              <div>
                <span className="font-mono text-cyan-400 font-bold block">Registration Fee</span>
                <span className="text-slate-300">BDT 350 per squad via bKash / Nagad Send Money to <strong>01718169072</strong>.</span>
              </div>
              <div>
                <span className="font-mono text-cyan-400 font-bold block">Unique Squad ID</span>
                <span className="text-slate-300">An official Squad ID will be generated automatically upon submission.</span>
              </div>
              <div>
                <span className="font-mono text-cyan-400 font-bold block">Helpline & Support</span>
                <span className="text-slate-300 font-mono">01718169072, +880 1849-315117</span>
              </div>
            </div>
          </div>

          {/* Card 2: Status Lifecycle */}
          <div className="rounded-3xl clay-panel p-5 sm:p-6 space-y-4">
            <h4 className="font-display text-base font-bold text-white pb-3 border-b border-cyan-500/20">
              Verification Review Flow
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-amber-300 block">Registration & Payment Pending</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed block mt-0.5">
                    Registration and payment status pending. You will get a SMS from <strong className="font-mono text-amber-300">01718169072</strong> when your registration is complete.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-300 block">Verified Squad</span>
                  <span className="text-slate-400 text-[11px]">Official fixture inclusion confirmed via SMS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Tournament Motto */}
          <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#0c2248] to-[#081836] p-6 text-center space-y-3 shadow-lg">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto drop-shadow-[0_0_12px_#fbbf24]" />
            <h4 className="font-display text-base font-extrabold text-white">
              Defend Your Stance<br />With Logic
            </h4>
            <p className="text-xs font-serif italic text-cyan-300">
              "Different perspectives.<br />A brighter tomorrow."
            </p>
          </div>

        </div>

      </div>

      {/* Global Full-Screen Submission Loading Screen Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020b1c]/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/50 bg-[#071638] p-8 shadow-[0_0_90px_rgba(0,229,255,0.45)] text-center space-y-6 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

            {/* Cyber Spinner / Animated Loader Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 border-r-sky-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-cyan-300 animate-spin [animation-duration:1.5s]" />
              <Loader2 className="w-8 h-8 text-cyan-300 animate-spin" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                PROCESSING REGISTRATION
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                Submitting Registration...
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Verifying squad members, student IDs, MFS transaction details, and generating official squad ID. Please wait a moment...
              </p>
            </div>

            {/* Progress Bar Indicator */}
            <div className="w-full bg-[#040e24] h-2.5 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
              <div className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 h-full rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
