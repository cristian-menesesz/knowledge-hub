import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import React from 'react';

import type { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = iconMap[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg ${colorMap[toast.type]}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded hover:opacity-70"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
