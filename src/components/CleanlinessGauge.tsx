'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp, Info } from 'lucide-react';

interface CleanlinessGaugeProps {
  score: number;
  zonesCount: number;
  criticalZonesCount: number;
  averageResponseMinutes: number;
}

export const CleanlinessGauge: React.FC<CleanlinessGaugeProps> = ({
  score,
  zonesCount,
  criticalZonesCount,
  averageResponseMinutes,
}) => {
  // SVG circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 85) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (val >= 70) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { stroke: '#ef4444', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const colorConfig = getScoreColor(score);

  return (
    <div className="rounded-2xl border border-tactical-800 bg-tactical-900/60 p-5 backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div 
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: colorConfig.stroke }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Facility Cleanliness Index (FCI)
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${colorConfig.badge}`}>
              {score >= 85 ? 'OPTIMAL' : score >= 70 ? 'ATTENTION' : 'CRITICAL'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time aggregate index: litter density $\times$ dwell duration across {zonesCount} zones
          </p>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          FORMULA: <span className="text-buzz-cyan font-semibold">100 - (\rho \cdot \tau)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Circular Gauge */}
        <div className="md:col-span-5 flex items-center justify-center py-2">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-tactical-800"
                strokeWidth="12"
                fill="none"
              />
              {/* Dynamic progress track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={colorConfig.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${colorConfig.stroke})`
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${colorConfig.text}`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Scorecard
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-tactical-950/70 border border-tactical-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Zone Alerts</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {criticalZonesCount} <span className="text-xs font-normal text-slate-400">of {zonesCount} critical</span>
            </div>
            <div className="text-[11px] text-amber-400/90 mt-1 flex items-center">
              Requires immediate sweep
            </div>
          </div>

          <div className="p-3 rounded-xl bg-tactical-950/70 border border-tactical-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-buzz-cyan" />
              <span>Avg Housekeeping SLA</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {averageResponseMinutes}m <span className="text-xs font-normal text-slate-400">dispatch to clean</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center">
              94.2% within 10m target
            </div>
          </div>

          <div className="p-3 rounded-xl bg-tactical-950/70 border border-tactical-800/80 col-span-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-[11px] text-slate-400">LIVE ZONE BREAKDOWN</span>
              <span className="text-buzz-cyan font-mono text-[11px]">WEIGHT: AREA RISK</span>
            </div>
            {/* Visual mini bar */}
            <div className="w-full bg-tactical-800 h-2 rounded-full mt-2 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '60%' }} title="Pristine Zones: 60%" />
              <div className="bg-amber-500 h-full" style={{ width: '20%' }} title="Warning Zones: 20%" />
              <div className="bg-rose-500 h-full" style={{ width: '20%' }} title="Critical Zones: 20%" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> Pristine (3)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Warning (1)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/> Critical (1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

