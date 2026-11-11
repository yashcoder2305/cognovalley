'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BoundingBox, Zone } from '@/types';
import { 
  Camera, 
  Upload, 
  Video, 
  SlidersHorizontal, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Maximize2
} from 'lucide-react';

interface VisionFeedProps {
  currentZone: Zone;
  boundingBoxes: BoundingBox[];
  onTriggerTicketFromBox: (box: BoundingBox) => void;
  persistenceThresholdSec: number;
  onUpdateThreshold: (val: number) => void;
}

export const VisionFeed: React.FC<VisionFeedProps> = ({
  currentZone,
  boundingBoxes,
  onTriggerTicketFromBox,
  persistenceThresholdSec,
  onUpdateThreshold,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [activeMediaMode, setActiveMediaMode] = useState<'stream' | 'capture'>('stream');
  const [customMediaUrl, setCustomMediaUrl] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomMediaUrl(url);
    }
  };

  const getZoneBackground = () => {
    if (customMediaUrl) return customMediaUrl;
    if (currentZone.id === 'zone-1') {
      return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80';
    } else if (currentZone.id === 'zone-2') {
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80';
    } else if (currentZone.id === 'zone-3') {
      return 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1400&q=80';
    } else if (currentZone.id === 'zone-4') {
      return 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80';
    }
    return 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80';
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden flex flex-col">
      {/* File input for custom test uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header bar */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-zinc-100">Live surveillance feed</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{currentZone.name}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400">{currentZone.cameraId}</span>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2 rounded text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center space-x-1"
            title="Upload custom test image/video"
          >
            <Upload className="w-3 h-3 text-zinc-400" />
            <span>Upload feed</span>
          </button>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`h-7 px-2 rounded text-xs font-medium border transition-colors flex items-center space-x-1 ${
              showOverlays
                ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle detection boxes"
          >
            {showOverlays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Boxes</span>
          </button>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
        {/* Background Stream Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getZoneBackground()}')` }}
        />

        {/* Top telemetry overlay */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 text-[11px] font-mono z-10">
          <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-emerald-400">
            RTSP 1080p @ 30FPS
          </span>
          <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-zinc-300 tabular-nums">
            {currentTimeStr}
          </span>
        </div>

        {/* Computer Vision Detections Overlay */}
        {showOverlays && (
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {boundingBoxes.map((box) => {
              const isBreached = box.persistenceSeconds >= persistenceThresholdSec;

              return (
                <div
                  key={box.id}
                  className={`absolute border transition-all ${
                    isBreached
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-amber-400 bg-amber-400/10'
                  }`}
                  style={{
                    left: `${box.coordinates.x}%`,
                    top: `${box.coordinates.y}%`,
                    width: `${box.coordinates.width}%`,
                    height: `${box.coordinates.height}%`,
                  }}
                >
                  {/* Top Label */}
                  <div
                    className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[10px] font-medium whitespace-nowrap flex items-center space-x-1.5 ${
                      isBreached ? 'bg-red-500 text-white' : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    <span>{box.label}</span>
                    <span className="opacity-90 tabular-nums font-mono">
                      {(box.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Bottom Dwell Info */}
                  <div className="absolute -bottom-5 left-0 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono text-zinc-300 tabular-nums whitespace-nowrap">
                    Dwell: {formatSeconds(box.persistenceSeconds)}
                    {isBreached && <span className="text-red-400 font-semibold ml-1">SLA breach</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Viewport bottom bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10 pointer-events-none">
          <div className="px-2 py-1 rounded bg-black/75 border border-white/10 text-zinc-300 flex items-center space-x-2 font-mono text-[11px]">
            <span>Model: YOLOv8x-Waste</span>
            <span className="text-zinc-600">•</span>
            <span>{boundingBoxes.length} detected objects</span>
          </div>
        </div>
      </div>

      {/* Detections Event Log Table */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Live detection stream</span>
          <span className="font-mono text-zinc-400">YOLOv8 inference log</span>
        </div>

        <div className="divide-y divide-zinc-800/60 max-h-48 overflow-y-auto">
          {boundingBoxes.map((box) => {
            const isBreached = box.persistenceSeconds >= persistenceThresholdSec;

            return (
              <div
                key={box.id}
                className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-zinc-900/40 transition-colors"
              >
                {/* Event info */}
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isBreached ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <span className="font-medium text-zinc-200">{box.label}</span>
                    <span className="text-[11px] text-zinc-400 ml-2 font-mono">
                      {(box.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>

                {/* Dwell time and trigger button */}
                <div className="flex items-center space-x-4">
                  <div className="text-right text-[11px] font-mono text-zinc-400 tabular-nums">
                    <span>Dwell: {formatSeconds(box.persistenceSeconds)}</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span>{formatSeconds(persistenceThresholdSec)}</span>
                  </div>

                  {isBreached ? (
                    <button
                      onClick={() => onTriggerTicketFromBox(box)}
                      className="h-6 px-2 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Dispatch staff
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-400 font-mono">Monitoring</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold Configuration Strip */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium">Incident trigger threshold:</span>
          <span className="font-mono text-zinc-100 tabular-nums">
            {persistenceThresholdSec}s ({Math.floor(persistenceThresholdSec / 60)}m {persistenceThresholdSec % 60}s)
          </span>
        </div>

        <div className="flex items-center space-x-3 w-48">
          <span className="text-[10px] font-mono text-zinc-400">30s</span>
          <input
            type="range"
            min="30"
            max="300"
            step="15"
            value={persistenceThresholdSec}
            onChange={(e) => onUpdateThreshold(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
          />
          <span className="text-[10px] font-mono text-zinc-400">5m</span>
        </div>
      </div>
    </div>
  );
};

