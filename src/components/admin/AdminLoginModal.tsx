import React, { useState } from 'react';
import { Shield, Lock, X, AlertCircle, Key, Mail } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithPassword } = useAdminAuth();
  const [email, setEmail] = useState('admin@techdebate4.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin authorization password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const success = await loginWithPassword(password, email);
      if (success) {
        setError('');
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setError('Invalid authorization credentials. Please verify your email and password.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#050f20]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-md w-full rounded-2xl bg-[#091b3e] border border-cyan-500/40 p-6 sm:p-8 shadow-[0_20px_60px_rgba(6,182,212,0.25)] space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-white tracking-tight">
            Admin Console Access
          </h3>
          <p className="text-xs text-slate-300">
            Enter your official administrative credentials to access the management suite.
          </p>
        </div>

        {/* Database-Backed Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@techdebate4.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040d21] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm focus:outline-none font-mono shadow-inner transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040d21] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm focus:outline-none font-mono shadow-inner transition-colors pr-10"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>

            {error && (
              <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </p>
            )}

            <p className="mt-2 text-[11px] font-mono text-slate-400">
              Authorized Account: <code className="text-cyan-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-500/30">admin@techdebate4.com</code>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 rounded-xl transition-all cursor-pointer font-mono uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Key className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying with Database...' : 'Verify & Open Console'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
