import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BlueprintRecord,
  MaterialAllocationRecord,
  PinRecord,
  ProjectRecord,
  SpecialtyDepartment,
} from '../types/schema';
import { DEPARTMENT_META, PIN_STATUS_META } from '../data/initialDatabase';
import { calculateBastMaterialAuditSummary } from '../utils/vontaAnalytics';
import {
  Printer,
  X,
  FileCheck2,
  Map,
  ShoppingCart,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  PenTool,
  Download,
  Filter,
  ShieldCheck,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface CustomPrintBastModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRecord;
  activeBlueprint: BlueprintRecord | undefined;
  pins: PinRecord[];
  materialAllocations: MaterialAllocationRecord[];
  activeDepartmentFilter: SpecialtyDepartment;
}

type PrintDocumentMode = 'bast_full' | 'blueprint_map' | 'shopping_list';
type BastPinScopeFilter = 'all' | 'resolved_only' | 'issues_only';
type SignatureParty = 'mandor' | 'worker' | 'owner';

export const CustomPrintBastModal: React.FC<CustomPrintBastModalProps> = ({
  isOpen,
  onClose,
  project,
  activeBlueprint,
  pins,
  materialAllocations,
  activeDepartmentFilter,
}) => {
  const [printMode, setPrintMode] = useState<PrintDocumentMode>('bast_full');
  const [bastPinScope, setBastPinScope] = useState<BastPinScopeFilter>('all');
  const [includePinsOnBlueprint, setIncludePinsOnBlueprint] = useState(true);
  const [includeMaterialAuditInBast, setIncludeMaterialAuditInBast] =
    useState(true);
  const [includePhotosInBast, setIncludePhotosInBast] = useState(true);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<
    string | null
  >(null);

  // Interactive Signature Pad Refs (3 Pihak: Mandor, Perwakilan Tukang, Owner)
  const mandorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ownerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawingMandor, setIsDrawingMandor] = useState(false);
  const [isDrawingWorker, setIsDrawingWorker] = useState(false);
  const [isDrawingOwner, setIsDrawingOwner] = useState(false);

  const [mandorSigned, setMandorSigned] = useState(true);
  const [workerSigned, setWorkerSigned] = useState(true);
  const [ownerSigned, setOwnerSigned] = useState(true);

  const [mandorSignerName, setMandorSignerName] = useState(
    'Hendra Wijaya, S.T.'
  );
  const [workerSignerName, setWorkerSignerName] = useState(
    'Budi Pratama (Lead Worker)'
  );
  const [ownerSignerName, setOwnerSignerName] = useState('Ir. Bagus Pratama');

  const getCanvasByParty = (
    party: SignatureParty
  ): HTMLCanvasElement | null => {
    if (party === 'mandor') return mandorCanvasRef.current;
    if (party === 'worker') return workerCanvasRef.current;
    return ownerCanvasRef.current;
  };

  const drawSimulatedSignature = (party: SignatureParty) => {
    const canvas = getCanvasByParty(party);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1B365D';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (party === 'mandor') {
      ctx.beginPath();
      ctx.moveTo(22, 68);
      ctx.bezierCurveTo(48, 16, 75, 82, 108, 32);
      ctx.bezierCurveTo(132, 14, 152, 65, 198, 42);
      ctx.moveTo(35, 76);
      ctx.lineTo(175, 64);
      ctx.stroke();
      setMandorSigned(true);
    } else if (party === 'worker') {
      ctx.beginPath();
      ctx.moveTo(28, 62);
      ctx.bezierCurveTo(56, 22, 88, 74, 118, 30);
      ctx.bezierCurveTo(140, 20, 165, 66, 202, 38);
      ctx.moveTo(42, 74);
      ctx.lineTo(182, 68);
      ctx.stroke();
      setWorkerSigned(true);
    } else {
      ctx.beginPath();
      ctx.moveTo(30, 64);
      ctx.bezierCurveTo(64, 18, 92, 78, 126, 26);
      ctx.bezierCurveTo(154, 15, 174, 70, 210, 35);
      ctx.moveTo(44, 74);
      ctx.lineTo(192, 66);
      ctx.stroke();
      setOwnerSigned(true);
    }
  };

  // Pre-draw realistic simulated signatures when modal opens in BAST mode
  useEffect(() => {
    if (!isOpen || printMode !== 'bast_full') return;
    const timer = window.setTimeout(() => {
      drawSimulatedSignature('mandor');
      drawSimulatedSignature('worker');
      drawSimulatedSignature('owner');
    }, 60);
    return () => window.clearTimeout(timer);
  }, [isOpen, printMode]);

  const baseDepartmentPins = useMemo(
    () =>
      pins.filter((p) =>
        activeDepartmentFilter === 'all'
          ? true
          : p.department === activeDepartmentFilter
      ),
    [pins, activeDepartmentFilter]
  );

  const filteredBastPins = useMemo(() => {
    if (bastPinScope === 'resolved_only') {
      return baseDepartmentPins.filter((p) => p.status === 'resolved');
    }
    if (bastPinScope === 'issues_only') {
      return baseDepartmentPins.filter((p) => p.status !== 'resolved');
    }
    return baseDepartmentPins;
  }, [baseDepartmentPins, bastPinScope]);

  const blueprintPins = useMemo(
    () =>
      baseDepartmentPins.filter((p) =>
        activeBlueprint ? p.blueprint_id === activeBlueprint.id : true
      ),
    [baseDepartmentPins, activeBlueprint]
  );

  const shoppingItems = useMemo(
    () =>
      materialAllocations.filter(
        (m) =>
          m.allocation_status === 'to_buy' &&
          (activeDepartmentFilter === 'all'
            ? true
            : m.department === activeDepartmentFilter)
      ),
    [materialAllocations, activeDepartmentFilter]
  );

  const departmentMaterialAllocations = useMemo(
    () =>
      materialAllocations.filter((m) =>
        activeDepartmentFilter === 'all'
          ? true
          : m.department === activeDepartmentFilter
      ),
    [materialAllocations, activeDepartmentFilter]
  );

  const resolvedCount = baseDepartmentPins.filter(
    (p) => p.status === 'resolved'
  ).length;
  const progressPercent =
    baseDepartmentPins.length > 0
      ? Math.round((resolvedCount / baseDepartmentPins.length) * 100)
      : 0;
  const avgRevision =
    baseDepartmentPins.length > 0
      ? (
          baseDepartmentPins.reduce((acc, p) => acc + p.revision_count, 0) /
          baseDepartmentPins.length
        ).toFixed(1)
      : '0.0';
  const isTerminUnlocked = progressPercent >= project.termin_target_percent;
  const materialAuditSummary = useMemo(
    () =>
      calculateBastMaterialAuditSummary(
        materialAllocations,
        activeDepartmentFilter
      ),
    [materialAllocations, activeDepartmentFilter]
  );

  if (!isOpen) return null;

  const getCanvasCoords = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (
    party: SignatureParty,
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = getCanvasByParty(party);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.strokeStyle = '#1B365D';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (party === 'mandor') {
      setIsDrawingMandor(true);
      setMandorSigned(true);
    } else if (party === 'worker') {
      setIsDrawingWorker(true);
      setWorkerSigned(true);
    } else {
      setIsDrawingOwner(true);
      setOwnerSigned(true);
    }
  };

  const draw = (
    party: SignatureParty,
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const isDrawing =
      party === 'mandor'
        ? isDrawingMandor
        : party === 'worker'
        ? isDrawingWorker
        : isDrawingOwner;
    if (!isDrawing) return;
    const canvas = getCanvasByParty(party);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (party: SignatureParty) => {
    if (party === 'mandor') setIsDrawingMandor(false);
    else if (party === 'worker') setIsDrawingWorker(false);
    else setIsDrawingOwner(false);
  };

  const clearSignature = (party: SignatureParty) => {
    const canvas = getCanvasByParty(party);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (party === 'mandor') setMandorSigned(false);
    else if (party === 'worker') setWorkerSigned(false);
    else setOwnerSigned(false);
  };

  const handleTriggerWindowPrint = () => {
    setExportSuccessMessage(
      'Opening browser print PDF dialog (A4 Portrait)...'
    );
    window.setTimeout(() => {
      window.print();
      setExportSuccessMessage(null);
    }, 150);
  };

  const handleDownloadStandaloneBastHtml = () => {
    const mandorSigData = mandorCanvasRef.current?.toDataURL('image/png') || '';
    const workerSigData = workerCanvasRef.current?.toDataURL('image/png') || '';
    const ownerSigData = ownerCanvasRef.current?.toDataURL('image/png') || '';
    const docDate = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const rowsHtml = filteredBastPins
      .map((pin, idx) => {
        const dept = DEPARTMENT_META[pin.department];
        const status = PIN_STATUS_META[pin.status];
        return `
        <div style="border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-bottom:14px;page-break-inside:avoid;background:#ffffff;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:10px;">
            <div>
              <strong style="font-family:monospace;font-size:13px;background:#1B365D;color:#fff;padding:2px 8px;border-radius:4px;">${pin.pin_code}</strong>
              <span style="font-size:11px;font-weight:700;margin-left:6px;color:#334155;">[${dept.label}]</span>
              <span style="font-size:14px;font-weight:800;margin-left:8px;color:#0f172a;">${idx + 1}. ${pin.title}</span>
            </div>
            <div style="font-family:monospace;font-size:11px;font-weight:700;color:${status.hex};">
              ${status.label} | Revision: R-0${pin.revision_count} | (${pin.coord_x.toFixed(1)}%, ${pin.coord_y.toFixed(1)}%)
            </div>
          </div>
          <p style="font-size:12px;color:#334155;margin:0 0 10px 0;"><strong>Instructions &amp; Notes:</strong> ${pin.description} (PIC: ${pin.assigned_worker_email})</p>
          ${
            includePhotosInBast
              ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <div style="font-family:monospace;font-size:10px;font-weight:700;color:#dc2626;margin-bottom:4px;">BEFORE PHOTO (INITIAL ISSUE)</div>
                    <img src="${pin.before_media_url}" style="width:100%;height:160px;object-fit:cover;border:1px solid #cbd5e1;border-radius:6px;" />
                  </div>
                  <div>
                    <div style="font-family:monospace;font-size:10px;font-weight:700;color:#16a34a;margin-bottom:4px;">AFTER PHOTO (FINAL RESULT)</div>
                    ${
                      pin.after_media_url
                        ? `<img src="${pin.after_media_url}" style="width:100%;height:160px;object-fit:cover;border:1px solid #cbd5e1;border-radius:6px;" />`
                        : `<div style="height:160px;display:flex;align-items:center;justify-content:center;border:1px dashed #cbd5e1;border-radius:6px;font-size:11px;color:#64748b;">No After photo yet</div>`
                    }
                  </div>
                </div>`
              : ''
          }
        </div>`;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Handover Report - ${project.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #141619; background: #F8F7F4; margin: 0; padding: 24px; }
    .sheet { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #E2E6EC; border-radius: 12px; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; padding: 0; } .no-print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="no-print-btn" style="margin-bottom:16px;text-align:right;">
      <button onclick="window.print()" style="background:#D97706;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;">Print / Save PDF</button>
    </div>
    <div style="border-bottom:2px solid #1B365D;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-family:monospace;font-size:11px;font-weight:700;color:#1B365D;letter-spacing:0.12em;">VONTA SPATIAL CONSTRUCTION · OFFICIAL HANDOVER REPORT</div>
        <h1 style="margin:6px 0 4px 0;font-size:22px;">WORK HANDOVER REPORT (BAST)</h1>
        <p style="margin:0;font-size:13px;color:#475569;">Project: <strong>${project.name}</strong> · Print Date: ${docDate}</p>
      </div>
      <div style="text-align:right;background:#F8F7F4;padding:10px 14px;border:1px solid #E2E6EC;border-radius:8px;">
        <div style="font-family:monospace;font-size:10px;color:#64748b;">PAYMENT STAGE (${project.termin_target_percent}%)</div>
        <div style="font-family:monospace;font-size:20px;font-weight:800;color:#16A34A;">${progressPercent}% (${resolvedCount}/${baseDepartmentPins.length} Pins)</div>
      </div>
    </div>
    ${rowsHtml}
    <div style="margin-top:28px;padding-top:20px;border-top:2px solid #1B365D;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
      <div style="border:1px solid #cbd5e1;border-radius:8px;padding:12px;">
        <div style="font-size:10px;font-family:monospace;font-weight:700;color:#475569;">SUBMITTED BY (FOREMAN)</div>
        ${mandorSigData ? `<img src="${mandorSigData}" style="height:70px;margin:8px auto;display:block;" />` : `<div style="height:70px;"></div>`}
        <div style="font-weight:700;font-size:12px;border-top:1px solid #94a3b8;padding-top:6px;">${mandorSignerName}</div>
      </div>
      <div style="border:1px solid #cbd5e1;border-radius:8px;padding:12px;">
        <div style="font-size:10px;font-family:monospace;font-weight:700;color:#475569;">COMPLETED BY (LEAD WORKER)</div>
        ${workerSigData ? `<img src="${workerSigData}" style="height:70px;margin:8px auto;display:block;" />` : `<div style="height:70px;"></div>`}
        <div style="font-weight:700;font-size:12px;border-top:1px solid #94a3b8;padding-top:6px;">${workerSignerName}</div>
      </div>
      <div style="border:1px solid #cbd5e1;border-radius:8px;padding:12px;">
        <div style="font-size:10px;font-family:monospace;font-weight:700;color:#475569;">APPROVED BY (OWNER / ARCHITECT)</div>
        ${ownerSigData ? `<img src="${ownerSigData}" style="height:70px;margin:8px auto;display:block;" />` : `<div style="height:70px;"></div>`}
        <div style="font-weight:700;font-size:12px;border-top:1px solid #94a3b8;padding-top:6px;">${ownerSignerName}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BAST-VONTA-${project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage(
      'Standalone Handover Report (.HTML) with 3-party signatures downloaded!'
    );
    window.setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-bast-title"
    >
      <div className="w-full max-w-6xl bg-[#F8F7F4] dark:bg-[#1E293B] border border-[#E2E6EC] dark:border-[#334155] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Modal Control Bar (Hidden when printing via .no-print) */}
        <div className="no-print px-5 py-4 bg-[#1B365D] text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97706] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-white/15 text-[#FCD34D] font-bold">
                  OFFICIAL AUDIT DOCUMENT · BAST
                </span>
                <span className="font-mono text-[10px] text-emerald-300 font-semibold">
                  No: BAST/VONTA/2026/001 · SHA256-9F84A2
                </span>
              </div>
              <h2
                id="print-bast-title"
                className="text-base sm:text-lg font-bold tracking-tight mt-0.5"
              >
                Print &amp; PDF Handover Report (BAST)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadStandaloneBastHtml}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              title="Download standalone Handover Report .HTML with photos and digital signatures"
            >
              <Download className="w-4 h-4 text-[#FCD34D]" />
              <span>Download Report (.HTML)</span>
            </button>
            <button
              type="button"
              onClick={handleTriggerWindowPrint}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>1-Click Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close print window"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast feedback inside modal */}
        {exportSuccessMessage && (
          <div className="no-print px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportSuccessMessage(null)}
              className="text-[11px] underline"
            >
              Close
            </button>
          </div>
        )}

        {/* Document Mode & Scope Filter Selector (Hidden when printing) */}
        <div className="no-print px-5 py-3.5 bg-white dark:bg-[#0F172A] border-b border-[#E2E6EC] dark:border-[#334155] flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPrintMode('bast_full')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  printMode === 'bast_full'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F8F7F4] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-slate-700'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  1. Full Handover Report ({filteredBastPins.length} Pins)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPrintMode('blueprint_map')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  printMode === 'blueprint_map'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F8F7F4] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-slate-700'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>2. Print Working Floor Plan (With / Without Pins)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintMode('shopping_list')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  printMode === 'shopping_list'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F8F7F4] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-slate-700'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  3. Print PO Shopping List ({shoppingItems.length} Items)
                </span>
              </button>
            </div>

            {printMode === 'blueprint_map' && (
              <button
                type="button"
                onClick={() =>
                  setIncludePinsOnBlueprint(!includePinsOnBlueprint)
                }
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
                  includePinsOnBlueprint
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300'
                }`}
              >
                {includePinsOnBlueprint ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Print Mode: WITH Spatial Pins</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Print Mode: WITHOUT Pins (Clean Floor Plan)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Sub-filter khusus Mode 1 (BAST Lengkap) */}
          {printMode === 'bast_full' && (
            <div className="pt-2 border-t border-[#E2E6EC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#1B365D] dark:text-amber-400" />
                  Report Pin Scope:
                </span>
                <button
                  type="button"
                  onClick={() => setBastPinScope('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bastPinScope === 'all'
                      ? 'bg-[#1B365D] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All Statuses ({baseDepartmentPins.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBastPinScope('resolved_only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bastPinScope === 'resolved_only'
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  Resolved Only ({resolvedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setBastPinScope('issues_only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bastPinScope === 'issues_only'
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                  }`}
                >
                  Open / In Progress (
                  {baseDepartmentPins.length - resolvedCount})
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePhotosInBast}
                    onChange={(e) => setIncludePhotosInBast(e.target.checked)}
                    className="rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                  />
                  <span>Include Before-After Photos</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMaterialAuditInBast}
                    onChange={(e) =>
                      setIncludeMaterialAuditInBast(e.target.checked)
                    }
                    className="rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                  />
                  <span>
                    Include Material Audit Table (
                    {departmentMaterialAllocations.length})
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Printable Document Preview Area */}
        <div className="printable-sheet p-5 sm:p-8 overflow-y-auto flex-1 bg-white text-[#141619]">
          {/* Official VONTA Document Header */}
          <div className="border-b-2 border-[#1B365D] pb-4 mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#1B365D] text-white font-mono text-xs font-bold tracking-wider">
                  VONTA SPATIAL CONSTRUCTION
                </span>
                <span className="font-mono text-xs font-bold text-[#D97706]">
                  OFFICIAL PROJECT DOCUMENT · NO: BAST/VONTA/2026/001
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#141619] mt-2">
                {printMode === 'bast_full' &&
                  'WORK HANDOVER REPORT (BAST)'}
                {printMode === 'blueprint_map' &&
                  `FIELD WORKING FLOOR PLAN: ${
                    activeBlueprint?.area_name || 'Project Area'
                  }`}
                {printMode === 'shopping_list' &&
                  'PROJECT MATERIAL PROCUREMENT & SHOPPING LIST (TO-BUY)'}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Project: <strong className="text-slate-900">{project.name}</strong>{' '}
                · Division Filter:{' '}
                <strong className="text-slate-900">
                  {activeDepartmentFilter === 'all'
                    ? 'All Divisions'
                    : DEPARTMENT_META[activeDepartmentFilter].label}
                </strong>{' '}
                · Print Date:{' '}
                <span className="font-mono font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>

            <div className="text-right font-mono bg-[#F8F7F4] p-3.5 rounded-xl border border-[#E2E6EC]">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Payment Stage Progress ({project.termin_target_percent}%)
              </p>
              <p className="text-xl font-extrabold text-[#16A34A] tabular-nums">
                {progressPercent}% Resolved ({resolvedCount}/
                {baseDepartmentPins.length} Pins)
              </p>
              <span
                className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  isTerminUnlocked
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {isTerminUnlocked
                  ? 'STAGE TARGET MET - READY FOR PAYOUT'
                  : `${Math.max(
                      0,
                      project.termin_target_percent - progressPercent
                    )}% REMAINING TO UNLOCK STAGE`}
              </span>
            </div>
          </div>

          {/* MODE 1: BAST LENGKAP (Executive Summary + Daftar Pin + Bukti Foto Before-After + Audit Material + 3-Party Signature) */}
          {printMode === 'bast_full' && (
            <div className="space-y-6">
              {/* Executive KPI Box inside BAST */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F7F4] p-4 rounded-xl border border-[#E2E6EC]">
                <div className="bg-white p-3 rounded-lg border border-[#E2E6EC]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Total Printed Pins
                  </span>
                  <span className="font-mono text-xl font-extrabold text-[#1B365D] tabular-nums">
                    {filteredBastPins.length} Pins
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E2E6EC]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Resolved Pins
                  </span>
                  <span className="font-mono text-xl font-extrabold text-[#16A34A] tabular-nums">
                    {resolvedCount} / {baseDepartmentPins.length}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E2E6EC]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Average Revisions
                  </span>
                  <span className="font-mono text-xl font-extrabold text-[#D97706] tabular-nums">
                    {avgRevision}x / pin
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E2E6EC]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Linked Material Orders
                  </span>
                  <span className="font-mono text-lg font-extrabold text-slate-900 tabular-nums">
                    {materialAuditSummary.totalAllocations} Orders (IDR{' '}
                    {(
                      materialAuditSummary.estimatedTotalValueIdr / 1000000
                    ).toFixed(2)}{' '}
                    M)
                  </span>
                </div>
              </div>

              {/* Pin Inspection List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1B365D] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D97706]" />
                    <span>
                      Section I · Spatial Pin Inspection &amp; Before-After Photo Verification ({filteredBastPins.length} Pins)
                    </span>
                  </h3>
                </div>

                {filteredBastPins.map((pin, idx) => {
                  const dept = DEPARTMENT_META[pin.department];
                  const status = PIN_STATUS_META[pin.status];
                  const pinMaterials = materialAllocations.filter(
                    (m) => m.pin_id === pin.id
                  );

                  return (
                    <div
                      key={pin.id}
                      className="p-4 rounded-xl border border-slate-300 bg-white break-inside-avoid"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#1B365D] text-white">
                            {pin.pin_code}
                          </span>
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                            {dept.label}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {idx + 1}. {pin.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span
                            className="font-bold px-2 py-0.5 rounded"
                            style={{
                              color: status.hex,
                              backgroundColor: `${status.hex}15`,
                            }}
                          >
                            Status: {status.label}
                          </span>
                          <span className="text-slate-600 font-bold">
                            Rev: R-0{pin.revision_count}
                          </span>
                          <span className="text-slate-500">
                            Coords: ({pin.coord_x.toFixed(1)}%,{' '}
                            {pin.coord_y.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 mb-3">
                        <p>
                          <strong>Instructions / Notes:</strong>{' '}
                          {pin.description}{' '}
                          <span className="font-mono text-slate-500">
                            (Worker PIC: {pin.assigned_worker_email})
                          </span>
                        </p>
                        {pinMaterials.length > 0 && (
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            Linked Materials:{' '}
                            {pinMaterials
                              .map(
                                (m) =>
                                  `${m.item_name} (${m.qty_requested} ${m.unit})`
                              )
                              .join(', ')}
                          </span>
                        )}
                      </div>

                      {includePhotosInBast && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-slate-200 rounded-lg p-2 bg-[#F8F7F4]">
                            <p className="font-mono text-[10px] font-bold uppercase text-red-700 mb-1">
                              BEFORE PHOTO (INITIAL ISSUE)
                            </p>
                            <img
                              src={pin.before_media_url}
                              alt={`Before ${pin.pin_code}`}
                              className="w-full h-36 object-cover rounded border border-slate-300"
                            />
                          </div>
                          <div className="border border-slate-200 rounded-lg p-2 bg-[#F8F7F4]">
                            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700 mb-1">
                              AFTER PHOTO (COMPLETION PROOF)
                            </p>
                            {pin.after_media_url ? (
                              <img
                                src={pin.after_media_url}
                                alt={`After ${pin.pin_code}`}
                                className="w-full h-36 object-cover rounded border border-slate-300"
                              />
                            ) : (
                              <div className="w-full h-36 rounded border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                                No After proof photo yet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bagian II: Tabel Rekapitulasi Pemakaian Material Terikat Pin */}
              {includeMaterialAuditInBast && (
                <div className="pt-4 border-t border-slate-300 break-inside-avoid">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1B365D] mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span>
                      Section II · Pin-Bound Material Usage Audit (Material Guard)
                    </span>
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-mono text-[10px] uppercase text-slate-700">
                        <th className="border border-slate-300 px-3 py-2">
                          No
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Pin Code
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Material Name
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Division
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Volume
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Allocation Source
                        </th>
                        <th className="border border-slate-300 px-3 py-2">
                          Budget Guard Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentMaterialAllocations.map((alloc, idx) => {
                        const pin = pins.find((p) => p.id === alloc.pin_id);
                        return (
                          <tr key={alloc.id}>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold text-[#1B365D]">
                              {pin?.pin_code || '-'}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-semibold">
                              {alloc.item_name}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono">
                              {DEPARTMENT_META[alloc.department].shortLabel}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold">
                              {alloc.qty_requested} {alloc.unit}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono text-[11px]">
                              {alloc.allocation_status ===
                              'allocated_from_stock'
                                ? 'Deducted from Warehouse'
                                : 'Shopping List (To-Buy)'}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 font-mono text-[11px]">
                              {alloc.is_duplicate_warning ? (
                                <span className="text-red-700 font-bold inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Duplicate Claim Warning
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold">
                                  Verified Safe
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bagian III: INTERACTIVE 3-PARTY DIGITAL SIGNATURE PADS (Mandor, Kepala Tukang, Owner) */}
              <div className="mt-8 pt-6 border-t-2 border-[#1B365D] break-inside-avoid">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1B365D] flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-[#D97706]" />
                      <span>
                        Section III · 3-Party Digital Approval &amp; Signatures
                        (Foreman, Lead Worker, Owner)
                      </span>
                    </h4>
                    <p className="no-print text-[11px] text-slate-500 mt-0.5">
                      Sign directly on the canvas pads below using your mouse or
                      touchscreen before printing PDF.
                    </p>
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Signatures:{' '}
                      {[mandorSigned, workerSigned, ownerSigned].filter(Boolean)
                        .length}{' '}
                      / 3 Complete
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pihak 1: Mandor Signature Pad */}
                  <div className="border border-slate-300 rounded-xl p-4 bg-[#F8F7F4]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase text-slate-700 font-bold">
                        1. Submitted By (Foreman)
                      </span>
                      <div className="no-print flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => drawSimulatedSignature('mandor')}
                          className="text-[10px] font-mono text-[#1B365D] hover:underline flex items-center gap-0.5"
                          title="Fill simulated signature"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => clearSignature('mandor')}
                          className="text-[10px] font-mono text-slate-600 hover:text-red-600 flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative bg-white border border-dashed border-slate-300 rounded-lg overflow-hidden">
                      <canvas
                        ref={mandorCanvasRef}
                        width={240}
                        height={95}
                        onMouseDown={(e) => startDrawing('mandor', e)}
                        onMouseMove={(e) => draw('mandor', e)}
                        onMouseUp={() => stopDrawing('mandor')}
                        onMouseLeave={() => stopDrawing('mandor')}
                        onTouchStart={(e) => startDrawing('mandor', e)}
                        onTouchMove={(e) => draw('mandor', e)}
                        onTouchEnd={() => stopDrawing('mandor')}
                        className="w-full h-24 cursor-crosshair touch-none"
                      />
                      {!mandorSigned && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400 font-mono">
                          Sign Foreman here...
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-300 pt-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          aria-label="Foreman signer name"
                          value={mandorSignerName}
                          onChange={(e) => setMandorSignerName(e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1B365D] focus:outline-none"
                        />
                        <p className="text-[10px] font-mono text-slate-500">
                          Site Manager / Foreman
                        </p>
                      </div>
                      {mandorSigned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pihak 2: Perwakilan Kepala Tukang Signature Pad */}
                  <div className="border border-slate-300 rounded-xl p-4 bg-[#F8F7F4]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase text-slate-700 font-bold">
                        2. Completed By (Worker)
                      </span>
                      <div className="no-print flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => drawSimulatedSignature('worker')}
                          className="text-[10px] font-mono text-[#1B365D] hover:underline flex items-center gap-0.5"
                          title="Fill simulated signature"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => clearSignature('worker')}
                          className="text-[10px] font-mono text-slate-600 hover:text-red-600 flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative bg-white border border-dashed border-slate-300 rounded-lg overflow-hidden">
                      <canvas
                        ref={workerCanvasRef}
                        width={240}
                        height={95}
                        onMouseDown={(e) => startDrawing('worker', e)}
                        onMouseMove={(e) => draw('worker', e)}
                        onMouseUp={() => stopDrawing('worker')}
                        onMouseLeave={() => stopDrawing('worker')}
                        onTouchStart={(e) => startDrawing('worker', e)}
                        onTouchMove={(e) => draw('worker', e)}
                        onTouchEnd={() => stopDrawing('worker')}
                        className="w-full h-24 cursor-crosshair touch-none"
                      />
                      {!workerSigned && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400 font-mono">
                          Sign Lead Worker here...
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-300 pt-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          aria-label="Worker signer name"
                          value={workerSignerName}
                          onChange={(e) => setWorkerSignerName(e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1B365D] focus:outline-none"
                        />
                        <p className="text-[10px] font-mono text-slate-500">
                          Lead Specialist Worker
                        </p>
                      </div>
                      {workerSigned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pihak 3: Owner / Arsitek Signature Pad */}
                  <div className="border border-slate-300 rounded-xl p-4 bg-[#F8F7F4]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase text-slate-700 font-bold">
                        3. Approved By (Owner)
                      </span>
                      <div className="no-print flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => drawSimulatedSignature('owner')}
                          className="text-[10px] font-mono text-[#1B365D] hover:underline flex items-center gap-0.5"
                          title="Fill simulated signature"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => clearSignature('owner')}
                          className="text-[10px] font-mono text-slate-600 hover:text-red-600 flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative bg-white border border-dashed border-slate-300 rounded-lg overflow-hidden">
                      <canvas
                        ref={ownerCanvasRef}
                        width={240}
                        height={95}
                        onMouseDown={(e) => startDrawing('owner', e)}
                        onMouseMove={(e) => draw('owner', e)}
                        onMouseUp={() => stopDrawing('owner')}
                        onMouseLeave={() => stopDrawing('owner')}
                        onTouchStart={(e) => startDrawing('owner', e)}
                        onTouchMove={(e) => draw('owner', e)}
                        onTouchEnd={() => stopDrawing('owner')}
                        className="w-full h-24 cursor-crosshair touch-none"
                      />
                      {!ownerSigned && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400 font-mono">
                          Sign Owner here...
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-300 pt-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          aria-label="Owner signer name"
                          value={ownerSignerName}
                          onChange={(e) => setOwnerSignerName(e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1B365D] focus:outline-none"
                        />
                        <p className="text-[10px] font-mono text-slate-500">
                          Property Owner / Architect
                        </p>
                      </div>
                      {ownerSigned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: CETAK DENAH KERJA (DENGAN PIN ATAU TANPA PIN) */}
          {printMode === 'blueprint_map' && activeBlueprint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-300">
                <span className="text-xs font-bold text-slate-800">
                  Area: {activeBlueprint.area_name}
                </span>
                <span className="font-mono text-xs font-bold text-[#1B365D]">
                  {includePinsOnBlueprint
                    ? `Showing ${blueprintPins.length} Pins on Floor Plan`
                    : 'Clean Floor Plan Mode (No Pins, For Field Working Drawings)'}
                </span>
              </div>

              <div className="relative w-full aspect-[16/10] border-2 border-slate-800 rounded-xl overflow-hidden bg-slate-50">
                <img
                  src={activeBlueprint.image_url}
                  alt={activeBlueprint.area_name}
                  className="w-full h-full object-contain"
                />

                {includePinsOnBlueprint &&
                  blueprintPins.map((pin) => {
                    const statusMeta = PIN_STATUS_META[pin.status];
                    return (
                      <div
                        key={pin.id}
                        style={{
                          left: `${pin.coord_x}%`,
                          top: `${pin.coord_y}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                      >
                        <div
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold text-white border-2 border-white shadow-md"
                          style={{ backgroundColor: statusMeta.hex }}
                        >
                          {pin.pin_code}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {includePinsOnBlueprint && (
                <div className="mt-4">
                  <h4 className="font-mono text-xs font-bold uppercase text-slate-700 mb-2">
                    Pin Coordinate Reference Table ({blueprintPins.length} Pins)
                  </h4>
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-mono text-[10px] uppercase">
                        <th className="border border-slate-300 px-2.5 py-1.5">
                          Code
                        </th>
                        <th className="border border-slate-300 px-2.5 py-1.5">
                          Division
                        </th>
                        <th className="border border-slate-300 px-2.5 py-1.5">
                          Work / Issue
                        </th>
                        <th className="border border-slate-300 px-2.5 py-1.5">
                          Worker PIC
                        </th>
                        <th className="border border-slate-300 px-2.5 py-1.5">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprintPins.map((pin) => (
                        <tr key={pin.id}>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-mono font-bold">
                            {pin.pin_code}
                          </td>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-mono">
                            {DEPARTMENT_META[pin.department].shortLabel}
                          </td>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-semibold">
                            {pin.title}
                          </td>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-mono">
                            {pin.assigned_worker_email}
                          </td>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-mono font-bold">
                            {PIN_STATUS_META[pin.status].label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: CETAK DAFTAR BELANJA (SHOPPING LIST TO-BUY) */}
          {printMode === 'shopping_list' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                This field Purchase Order (PO) lists material shortages linked
                directly to active work pins.
              </p>

              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-mono text-[10px] uppercase">
                    <th className="border border-slate-300 px-3 py-2">No</th>
                    <th className="border border-slate-300 px-3 py-2">
                      Material to Purchase
                    </th>
                    <th className="border border-slate-300 px-3 py-2">
                      Division
                    </th>
                    <th className="border border-slate-300 px-3 py-2">
                      Quantity
                    </th>
                    <th className="border border-slate-300 px-3 py-2">
                      Linked Pin
                    </th>
                    <th className="border border-slate-300 px-3 py-2">
                      Physical Purchase Check
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shoppingItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-slate-300 px-3 py-6 text-center text-slate-500"
                      >
                        No materials in the shopping queue right now.
                      </td>
                    </tr>
                  ) : (
                    shoppingItems.map((item, idx) => {
                      const boundPin = pins.find((p) => p.id === item.pin_id);
                      return (
                        <tr key={item.id}>
                          <td className="border border-slate-300 px-3 py-2 font-mono">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-bold">
                            {item.item_name}
                            {item.is_duplicate_warning && (
                              <span className="ml-2 font-mono text-[10px] text-red-600">
                                [NEEDS FOREMAN CHECK: 2ND CLAIM]
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-mono">
                            {DEPARTMENT_META[item.department].label}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-mono font-extrabold">
                            {item.qty_requested} {item.unit}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-mono">
                            {boundPin
                              ? `${boundPin.pin_code} (${boundPin.title})`
                              : '-'}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-mono text-slate-500">
                            [ &nbsp; ] Purchased &amp; Received in Warehouse
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
