import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BlueprintRecord,
  PinRecord,
  PinStatus,
  GlobalRole,
  SpecialtyDepartment,
  MaterialAllocationRecord,
  DivisionRecord,
} from '../types/schema';
import { getDepartmentMeta, PIN_STATUS_META } from '../data/initialDatabase';
import {
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Crosshair,
  Move,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';

interface SpatialBlueprintCanvasProps {
  blueprint: BlueprintRecord | undefined;
  pins: PinRecord[];
  selectedPinId: string | null;
  onSelectPin: (pinId: string) => void;
  activeRole: GlobalRole;
  canvasMode: '2.5d' | '2d';
  onChangeCanvasMode: (mode: '2.5d' | '2d') => void;
  isPlacementMode: boolean;
  onTogglePlacementMode: () => void;
  onRequestCreatePinAtCoord: (coordX: number, coordY: number) => void;
  onRepositionPinCoord?: (
    pinId: string,
    coordX: number,
    coordY: number
  ) => void;
  isAreaLoading: boolean;
  simulatedUiState: 'normal' | 'loading' | 'empty' | 'error';
  onResetSimulatedState: () => void;
  activeDepartmentFilter: SpecialtyDepartment;
  onChangeDepartmentFilter?: (dept: SpecialtyDepartment) => void;
  divisions?: DivisionRecord[];
  selectedPinAllocations?: MaterialAllocationRecord[];
  onOpenPinVerification?: (pinId: string) => void;
  onOpenUploadBlueprintModal?: () => void;
}

export const SpatialBlueprintCanvas: React.FC<SpatialBlueprintCanvasProps> = ({
  blueprint,
  pins,
  selectedPinId,
  onSelectPin,
  activeRole,
  canvasMode,
  onChangeCanvasMode,
  isPlacementMode,
  onTogglePlacementMode,
  onRequestCreatePinAtCoord,
  onRepositionPinCoord,
  isAreaLoading,
  simulatedUiState,
  onResetSimulatedState,
  activeDepartmentFilter,
  onChangeDepartmentFilter,
  divisions,
  onOpenPinVerification,
  onOpenUploadBlueprintModal,
}) => {
  // 2.5D Interactive Perspective State
  const [tiltPitch, setTiltPitch] = useState<number>(52);
  const [orbitRotation, setOrbitRotation] = useState<number>(-18);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isDraggingOrbit, setIsDraggingOrbit] = useState<boolean>(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  // Filter status cepat & tabel daftar titik area
  const [statusFilter, setStatusFilter] = useState<'all' | PinStatus>('all');
  const [showCadLaser, setShowCadLaser] = useState<boolean>(true);
  const [showAreaPinTable, setShowAreaPinTable] = useState<boolean>(false);
  const [repositioningPinId, setRepositioningPinId] = useState<string | null>(
    null
  );

  const dragStartRef = useRef<{
    x: number;
    y: number;
    rot: number;
    pitch: number;
  } | null>(null);
  const planeRef = useRef<HTMLDivElement | null>(null);

  const isLeader = activeRole === 'owner' || activeRole === 'mandor';
  const isWorker = activeRole === 'worker';

  useEffect(() => {
    setImgLoadError(false);
    setRepositioningPinId(null);
  }, [blueprint?.id]);

  useEffect(() => {
    setRepositioningPinId(null);
  }, [selectedPinId]);

  // Hanya tampilkan titik yang belum di-Approve (status !== 'resolved'); titik Approve masuk ke halaman History
  const activeCanvasPins = useMemo(
    () => pins.filter((pin) => pin.status !== 'resolved'),
    [pins]
  );

  const visibleCanvasPins = useMemo(() => {
    return activeCanvasPins.filter((pin) => {
      if (statusFilter !== 'all' && pin.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [activeCanvasPins, statusFilter]);

  const selectedPin = useMemo(
    () => activeCanvasPins.find((p) => p.id === selectedPinId) || null,
    [activeCanvasPins, selectedPinId]
  );

  const statusCounts = useMemo(() => {
    return {
      all: activeCanvasPins.length,
      open: activeCanvasPins.filter(
        (p) => p.status === 'open' || p.status === 'reopened'
      ).length,
      in_progress: activeCanvasPins.filter((p) => p.status === 'in_progress')
        .length,
      in_preview: activeCanvasPins.filter((p) => p.status === 'in_preview')
        .length,
    };
  }, [activeCanvasPins]);

  const handleResetCamera = () => {
    setTiltPitch(canvasMode === '2.5d' ? 52 : 0);
    setOrbitRotation(canvasMode === '2.5d' ? -18 : 0);
    setZoomScale(1);
  };

  const handleCycleTilt = () => {
    setTiltPitch((prev) => {
      if (prev === 52) return 28;
      if (prev === 28) return 64;
      return 52;
    });
  };

  const handleRotate90 = () => {
    setOrbitRotation((prev) => {
      const next = prev + 90;
      return next > 180 ? next - 360 : next;
    });
  };

  const computePlaneCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    if (!planeRef.current) return null;
    const rect = planeRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(4, Math.min(96, Number(rawX.toFixed(2))));
    const clampedY = Math.max(4, Math.min(96, Number(rawY.toFixed(2))));
    return { x: clampedX, y: clampedY };
  };

  const handlePlaneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLeader) return;

    if (repositioningPinId && onRepositionPinCoord) {
      e.stopPropagation();
      const coords = computePlaneCoordinates(e.clientX, e.clientY);
      if (coords) {
        onRepositionPinCoord(repositioningPinId, coords.x, coords.y);
        setRepositioningPinId(null);
        setHoverCoord(null);
      }
      return;
    }

    if (isPlacementMode) {
      e.stopPropagation();
      const coords = computePlaneCoordinates(e.clientX, e.clientY);
      if (coords) {
        onRequestCreatePinAtCoord(coords.x, coords.y);
      }
    }
  };

  const handlePlanePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLeader && (isPlacementMode || repositioningPinId)) {
      const coords = computePlaneCoordinates(e.clientX, e.clientY);
      setHoverCoord(coords);
    } else if (hoverCoord) {
      setHoverCoord(null);
    }
  };

  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (canvasMode !== '2.5d' || isPlacementMode || repositioningPinId) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDraggingOrbit(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: orbitRotation,
      pitch: tiltPitch,
    };
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingOrbit || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const nextRot = Math.max(
      -180,
      Math.min(180, Math.round(dragStartRef.current.rot + deltaX * 0.45))
    );
    const nextPitch = Math.max(
      20,
      Math.min(68, Math.round(dragStartRef.current.pitch - deltaY * 0.25))
    );
    setOrbitRotation(nextRot);
    setTiltPitch(nextPitch);
  };

  const handleContainerPointerUp = () => {
    setIsDraggingOrbit(false);
    dragStartRef.current = null;
  };

  if (isAreaLoading || simulatedUiState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] p-6 text-center">
        <RefreshCw className="w-6 h-6 text-[#1B365D] dark:text-[#D97706] animate-spin mb-3" />
        <p className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
          Loading Floor Plan...
        </p>
      </div>
    );
  }

  if (simulatedUiState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] rounded-[8px] border border-[#DC2626]/40 bg-[#F8F7F4] dark:bg-[#0F141C] p-6 text-center">
        <AlertTriangle className="w-6 h-6 text-[#DC2626] mb-3" />
        <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
          Failed to Load Floor Plan
        </h3>
        <button
          type="button"
          onClick={onResetSimulatedState}
          className="mt-3 h-9 px-4 rounded-[6px] bg-[#1B365D] text-white text-[13px] font-medium"
        >
          Reload Floor Plan
        </button>
      </div>
    );
  }

  if (!blueprint || simulatedUiState === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] rounded-[8px] border border-dashed border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] p-6 text-center">
        <Layers className="w-6 h-6 text-[#1B365D] dark:text-[#D97706] mb-3" />
        <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
          No Floor Plan in This Area
        </h3>
        {simulatedUiState === 'empty' && (
          <button
            type="button"
            onClick={onResetSimulatedState}
            className="mt-3 h-9 px-4 rounded-[6px] bg-[#B45309] text-white text-[13px] font-medium"
          >
            Restore Floor Plan
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* 1. PANGGUNG KANVAS 2.5D / 2D DENGAN FLOATING OVERLAY TOOLBAR */}
      <div
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerCancel={handleContainerPointerUp}
        className={`relative flex-1 min-h-[440px] rounded-xl border border-[#E2E6EC] dark:border-[#263346] shadow-2xs flex items-center justify-center overflow-hidden select-none touch-none ${
          canvasMode === '2.5d'
            ? 'bg-gradient-to-b from-[#ECEAE4] to-[#DFDDD6] dark:from-[#0B1017] dark:to-[#0F141C]'
            : 'bg-[#F8F7F4] dark:bg-[#0F141C]'
        } ${
          isPlacementMode || repositioningPinId
            ? 'cursor-crosshair'
            : canvasMode === '2.5d'
            ? isDraggingOrbit
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{
          perspective: canvasMode === '2.5d' ? '1300px' : 'none',
        }}
      >
        {/* FLOATING OVERLAY TOOLBAR DI DALAM BINGKAI ATAS KANVAS */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Kiri: Sakelar 3D / 2D + Dropdown Filter Departemen/Divisi */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-white/95 dark:bg-[#161F2C]/95 backdrop-blur-xs p-1 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] shadow-xs">
            {/* Sakelar 3D / 2D */}
            <div
              role="group"
              aria-label="3D or 2D floor plan mode"
              className="inline-flex rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] p-0.5 border border-[#E2E6EC] dark:border-[#263346]"
            >
              <button
                type="button"
                onClick={() => {
                  onChangeCanvasMode('2.5d');
                  setTiltPitch(52);
                  setOrbitRotation(-18);
                }}
                className={`h-7 px-2.5 rounded-[4px] text-[12px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
                  canvasMode === '2.5d'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeCanvasMode('2d')}
                className={`h-7 px-2.5 rounded-[4px] text-[12px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
                  canvasMode === '2d'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>2D</span>
              </button>
            </div>

            <div className="h-4 w-px bg-[#E2E6EC] dark:bg-[#263346] mx-0.5" />

            {/* Dropdown Filter Departemen / Divisi (Tanpa Semua Divisi) */}
            <select
              aria-label="Filter by division"
              value={
                activeDepartmentFilter === 'all'
                  ? divisions?.[0]?.code || 'listrik'
                  : activeDepartmentFilter
              }
              disabled={isWorker && activeDepartmentFilter !== 'all'}
              onChange={(e) =>
                onChangeDepartmentFilter &&
                onChangeDepartmentFilter(e.target.value as SpecialtyDepartment)
              }
              className="h-7 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1B365D]"
            >
              {(divisions && divisions.length > 0
                ? divisions
                : [
                    { code: 'listrik', short_label: 'Electrical' },
                    { code: 'pipa', short_label: 'Plumbing' },
                    { code: 'sipil', short_label: 'Civil' },
                    { code: 'cat', short_label: 'Finishing' },
                  ]
              ).map((div) => (
                <option key={div.code} value={div.code}>
                  Division: {div.short_label}
                </option>
              ))}
            </select>
          </div>

          {/* Kanan: Kontrol Kamera/Zoom/Tilt Ringkas + Tombol Brass "+ Tancapkan Pin" */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-0.5 bg-white/95 dark:bg-[#161F2C]/95 backdrop-blur-xs p-1 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setZoomScale((z) =>
                    Math.max(0.65, Number((z - 0.15).toFixed(2)))
                  )
                }
                aria-label="Zoom out"
                title="Zoom out"
                className="h-7 w-7 flex items-center justify-center rounded-[4px] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] tabular-nums px-1.5 text-[#141619] dark:text-[#F8FAFC]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoomScale((z) =>
                    Math.min(1.6, Number((z + 0.15).toFixed(2)))
                  )
                }
                aria-label="Zoom in"
                title="Zoom in"
                className="h-7 w-7 flex items-center justify-center rounded-[4px] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {canvasMode === '2.5d' && (
                <button
                  type="button"
                  onClick={handleCycleTilt}
                  title="Change 3D tilt angle"
                  className="h-7 px-2 rounded-[4px] font-mono text-[11px] tabular-nums text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
                >
                  Tilt {tiltPitch}°
                </button>
              )}

              <button
                type="button"
                onClick={handleRotate90}
                aria-label="Rotate floor plan 90 degrees"
                title="Rotate 90°"
                className="h-7 w-7 flex items-center justify-center rounded-[4px] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowCadLaser((v) => !v)}
                aria-label="Toggle X/Y crosshair"
                title="X/Y coordinate crosshair"
                className={`h-7 w-7 flex items-center justify-center rounded-[4px] ${
                  showCadLaser
                    ? 'text-[#B45309] dark:text-[#D97706] bg-[#B45309]/10'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>

              {isLeader && selectedPin && onRepositionPinCoord && (
                <button
                  type="button"
                  onClick={() =>
                    setRepositioningPinId((prev) =>
                      prev === selectedPin.id ? null : selectedPin.id
                    )
                  }
                  title="Move selected pin"
                  className={`h-7 px-2 rounded-[4px] text-[11px] font-medium flex items-center gap-1 ${
                    repositioningPinId === selectedPin.id
                      ? 'bg-[#DC2626] text-white'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                  }`}
                >
                  <Move className="w-3 h-3" />
                  <span>
                    {repositioningPinId === selectedPin.id ? 'Cancel' : 'Move'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetCamera}
                aria-label="Reset camera"
                title="Reset camera"
                className="h-7 w-7 flex items-center justify-center rounded-[4px] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLeader && (
              <button
                type="button"
                onClick={() => {
                  setRepositioningPinId(null);
                  onTogglePlacementMode();
                }}
                className={`h-9 px-3.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 ${
                  isPlacementMode
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#B45309] hover:bg-[#92400E] text-white'
                }`}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>
                  {isPlacementMode ? 'Cancel Pin' : 'Pin'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Status Indicator Kecil saat Mode Tancap / Geser Aktif */}
        {isLeader && (isPlacementMode || repositioningPinId) && (
          <div className="absolute bottom-3 left-3 z-30 px-3 py-1.5 rounded-[6px] bg-[#141619]/90 text-white text-[12px] font-mono flex items-center gap-2 pointer-events-none">
            <span>
              {repositioningPinId
                ? `Click new position for pin ${selectedPin?.pin_code}`
                : 'Click on the floor plan to place a new pin'}
            </span>
            {hoverCoord && (
              <span className="text-[#FCD34D] tabular-nums">
                X:{hoverCoord.x.toFixed(1)}% Y:{hoverCoord.y.toFixed(1)}%
              </span>
            )}
          </div>
        )}

        {/* BIDANG DENAH BLUEPRINT (2.5D TILTED ATAU 2D DATAR) */}
        <div
          ref={planeRef}
          onClick={handlePlaneClick}
          onPointerMove={handlePlanePointerMove}
          className="relative w-[90%] max-w-[820px] aspect-[10/7] rounded-[8px] border-2 border-[#1B365D] dark:border-[#263346] bg-[#F8F7F4] shadow-xl transition-transform duration-150 ease-out"
          style={{
            transformStyle: canvasMode === '2.5d' ? 'preserve-3d' : 'flat',
            transform:
              canvasMode === '2.5d'
                ? `scale(${zoomScale}) rotateX(${tiltPitch}deg) rotateZ(${orbitRotation}deg)`
                : `scale(${zoomScale})`,
          }}
        >
          {canvasMode === '2.5d' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[8px] border border-[#1B365D]/40 bg-[#1B365D]/15"
              style={{
                transform: 'translateZ(-10px)',
              }}
            />
          )}

          {!imgLoadError ? (
            <img
              src={blueprint.image_url}
              alt={`Floor plan ${blueprint.area_name}`}
              referrerPolicy="no-referrer"
              onError={() => setImgLoadError(true)}
              draggable={false}
              className="w-full h-full object-cover rounded-[6px] pointer-events-none select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F7F4] text-[#1B365D] p-6 text-center">
              <Layers className="w-8 h-8 mb-2 text-[#1B365D]" />
              <p className="font-semibold text-[14px]">{blueprint.area_name}</p>
            </div>
          )}

          {/* CAD Laser Crosshair Lines */}
          {showCadLaser && selectedPin && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-[#B45309] z-10"
                style={{ left: `${selectedPin.coord_x}%` }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[#B45309] z-10"
                style={{ top: `${selectedPin.coord_y}%` }}
              />
            </>
          )}

          {/* Crosshair Preview */}
          {isLeader && (isPlacementMode || repositioningPinId) && hoverCoord && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                left: `${hoverCoord.x}%`,
                top: `${hoverCoord.y}%`,
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#B45309] bg-[#B45309]/25 flex items-center justify-center animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B45309] border border-white" />
              </div>
            </div>
          )}

          {/* Render Seluruh Pilar Pin di Atas Denah */}
          {visibleCanvasPins.map((pin) => {
            const isSelected = pin.id === selectedPinId;
            const statusMeta = PIN_STATUS_META[pin.status];
            const deptMeta = getDepartmentMeta(pin.department, divisions);
            const isGhostPin = pin.status === 'reopened';

            if (canvasMode === '2.5d') {
              return (
                <div
                  key={pin.id}
                  style={{
                    left: `${pin.coord_x}%`,
                    top: `${pin.coord_y}%`,
                    transformStyle: 'preserve-3d',
                  }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                >
                  {isGhostPin && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#9333EA] bg-[#9333EA]/30 animate-ghost-ring"
                    />
                  )}

                  <div
                    aria-hidden="true"
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      isSelected ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                      borderColor: statusMeta.hex,
                      backgroundColor: `${statusMeta.hex}33`,
                      boxShadow: `0 0 12px ${statusMeta.hex}`,
                    }}
                  />

                  <div
                    style={{
                      transformOrigin: 'bottom center',
                      transform: `translateX(-50%) rotateZ(${-orbitRotation}deg) rotateX(${-tiltPitch}deg)`,
                    }}
                    className="absolute bottom-3 left-1/2 flex flex-col items-center"
                  >
                    {pin.delete_requested_by_mandor && (
                      <span className="mb-1 px-1.5 py-0.5 rounded bg-[#B45309] text-white font-mono text-[9px] font-bold tracking-wider uppercase border border-white whitespace-nowrap">
                        DELETE REQ
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPin(pin.id);
                        if (onOpenPinVerification) {
                          onOpenPinVerification(pin.id);
                        }
                      }}
                      aria-label={`Pin ${pin.pin_code} ${pin.title}`}
                      className={`min-h-[40px] min-w-[50px] px-2 py-1 rounded-[6px] border-2 text-white shadow-lg flex flex-col items-center justify-center transition-transform ${
                        isSelected
                          ? 'scale-115 ring-3 ring-[#B45309] z-30'
                          : 'hover:scale-105'
                      } ${isGhostPin ? 'animate-ghost-pin' : ''}`}
                      style={{
                        backgroundColor: statusMeta.hex,
                        borderColor: '#FFFFFF',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] font-bold tabular-nums">
                          {pin.pin_code}
                        </span>
                        {pin.priority === 'urgent' && (
                          <span className="font-mono text-[10px] font-bold bg-black/30 px-1 rounded">
                            !
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] leading-none opacity-95 mt-0.5">
                        {deptMeta.code}
                      </span>
                    </button>

                    <div
                      aria-hidden="true"
                      className="w-1.5 h-9 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom, ${statusMeta.hex}, ${statusMeta.hex}40)`,
                        boxShadow: `0 0 8px ${statusMeta.hex}`,
                      }}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pin.id}
                style={{
                  left: `${pin.coord_x}%`,
                  top: `${pin.coord_y}%`,
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPin(pin.id);
                    if (onOpenPinVerification) {
                      onOpenPinVerification(pin.id);
                    }
                  }}
                  aria-label={`Pin ${pin.pin_code} ${pin.title}`}
                  className={`min-h-[40px] min-w-[48px] px-2 py-1 rounded-[6px] border-2 text-white shadow-md flex flex-col items-center justify-center transition-transform ${
                    isSelected
                      ? 'scale-115 ring-3 ring-[#B45309] z-30'
                      : 'hover:scale-105'
                  } ${isGhostPin ? 'animate-ghost-pin' : ''}`}
                  style={{
                    backgroundColor: statusMeta.hex,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    {pin.pin_code}
                  </span>
                  <span className="font-mono text-[9px] leading-none mt-0.5">
                    {deptMeta.code}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BAR BAWAH BINGKAI KANVAS 2.5D (SEPERTI BAR JUDUL VIDEO YOUTUBE LIVE) */}
      <div className="px-4 py-3 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Kiri: Nama Area Aktif */}
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#1B365D] dark:text-[#D97706] shrink-0" />
          <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
            {blueprint.area_name}
          </h2>
          {isLeader && onOpenUploadBlueprintModal && (
            <button
              type="button"
              onClick={onOpenUploadBlueprintModal}
              className="h-7 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC] flex items-center gap-1 transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span> New Area</span>
            </button>
          )}
        </div>

        {/* Tengah: Indikator Filter Cepat Status Pin (Semua, Reported, On Progress, In Preview - Tanpa Ghost) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              {
                id: 'all',
                label: `All ${statusCounts.all}`,
                activeBg: 'bg-[#1B365D] text-white',
              },
              {
                id: 'open',
                label: `Open ${statusCounts.open}`,
                activeBg: 'bg-[#DC2626] text-white',
              },
              {
                id: 'in_progress',
                label: `In progress ${statusCounts.in_progress}`,
                activeBg: 'bg-[#CA8A04] text-white',
              },
              {
                id: 'in_preview',
                label: `Pending review ${statusCounts.in_preview}`,
                activeBg: 'bg-[#0284C7] text-white',
              },
            ] as const
          ).map((st) => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`h-7 px-2.5 rounded-[6px] text-[12px] font-mono font-medium tabular-nums transition-colors ${
                  isActive
                    ? st.activeBg
                    : 'bg-[#F8F7F4] dark:bg-[#0F141C] text-[#475569] dark:text-[#94A3B8] border border-[#E2E6EC] dark:border-[#263346] hover:text-[#141619] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Kanan: Tombol Membuka/Menyembunyikan Tabel Ringkas "Daftar Titik Area Ini" */}
        <button
          type="button"
          onClick={() => setShowAreaPinTable((v) => !v)}
          className="h-8 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC] flex items-center gap-1.5 hover:border-[#1B365D] transition-colors"
        >
          <span>Pins in This Area ({visibleCanvasPins.length})</span>
          {showAreaPinTable ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* 3. COLLAPSIBLE TABEL RINGKAS "DAFTAR TITIK AREA INI" */}
      {showAreaPinTable && (
        <div className="rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EC] dark:border-[#263346] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70">
                <th className="py-2 px-3">Pin</th>
                <th className="py-2 px-3">Task</th>
                <th className="py-2 px-3">Division</th>
                <th className="py-2 px-3">Revisions</th>
                <th className="py-2 px-3 text-right">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
              {visibleCanvasPins.map((pin) => {
                const isSelected = pin.id === selectedPinId;
                const stMeta = PIN_STATUS_META[pin.status];
                return (
                  <tr
                    key={pin.id}
                    onClick={() => {
                      onSelectPin(pin.id);
                      if (onOpenPinVerification) {
                        onOpenPinVerification(pin.id);
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#1B365D]/10 dark:bg-[#1B365D]/30'
                        : 'hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-semibold tabular-nums">
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[11px]"
                        style={{ backgroundColor: stMeta.hex }}
                      >
                        {pin.pin_code}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-[#141619] dark:text-[#F8FAFC] truncate max-w-[260px]">
                      {pin.title}
                    </td>
                    <td className="py-2 px-3 text-[#475569] dark:text-[#94A3B8]">
                      {getDepartmentMeta(pin.department, divisions).shortLabel}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-[12px]">
                      R-0{pin.revision_count}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[12px] text-[#475569] dark:text-[#94A3B8]">
                      {pin.coord_x}%, {pin.coord_y}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
