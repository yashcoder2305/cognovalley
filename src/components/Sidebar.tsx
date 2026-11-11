'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  MapPin, 
  Camera, 
  Users, 
  Settings, 
  ChevronDown, 
  X
} from 'lucide-react';

interface SidebarProps {
  activeIncidentsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeIncidentsCount, 
  isOpenMobile = false,
  onCloseMobile 
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-50 md:z-10 transition-transform duration-200 ${
        isOpenMobile ? 'fixed left-0 top-0 translate-x-0' : 'hidden md:flex'
      }`}>
        <div>
          {/* Workspace Brand Header */}
          <div className="h-14 border-b border-zinc-800 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-100 tracking-tight">BinBuzz</span>
                <span className="text-[10px] text-zinc-400">Facility Operations</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                v1.4
              </span>
              {isOpenMobile && (
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded text-zinc-400 hover:text-white md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Facility Selector */}
          <div className="p-3">
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors">
              <span className="truncate">Central Campus • Block A</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-2 shrink-0" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="px-3 space-y-1">
            <a
              href="#overview"
              onClick={onCloseMobile}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-100 border border-zinc-800/80"
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span>Overview</span>
              </div>
            </a>

            <a
              href="#incidents"
              onClick={onCloseMobile}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-zinc-400" />
                <span>Incidents</span>
              </div>
              {activeIncidentsCount > 0 && (
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 tabular-nums">
                  {activeIncidentsCount}
                </span>
              )}
            </a>

            <a
              href="#zones"
              onClick={onCloseMobile}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Zones & Floors</span>
            </a>

            <a
              href="#cameras"
              onClick={onCloseMobile}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
            >
              <Camera className="w-4 h-4 text-zinc-400" />
              <span>Camera Streams</span>
            </a>

            <a
              href="#staff"
              onClick={onCloseMobile}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
            >
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Housekeeping</span>
            </a>
          </nav>
        </div>

        {/* Operator User Footer */}
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center justify-between p-2 rounded-md bg-zinc-900/40 border border-zinc-800/60">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-medium text-zinc-300 shrink-0">
                YG
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 truncate">Yash Gandha</div>
                <div className="text-[10px] text-zinc-400 truncate">Lead Facility Ops</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="System connected" />
          </div>
        </div>
      </aside>
    </>
  );
};
