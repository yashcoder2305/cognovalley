'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VerificationPair } from '@/types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface VerificationPanelProps {
  verifications: VerificationPair[];
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  verifications,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
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
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
            Visual verification audit
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Incident detection frame vs post-cleanup verification
          </p>
        </div>

        {/* Ticket Selector Tabs */}
        <div className="flex items-center space-x-1">
          {verifications.map((pair, idx) => (
            <button
              key={pair.id}
              onClick={() => {
                setActiveIdx(idx);
                setSliderPosition(50);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                activeIdx === idx
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {pair.ticketNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Draggable Split Viewer */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/9] cursor-ew-resize select-none bg-zinc-900 overflow-hidden"
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

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-400 flex items-center justify-center text-[10px] text-zinc-200 shadow-md">
            ◄►
          </div>
        </div>

        {/* Before label */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-zinc-200 border border-white/10">
            Before: Detected at {activePair.detectedAt}
          </span>
        </div>

        {/* After label */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/10 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>After: Verified at {activePair.cleanedAt}</span>
          </span>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-zinc-400">Location:</span>{' '}
          <span className="font-medium text-zinc-200">{activePair.zoneName}</span>
          <span className="text-zinc-600 mx-2">•</span>
          <span className="text-zinc-400">Resolved waste:</span>{' '}
          <span className="text-zinc-300">{activePair.litterTypes.join(', ')}</span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-zinc-400">Score:</span>
          <span className="text-red-400 tabular-nums">{activePair.cleanlinessBefore}%</span>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <span className="text-emerald-400 font-semibold tabular-nums">{activePair.cleanlinessAfter}%</span>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 ml-1">
            +{activePair.cleanlinessAfter - activePair.cleanlinessBefore}% recovery
          </span>
        </div>
      </div>
    </div>
  );
};

