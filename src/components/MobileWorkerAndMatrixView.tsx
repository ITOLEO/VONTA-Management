import React, { useState, useEffect } from 'react';
import {
  BlueprintRecord,
  DepartmentOnly,
  InventoryItemRecord,
  MaterialAllocationRecord,
  PinRecord,
  ProfileRecord,
} from '../types/schema';
import {
  DEPARTMENT_META,
  PIN_STATUS_META,
  createFieldPhotoSvgDataUri,
} from '../data/initialDatabase';
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Map as MapIcon,
  Mic,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Square,
  UserCheck,
  Volume2,
  Zap,
  Droplets,
  BrickWall,
  Paintbrush,
} from 'lucide-react';

interface MobileWorkerAndMatrixViewProps {
  activeWorkerProfile: ProfileRecord;
  workerProfiles: ProfileRecord[];
  onSwitchWorkerProfile: (profileId: string) => void;
  activeBlueprint: BlueprintRecord | undefined;
  blueprints: BlueprintRecord[];
  onSelectBlueprint: (bpId: string) => void;
  pins: PinRecord[];
  selectedPin: PinRecord | undefined;
  onSelectPin: (pinId: string) => void;
  inventoryItems: InventoryItemRecord[];
  materialAllocations: MaterialAllocationRecord[];
  onWorkerUploadAfterProof: (
    pin: PinRecord,
    afterUrl: string,
    workerNote: string,
    voiceDurationSec?: number
  ) => void;
  onUpdateShoppingItemQty: (allocationId: string, nextQty: number) => void;
  onAllocateMaterialToPin: (payload: {
    pinId: string;
    inventoryItemId: string;
    qtyRequested: number;
  }) => void;
  onOpenFullPortfolio: () => void;
}

type MobileTabId = 'tugas' | 'denah' | 'bukti' | 'belanja' | 'profil';

const DEPT_PRICE_ESTIMATE: Record<DepartmentOnly, number> = {
  listrik: 185000,
  pipa: 145000,
  sipil: 95000,
  cat: 265000,
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const MobileWorkerAndMatrixView: React.FC<
  MobileWorkerAndMatrixViewProps
> = ({
  activeWorkerProfile,
  workerProfiles,
  onSwitchWorkerProfile,
  activeBlueprint,
  blueprints,
  onSelectBlueprint,
  pins,
  selectedPin,
  onSelectPin,
  inventoryItems,
  materialAllocations,
  onWorkerUploadAfterProof,
  onUpdateShoppingItemQty,
  onAllocateMaterialToPin,
  onOpenFullPortfolio,
}) => {
  const [mobileTab, setMobileTab] = useState<MobileTabId>('tugas');
  const [activeDeptPill, setActiveDeptPill] = useState<DepartmentOnly>(
    activeWorkerProfile.specialty_department === 'all'
      ? 'listrik'
      : activeWorkerProfile.specialty_department
  );

  useEffect(() => {
    if (activeWorkerProfile.specialty_department !== 'all') {
      setActiveDeptPill(activeWorkerProfile.specialty_department);
    }
  }, [activeWorkerProfile.specialty_department]);

  // Step 2 (Bukti) state: 1 Foto After -> 2 Voice Note -> 3 Konfirmasi
  const [proofStep, setProofStep] = useState<1 | 2 | 3>(1);
  const [customPhotoCaption, setCustomPhotoCaption] = useState(
    'Installation neatly routed along conduit path per site safety standards'
  );
  const [previewAfterDataUri, setPreviewAfterDataUri] = useState<string | null>(
    null
  );
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedVoiceSec, setRecordedVoiceSec] = useState<number>(15);
  const [workerNoteText, setWorkerNoteText] = useState(
    'Work on this pin is complete and tested normal.'
  );
  const [quickClaimInventoryId, setQuickClaimInventoryId] = useState<string>(
    inventoryItems[0]?.id || ''
  );
  const [quickClaimQty, setQuickClaimQty] = useState<number>(2);

  const workerDeptPins = pins.filter((p) => p.department === activeDeptPill);
  const areaWorkerPins = workerDeptPins.filter((p) =>
    activeBlueprint ? p.blueprint_id === activeBlueprint.id : true
  );
  const targetPin =
    selectedPin && selectedPin.department === activeDeptPill
      ? selectedPin
      : areaWorkerPins[0] || workerDeptPins[0] || pins[0];

  const deptShoppingList = materialAllocations.filter(
    (m) => m.department === activeDeptPill
  );

  const handleGenerateSimulatedCameraPhoto = () => {
    if (!targetPin) return;
    const generatedUri = createFieldPhotoSvgDataUri(
      targetPin.pin_code,
      'AFTER',
      targetPin.department,
      customPhotoCaption
    );
    setPreviewAfterDataUri(generatedUri);
    setProofStep(2);
  };

  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setRecordedVoiceSec(15);
      setProofStep(3);
    } else {
      setIsRecordingVoice(true);
    }
  };

  const handleSubmitMobileProof = () => {
    if (!targetPin) return;
    const finalAfterUrl =
      previewAfterDataUri ||
      targetPin.after_media_url ||
      createFieldPhotoSvgDataUri(
        targetPin.pin_code,
        'AFTER',
        targetPin.department,
        customPhotoCaption
      );

    onWorkerUploadAfterProof(
      targetPin,
      finalAfterUrl,
      workerNoteText,
      recordedVoiceSec
    );
    setProofStep(1);
    setPreviewAfterDataUri(null);
    setMobileTab('tugas');
  };

  const ftrPercent =
    activeWorkerProfile.total_resolved_pins > 0
      ? Math.round(
          (activeWorkerProfile.first_time_right_count /
            activeWorkerProfile.total_resolved_pins) *
            100
        )
      : 96;

  const workerTotalRevisions = pins
    .filter(
      (p) =>
        (p.assigned_worker_email || '').toLowerCase() ===
        activeWorkerProfile.email.toLowerCase()
    )
    .reduce((sum, p) => sum + p.revision_count, 0);

  return (
    <div className="flex flex-col items-center">
      {/* Top Worker Profile Switcher Bar above Mobile Frame */}
      <div className="w-full max-w-[412px] mb-3 px-3.5 py-2 rounded-lg bg-[#1B365D] text-white flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#D97706] shrink-0" />
          <span className="text-[11px] font-medium uppercase tracking-[0.04em]">
            Worker Mobile View (2D)
          </span>
        </div>
        <select
          aria-label="Select Worker Account"
          value={activeWorkerProfile.id}
          onChange={(e) => {
            onSwitchWorkerProfile(e.target.value);
            const found = workerProfiles.find((w) => w.id === e.target.value);
            if (found && found.specialty_department !== 'all') {
              setActiveDeptPill(found.specialty_department);
            }
          }}
          className="px-2.5 py-1 rounded-md bg-white/15 border border-white/20 text-white text-xs font-mono font-semibold"
        >
          {workerProfiles.map((w) => (
            <option key={w.id} value={w.id} className="text-slate-900">
              {w.full_name} ({w.specialty_department.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Authentic Smartphone Frame matching VONTA UI Comparison Matrix */}
      <div className="w-full max-w-[412px] rounded-[34px] border-[7px] border-[#141619] bg-[#F8F7F4] shadow-2xl overflow-hidden flex flex-col min-h-[720px]">
        {/* Mobile Status Bar + App Header (Drafting Navy #1B365D) */}
        <div className="bg-[#1B365D] text-white px-5 pt-2.5 pb-3.5">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 mb-2">
            <span>9:41</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#FCD34D]">
              OUTDOOR HIGH-CONTRAST 2D
            </span>
            <span>5G · 100%</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base">
                  VONTA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D97706] text-white font-bold">
                  WORKER
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {mobileTab === 'tugas' && 'My Work Area & Tasks Today'}
                {mobileTab === 'denah' && 'Fast 2D Floor Plan'}
                {mobileTab === 'bukti' &&
                  `Upload Work Proof · ${targetPin?.pin_code || ''}`}
                {mobileTab === 'belanja' && 'Division Shopping List'}
                {mobileTab === 'profil' && 'Worker Profile & Track Record'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileTab('bukti')}
              className="px-3 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
          </div>

          {/* Department Pill Bar inside Mobile Header */}
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {(
              [
                { id: 'listrik', label: 'Electrical', icon: Zap },
                { id: 'pipa', label: 'Plumbing', icon: Droplets },
                { id: 'sipil', label: 'Civil', icon: BrickWall },
                { id: 'cat', label: 'Finishing', icon: Paintbrush },
              ] as const
            ).map((dept) => {
              const Icon = dept.icon;
              const isSelected = activeDeptPill === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setActiveDeptPill(dept.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${
                    isSelected
                      ? 'bg-[#D97706] text-white shadow-xs'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{dept.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Body Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-[#141619]">
          {/* TAB 1: TUGAS HARI INI & AREA KERJA SAYA */}
          {mobileTab === 'tugas' && (
            <>
              <div className="bg-white rounded-2xl p-3.5 border border-[#E2E6EC] shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      My Work Area
                    </span>
                    <h3 className="text-sm font-bold text-[#141619] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <span>{activeBlueprint?.area_name || 'Floor 1'}</span>
                    </h3>
                  </div>
                  <select
                    aria-label="Select floor area"
                    value={activeBlueprint?.id || ''}
                    onChange={(e) => onSelectBlueprint(e.target.value)}
                    className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-[#F8F7F4] border border-[#E2E6EC]"
                  >
                    {blueprints.map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        {bp.area_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2D Fast Blueprint Preview inside Mobile Card */}
                {activeBlueprint && (
                  <div
                    onClick={() => setMobileTab('denah')}
                    className="relative w-full h-36 rounded-xl overflow-hidden border border-[#E2E6EC] bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={activeBlueprint.image_url}
                      alt={activeBlueprint.area_name}
                      className="w-full h-full object-cover"
                    />
                    {areaWorkerPins.map((pin) => {
                      const st = PIN_STATUS_META[pin.status];
                      const isTarget = targetPin?.id === pin.id;
                      return (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPin(pin.id);
                          }}
                          style={{
                            left: `${pin.coord_x}%`,
                            top: `${pin.coord_y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-full font-mono text-[9px] font-extrabold text-white border-2 border-white shadow-md ${
                            isTarget ? 'scale-125 ring-2 ring-[#1B365D]' : ''
                          }`}
                          title={pin.title}
                        >
                          <span
                            className="px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: st.hex }}
                          >
                            {pin.pin_code}
                          </span>
                        </button>
                      );
                    })}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#141619]/80 text-white font-mono text-[10px]">
                      Tap to enlarge 2D Floor Plan
                    </div>
                  </div>
                )}
              </div>

              {/* Daftar Tugas Harian yang Jelas */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="font-mono text-xs font-bold uppercase text-[#1B365D]">
                    Tasks Today ({workerDeptPins.length} Pins)
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">
                    {
                      workerDeptPins.filter((p) => p.status === 'resolved')
                        .length
                    }{' '}
                    Resolved
                  </span>
                </div>

                {workerDeptPins.map((pin) => {
                  const st = PIN_STATUS_META[pin.status];
                  const isActive = targetPin?.id === pin.id;
                  return (
                    <div
                      key={pin.id}
                      onClick={() => onSelectPin(pin.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isActive
                          ? 'border-2 border-[#1B365D] shadow-sm'
                          : 'border-[#E2E6EC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-xs font-extrabold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: st.hex }}
                          >
                            {pin.pin_code}
                          </span>
                          <h4 className="text-xs font-bold text-[#141619]">
                            {pin.title}
                          </h4>
                        </div>
                        <span
                          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            color: st.hex,
                            backgroundColor: `${st.hex}18`,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        {pin.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-slate-500">
                          Rev: R-0{pin.revision_count} · ({pin.coord_x}%,{' '}
                          {pin.coord_y}%)
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPin(pin.id);
                            setMobileTab('bukti');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Proof</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 2: DENAH 2D SEDERHANA (HIGH-CONTRAST OUTDOOR FRIENDLY) */}
          {mobileTab === 'denah' && activeBlueprint && (
            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E2E6EC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1B365D]">
                    2D Floor Plan · {activeBlueprint.area_name}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                    Battery &amp; Data Saver
                  </span>
                </div>

                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#1B365D] bg-white">
                  <img
                    src={activeBlueprint.image_url}
                    alt={activeBlueprint.area_name}
                    className="w-full h-full object-contain"
                  />
                  {workerDeptPins.map((pin) => {
                    const st = PIN_STATUS_META[pin.status];
                    const isSelected = targetPin?.id === pin.id;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => onSelectPin(pin.id)}
                        style={{
                          left: `${pin.coord_x}%`,
                          top: `${pin.coord_y}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full font-mono text-[10px] font-extrabold text-white border-2 border-white shadow-md ${
                          isSelected ? 'scale-125 ring-2 ring-[#D97706]' : ''
                        }`}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: st.hex }}
                        >
                          {pin.pin_code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {targetPin && (
                  <div className="mt-3 p-3 rounded-xl bg-[#F8F7F4] border border-[#E2E6EC] flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-[#1B365D]">
                        {targetPin.pin_code} · {targetPin.title}
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {targetPin.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileTab('bukti')}
                      className="shrink-0 w-11 h-11 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-md"
                      title="Capture Proof Photo"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD BUKTI PEKERJAAN (FOTO + VOICE NOTE 15 DETIK) */}
          {mobileTab === 'bukti' && targetPin && (
            <div className="bg-white rounded-2xl p-4 border border-[#E2E6EC] space-y-4">
              {/* 3-Step Progress Pill matching Comparison Matrix Row 02 */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#F8F7F4] p-1.5 rounded-xl border border-[#E2E6EC] font-mono text-[10px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setProofStep(1)}
                  className={`py-1.5 rounded-lg ${
                    proofStep === 1
                      ? 'bg-[#1B365D] text-white'
                      : 'text-slate-600'
                  }`}
                >
                  1. After Photo
                </button>
                <button
                  type="button"
                  onClick={() => setProofStep(2)}
                  className={`py-1.5 rounded-lg ${
                    proofStep === 2
                      ? 'bg-[#1B365D] text-white'
                      : 'text-slate-600'
                  }`}
                >
                  2. Voice Note
                </button>
                <button
                  type="button"
                  onClick={() => setProofStep(3)}
                  className={`py-1.5 rounded-lg ${
                    proofStep === 3
                      ? 'bg-[#1B365D] text-white'
                      : 'text-slate-600'
                  }`}
                >
                  3. Confirm
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E2E6EC]">
                <span className="font-mono text-xs font-extrabold text-[#1B365D]">
                  Target Pin: {targetPin.pin_code} ({targetPin.title})
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Instructions: {targetPin.description}
                </p>
              </div>

              {/* Photo Preview Box */}
              <div className="space-y-2">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#E2E6EC] bg-slate-100">
                  <img
                    src={
                      previewAfterDataUri ||
                      targetPin.after_media_url ||
                      targetPin.before_media_url
                    }
                    alt={targetPin.pin_code}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-[#16A34A] text-white font-mono text-[10px] font-bold">
                    {previewAfterDataUri
                      ? 'NEW AFTER PHOTO READY'
                      : 'FIELD CAMERA PREVIEW'}
                  </span>
                </div>

                <input
                  type="text"
                  value={customPhotoCaption}
                  onChange={(e) => setCustomPhotoCaption(e.target.value)}
                  placeholder="Proof photo watermark label..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E6EC] bg-[#F8F7F4] text-xs"
                />

                <button
                  type="button"
                  onClick={handleGenerateSimulatedCameraPhoto}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Completion Photo (Camera)</span>
                </button>
              </div>

              {/* 15-Second Voice Note Recorder */}
              <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E2E6EC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#141619]">
                    Record Voice Note (Max 15s)
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1B365D]">
                    00:{recordedVoiceSec.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Simulated Waveform Bar */}
                <div className="flex items-center gap-1 h-8 px-3 rounded-lg bg-white border border-[#E2E6EC]">
                  <Volume2 className="w-4 h-4 text-[#1B365D] shrink-0 mr-1" />
                  {[
                    35, 65, 90, 45, 80, 100, 60, 40, 85, 95, 50, 75, 60, 40, 70,
                    55,
                  ].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${isRecordingVoice ? 95 : h}%` }}
                      className={`flex-1 rounded-full transition-all ${
                        isRecordingVoice
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-[#1B365D]/70'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecord}
                    className={`flex-1 min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isRecordingVoice
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-[#E2E6EC] text-[#141619]'
                    }`}
                  >
                    {isRecordingVoice ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop Recording (15s)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-[#D97706]" />
                        <span>Record Voice Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={workerNoteText}
                onChange={(e) => setWorkerNoteText(e.target.value)}
                placeholder="Brief worker note..."
                className="w-full p-2.5 rounded-xl border border-[#E2E6EC] bg-[#F8F7F4] text-xs"
              />

              <button
                type="button"
                onClick={handleSubmitMobileProof}
                className="w-full min-h-[48px] rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Send After Photo + Voice Note to Foreman</span>
              </button>
            </div>
          )}

          {/* TAB 4: DAFTAR BELANJA MATERIAL (MOBILE STEPPER + PIN CLAIM) */}
          {mobileTab === 'belanja' && (
            <div className="space-y-3">
              {/* Quick Pin-Bound Material Request */}
              {targetPin && (
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2E6EC] space-y-2.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#1B365D] block">
                    Request Material for Pin {targetPin.pin_code}
                  </span>
                  <select
                    aria-label="Select warehouse item"
                    value={quickClaimInventoryId}
                    onChange={(e) => setQuickClaimInventoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E6EC] bg-[#F8F7F4] text-xs font-semibold"
                  >
                    {inventoryItems.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.item_name} (Stock: {inv.stock_available} {inv.unit})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-[#F8F7F4] px-2.5 py-1 rounded-xl border border-[#E2E6EC]">
                      <button
                        type="button"
                        onClick={() =>
                          setQuickClaimQty((q) => Math.max(1, q - 1))
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-[#E2E6EC] flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-xs font-extrabold px-2">
                        {quickClaimQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickClaimQty((q) => q + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#E2E6EC] flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!quickClaimInventoryId) return;
                        onAllocateMaterialToPin({
                          pinId: targetPin.id,
                          inventoryItemId: quickClaimInventoryId,
                          qtyRequested: quickClaimQty,
                        });
                      }}
                      className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold"
                    >
                      + Request Pin Material
                    </button>
                  </div>
                </div>
              )}

              {/* Daftar Belanja per Departemen */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E2E6EC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#141619]">
                    Shopping List &amp; Allocations (
                    {DEPARTMENT_META[activeDeptPill].shortLabel})
                  </h4>
                  <span className="font-mono text-[10px] text-slate-500">
                    {deptShoppingList.length} Items
                  </span>
                </div>

                {deptShoppingList.map((alloc) => {
                  const pin = pins.find((p) => p.id === alloc.pin_id);
                  const estPrice =
                    alloc.qty_requested * DEPT_PRICE_ESTIMATE[alloc.department];
                  return (
                    <div
                      key={alloc.id}
                      className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E2E6EC] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1B365D] text-white">
                            {pin?.pin_code || '#PIN'}
                          </span>
                          <p className="text-xs font-bold text-[#141619] truncate">
                            {alloc.item_name}
                          </p>
                        </div>
                        <p className="font-mono text-[11px] text-emerald-700 font-semibold mt-1">
                          {alloc.qty_requested} {alloc.unit} ·{' '}
                          {formatRupiah(estPrice)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateShoppingItemQty(
                              alloc.id,
                              Math.max(1, alloc.qty_requested - 1)
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-[#E2E6EC] flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-6 text-center">
                          {alloc.qty_requested}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateShoppingItemQty(
                              alloc.id,
                              alloc.qty_requested + 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-[#E2E6EC] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PROFIL & PORTOFOLIO CV TUKANG (MATCHING MATRIX ROW 03 RIGHT) */}
          {mobileTab === 'profil' && (
            <div className="bg-white rounded-2xl p-4 border border-[#E2E6EC] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1B365D] text-white font-mono text-lg font-extrabold flex items-center justify-center">
                  {activeWorkerProfile.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-[#141619]">
                      {activeWorkerProfile.full_name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#1B365D]" />
                  </div>
                  <p className="text-xs text-slate-600">
                    {
                      DEPARTMENT_META[
                        activeWorkerProfile.specialty_department === 'all'
                          ? 'listrik'
                          : activeWorkerProfile.specialty_department
                      ].label
                    }{' '}
                    Specialist
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified by Vonta
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-[#F8F7F4] p-3 rounded-xl border border-[#E2E6EC]">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Resolved Pins
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#141619]">
                    {activeWorkerProfile.total_resolved_pins}
                  </span>
                </div>
                <div className="border-x border-[#E2E6EC]">
                  <span className="text-[10px] font-mono text-slate-500 block">
                    First-Time Right
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#16A34A]">
                    {ftrPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Active Revisions
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#1B365D]">
                    {workerTotalRevisions}x
                  </span>
                </div>
              </div>

              {targetPin && (
                <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E2E6EC] space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-[#1B365D]">
                      LATEST PIN RECORD: {targetPin.pin_code}
                    </span>
                    <span className="text-[#16A34A] font-bold">
                      {PIN_STATUS_META[targetPin.status].label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#141619] truncate">
                    {targetPin.title}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenFullPortfolio}
                className="w-full min-h-[44px] rounded-xl bg-[#D97706] hover:bg-[#b86305] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>View Full Track Record</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Mobile Tab Navigation Bar (5 Tabs: Tugas | Denah | Bukti | Belanja | Profil) */}
        <div className="bg-white border-t border-[#E2E6EC] px-2 py-2 grid grid-cols-5 gap-1">
          {(
            [
              { id: 'tugas', label: 'Tasks', icon: ClipboardList },
              { id: 'denah', label: 'Plan', icon: MapIcon },
              { id: 'bukti', label: 'Proof', icon: Camera },
              { id: 'belanja', label: 'Shop', icon: ShoppingCart },
              { id: 'profil', label: 'Profile', icon: UserCheck },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = mobileTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMobileTab(item.id)}
                className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? 'bg-[#1B365D] text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
