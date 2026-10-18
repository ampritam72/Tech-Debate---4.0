import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { PaymentStatus, MatchStatus, TeamStatus } from '../../types';

interface StatusBadgeProps {
  status: PaymentStatus | MatchStatus | TeamStatus;
  type?: 'payment' | 'match' | 'team';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'payment' }) => {
  if (status === 'VERIFIED' || status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{status === 'VERIFIED' ? 'Verified' : 'Completed'}</span>
      </span>
    );
  }

  if (status === 'PENDING' || status === 'Upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{status === 'PENDING' ? 'Pending Verification' : 'Upcoming'}</span>
      </span>
    );
  }

  if (status === 'Live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-pulse">
        <PlayCircle className="w-3.5 h-3.5" />
        <span>Live Round</span>
      </span>
    );
  }

  if (status === 'REJECTED' || status === 'DISQUALIFIED' || status === 'Cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        <XCircle className="w-3.5 h-3.5" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
};
