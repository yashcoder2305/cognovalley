'use client';

import React from 'react';
import { Zone } from '@/types';
import { MapPin, AlertCircle, CheckCircle2, Flame, ArrowUpRight, Camera } from 'lucide-react';

interface ZoneScorecardsProps {
  zones: Zone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export const ZoneScorecards: React.FC<ZoneScorecardsProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const getBadgeStyle = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="rounded-2xl border border-tactical-800 bg-tactical-900/60 p-5 backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-buzz-cyan" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Zone Scorecards & Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cleanliness index derived from computer vision stream density
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {zones.length} ZONES ACTIVE
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-tactical-850 border-buzz-cyan/60 shadow-lg shadow-cyan-950/40'
                  : 'bg-tactical-950/60 border-tactical-800 hover:border-tactical-700 hover:bg-tactical-900/90'
              }`}
            >
              {/* Active selection indicator bar */}
              {isSelected && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-buzz-cyan rounded-r-full" />
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider">
                      {zone.code}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {zone.areaType}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-buzz-cyan transition-colors mt-0.5">
                    {zone.name}
                  </h4>
                </div>

                {/* Zone Score Indicator */}
                <div className="text-right">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getBadgeStyle(zone.cleanlinessScore)}`}>
                    {zone.cleanlinessScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Index
                  </div>
                </div>
              </div>

              {/* Progress bar representing 0-100% cleanliness */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Litter Density: {zone.litterDensity}%</span>
                  <span>{zone.activeIncidents > 0 ? `${zone.activeIncidents} alert(s)` : 'Clear'}</span>
                </div>
                <div className="w-full bg-tactical-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${getScoreBarColor(zone.cleanlinessScore)}`}
                    style={{ width: `${zone.cleanlinessScore}%` }}
                  />
                </div>
              </div>

              {/* Footer row with camera link and incident warning */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-tactical-800/60 font-mono">
                <span className="flex items-center space-x-1 text-slate-400">
                  <Camera className="w-3 h-3 text-slate-500" />
                  <span>{zone.cameraIds.join(', ')}</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Checked {zone.lastInspection}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

