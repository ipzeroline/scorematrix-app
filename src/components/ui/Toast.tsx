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
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  points: 'border-green-500/30 bg-green-500/10',
  credits: 'border-amber-500/30 bg-amber-500/10',
};

const ICON_COLOR = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
  points: 'text-green-400',
  credits: 'text-amber-400',
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
        'flex items-start gap-3 p-3 rounded-xl border min-w-[300px] max-w-[400px]',
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
