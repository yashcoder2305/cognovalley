'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  RefreshCw, 
  Menu, 
  X, 
  Command, 
  HelpCircle,
  Bell
} from 'lucide-react';

interface HeaderProps {
  onOpenDemoModal: () => void;
  onTriggerSimulatedWaste: () => void;
  isSimulating: boolean;
  onOpenShortcuts: () => void;
  onToggleMobileMenu: () => void;
  activeIncidentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoModal,
  onTriggerSimulatedWaste,
  isSimulating,
  onOpenShortcuts,
  onToggleMobileMenu,
  activeIncidentsCount,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400">Facilities</span>
          <span className="text-zinc-600">/</span>
          <span className="font-medium text-zinc-100">Hygiene & Waste Intelligence</span>
        </div>
      </div>

      {/* Right side status & action buttons */}
      <div className="flex items-center space-x-2.5">
        {/* CV Pipeline Status */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-zinc-400 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>YOLOv8 pipeline active</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400 tabular-nums">28.4 FPS</span>
        </div>

        {/* Keyboard shortcut hint button */}
        <button
          onClick={onOpenShortcuts}
          className="h-8 px-2 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors hidden sm:flex items-center space-x-1"
          title="View Keyboard Shortcuts (?)"
        >
          <kbd className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">?</kbd>
        </button>

        {/* Secondary: Simulate Spill */}
        <button
          onClick={onTriggerSimulatedWaste}
          disabled={isSimulating}
          className="h-8 px-2.5 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5"
          title="Simulate a new litter detection (Shortcut: S)"
        >
          {isSimulating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>{isSimulating ? 'Simulating...' : 'Simulate incident'}</span>
          <kbd className="hidden md:inline font-mono text-[10px] text-zinc-400 ml-1">S</kbd>
        </button>

        {/* Primary: Review Panel Demo */}
        <button
          onClick={onOpenDemoModal}
          className="h-8 px-3 rounded-md text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors flex items-center space-x-1.5 shadow-sm"
          title="Open Review Panel Demo (Shortcut: D)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Review panel demo</span>
          <kbd className="hidden md:inline font-mono text-[10px] text-zinc-600 bg-zinc-200/80 px-1 py-0.2 rounded ml-1">D</kbd>
        </button>
      </div>
    </header>
  );
};
