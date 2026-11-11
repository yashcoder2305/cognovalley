'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start space-x-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl max-w-sm text-xs transition-all"
        >
          {toast.type === 'warning' && (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-zinc-100">{toast.title}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{toast.description}</div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

