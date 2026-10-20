import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { PaymentStatus, MatchStatus, TeamStatus } from '../../types';

interface StatusBadgeProps {
  status: PaymentStatus | MatchStatus | TeamStatus;
  type?: 'payment' | 'match' | 'team';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'VERIFIED' || status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{status === 'VERIFIED' ? 'Verified' : 'Completed'}</span>
      </span>
    );
  }

  if (status === 'PENDING' || status === 'Upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{status === 'PENDING' ? 'Pending Verification' : 'Upcoming'}</span>
      </span>
    );
  }

  if (status === 'Live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-pulse whitespace-nowrap">
        <PlayCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Live Round</span>
      </span>
    );
  }

  if (status === 'REJECTED' || status === 'DISQUALIFIED' || status === 'Cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
};
