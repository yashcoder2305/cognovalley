'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VerificationPair } from '@/types';
import { CheckCircle2, SplitSquareVertical, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface VisualVerificationSliderProps {
  verifications: VerificationPair[];
}

export const VisualVerificationSlider: React.FC<VisualVerificationSliderProps> = ({
  verifications,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePair = verifications[activeIdx] || verifications[0];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="rounded-2xl border border-tactical-800 bg-tactical-900/60 p-5 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <SplitSquareVertical className="w-4 h-4 text-buzz-emerald" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Visual Verification (Before vs After Diff)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AUDIT VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Slide to compare incident detection frame with post-cleanup inspection photo
          </p>
        </div>

        {/* Pair selector tabs */}
        <div className="flex items-center space-x-2">
          {verifications.map((pair, idx) => (
            <button
              key={pair.id}
              onClick={() => {
                setActiveIdx(idx);
                setSliderPosition(50);
              }}
              className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                activeIdx === idx
                  ? 'bg-tactical-800 border-buzz-emerald text-emerald-400'
                  : 'bg-tactical-950/60 border-tactical-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {pair.ticketId}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Draggable Split View */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-tactical-700/80 cursor-ew-resize select-none bg-tactical-950"
      >
        {/* AFTER Image (Full background) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activePair.afterImage})` }}
        />

        {/* BEFORE Image (Clipped overlay) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${activePair.beforeImage})`,
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        />

        {/* Draggable Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xl">
            <span className="text-[10px] text-white font-mono font-bold tracking-tighter">◄►</span>
          </div>
        </div>

        {/* Left Side Label (Before Incident) */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-2.5 py-1 rounded bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-[10px] font-mono text-rose-300 font-bold flex items-center space-x-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>BEFORE: INCIDENT DETECTED ({activePair.detectedAt})</span>
          </div>
        </div>

        {/* Right Side Label (After Cleanup) */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2.5 py-1 rounded bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold flex items-center space-x-1.5 shadow-lg">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>AFTER: CLEANED & REVERIFIED ({activePair.cleanedAt})</span>
          </div>
        </div>

        {/* Detected waste items tags on bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
          {activePair.wasteTypesFound.map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-rose-500/30 text-rose-300 font-mono text-[10px]"
            >
              ⚠ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Delta Scorecard bar */}
      <div className="mt-4 p-3 rounded-xl bg-tactical-950 border border-tactical-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              {activePair.zoneName} Cleanliness Recovery
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2 mt-0.5">
              <span className="text-rose-400">Before: {activePair.cleanlinessDelta.beforeScore}%</span>
              <ArrowRight className="w-3 h-3 text-slate-500 inline" />
              <span className="text-emerald-400 font-bold">After: {activePair.cleanlinessDelta.afterScore}%</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">
            +{activePair.cleanlinessDelta.afterScore - activePair.cleanlinessDelta.beforeScore}% INDEX RECOVERY
          </span>
        </div>
      </div>
    </div>
  );
};

