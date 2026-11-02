import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DepartmentOnly } from '../types/schema';
import { createFieldPhotoSvgDataUri } from '../data/initialDatabase';
import {
  Camera,
  Upload,
  Pencil,
  ArrowUpRight,
  Square,
  Type,
  Undo2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  SwitchCamera,
  Sparkles,
} from 'lucide-react';

export type MarkupTool = 'pen' | 'arrow' | 'rect' | 'stamp';

export interface MarkupOperation {
  tool: MarkupTool;
  color: string;
  points: { x: number; y: number }[];
  stampText?: string;
}

interface PhotoCaptureAndMarkupStudioProps {
  pinCode: string;
  phase: 'BEFORE' | 'AFTER';
  department: DepartmentOnly;
  titleHint: string;
  coordX?: number;
  coordY?: number;
  initialImageUrl?: string | null;
  onImageReady: (compositeDataUrl: string) => void;
}

const MARKUP_COLORS = [
  { hex: '#DC2626', label: 'Red' },
  { hex: '#FACC15', label: 'Yellow' },
  { hex: '#16A34A', label: 'Green' },
  { hex: '#FFFFFF', label: 'White' },
];

const STAMP_PRESETS = [
  'DEMOLISH HERE',
  'LEAK SPOT',
  'CHECK GROUND / WIRE',
  'WALL CRACK',
  'FIXED / RESOLVED',
];

export const PhotoCaptureAndMarkupStudio: React.FC<
  PhotoCaptureAndMarkupStudioProps
> = ({
  pinCode,
  phase,
  department,
  titleHint,
  coordX,
  coordY,
  initialImageUrl,
  onImageReady,
}) => {
  // Mode Sumber Foto: 'template' | 'camera' | 'upload'
  const [sourceTab, setSourceTab] = useState<'markup' | 'camera'>('markup');
  const [baseImageSrc, setBaseImageSrc] = useState<string>(() => {
    return (
      initialImageUrl ||
      createFieldPhotoSvgDataUri(
        pinCode,
        phase,
        department,
        titleHint || 'Field Construction Pin Inspection'
      )
    );
  });

  // WebRTC Live Camera State
  const [isCameraStreaming, setIsCameraStreaming] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>(
    'environment'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Canvas Markup State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<MarkupTool>('arrow');
  const [activeColor, setActiveColor] = useState<string>('#DC2626');
  const [activeStamp, setActiveStamp] = useState<string>(STAMP_PRESETS[0]);
  const [operations, setOperations] = useState<MarkupOperation[]>([]);
  const [currentOp, setCurrentOp] = useState<MarkupOperation | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Stop camera stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Update default template when department or titleHint changes if user hasn't uploaded custom photo
  const handleRegenerateTemplate = () => {
    const generated = createFieldPhotoSvgDataUri(
      pinCode,
      phase,
      department,
      titleHint || 'Field Construction Pin Inspection'
    );
    setBaseImageSrc(generated);
    setOperations([]);
  };

  // Start WebRTC Camera
  const startCameraStream = async (facing: 'environment' | 'user') => {
    setCameraError(null);
    stopCameraStream();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support WebRTC getUserMedia.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 960 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      setIsCameraStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError(
        'Direct camera access is restricted by browser/iframe permissions. Use "Simulate Field Camera Capture" below or upload a photo from gallery.'
      );
      setIsCameraStreaming(false);
    }
  };

  const handleCaptureFromVideo = () => {
    if (videoRef.current && isCameraStreaming) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 520;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
        // Tambahkan HUD Timestamp Lapangan di sudut bawah
        ctx.fillStyle = 'rgba(20, 22, 25, 0.78)';
        ctx.fillRect(0, tempCanvas.height - 42, tempCanvas.width, 42);
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        const coordText =
          coordX !== undefined && coordY !== undefined
            ? ` · X:${coordX.toFixed(1)}% Y:${coordY.toFixed(1)}%`
            : '';
        ctx.fillText(
          `[VONTA CAM] ${pinCode} (${phase}) · ${department.toUpperCase()}${coordText} · ${new Date().toLocaleTimeString('en-US')}`,
          16,
          tempCanvas.height - 16
        );
        const capturedUrl = tempCanvas.toDataURL('image/png');
        setBaseImageSrc(capturedUrl);
        setOperations([]);
        stopCameraStream();
        setSourceTab('markup');
      }
    }
  };

  const handleSimulatedCameraCapture = () => {
    const simulatedSvg = createFieldPhotoSvgDataUri(
      pinCode,
      phase,
      department,
      `${titleHint || 'Field Issue'} (Camera Capture ${new Date().toLocaleTimeString('en-US')})`
    );
    setBaseImageSrc(simulatedSvg);
    setOperations([]);
    stopCameraStream();
    setSourceTab('markup');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBaseImageSrc(reader.result);
        setOperations([]);
        setSourceTab('markup');
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to draw a single operation onto a 2D canvas context
  const drawOperationOnContext = (
    ctx: CanvasRenderingContext2D,
    op: MarkupOperation
  ) => {
    if (op.points.length === 0) return;
    ctx.save();
    ctx.strokeStyle = op.color;
    ctx.fillStyle = op.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (op.tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(op.points[0].x, op.points[0].y);
      for (let i = 1; i < op.points.length; i++) {
        ctx.lineTo(op.points[i].x, op.points[i].y);
      }
      ctx.stroke();
    } else if (op.tool === 'arrow') {
      const start = op.points[0];
      const end = op.points[op.points.length - 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.hypot(dx, dy);
      if (len > 4) {
        const angle = Math.atan2(dy, dx);
        const headLen = 18;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLen * Math.cos(angle - Math.PI / 6),
          end.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          end.x - headLen * Math.cos(angle + Math.PI / 6),
          end.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    } else if (op.tool === 'rect') {
      const start = op.points[0];
      const end = op.points[op.points.length - 1];
      const rx = Math.min(start.x, end.x);
      const ry = Math.min(start.y, end.y);
      const rw = Math.abs(end.x - start.x);
      const rh = Math.abs(end.y - start.y);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = `${op.color}22`;
      ctx.fillRect(rx, ry, rw, rh);
    } else if (op.tool === 'stamp') {
      const pt = op.points[0];
      const text = op.stampText || 'CHECK THIS PIN';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      const metrics = ctx.measureText(text);
      const padX = 10;
      const boxW = metrics.width + padX * 2;
      const boxH = 30;
      const bx = Math.max(8, Math.min(800 - boxW - 8, pt.x - boxW / 2));
      const by = Math.max(8, Math.min(520 - boxH - 8, pt.y - boxH / 2));

      ctx.fillStyle = 'rgba(20, 22, 25, 0.88)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = op.color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = op.color;
      ctx.fillText(text, bx + padX, by + 20);
    }

    ctx.restore();
  };

  // Render composite canvas whenever baseImageSrc, operations, or currentOp changes
  const renderCanvas = useCallback(
    (exportToParent: boolean) => {
      const canvas = canvasRef.current;
      const img = loadedImageRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      for (const op of operations) {
        drawOperationOnContext(ctx, op);
      }
      if (currentOp) {
        drawOperationOnContext(ctx, currentOp);
      }

      if (exportToParent) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          onImageReady(dataUrl);
        } catch {
          onImageReady(baseImageSrc);
        }
      }
    },
    [operations, currentOp, baseImageSrc, onImageReady]
  );

  // Load baseImageSrc into HTMLImageElement
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      renderCanvas(true);
    };
    img.src = baseImageSrc;
  }, [baseImageSrc, renderCanvas]);

  useEffect(() => {
    if (loadedImageRef.current) {
      renderCanvas(!isDrawing);
    }
  }, [operations, currentOp, isDrawing, renderCanvas]);

  // Pointer coordinate converter on 800x520 canvas
  const getCanvasPoint = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Number(((e.clientX - rect.left) * scaleX).toFixed(1)),
      y: Number(((e.clientY - rect.top) * scaleY).toFixed(1)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (activeTool === 'stamp') {
      const stampOp: MarkupOperation = {
        tool: 'stamp',
        color: activeColor,
        points: [pt],
        stampText: activeStamp,
      };
      setOperations((prev) => [...prev, stampOp]);
      return;
    }

    setIsDrawing(true);
    setCurrentOp({
      tool: activeTool,
      color: activeColor,
      points: [pt, pt],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentOp) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (currentOp.tool === 'pen') {
      setCurrentOp({
        ...currentOp,
        points: [...currentOp.points, pt],
      });
    } else {
      setCurrentOp({
        ...currentOp,
        points: [currentOp.points[0], pt],
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentOp) return;
    setIsDrawing(false);
    setOperations((prev) => [...prev, currentOp]);
    setCurrentOp(null);
  };

  return (
    <div className="rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden space-y-3 p-3.5">
      {/* Top Bar: Pilih Kamera Live vs Kanvas Coretan Markup */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E2E6EC] dark:border-slate-800">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase text-[#D97706]">
            FIELD PHOTO &amp; MARKUP STUDIO ({phase})
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Capture live photo or draw arrows/boxes on the image so workers know the exact spot.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setSourceTab('camera');
              startCameraStream(cameraFacingMode);
            }}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              sourceTab === 'camera'
                ? 'bg-[#1B365D] text-white dark:bg-[#38BDF8] dark:text-slate-950'
                : 'bg-[#F8F7F4] dark:bg-slate-800 text-[#141619] dark:text-slate-200 border border-[#E2E6EC] dark:border-slate-700'
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Open Live Camera</span>
          </button>

          <label className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-[#F8F7F4] dark:bg-slate-800 text-[#141619] dark:text-slate-200 border border-[#E2E6EC] dark:border-slate-700 cursor-pointer hover:border-[#1B365D] transition-colors">
            <Upload className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>Choose Gallery File</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleRegenerateTemplate}
            title="Generate simulated construction visual from title"
            className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[#F8F7F4] dark:bg-slate-800 text-[#141619] dark:text-slate-200 border border-[#E2E6EC] dark:border-slate-700 hover:border-[#1B365D]"
          >
            <Sparkles className="w-4 h-4 text-[#1B365D] dark:text-[#38BDF8] shrink-0" />
            <span>Auto CAD Visual</span>
          </button>
        </div>
      </div>

      {/* MODE 1: WEBRTC LIVE CAMERA CAPTURE */}
      {sourceTab === 'camera' && (
        <div className="space-y-3">
          <div className="relative w-full aspect-[16/10] rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isCameraStreaming ? 'block' : 'hidden'
              }`}
            />

            {!isCameraStreaming && (
              <div className="p-6 text-center max-w-md space-y-3">
                <Camera className="w-10 h-10 text-[#FCD34D] mx-auto" />
                <p className="text-xs text-slate-200 font-medium">
                  {cameraError ||
                    'Initializing device camera sensor for project pin documentation...'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulatedCameraCapture}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Simulate Field Camera Capture Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setSourceTab('markup');
                    }}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Back to Markup Canvas
                  </button>
                </div>
              </div>
            )}

            {/* Camera Viewfinder HUD Overlay */}
            {isCameraStreaming && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[11px] font-mono bg-black/60 text-white px-2.5 py-1 rounded">
                  <span>
                    CAMERA ACTIVE · {pinCode} ({phase})
                  </span>
                  <span>
                    {coordX !== undefined && coordY !== undefined
                      ? `X:${coordX.toFixed(1)}% Y:${coordY.toFixed(1)}%`
                      : department.toUpperCase()}
                  </span>
                </div>
                <div className="border border-dashed border-[#FCD34D]/60 w-3/4 h-3/4 mx-auto my-auto rounded-lg" />
              </div>
            )}
          </div>

          {isCameraStreaming && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextFacing =
                    cameraFacingMode === 'environment' ? 'user' : 'environment';
                  setCameraFacingMode(nextFacing);
                  startCameraStream(nextFacing);
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>Switch Camera (Front/Rear)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setSourceTab('markup');
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCaptureFromVideo}
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs sm:text-sm font-bold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo &amp; Continue Markup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: INTERACTIVE PHOTO MARKUP STUDIO (CORETAN ANOTASI GAMBAR) */}
      {sourceTab === 'markup' && (
        <div className="space-y-3">
          {/* Toolbar Alat Coretan & Warna */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8F7F4] dark:bg-slate-800/90 p-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700">
            {/* Alat Coretan */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTool('arrow')}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTool === 'arrow'
                    ? 'bg-[#1B365D] text-white dark:bg-[#38BDF8] dark:text-slate-950'
                    : 'text-[#141619] dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                <span>Arrow</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rect')}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTool === 'rect'
                    ? 'bg-[#1B365D] text-white dark:bg-[#38BDF8] dark:text-slate-950'
                    : 'text-[#141619] dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700'
                }`}
              >
                <Square className="w-4 h-4 shrink-0" />
                <span>Area Box</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTool === 'pen'
                    ? 'bg-[#1B365D] text-white dark:bg-[#38BDF8] dark:text-slate-950'
                    : 'text-[#141619] dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700'
                }`}
              >
                <Pencil className="w-4 h-4 shrink-0" />
                <span>Freehand</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('stamp')}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTool === 'stamp'
                    ? 'bg-[#1B365D] text-white dark:bg-[#38BDF8] dark:text-slate-950'
                    : 'text-[#141619] dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700'
                }`}
              >
                <Type className="w-4 h-4 shrink-0" />
                <span>Text Stamp</span>
              </button>
            </div>

            {/* Pilihan Warna & Undo/Clear */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {MARKUP_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setActiveColor(c.hex)}
                  aria-label={`Markup color ${c.label}`}
                  title={`Markup color ${c.label}`}
                  className={`min-h-[44px] min-w-[44px] rounded-md border flex items-center justify-center transition-transform ${
                    activeColor === c.hex
                      ? 'ring-2 ring-[#D97706] scale-105 border-[#141619] dark:border-white'
                      : 'border-slate-300 dark:border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/30"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setOperations((prev) => prev.slice(0, -1))}
                disabled={operations.length === 0}
                title="Undo last stroke"
                aria-label="Undo last stroke"
                className="min-h-[44px] px-2.5 py-1.5 rounded-md border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700"
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={() => setOperations([])}
                disabled={operations.length === 0}
                title="Clear all markup"
                aria-label="Clear all markup"
                className="min-h-[44px] px-2.5 py-1.5 rounded-md border border-[#DC2626]/40 text-[#DC2626] text-xs font-semibold flex items-center gap-1 disabled:opacity-40 hover:bg-[#DC2626]/10"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Pilihan Teks Cap jika alat 'stamp' aktif */}
          {activeTool === 'stamp' && (
            <div className="flex items-center gap-1.5 flex-wrap px-2 py-1.5 rounded-lg bg-[#1B365D]/10 dark:bg-slate-800 text-xs">
              <span className="font-mono font-bold text-[#1B365D] dark:text-[#38BDF8] mr-1">
                SELECT TEXT STAMP (CLICK ON PHOTO):
              </span>
              {STAMP_PRESETS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveStamp(st)}
                  className={`min-h-[38px] px-2.5 py-1 rounded font-mono text-[11px] font-bold transition-colors ${
                    activeStamp === st
                      ? 'bg-[#D97706] text-white'
                      : 'bg-white dark:bg-slate-900 text-[#141619] dark:text-slate-200 border border-[#E2E6EC] dark:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          {/* Kanvas Gambar Interaktif */}
          <div className="relative w-full rounded-lg border-2 border-[#1B365D] dark:border-[#38BDF8] overflow-hidden bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={520}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-auto block touch-none cursor-crosshair select-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {operations.length > 0
                  ? `${operations.length} markup annotations applied to photo ${pinCode}`
                  : 'Drag finger / mouse across the photo to add arrows or highlight boxes'}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>RESOLUTION: 800x520 PX</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
