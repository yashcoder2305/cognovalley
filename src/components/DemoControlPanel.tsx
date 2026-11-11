'use client';

import React from 'react';
import { 
  X, 
  Play, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DemoControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRunFullDemoStory: () => void;
  demoStep: number; // 0 = idle, 1 = detecting, 2 = threshold breached, 3 = ticket opened, 4 = dispatched, 5 = cleaned & verified
  isDemoRunning: boolean;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  isOpen,
  onClose,
  onRunFullDemoStory,
  demoStep,
  isDemoRunning,
}) => {
  if (!isOpen) return null;

  const steps = [
    { title: 'Waste Detection', desc: 'Computer vision identifies overflowing bins & unattended cups.' },
    { title: 'Persistence Breach', desc: 'Dwell time exceeds configured threshold (trigger alert).' },
    { title: 'Ticket Auto-Creation', desc: 'Operator ticket generated with bounding box proof.' },
    { title: 'Housekeeper Dispatch', desc: 'Staff dispatched with ETA & location coordinates.' },
    { title: 'Visual Verification', desc: 'Before/after split diff verifies clean zone; index score recovers.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-tactical-700 bg-tactical-950 p-6 shadow-2xl overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-buzz-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-tactical-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-buzz-cyan/10 border border-buzz-cyan/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-buzz-cyan" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cogno Valley Technical Review Demo Story
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                TRACK E // FACILITY HYGIENE & CLEANLINESS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-tactical-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Problem statement reminder */}
        <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-800 text-xs text-slate-300 leading-relaxed mb-5">
          <span className="font-semibold text-buzz-cyan">Demo Objective: </span>
          &ldquo;Litter persists beyond the configured threshold. A ticket opens, and the cleanup appears in a before/after comparison.&rdquo;
        </div>

        {/* Step Progression Visualizer */}
        <div className="space-y-3 mb-6">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = demoStep > stepNum;
            const isCurrent = demoStep === stepNum;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-tactical-900 border-buzz-cyan shadow-sm shadow-cyan-950/40 text-white'
                    : isCompleted
                    ? 'bg-tactical-950 border-emerald-500/30 text-emerald-300'
                    : 'bg-tactical-950/50 border-tactical-800/80 text-slate-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-buzz-cyan text-slate-950 animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-tactical-800 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </div>

                <div className="flex-1">
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{st.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-buzz-cyan animate-pulse">
                        PROCESSING...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-tactical-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={onRunFullDemoStory}
            disabled={isDemoRunning}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center space-x-2 transition-all ${
              isDemoRunning
                ? 'bg-tactical-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-buzz-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20 hover:scale-[1.02]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isDemoRunning ? 'Executing Automated Demo...' : 'Run Automated Demo Scenario'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

