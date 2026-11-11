'use client';

import React from 'react';
import { Play, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenDemoModal: () => void;
  onTriggerSimulatedWaste: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoModal,
  onTriggerSimulatedWaste,
  isSimulating,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb / Title */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-zinc-400">Facilities</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-zinc-100">Hygiene & Waste Intelligence</span>
      </div>

      {/* Right side status & action buttons */}
      <div className="flex items-center space-x-3">
        {/* CV Pipeline Status */}
        <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-400 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>YOLOv8 pipeline active</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400 tabular-nums">28.4 FPS</span>
        </div>

        {/* Secondary: Simulate Spill */}
        <button
          onClick={onTriggerSimulatedWaste}
          disabled={isSimulating}
          className="h-8 px-2.5 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5"
          title="Simulate a new litter detection to test threshold and ticketing"
        >
          {isSimulating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>{isSimulating ? 'Simulating...' : 'Simulate incident'}</span>
        </button>

        {/* Primary: Review Panel Demo */}
        <button
          onClick={onOpenDemoModal}
          className="h-8 px-3 rounded-md text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Review panel demo</span>
        </button>
      </div>
    </header>
  );
};

