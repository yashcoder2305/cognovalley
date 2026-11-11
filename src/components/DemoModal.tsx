'use client';

import React from 'react';
import { X, Play, CheckCircle2, Clock } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunFullDemoStory: () => void;
  demoStep: number;
  isDemoRunning: boolean;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onRunFullDemoStory,
  demoStep,
  isDemoRunning,
}) => {
  if (!isOpen) return null;

  const steps = [
    { title: 'Waste detection', desc: 'CV model detects overflowing bin and paper litter in selected zone.' },
    { title: 'Threshold evaluation', desc: 'Dwell time exceeds configured SLA limit (180s).' },
    { title: 'Ticket auto-creation', desc: 'Incident ticket auto-generated with captured frame and priority.' },
    { title: 'Staff dispatch', desc: 'Nearest housekeeping personnel assigned with zone coordinates.' },
    { title: 'Visual verification', desc: 'Post-cleanup image verified; zone cleanliness index recalculates.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Technical Review Panel Demo
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cogno Valley Labs • Track E (Facility Hygiene & Cleanliness)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core objective callout */}
        <div className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 mb-5">
          <span className="font-medium text-zinc-100">Evaluator scenario: </span>
          Litter persists beyond threshold $\rightarrow$ ticket opens $\rightarrow$ housekeeper dispatched $\rightarrow$ cleanup verified via before/after comparison.
        </div>

        {/* Steps progression */}
        <div className="space-y-2 mb-6">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = demoStep > stepNum;
            const isCurrent = demoStep === stepNum;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 p-3 rounded-md border text-xs transition-colors ${
                  isCurrent
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : isCompleted
                    ? 'bg-zinc-900/30 border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-zinc-800/60 text-zinc-500'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200">{st.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-zinc-400">Processing...</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={onRunFullDemoStory}
            disabled={isDemoRunning}
            className={`h-8 px-4 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              isDemoRunning
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isDemoRunning ? 'Running demonstration...' : 'Run automated demo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

