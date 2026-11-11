'use client';

import React from 'react';
import { Zone } from '@/types';

interface ZoneListProps {
  zones: Zone[];
  selectedZoneId: string;
  onSelectZone: (id: string) => void;
}

// Mini SVG Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const min = 40;
  const max = 100;
  const width = 64;
  const height = 18;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const ZoneList: React.FC<ZoneListProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const getStatusColor = (score: number) => {
    if (score >= 85) return '#22c55e'; // emerald
    if (score >= 70) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
            Facility zones
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Real-time cleanliness index by area
          </p>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
          {zones.length} active
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-zinc-800/80">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const statusColor = getStatusColor(zone.cleanlinessScore);

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                isSelected
                  ? 'bg-zinc-900 border-l-2 border-l-zinc-100 text-white'
                  : 'hover:bg-zinc-900/50 text-zinc-300'
              }`}
            >
              {/* Left: Status dot + Name */}
              <div className="min-w-0 pr-3">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="font-medium text-zinc-200 truncate">
                    {zone.name}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center space-x-2">
                  <span className="font-mono text-zinc-400">{zone.code}</span>
                  <span>•</span>
                  <span>{zone.areaType}</span>
                </div>
              </div>

              {/* Right: Sparkline + Score */}
              <div className="flex items-center space-x-4 shrink-0">
                {/* 1hr Sparkline */}
                <div className="hidden sm:block" title="1-hour cleanliness trend">
                  <Sparkline data={zone.history} color={statusColor} />
                </div>

                {/* Score */}
                <div className="text-right w-12">
                  <div className="font-semibold text-zinc-100 tabular-nums text-sm">
                    {zone.cleanlinessScore}%
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {zone.activeIncidents > 0 ? (
                      <span className="text-amber-400 font-medium">{zone.activeIncidents} alert</span>
                    ) : (
                      'Normal'
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

