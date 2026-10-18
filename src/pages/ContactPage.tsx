import React, { useState } from 'react';
import { Phone, MapPin, Send, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { GlassCard } from '../components/common/GlassCard';
import { useTournament } from '../context/TournamentContext';

export const ContactPage: React.FC = () => {
  const { submitInquiry } = useTournament();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentId: '',
    subject: 'Registration & MFS Verification Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) return;
    setIsSubmitting(true);
    try {
      await submitInquiry({
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
        subject: formData.subject,
        message: formData.message,
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        badge="GET IN TOUCH"
        title="Contact & Helpdesk"
        subtitle="Have questions regarding team eligibility, bKash / Nagad / Rocket transaction verification, or match logistics? Connect directly with the Tech Debate 4.0 Helpdesk."
        centered
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
              Championship Venue
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Department of Computer Science & Engineering<br />
              Varendra University, Rajshahi<br />
              Rajshahi, Bangladesh
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              CSE Seminar Rooms, Galleries & Central Auditorium, Varendra University
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
              Hotline & Verification Desk
            </h4>
            <div className="space-y-2.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-mono">MFS Verification & Registration</span>
                  <a href="tel:01718169072" className="font-mono text-cyan-300 hover:text-cyan-200 font-bold text-xs break-all">
                    01718169072
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('01718169072', 'phone1')}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer transition-all self-start sm:self-auto shrink-0"
                  title="Copy number"
                >
                  {copiedKey === 'phone1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'phone1' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-mono">Tournament Secretariat & Support</span>
                  <a href="tel:+8801849315117" className="font-mono text-cyan-300 hover:text-cyan-200 font-bold text-xs break-all">
                    +880 1849-315117
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('+880 1849-315117', 'phone2')}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer transition-all self-start sm:self-auto shrink-0"
                  title="Copy number"
                >
                  {copiedKey === 'phone2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'phone2' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Available 10:00 AM – 08:00 PM BST</span>
            </div>
          </GlassCard>
        </div>

        {/* Contact / Inquiry Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8" glow>
            <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Submit an Inquiry or Verification Ticket
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your inquiry is synced directly to the Admin Helpdesk Console in real time.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Inquiry Dispatched to Admin Helpdesk
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your ticket has been logged in real time with the Tech Debate 4.0 Secretariat. We will contact you at <strong>{formData.phone}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', studentId: '', subject: 'Registration & MFS Verification Inquiry', message: '' });
                  }}
                  className="px-5 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-mono"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shakib Ahmed"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-medium">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-medium">
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 231311070"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-medium">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="Registration & MFS Verification Inquiry">MFS Transaction Verification</option>
                      <option value="Team Roster Amendment">Team Roster Amendment</option>
                      <option value="Debate Rules & Adjudication Query">Debate Rules & Adjudication</option>
                      <option value="Venue & Schedule Assistance">Venue & Logistics</option>
                      <option value="General Sponsorship / Press">General Sponsorship / Press</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-medium">
                    Your Message / Transaction Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide your registered Team Name, bKash/Nagad TrxID, or question in detail..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#071630] border border-slate-300 dark:border-sky-500/25 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.35)] active:scale-95 uppercase tracking-wide"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}

          </GlassCard>
        </div>

      </div>
    </div>
  );
};
