'use client';
import { X, CheckCircle, XCircle, Info, AlertTriangle, Zap, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'points' | 'credits';
  title: string;
  message?: string;
  amount?: number;
  onDismiss: (id: string) => void;
}

const ICON = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
  points: Zap,
  credits: Coins,
};

const BG = {
  success: 'border-emerald-500/40 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
  error: 'border-red-500/40 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
  info: 'border-blue-500/40 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.25)]',
  warning: 'border-amber-500/40 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
  points: 'border-green-500/40 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.25)]',
  credits: 'border-amber-500/40 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
};

const ICON_COLOR = {
  success: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  error: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  info: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  warning: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  points: 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  credits: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
};

export function Toast({ id, type, title, message, amount, onDismiss }: ToastProps) {
  const Icon = ICON[type];

  const handleDismiss = () => {
    onDismiss(id);
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border min-w-[300px] max-w-[400px] backdrop-blur-md',
        BG[type]
      )}
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', ICON_COLOR[type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        {message && <p className="text-xs text-gray-400 mt-0.5">{message}</p>}
        {amount !== undefined && (
          <p className={cn('text-xs font-bold mt-0.5 font-mono', ICON_COLOR[type])}>
            +{amount.toLocaleString()} {type === 'credits' ? 'credits' : 'pts'}
          </p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-gray-500 hover:text-white transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
