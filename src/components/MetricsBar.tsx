'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  score: number;
  criticalZonesCount: number;
  totalZones: number;
  openIncidentsCount: number;
  averageResponseMinutes: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  score,
  criticalZonesCount,
  totalZones,
  openIncidentsCount,
  averageResponseMinutes,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-zinc-800 bg-zinc-950">
      {/* KPI 1: Cleanliness Score */}
      <div className="p-4 border-r border-b md:border-b-0 border-zinc-800">
        <div className="text-[11px] font-medium text-zinc-400">
          Cleanliness index
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {score.toFixed(1)}%
          </span>
          <span className="inline-flex items-center text-xs font-medium text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +2.4%
          </span>
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">
          Target: 85% • Aggregate across all zones
        </div>
      </div>

      {/* KPI 2: Active Incidents */}
      <div className="p-4 border-b md:border-b-0 md:border-r border-zinc-800">
        <div className="text-[11px] font-medium text-zinc-400">
          Active incidents
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {openIncidentsCount}
          </span>
          {openIncidentsCount > 0 ? (
            <span className="inline-flex items-center text-xs font-medium text-amber-400">
              {openIncidentsCount === 1 ? '1 needs attention' : `${openIncidentsCount} need attention`}
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-emerald-400">
              Clear
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">
          Automated vision threshold triggers
        </div>
      </div>

      {/* KPI 3: SLA Response Time */}
      <div className="p-4 border-r border-zinc-800">
        <div className="text-[11px] font-medium text-zinc-400">
          Average resolution time
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {averageResponseMinutes}m
          </span>
          <span className="text-xs text-zinc-400">
            within 10m target
          </span>
        </div>
        <div className="text-[11px] text-emerald-400 mt-1 flex items-center">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
          94.2% SLA compliance
        </div>
      </div>

      {/* KPI 4: Monitored Zones */}
      <div className="p-4">
        <div className="text-[11px] font-medium text-zinc-400">
          Monitored zones
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {totalZones}
          </span>
          <span className="text-xs text-zinc-400">
            {criticalZonesCount > 0 ? `${criticalZonesCount} in warning` : 'all optimal'}
          </span>
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">
          5 live RTSP streams feeding CV
        </div>
      </div>
    </div>
  );
};
