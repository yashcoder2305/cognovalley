'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BoundingBox, Zone } from '@/types';
import {
  Upload,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ScanLine,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CameraOff,
  Video,
  Zap,
  Ticket,
} from 'lucide-react';

export interface ScanDetectionPayload {
  label: string;
  confidence: number;
  source: 'image' | 'webcam';
}

interface VisionFeedProps {
  currentZone: Zone;
  boundingBoxes: BoundingBox[];
  onTriggerTicketFromBox: (box: BoundingBox) => void;
  persistenceThresholdSec: number;
  onUpdateThreshold: (val: number) => void;
  onCreateTicketFromDetection?: (detection: ScanDetectionPayload) => void;
}

interface ScanDetection {
  id: string;
  label: string;
  className: string;
  confidence: number;
  coordinates: { x: number; y: number; width: number; height: number };
  pixelBox?: number[];
}

interface ScanResult {
  success: boolean;
  model: string;
  classes: string[];
  inferenceMs: number;
  image: { width: number; height: number };
  detections: ScanDetection[];
}

type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';
type SourceMode = 'demo' | 'image' | 'webcam';
type WebcamStatus = 'idle' | 'starting' | 'live' | 'error';

interface OverlayBox {
  id: string;
  label: string;
  confidence: number;
  coordinates: { x: number; y: number; width: number; height: number };
  breached: boolean;
  footer: string;
}

const AUTO_SCAN_INTERVAL_MS = 3500;
const AUTO_TICKET_COOLDOWN_MS = 15000;

export const VisionFeed: React.FC<VisionFeedProps> = ({
  currentZone,
  boundingBoxes,
  onTriggerTicketFromBox,
  persistenceThresholdSec,
  onUpdateThreshold,
  onCreateTicketFromDetection,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [sourceMode, setSourceMode] = useState<SourceMode>('demo');

  // Uploaded image scan
  const [customMediaUrl, setCustomMediaUrl] = useState<string | null>(null);

  // Scan state (shared by image + webcam)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanHint, setScanHint] = useState<string | null>(null);
  const [confThreshold, setConfThreshold] = useState<number>(0.25);

  // Webcam state
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>('idle');
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [autoScan, setAutoScan] = useState<boolean>(true);
  const [autoTicket, setAutoTicket] = useState<boolean>(true);
  const [autoTicketCount, setAutoTicketCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoScanBusy = useRef<boolean>(false);
  const lastAutoTicketAt = useRef<number>(0);
  const confRef = useRef<number>(confThreshold);
  const createTicketRef = useRef<VisionFeedProps['onCreateTicketFromDetection']>(
    onCreateTicketFromDetection
  );

  confRef.current = confThreshold;
  createTicketRef.current = onCreateTicketFromDetection;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Release image object URLs when replaced/unmounted
  useEffect(() => {
    return () => {
      if (customMediaUrl) URL.revokeObjectURL(customMediaUrl);
    };
  }, [customMediaUrl]);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Attach the stream once the video element exists
  useEffect(() => {
    if (sourceMode === 'webcam' && webcamStatus === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [sourceMode, webcamStatus]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setWebcamStatus('idle');
  }, []);

  const switchToDemo = () => {
    stopWebcam();
    if (customMediaUrl) URL.revokeObjectURL(customMediaUrl);
    setCustomMediaUrl(null);
    setSourceMode('demo');
    setScanStatus('idle');
    setScanResult(null);
    setScanError(null);
    setScanHint(null);
    setWebcamError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startWebcam = async () => {
    stopWebcam();
    setSourceMode('webcam');
    setWebcamStatus('starting');
    setWebcamError(null);
    setScanError(null);
    setScanHint(null);
    setScanResult(null);
    setScanStatus('idle');
    if (customMediaUrl) URL.revokeObjectURL(customMediaUrl);
    setCustomMediaUrl(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setWebcamStatus('error');
      setWebcamError('Webcam API unavailable. Use http://localhost or HTTPS, and a modern browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setWebcamStatus('live');
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      let message = 'Could not access the webcam.';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        message = 'Camera permission denied. Allow camera access in your browser and retry.';
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        message = 'No webcam found on this device.';
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        message = 'The camera is already in use by another application.';
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      setWebcamStatus('error');
      setWebcamError(message);
    }
  };

  const runScan = useCallback(async (file: File, source: 'image' | 'webcam') => {
    setScanStatus('scanning');
    setScanError(null);
    setScanHint(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('conf', String(confRef.current));

      const response = await fetch('/api/scan', { method: 'POST', body: form });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (payload && (payload.error || payload.detail)) || `Scan failed (${response.status})`
        );
      }

      const result = payload as ScanResult;
      setScanResult(result);
      setScanStatus('done');

      if (source === 'webcam' && autoTicket && result.detections.length > 0) {
        const best = [...result.detections].sort((a, b) => b.confidence - a.confidence)[0];
        const now = Date.now();
        const threshold = Math.max(confRef.current, 0.35);

        if (best && best.confidence >= threshold && now - lastAutoTicketAt.current >= AUTO_TICKET_COOLDOWN_MS) {
          lastAutoTicketAt.current = now;
          createTicketRef.current?.({
            label: best.label,
            confidence: best.confidence,
            source: 'webcam',
          });
          setAutoTicketCount((count) => count + 1);
        }
      }
    } catch (error) {
      setScanStatus('error');
      setScanError(error instanceof Error ? error.message : 'Scan failed');
      setScanHint('Start the local scanner with: npm run scan:server');
    }
  }, [autoTicket]);

  const captureFrame = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92);
    });
    if (!blob) return null;
    return new File([blob], 'webcam-frame.jpg', { type: 'image/jpeg' });
  }, []);

  const scanWebcamFrame = useCallback(async () => {
    const file = await captureFrame();
    if (file) await runScan(file, 'webcam');
  }, [captureFrame, runScan]);

  // Continuous webcam scanning
  useEffect(() => {
    if (sourceMode !== 'webcam' || webcamStatus !== 'live' || !autoScan) return;

    let cancelled = false;
    const tick = async () => {
      if (cancelled || autoScanBusy.current) return;
      autoScanBusy.current = true;
      try {
        const file = await captureFrame();
        if (file && !cancelled) await runScan(file, 'webcam');
      } finally {
        autoScanBusy.current = false;
      }
    };

    const timer = setInterval(tick, AUTO_SCAN_INTERVAL_MS);
    const kickoff = setTimeout(tick, 800);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(kickoff);
    };
  }, [sourceMode, webcamStatus, autoScan, captureFrame, runScan]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    stopWebcam();
    if (!file.type.startsWith('image/')) {
      if (customMediaUrl) URL.revokeObjectURL(customMediaUrl);
      setCustomMediaUrl(null);
      setSourceMode('image');
      setScanStatus('error');
      setScanError('Only image files are supported. Export a frame from your video as JPG or PNG.');
      setScanHint(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setCustomMediaUrl(url);
    setSourceMode('image');
    setShowOverlays(true);
    setScanResult(null);
    await runScan(file, 'image');
  };

  const getZoneBackground = () => {
    if (customMediaUrl) return customMediaUrl;
    if (currentZone.id === 'zone-1') {
      return '/media/food-court.jpg';
    } else if (currentZone.id === 'zone-2') {
      return '/media/lobby.jpg';
    } else if (currentZone.id === 'zone-3') {
      return '/media/restroom-corridor.jpg';
    } else if (currentZone.id === 'zone-4') {
      return '/media/walkway.jpg';
    }
    return '/media/library.jpg';
  };

  const isScanSource = sourceMode === 'image' || sourceMode === 'webcam';

  const overlays: OverlayBox[] = isScanSource
    ? (scanResult?.detections ?? []).map((detection) => ({
        id: detection.id,
        label: detection.label,
        confidence: detection.confidence,
        coordinates: detection.coordinates,
        breached: false,
        footer: 'AI detection',
      }))
    : boundingBoxes.map((box) => {
        const breached = box.persistenceSeconds >= persistenceThresholdSec;
        return {
          id: box.id,
          label: box.label,
          confidence: box.confidence,
          coordinates: box.coordinates,
          breached,
          footer: `Dwell: ${formatSeconds(box.persistenceSeconds)}`,
        };
      });

  const detectionCount = isScanSource ? scanResult?.detections.length ?? 0 : boundingBoxes.length;
  const modelLabel = isScanSource ? scanResult?.model ?? 'best.pt' : 'YOLOv8x-Waste';

  const createTicket = (box: OverlayBox) => {
    createTicketRef.current?.({
      label: box.label,
      confidence: box.confidence,
      source: sourceMode === 'webcam' ? 'webcam' : 'image',
    });
  };

  const telemetryOverlay = (
    <>
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 text-[11px] font-mono z-20">
        <span
          className={`px-2 py-0.5 rounded bg-black/75 border border-white/10 ${
            sourceMode === 'webcam'
              ? 'text-red-400'
              : sourceMode === 'image'
              ? 'text-sky-400'
              : 'text-emerald-400'
          }`}
        >
          {sourceMode === 'webcam'
            ? webcamStatus === 'live'
              ? 'LIVE WEBCAM'
              : 'WEBCAM'
            : sourceMode === 'image'
            ? 'AI SCAN · YOLOv8'
            : 'RTSP 1080p @ 30FPS'}
        </span>
        <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-zinc-300 tabular-nums">
          {currentTimeStr}
        </span>
        {isScanSource && scanStatus === 'done' && scanResult && (
          <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-zinc-300 tabular-nums">
            {scanResult.image.width}×{scanResult.image.height}
          </span>
        )}
        {sourceMode === 'webcam' && webcamStatus === 'live' && autoScan && (
          <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-sky-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            auto-scan
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10 pointer-events-none">
        <div className="px-2 py-1 rounded bg-black/75 border border-white/10 text-zinc-300 flex items-center space-x-2 font-mono text-[11px]">
          <span>Model: {modelLabel}</span>
          <span className="text-zinc-600">•</span>
          <span>{detectionCount} detected objects</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header bar */}
      <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              sourceMode === 'webcam'
                ? webcamStatus === 'live'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-amber-400'
                : sourceMode === 'image'
                ? 'bg-sky-400'
                : 'bg-emerald-500'
            }`}
          />
          <span className="font-medium text-zinc-100">
            {sourceMode === 'webcam'
              ? 'Live webcam scan'
              : sourceMode === 'image'
              ? 'Image scan'
              : 'Live surveillance feed'}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{currentZone.name}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400">
            {sourceMode === 'webcam' ? 'webcam:0' : sourceMode === 'image' ? 'upload' : currentZone.cameraId}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Source segmented control */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-[11px]">
            <button
              onClick={switchToDemo}
              className={`h-6 px-2 rounded flex items-center space-x-1 font-medium transition-colors ${
                sourceMode === 'demo'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Return to the simulated live feed"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Demo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanStatus === 'scanning' && sourceMode === 'image'}
              className={`h-6 px-2 rounded flex items-center space-x-1 font-medium transition-colors ${
                sourceMode === 'image'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Upload an image and run garbage detection"
            >
              {scanStatus === 'scanning' && sourceMode === 'image' ? (
                <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              <span>Upload</span>
            </button>

            <button
              onClick={startWebcam}
              className={`h-6 px-2 rounded flex items-center space-x-1 font-medium transition-colors ${
                sourceMode === 'webcam'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Scan a live webcam feed"
            >
              <Video className="w-3 h-3" />
              <span>Webcam</span>
            </button>
          </div>

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

      {/* Viewport */}
      <div className="relative w-full bg-zinc-900 overflow-hidden">
        {sourceMode === 'image' && (
          <div className="flex justify-center bg-black">
            <div className="relative inline-block max-w-full">
              {customMediaUrl ? (
                <img
                  src={customMediaUrl}
                  alt="Uploaded frame for garbage detection"
                  className="block max-h-[560px] w-auto max-w-full"
                />
              ) : (
                <div className="w-full min-w-[320px] aspect-video" />
              )}

              {showOverlays && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {overlays.map((box) => (
                    <div
                      key={box.id}
                      className="absolute border-2 border-sky-400 bg-sky-400/10"
                      style={{
                        left: `${box.coordinates.x}%`,
                        top: `${box.coordinates.y}%`,
                        width: `${box.coordinates.width}%`,
                        height: `${box.coordinates.height}%`,
                      }}
                    >
                      <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex items-center space-x-1.5 bg-sky-400 text-zinc-950">
                        <span>{box.label}</span>
                        <span className="opacity-90 tabular-nums font-mono">
                          {(box.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="absolute -bottom-5 left-0 px-1 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 tabular-nums whitespace-nowrap">
                        {box.footer}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.95)] animate-scanline" />
                </div>
              )}

              {telemetryOverlay}
            </div>
          </div>
        )}

        {sourceMode === 'webcam' && (
          <div className="flex justify-center bg-black">
            <div className="relative inline-block max-w-full">
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                className={`block max-h-[560px] w-auto max-w-full bg-black ${
                  webcamStatus === 'live' ? '' : 'hidden'
                }`}
              />

              {webcamStatus !== 'live' && (
                <div className="w-full min-w-[320px] aspect-video flex flex-col items-center justify-center px-6 text-center">
                  {webcamStatus === 'starting' ? (
                    <>
                      <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                      <div className="mt-2 text-xs font-medium text-zinc-100">Starting webcam…</div>
                      <div className="text-[11px] text-zinc-400">Allow camera access when prompted.</div>
                    </>
                  ) : (
                    <>
                      <CameraOff className="w-7 h-7 text-zinc-500" />
                      <div className="mt-2 text-xs font-medium text-zinc-100">
                        {webcamError ?? 'Webcam is off'}
                      </div>
                      <button
                        onClick={startWebcam}
                        className="mt-3 h-8 px-3 rounded-md text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors flex items-center space-x-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Enable webcam</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {showOverlays && webcamStatus === 'live' && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {overlays.map((box) => (
                    <div
                      key={box.id}
                      className="absolute border-2 border-red-500 bg-red-500/10"
                      style={{
                        left: `${box.coordinates.x}%`,
                        top: `${box.coordinates.y}%`,
                        width: `${box.coordinates.width}%`,
                        height: `${box.coordinates.height}%`,
                      }}
                    >
                      <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex items-center space-x-1.5 bg-red-500 text-white">
                        <span>{box.label}</span>
                        <span className="opacity-90 tabular-nums font-mono">
                          {(box.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {scanStatus === 'scanning' && webcamStatus === 'live' && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.95)] animate-scanline" />
                </div>
              )}

              {telemetryOverlay}
            </div>
          </div>
        )}

        {sourceMode === 'demo' && (
          <div className="relative w-full aspect-video">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${getZoneBackground()}')` }}
            />

            {showOverlays && (
              <div className="absolute inset-0 z-20 pointer-events-auto">
                {overlays.map((box) => (
                  <div
                    key={box.id}
                    className={`absolute border transition-all ${
                      box.breached
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
                    <div
                      className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex items-center space-x-1.5 ${
                        box.breached ? 'bg-red-500 text-white' : 'bg-amber-400 text-zinc-950'
                      }`}
                    >
                      <span>{box.label}</span>
                      <span className="opacity-90 tabular-nums font-mono">
                        {(box.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="absolute -bottom-5 left-0 px-1 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 tabular-nums whitespace-nowrap">
                      {box.footer}
                      {box.breached && <span className="text-red-400 font-semibold ml-1">SLA breach</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {telemetryOverlay}
          </div>
        )}
      </div>

      {/* Scan toolbar: confidence + auto toggles */}
      {isScanSource && (
        <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">Confidence</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(Number(e.target.value))}
                className="w-24 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-sky-400"
              />
              <span className="font-mono text-zinc-200 tabular-nums">
                {Math.round(confThreshold * 100)}%
              </span>
            </div>

            {sourceMode === 'webcam' && (
              <>
                <button
                  onClick={() => setAutoScan((value) => !value)}
                  className={`h-6 px-2 rounded border text-[11px] font-medium flex items-center space-x-1 transition-colors ${
                    autoScan
                      ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Continuously scan webcam frames"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-scan {autoScan ? 'on' : 'off'}</span>
                </button>

                <button
                  onClick={scanWebcamFrame}
                  disabled={webcamStatus !== 'live' || scanStatus === 'scanning'}
                  className="h-6 px-2 rounded border border-zinc-700 bg-zinc-800 text-zinc-100 text-[11px] font-medium flex items-center space-x-1 disabled:opacity-50 hover:bg-zinc-700 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  <span>Capture & scan</span>
                </button>
              </>
            )}

            <button
              onClick={() => setAutoTicket((value) => !value)}
              className={`h-6 px-2 rounded border text-[11px] font-medium flex items-center space-x-1 transition-colors ${
                autoTicket
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Automatically create cleaning tickets for strong detections"
            >
              <Ticket className="w-3 h-3" />
              <span>Auto-ticket {autoTicket ? 'on' : 'off'}</span>
            </button>

            {sourceMode === 'webcam' && autoTicketCount > 0 && (
              <span className="font-mono text-emerald-400">{autoTicketCount} auto-created</span>
            )}
          </div>

          <span className="font-mono text-zinc-500">
            {scanStatus === 'done' && scanResult
              ? `${detectionCount} detections · ${scanResult.inferenceMs} ms · ${scanResult.model}`
              : scanStatus === 'scanning'
              ? 'inference running…'
              : scanStatus === 'error'
              ? scanError
              : 'ready'}
          </span>
        </div>
      )}

      {/* Scan status strip */}
      {isScanSource && scanStatus === 'error' && (
        <div className="px-4 py-2 border-t border-amber-500/20 bg-amber-500/5 flex flex-wrap items-center gap-2 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-200">{scanError}</span>
          {scanHint && <span className="text-zinc-400">— {scanHint}</span>}
        </div>
      )}

      {/* Detection log */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>{isScanSource ? 'Scan results' : 'Live detection stream'}</span>
          <span className="font-mono text-zinc-400">
            {isScanSource
              ? scanStatus === 'done'
                ? `YOLOv8 · ${scanResult?.model}`
                : 'YOLOv8 inference'
              : 'YOLOv8 inference log'}
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60 max-h-48 overflow-y-auto">
          {overlays.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-zinc-500">
              {isScanSource
                ? scanStatus === 'scanning'
                  ? 'Analyzing frame…'
                  : sourceMode === 'webcam' && webcamStatus !== 'live'
                  ? 'Enable the webcam to begin detection.'
                  : 'No garbage detected. Try a clearer frame or lower the confidence threshold.'
                : 'No active detections.'}
            </div>
          )}

          {overlays.map((box) => (
            <div
              key={box.id}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-zinc-900/40 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isScanSource
                      ? sourceMode === 'webcam'
                        ? 'bg-red-500'
                        : 'bg-sky-400'
                      : box.breached
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <span className="font-medium text-zinc-200">{box.label}</span>
                  <span className="text-[11px] text-zinc-400 ml-2 font-mono">
                    {(box.confidence * 100).toFixed(1)}% confidence
                  </span>
                  <div className="mt-1 w-24 h-1 rounded bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-1 rounded ${
                        isScanSource
                          ? sourceMode === 'webcam'
                            ? 'bg-red-500'
                            : 'bg-sky-400'
                          : box.breached
                          ? 'bg-red-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, box.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {isScanSource ? (
                  <>
                    <span className="hidden sm:inline text-[11px] font-mono text-zinc-400 tabular-nums">
                      {Math.round(box.coordinates.width)}% × {Math.round(box.coordinates.height)}% of frame
                    </span>
                    {onCreateTicketFromDetection && (
                      <button
                        onClick={() => createTicket(box)}
                        className="h-6 px-2 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center space-x-1"
                      >
                        <Ticket className="w-3 h-3" />
                        <span>Create ticket</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-right text-[11px] font-mono text-zinc-400 tabular-nums">
                      <span>{box.footer}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span>{formatSeconds(persistenceThresholdSec)}</span>
                    </div>

                    {box.breached ? (
                      <button
                        onClick={() => {
                          const original = boundingBoxes.find((b) => b.id === box.id);
                          if (original) onTriggerTicketFromBox(original);
                        }}
                        className="h-6 px-2 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Dispatch staff
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">Monitoring</span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold Configuration Strip (demo feed only) */}
      {sourceMode === 'demo' && (
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
      )}
    </div>
  );
};
