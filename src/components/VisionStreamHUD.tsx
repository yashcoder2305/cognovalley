'use client';

import React, { useState, useEffect } from 'react';
import { BoundingBox, Zone } from '@/types';
import { 
  Camera, 
  Layers, 
  Maximize2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Upload,
  Video,
  CheckCircle,
  Sliders,
  Crosshair
} from 'lucide-react';

interface VisionStreamHUDProps {
  currentZone: Zone;
  boundingBoxes: BoundingBox[];
  onTriggerTicketFromBox: (box: BoundingBox) => void;
  persistenceThresholdSec: number;
  onUpdateThreshold: (val: number) => void;
}

export const VisionStreamHUD: React.FC<VisionStreamHUDProps> = ({
  currentZone,
  boundingBoxes,
  onTriggerTicketFromBox,
  persistenceThresholdSec,
  onUpdateThreshold,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [activeMediaMode, setActiveMediaMode] = useState<'video' | 'photo'>('video');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0'));
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-tactical-800 bg-tactical-900/60 p-5 backdrop-blur-sm flex flex-col h-full">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Vision Intelligence Pipeline HUD
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-tactical-800 text-slate-300 border border-tactical-700">
              CAM // {currentZone.cameraIds[0] || 'CAM-01'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Targeting: <span className="text-slate-200 font-medium">{currentZone.name}</span> ({currentZone.code})
          </p>
        </div>

        {/* Tactical Controls & Switches */}
        <div className="flex items-center space-x-2">
          {/* Media input mode selector */}
          <div className="flex bg-tactical-950 p-1 rounded-lg border border-tactical-800 text-xs">
            <button
              onClick={() => setActiveMediaMode('video')}
              className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition-all ${
                activeMediaMode === 'video'
                  ? 'bg-tactical-800 text-buzz-cyan shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live Video</span>
            </button>
            <button
              onClick={() => setActiveMediaMode('photo')}
              className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition-all ${
                activeMediaMode === 'photo'
                  ? 'bg-tactical-800 text-buzz-cyan shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Frame</span>
            </button>
          </div>

          {/* Toggle overlays */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showOverlays
                ? 'bg-buzz-cyan/10 border-buzz-cyan/40 text-buzz-cyan'
                : 'bg-tactical-950 border-tactical-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle AI Detection Bounding Boxes"
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">HUD</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-tactical-700/80 bg-tactical-950 shadow-2xl group flex-1">
        {/* Synthetic Video Feed or Image representation */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80')`,
            filter: showHeatmap ? 'contrast(1.2) hue-rotate(45deg)' : 'none',
          }}
        />

        {/* Tactical Scanlines & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-tactical-950/90 via-transparent to-tactical-950/40 pointer-events-none" />
        <div className="absolute inset-0 hud-grid opacity-30 pointer-events-none" />

        {/* Video / Camera Status OSD */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 text-[10px] font-mono z-10">
          <div className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-emerald-400 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE REC [RTSP // 1080p @ 30FPS]</span>
          </div>
          <div className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-slate-300">
            {currentTimeStr}
          </div>
        </div>

        {/* Crosshair Center Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <Crosshair className="w-16 h-16 text-white stroke-[1]" />
        </div>

        {/* AI Bounding Boxes Overlay */}
        {showOverlays && (
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {boundingBoxes.map((box) => {
              const isBreached = box.persistenceSeconds >= persistenceThresholdSec;
              const isSelected = selectedBoxId === box.id;

              return (
                <div
                  key={box.id}
                  onClick={() => setSelectedBoxId(box.id)}
                  className={`absolute border-2 transition-all cursor-pointer group/box ${
                    isBreached
                      ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                      : 'border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                  style={{
                    left: `${box.coordinates.x}%`,
                    top: `${box.coordinates.y}%`,
                    width: `${box.coordinates.width}%`,
                    height: `${box.coordinates.height}%`,
                  }}
                >
                  {/* Tactical corner brackets */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />

                  {/* Header Label Tag */}
                  <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md flex items-center space-x-1.5 ${
                    isBreached ? 'bg-rose-600 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    <span>{box.label}</span>
                    {showConfidence && (
                      <span className="opacity-80">{(box.confidence * 100).toFixed(1)}%</span>
                    )}
                  </div>

                  {/* Persistence Dwell Timer Badge */}
                  <div className="absolute -bottom-6 left-0 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[9px] font-mono text-slate-200 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5 text-buzz-cyan" />
                    <span>Dwell: {formatSeconds(box.persistenceSeconds)} / {formatSeconds(persistenceThresholdSec)}</span>
                  </div>

                  {/* If breached: 1-click Dispatch button overlay */}
                  {isBreached && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerTicketFromBox(box);
                      }}
                      className="absolute inset-0 m-auto w-max h-max px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center space-x-1 transition-transform transform active:scale-95"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>SLA BREACH: DISPATCH</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Viewport Bottom Status Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono z-10">
          <div className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-slate-300 flex items-center space-x-3">
            <span className="text-buzz-cyan font-bold">SEGMENTATION: ACTIVE</span>
            <span className="text-slate-500">|</span>
            <span>Objects: {boundingBoxes.length}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">
              Unattended: {boundingBoxes.filter(b => b.persistenceSeconds >= persistenceThresholdSec).length} Breached
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-slate-400 hidden sm:flex items-center space-x-2">
            <span>MODEL: YOLOv8x-WasteSeg</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Threshold Configuration Slider Bar */}
      <div className="mt-4 p-3.5 rounded-xl bg-tactical-950/80 border border-tactical-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-buzz-cyan" />
            <span className="font-semibold">Maintenance Trigger Persistence Threshold:</span>
            <span className="font-mono text-buzz-cyan font-bold">{persistenceThresholdSec}s ({Math.floor(persistenceThresholdSec / 60)}m {persistenceThresholdSec % 60}s)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            RULE: Auto-generates Housekeeping Ticket when litter exceeds limit
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-mono text-slate-500">30s (Rapid)</span>
          <input
            type="range"
            min="30"
            max="300"
            step="15"
            value={persistenceThresholdSec}
            onChange={(e) => onUpdateThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-tactical-800 rounded-lg appearance-none cursor-pointer accent-buzz-cyan"
          />
          <span className="text-[10px] font-mono text-slate-500">300s (Standard)</span>
        </div>
      </div>
    </div>
  );
};

