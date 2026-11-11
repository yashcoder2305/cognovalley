'use client';

import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'D', action: 'Open Review Panel Demo modal' },
    { key: 'S', action: 'Simulate new waste spill incident' },
    { key: '1 - 5', action: 'Quick select zone 1 through 5' },
    { key: 'Esc', action: 'Close active modal or drawer' },
    { key: '?', action: 'Show this keyboard shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Command className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{sc.action}</span>
              <kbd className="font-mono text-[11px] bg-zinc-900 border border-zinc-700/80 px-2 py-0.5 rounded text-zinc-200 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

