import React, { useState, useRef, useEffect } from 'react';
import {
  GlobalRole,
  InventoryItemRecord,
  MaterialAllocationRecord,
  PinPriority,
  PinRecord,
  ProfileRecord,
} from '../types/schema';
import { getDepartmentMeta, PIN_STATUS_META } from '../data/initialDatabase';
import { PhotoCaptureAndMarkupStudio } from './PhotoCaptureAndMarkupStudio';
import {
  Camera,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
  Lock,
  Package,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Upload,
  Check,
  X,
  PlayCircle,
  MessageSquare,
  Send,
  Image as ImageIcon,
} from 'lucide-react';

interface BeforeAfterSliderGateProps {
  pin: PinRecord;
  areaPins?: PinRecord[];
  onSelectPin?: (pinId: string) => void;
  workers?: ProfileRecord[];
  activeRole: GlobalRole;
  activeUserName: string;
  inventoryItems: InventoryItemRecord[];
  pinAllocations: MaterialAllocationRecord[];
  onAllocateMaterialToPin: (payload: {
    pinId: string;
    inventoryItemId: string;
    qtyRequested: number;
  }) => void;
  onWorkerStartProgress?: (pin: PinRecord) => void;
  onWorkerUploadAfter: (
    pin: PinRecord,
    customDataUrl?: string,
    workerCompletionNote?: string,
    voiceDurationSec?: number
  ) => void;
  onAddPinComment?: (
    pin: PinRecord,
    note: string,
    mediaUrl?: string | null
  ) => void;
  onLeaderUpdatePinMeta?: (
    pinId: string,
    payload: {
      title: string;
      description: string;
      priority: PinPriority;
      assignedWorkerEmail: string;
    }
  ) => void;
  onLeaderApprovePin: (pin: PinRecord, leaderApprovalNote?: string) => void;
  onLeaderRejectPin: (pin: PinRecord, rejectReason: string) => void;
  onOwnerReopenGhostPin: (
    pin: PinRecord,
    reopenReason: string,
    recurrenceCategory?: string,
    resetAfterMedia?: boolean
  ) => void;
  onMandorRequestDeletePin: (
    pin: PinRecord,
    deleteReason?: string,
    deleteCategory?: string
  ) => void;
  onOwnerConfirmDeletePin: (pin: PinRecord, ownerDecisionNote?: string) => void;
  onOwnerCancelDeleteRequest: (
    pin: PinRecord,
    ownerDecisionNote?: string
  ) => void;
  onOpenPrintBast?: () => void;
}

export const BeforeAfterSliderGate: React.FC<BeforeAfterSliderGateProps> = ({
  pin,
  areaPins = [],
  onSelectPin,
  workers = [],
  activeRole,
  inventoryItems,
  pinAllocations,
  onWorkerStartProgress,
  onWorkerUploadAfter,
  onAddPinComment,
  onLeaderUpdatePinMeta,
  onLeaderApprovePin,
  onLeaderRejectPin,
  onOwnerReopenGhostPin,
  onMandorRequestDeletePin,
  onOwnerConfirmDeletePin,
  onOwnerCancelDeleteRequest,
}) => {
  const [sliderPercent, setSliderPercent] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const [rejectNote, setRejectNote] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [reopenNote, setReopenNote] = useState<string>('');
  const [showReopenInput, setShowReopenInput] = useState<boolean>(false);

  const [workerStatusNote, setWorkerStatusNote] = useState<string>('');
  const [commentNote, setCommentNote] = useState<string>('');
  const [commentPhotoDataUrl, setCommentPhotoDataUrl] = useState<string | null>(
    null
  );

  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(pin.title);
  const [editDescription, setEditDescription] = useState<string>(
    pin.description || ''
  );
  const [editPriority, setEditPriority] = useState<PinPriority>(pin.priority);
  const [editWorkerEmail, setEditWorkerEmail] = useState<string>(
    pin.assigned_worker_email || 'budi.listrik@gmail.com'
  );

  const [isAfterStudioOpen, setIsAfterStudioOpen] = useState<boolean>(false);
  const commentFileInputRef = useRef<HTMLInputElement | null>(null);
  const afterQuickFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEditTitle(pin.title);
    setEditDescription(pin.description || '');
    setEditPriority(pin.priority);
    setEditWorkerEmail(pin.assigned_worker_email || 'budi.listrik@gmail.com');
    setShowRejectInput(false);
    setShowReopenInput(false);
    setWorkerStatusNote('');
    setCommentNote('');
    setCommentPhotoDataUrl(null);
  }, [
    pin.id,
    pin.department,
    pin.title,
    pin.description,
    pin.priority,
    pin.assigned_worker_email,
    inventoryItems,
  ]);

  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  const isLeader = activeRole === 'owner' || activeRole === 'mandor';
  const isOwner = activeRole === 'owner';
  const isMandor = activeRole === 'mandor';

  const hasAfterMedia = Boolean(pin.after_media_url);
  // Jika sudah ada revisi dan tersimpan foto sebelum revisi, Before menampilkan foto sebelum revisi terakhir
  const effectiveBeforeMediaUrl =
    pin.revision_count > 0 && pin.before_revision_media_url
      ? pin.before_revision_media_url
      : pin.before_media_url;

  const revisionCode = `R-0${pin.revision_count}`;
  const statusMeta = PIN_STATUS_META[pin.status] || PIN_STATUS_META.open;
  const deptMeta = getDepartmentMeta(pin.department);

  const currentPinIndex = areaPins.findIndex((p) => p.id === pin.id);
  const hasPrevPin = currentPinIndex > 0;
  const hasNextPin =
    currentPinIndex >= 0 && currentPinIndex < areaPins.length - 1;

  const updateSliderFromClientX = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPercent(Math.max(5, Math.min(95, Math.round(pct))));
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLeaderUpdatePinMeta || !editTitle.trim()) return;
    onLeaderUpdatePinMeta(pin.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      assignedWorkerEmail: editWorkerEmail,
    });
    setIsEditingMeta(false);
  };

  const handleQuickAfterFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onWorkerUploadAfter(
          pin,
          reader.result,
          workerStatusNote.trim() ||
            'Work completed and latest photo uploaded for review.',
          12
        );
        setWorkerStatusNote('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCommentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCommentPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentNote.trim() && !commentPhotoDataUrl) return;
    if (onAddPinComment) {
      onAddPinComment(
        pin,
        commentNote.trim() || 'Attached pin progress photo.',
        commentPhotoDataUrl
      );
    }
    setCommentNote('');
    setCommentPhotoDataUrl(null);
  };

  const pinComments = pin.pin_comments || [];

  return (
    <div className="flex flex-col h-full justify-between text-[13px]">
      {/* BAGIAN ATAS & TENGAH (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* 1. HEADER KODE PIN (#101 + Status Badge Reported / On Progress / In Preview / Approve + Counter Revisi + Prev/Next) */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E2E6EC] dark:border-[#263346]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="font-mono text-[12px] font-bold px-2 py-0.5 rounded-[4px] text-white tabular-nums"
              style={{ backgroundColor: statusMeta.hex }}
            >
              {pin.pin_code}
            </span>
            <span
              className="text-[11px] font-mono font-semibold uppercase tracking-[0.04em] px-2 py-0.5 rounded-[4px] text-white"
              style={{ backgroundColor: statusMeta.hex }}
            >
              {statusMeta.label}
            </span>
            <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-[4px] tabular-nums bg-[#F8F7F4] dark:bg-[#0F141C] text-[#141619] dark:text-[#F8FAFC] border border-[#E2E6EC] dark:border-[#263346]">
              {revisionCode} ({pin.revision_count}x Rev)
            </span>
          </div>

          {onSelectPin && areaPins.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={!hasPrevPin}
                onClick={() =>
                  hasPrevPin && onSelectPin(areaPins[currentPinIndex - 1].id)
                }
                aria-label="Previous pin"
                className="h-7 w-7 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center disabled:opacity-40 hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={!hasNextPin}
                onClick={() =>
                  hasNextPin && onSelectPin(areaPins[currentPinIndex + 1].id)
                }
                aria-label="Next pin"
                className="h-7 w-7 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center disabled:opacity-40 hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. KOMPONEN INTERAKTIF BEFORE-AFTER IMAGE SLIDER (Bisa Dilihat Mandor & Pekerja) */}
        <div className="space-y-2">
          <div
            ref={sliderContainerRef}
            onPointerDown={(e) => {
              if (!hasAfterMedia) return;
              setIsDraggingSlider(true);
              updateSliderFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (!isDraggingSlider || !hasAfterMedia) return;
              updateSliderFromClientX(e.clientX);
            }}
            onPointerUp={() => setIsDraggingSlider(false)}
            onPointerCancel={() => setIsDraggingSlider(false)}
            className="relative w-full aspect-[16/10] rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-[#0F141C] shadow-2xs overflow-hidden select-none touch-none"
          >
            {/* Layer 1: Foto BEFORE (Jika revisi >= 1, mengikuti foto sebelum revisi) */}
            <img
              src={effectiveBeforeMediaUrl}
              alt={`Before photo ${pin.pin_code}`}
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-black/75 text-white font-mono text-[10px] font-semibold uppercase">
              {pin.revision_count > 0 && pin.before_revision_media_url
                ? 'Before (Pre-Revision)'
                : 'Before'}
            </span>

            {/* Layer 2: Foto AFTER (Hasil pengerjaan / revisi terakhir) */}
            {hasAfterMedia && pin.after_media_url ? (
              <>
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPercent}%)`,
                  }}
                >
                  <img
                    src={pin.after_media_url}
                    alt={`After photo ${pin.pin_code}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-[#16A34A] text-white font-mono text-[10px] font-semibold uppercase">
                  {pin.revision_count > 0
                    ? `After (Revision #${pin.revision_count})`
                    : 'After'}
                </span>

                {/* Garis Pembagi Slider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md cursor-ew-resize"
                  style={{ left: `${sliderPercent}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#1B365D] text-[#1B365D] flex items-center justify-center shadow">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-y-0 right-0 w-1/2 bg-black/70 backdrop-blur-[2px] border-l border-dashed border-white/30 flex flex-col items-center justify-center p-3 text-center">
                <Lock className="w-4 h-4 text-[#FCD34D] mb-1" />
                <span className="text-[11px] font-medium text-white">
                  No After Photo Yet
                </span>
              </div>
            )}
          </div>

          {/* Slider Range + Workflow Aksi Status Pekerja (Reported -> On Progress -> In Preview) */}
          <div className="space-y-2">
            {hasAfterMedia && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-[#475569] dark:text-[#94A3B8]">
                  Before / After
                </span>
                <input
                  type="range"
                  aria-label="Slide Before and After comparison"
                  min={5}
                  max={95}
                  value={sliderPercent}
                  onChange={(e) => setSliderPercent(Number(e.target.value))}
                  className="flex-1 accent-[#1B365D] cursor-pointer h-1.5"
                />
                <span className="font-mono text-[10px] tabular-nums text-[#475569] dark:text-[#94A3B8]">
                  {sliderPercent}%
                </span>
              </div>
            )}

            {/* Tahap 1 -> 2: Jika status masih "Reported" (open/reopened), tombol Ambil Pekerjaan mengubah status jadi "On Progress" */}
            {(pin.status === 'open' || pin.status === 'reopened') &&
              onWorkerStartProgress && (
                <button
                  type="button"
                  onClick={() => onWorkerStartProgress(pin)}
                  className="w-full h-8 px-3 rounded-[6px] bg-[#CA8A04] hover:bg-amber-700 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Take Task (Set to In Progress)</span>
                </button>
              )}

            {/* Tahap 2 -> 3: Input Keterangan Terbaru + Upload Foto After untuk mengubah status ke "In Preview" */}
            <div className="p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] space-y-2">
              <input
                type="text"
                value={workerStatusNote}
                onChange={(e) => setWorkerStatusNote(e.target.value)}
                placeholder="Type worker status note before uploading photo..."
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px] text-[#141619] dark:text-[#F8FAFC]"
              />
              <div className="flex items-center gap-1.5">
                <input
                  ref={afterQuickFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQuickAfterFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() =>
                    onWorkerUploadAfter(
                      pin,
                      undefined,
                      workerStatusNote.trim() ||
                        'Work completed and latest photo uploaded (Pending Review).',
                      12
                    )
                  }
                  className="flex-1 h-8 px-2.5 rounded-[6px] bg-[#0284C7] hover:bg-sky-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors truncate cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Upload Photo &amp; Status (Pending Review)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => afterQuickFileInputRef.current?.click()}
                  title="Select Photo File from Device"
                  className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] hover:border-[#1B365D] text-[11px] font-medium text-[#141619] dark:text-[#F8FAFC] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAfterStudioOpen(true)}
                  title="Open Camera & Markup Studio"
                  aria-label="Open Camera and Markup Studio"
                  className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] hover:border-[#1B365D] flex items-center justify-center text-[#475569] dark:text-[#94A3B8] shrink-0 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. INFORMASI SINGKAT CATATAN & PIC */}
        <div className="p-3.5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] space-y-2">
          {!isEditingMeta ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] leading-snug">
                  {pin.title}
                </h3>
                {isLeader && onLeaderUpdatePinMeta && (
                  <button
                    type="button"
                    onClick={() => setIsEditingMeta(true)}
                    aria-label="Edit pin details"
                    className="p-1 rounded text-[#475569] hover:text-[#141619] dark:hover:text-[#F8FAFC]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {pin.description || 'No additional notes.'}
              </p>

              <div className="pt-2 border-t border-[#E2E6EC] dark:border-[#263346] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Division:{' '}
                  <strong className="text-[#141619] dark:text-[#F8FAFC]">
                    {deptMeta.shortLabel}
                  </strong>
                </span>
                <span className="font-mono text-[#475569] dark:text-[#94A3B8]">
                  PIC:{' '}
                  <strong className="text-[#141619] dark:text-[#F8FAFC]">
                    {pin.assigned_worker_email || '-'}
                  </strong>
                </span>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveMeta} className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[13px]"
                placeholder="Pin title..."
              />
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                placeholder="Instruction notes..."
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={editWorkerEmail}
                  onChange={(e) => setEditWorkerEmail(e.target.value)}
                  className="flex-1 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px] font-mono"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.email}>
                      {w.full_name} ({w.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="h-8 px-3 rounded-[6px] bg-[#1B365D] text-white text-[12px] font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(false)}
                  className="h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. COMMENT BOX KHUSUS TITIK INI (HANYA BERISI GAMBAR & NOTE REVISI / PENGERJAAN) */}
        <div className="p-3.5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#141619] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#1B365D] dark:text-[#D97706]" />
              <span>Pin {pin.pin_code} Comments (Photos &amp; Notes)</span>
            </span>
            <span className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
              {pinComments.length} notes
            </span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {pinComments.length === 0 ? (
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8] py-2 text-center">
                No revision notes or photos on this pin yet.
              </p>
            ) : (
              pinComments.map((cmt) => {
                const roleStr =
                  cmt.author_role || cmt.sender_role || 'worker';
                const nameStr =
                  cmt.author_name || cmt.sender_name || 'Team Member';
                const isMandorOrOwner =
                  roleStr === 'mandor' || roleStr === 'owner';
                return (
                  <div
                    key={cmt.id}
                    className={`p-2.5 rounded-lg border text-[12px] space-y-1.5 ${
                      isMandorOrOwner
                        ? 'bg-[#B45309]/5 border-[#B45309]/30'
                        : 'bg-[#F8F7F4] dark:bg-[#0F141C] border-[#E2E6EC] dark:border-[#263346]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#141619] dark:text-[#F8FAFC]">
                        {nameStr}
                      </span>
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#475569] dark:text-[#94A3B8]">
                        {(roleStr === 'mandor' ? 'foreman' : roleStr).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[#141619] dark:text-[#F8FAFC] leading-relaxed">
                      {cmt.note}
                    </p>
                    {cmt.media_url && (
                      <img
                        src={cmt.media_url}
                        alt="Pin comment attachment"
                        className="w-full max-h-28 object-cover rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] mt-1"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input Note & Gambar pada Comment Box */}
          <form onSubmit={handlePostComment} className="space-y-2 pt-1">
            {commentPhotoDataUrl && (
              <div className="relative inline-block">
                <img
                  src={commentPhotoDataUrl}
                  alt="Attachment preview"
                  className="h-14 w-24 object-cover rounded border border-[#E2E6EC]"
                />
                <button
                  type="button"
                  onClick={() => setCommentPhotoDataUrl(null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <input
                ref={commentFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCommentImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => commentFileInputRef.current?.click()}
                title="Attach Image to Comments"
                className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] flex items-center justify-center text-[#475569] hover:text-[#141619] shrink-0 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={commentNote}
                onChange={(e) => setCommentNote(e.target.value)}
                placeholder="Write a revision or progress note for this pin..."
                className="flex-1 h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] text-[#141619] dark:text-[#F8FAFC]"
              />
              <button
                type="submit"
                className="h-8 px-2.5 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Ringkasan Material Terikat Pin */}
        {pinAllocations.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#1B365D] dark:text-[#D97706]" />
                <span>Orders Linked to This Pin</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums text-[#475569] dark:text-[#94A3B8]">
                {pinAllocations.length} orders
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {pinAllocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="px-2.5 py-1.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] flex items-center justify-between gap-2 text-[12px]"
                >
                  <span className="truncate">{alloc.item_name}</span>
                  <span className="font-mono tabular-nums shrink-0 text-[11px]">
                    {alloc.qty_requested} {alloc.unit} (
                    {alloc.request_type ||
                      (alloc.allocation_status === 'to_buy' ? 'PR' : 'SR')}
                    )
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Input Note Revisi saat Mandor klik Tolak / Revisi */}
        {showRejectInput && (
          <div className="p-3 rounded-[8px] border border-[#DC2626]/40 bg-[#DC2626]/5 space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-[0.04em] text-[#DC2626]">
              Foreman Revision Note (Auto-Posted to Comments &amp; +1 Rev)
            </label>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Explain what the worker needs to fix..."
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowRejectInput(false)}
                className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onLeaderRejectPin(
                    pin,
                    rejectNote.trim() || 'Requires rework to meet standards.'
                  );
                  setRejectNote('');
                  setShowRejectInput(false);
                }}
                className="h-8 px-3 rounded-[6px] bg-[#DC2626] text-white text-[12px] font-medium cursor-pointer"
              >
                Send Revision
              </button>
            </div>
          </div>
        )}

        {/* Form Input Revisi Pin Selesai */}
        {showReopenInput && (
          <div className="p-3 rounded-[8px] border border-[#DC2626]/40 bg-[#DC2626]/5 space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-[0.04em] text-[#DC2626]">
              Work Revision Note
            </label>
            <input
              type="text"
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="e.g. Requires rework in this area..."
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowReopenInput(false)}
                className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onOwnerReopenGhostPin(
                    pin,
                    reopenNote.trim() || 'Requires revision.'
                  );
                  setReopenNote('');
                  setShowReopenInput(false);
                }}
                className="h-8 px-3 rounded-[6px] bg-[#DC2626] text-white text-[12px] font-medium"
              >
                Save Revision
              </button>
            </div>
          </div>
        )}

        {/* Bar Konfirmasi Izin Hapus Pin dari Mandor (Khusus Owner) */}
        {pin.delete_requested_by_mandor && (
          <div className="p-3 rounded-[8px] border border-[#B45309]/50 bg-[#B45309]/10 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC]">
              Foreman requested deletion of pin {pin.pin_code}
            </span>
            {isOwner && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOwnerConfirmDeletePin(pin)}
                  className="h-7 px-2.5 rounded-[6px] bg-[#DC2626] text-white text-[11px] font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Approve Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOwnerCancelDeleteRequest(pin)}
                  className="h-7 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[11px]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. FOOTER BAWAH: APPROVE & TOLAK/REVISI (TANPA TULISAN HIJAU DAN MERAH) */}
      <div className="p-2.5 border-t border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] flex items-center gap-1.5">
        <button
          type="button"
          disabled={!isLeader || !hasAfterMedia || pin.status === 'resolved'}
          onClick={() => onLeaderApprovePin(pin)}
          className="flex-1 min-w-0 h-9 px-2 rounded-[6px] bg-[#16A34A] hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Approve</span>
        </button>

        {pin.status === 'resolved' && isOwner ? (
          <button
            type="button"
            onClick={() => setShowReopenInput((v) => !v)}
            className="flex-1 min-w-0 h-9 px-2 rounded-[6px] bg-[#DC2626] hover:bg-red-700 text-white text-[12px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Revise</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={!isLeader}
            onClick={() => setShowRejectInput((v) => !v)}
            className="flex-1 min-w-0 h-9 px-2 rounded-[6px] bg-[#DC2626] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Reject / Revise</span>
          </button>
        )}

        {/* Ikon Hapus Pin (Owner Hapus Langsung, Mandor Ajukan Izin Hapus) */}
        {isOwner ? (
          <button
            type="button"
            onClick={() => onOwnerConfirmDeletePin(pin)}
            title="Delete Pin (Owner Only)"
            aria-label={`Delete Pin ${pin.pin_code} (Owner Only)`}
            className="h-9 w-9 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[#475569] hover:text-[#DC2626] hover:border-[#DC2626] flex items-center justify-center shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : isMandor ? (
          <button
            type="button"
            disabled={pin.delete_requested_by_mandor}
            onClick={() =>
              onMandorRequestDeletePin(
                pin,
                'Pin deletion requested by Foreman.'
              )
            }
            title="Request Delete Approval from Owner"
            aria-label={`Request delete approval for Pin ${pin.pin_code} from Owner`}
            className="h-9 w-9 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[#475569] hover:text-[#B45309] disabled:opacity-40 flex items-center justify-center shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Modal Studio Kamera & Coretan Markup Foto After */}
      {isAfterStudioOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-2xl rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Camera &amp; After Photo Markup ({pin.pin_code})
              </h3>
              <button
                type="button"
                onClick={() => setIsAfterStudioOpen(false)}
                className="h-7 w-7 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <PhotoCaptureAndMarkupStudio
              pinCode={pin.pin_code}
              phase="AFTER"
              department={pin.department}
              titleHint={pin.title}
              coordX={pin.coord_x}
              coordY={pin.coord_y}
              initialImageUrl={pin.after_media_url}
              onImageReady={(dataUrl) => {
                setIsAfterStudioOpen(false);
                onWorkerUploadAfter(
                  pin,
                  dataUrl,
                  workerStatusNote.trim() ||
                    'After photo with markup uploaded for review.',
                  12
                );
                setWorkerStatusNote('');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
