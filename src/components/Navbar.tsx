'use client';

import React from 'react';
import { 
  Trash2, 
  Activity, 
  ShieldCheck, 
  Bell, 
  Sparkles,
  Layers,
  Radio,
  Sliders,
  Play
} from 'lucide-react';

interface NavbarProps {
  overallScore: number;
  activeIncidentsCount: number;
  onOpenDemoModal: () => void;
  onTriggerSimulatedWaste: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  overallScore,
  activeIncidentsCount,
  onOpenDemoModal,
  onTriggerSimulatedWaste,
  isSimulating,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-tactical-800 bg-tactical-950/80 backdrop-blur-md">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-buzz-cyan via-buzz-accent to-buzz-emerald p-0.5 shadow-lg shadow-buzz-cyan/20">
            <div className="w-full h-full bg-tactical-950 rounded-[10px] flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-buzz-cyan" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-buzz-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-buzz-emerald"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                BIN<span className="text-buzz-cyan ml-1">BUZZ</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded bg-tactical-800 text-slate-300 border border-tactical-700">
                TRACK E // HYGIENE OS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cogno Valley Labs • Intelligent Facility & Waste Analytics
            </p>
          </div>
        </div>

        {/* Global Live Facility Metrics */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-tactical-900 border border-tactical-800">
            <Radio className="w-4 h-4 text-buzz-emerald animate-pulse" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Vision Pipeline</div>
              <div className="text-xs font-semibold text-emerald-400">YOLOv8-Waste Live (28.4 FPS)</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-tactical-900 border border-tactical-800">
            <Activity className="w-4 h-4 text-buzz-cyan" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Facility Hygiene</div>
              <div className={`text-xs font-bold font-mono ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {overallScore}% INDEX
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-tactical-900 border border-tactical-800">
            <Bell className={`w-4 h-4 ${activeIncidentsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Breach Tickets</div>
              <div className="text-xs font-bold font-mono text-white">
                {activeIncidentsCount} ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Action button: Panel Demo & Trigger Incident */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onTriggerSimulatedWaste}
            disabled={isSimulating}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center space-x-2 ${
              isSimulating
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300 animate-pulse'
                : 'bg-tactical-900 border-tactical-700 text-slate-200 hover:border-slate-500 hover:bg-tactical-850'
            }`}
            title="Simulate a new litter spill that exceeds threshold and triggers a ticket"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSimulating ? 'Simulating Spill...' : 'Trigger Incident'}</span>
          </button>

          <button
            onClick={onOpenDemoModal}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-buzz-cyan via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Review Panel Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

