import React, { useMemo, useState } from 'react';
import {
  BlueprintRecord,
  DepartmentOnly,
  GlobalRole,
  MaterialAllocationRecord,
  PinRecord,
  ProfileRecord,
  ProjectRecord,
} from '../types/schema';
import {
  DEPARTMENT_META,
  PIN_STATUS_META,
  createFieldPhotoSvgDataUri,
} from '../data/initialDatabase';
import {
  Copy,
  Check,
  MapPin,
  Printer,
  Award,
  Mail,
} from 'lucide-react';

interface ExecutiveAndPortfolioViewProps {
  mode?: 'overview' | 'portfolio';
  project: ProjectRecord;
  blueprints: BlueprintRecord[];
  pins: PinRecord[];
  profiles?: ProfileRecord[];
  materialAllocations: MaterialAllocationRecord[];
  activeRole: GlobalRole;
  onUpdateTerminTarget: (targetPercent: number) => void;
  onJumpToPinOnMap: (pinId: string) => void;
  onOpenPrintModal: () => void;
}

export const ExecutiveAndPortfolioView: React.FC<
  ExecutiveAndPortfolioViewProps
> = ({
  project,
  pins,
  profiles = [],
  onJumpToPinOnMap,
  onOpenPrintModal,
}) => {
  const workerList = useMemo(
    () => profiles.filter((p) => p.global_role === 'worker'),
    [profiles]
  );
  const [selectedWorkerEmail, setSelectedWorkerEmail] = useState<string>(
    workerList[0]?.email || 'budi.listrik@gmail.com'
  );
  const [copiedPublicUrl, setCopiedPublicUrl] = useState<boolean>(false);

  const activeWorkerProfile =
    workerList.find((w) => w.email === selectedWorkerEmail) || workerList[0];

  const workerAllAssignedPins = useMemo(
    () =>
      pins.filter(
        (p) => p.assigned_worker_email === activeWorkerProfile?.email
      ),
    [pins, activeWorkerProfile]
  );

  const workerResolvedPins = useMemo(
    () => workerAllAssignedPins.filter((p) => p.status === 'resolved'),
    [workerAllAssignedPins]
  );

  // Metrik First-Time Right % & Revision Counter rata-rata
  const ftrPercent = useMemo(() => {
    if (!activeWorkerProfile) return 100;
    if (activeWorkerProfile.total_resolved_pins === 0) return 100;
    return Math.round(
      (activeWorkerProfile.first_time_right_count /
        activeWorkerProfile.total_resolved_pins) *
        100
    );
  }, [activeWorkerProfile]);

  const workerAvgRevision = useMemo(() => {
    if (workerAllAssignedPins.length === 0) return 0.8;
    const sumRev = workerAllAssignedPins.reduce(
      (acc, p) => acc + p.revision_count,
      0
    );
    return Number((sumRev / workerAllAssignedPins.length).toFixed(1));
  }, [workerAllAssignedPins]);

  // Galeri Before-After 3 Kolom
  const workerGalleryItems = useMemo(() => {
    if (!activeWorkerProfile) return [];
    const dept: DepartmentOnly =
      activeWorkerProfile.specialty_department === 'all'
        ? 'listrik'
        : activeWorkerProfile.specialty_department;

    const liveItems = workerResolvedPins.map((p) => ({
      id: p.id,
      pinCode: p.pin_code,
      title: p.title,
      dateLabel: p.resolved_at
        ? new Date(p.resolved_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '26 Oct 2026',
      beforeUrl: p.before_media_url,
      afterUrl:
        p.after_media_url ||
        createFieldPhotoSvgDataUri(
          p.pin_code,
          'AFTER',
          dept,
          'Verified repair complete'
        ),
      isLiveProjectPin: true,
      pinId: p.id,
    }));

    const historicalShowcase = [
      {
        id: `hist-${activeWorkerProfile.id}-1`,
        pinCode: '#L-021',
        title:
          dept === 'listrik'
            ? 'Main Panel Cable Repair'
            : dept === 'pipa'
            ? 'Pump Pressure Pipe Joint Repair'
            : dept === 'sipil'
            ? 'Wall Structure & Plaster Repair'
            : 'Weatherproof Exterior Repainting',
        dateLabel: '12 Apr 2026',
        beforeUrl: createFieldPhotoSvgDataUri(
          '#L-021',
          'BEFORE',
          dept,
          'Initial condition before repair'
        ),
        afterUrl: createFieldPhotoSvgDataUri(
          '#L-021',
          'AFTER',
          dept,
          'Verified clean final result'
        ),
        isLiveProjectPin: false,
        pinId: null,
      },
      {
        id: `hist-${activeWorkerProfile.id}-2`,
        pinCode: '#L-037',
        title:
          dept === 'listrik'
            ? 'Outdoor Switch & Grounding Install'
            : dept === 'pipa'
            ? 'Floor Drain & Waterproofing Install'
            : dept === 'sipil'
            ? 'Granite Grout & Column Corner Leveling'
            : 'Alkali Sealer & Topcoat Application',
        dateLabel: '18 Apr 2026',
        beforeUrl: createFieldPhotoSvgDataUri(
          '#L-037',
          'BEFORE',
          dept,
          'Initial inspection finding'
        ),
        afterUrl: createFieldPhotoSvgDataUri(
          '#L-037',
          'AFTER',
          dept,
          'Completed to QC standard'
        ),
        isLiveProjectPin: false,
        pinId: null,
      },
      {
        id: `hist-${activeWorkerProfile.id}-3`,
        pinCode: '#L-062',
        title:
          dept === 'listrik'
            ? 'Conduit Routing & MCB Termination'
            : dept === 'pipa'
            ? 'Hot Water Pipe Pressure Test'
            : dept === 'sipil'
            ? 'Hairline Crack & Fine Skimcoat Repair'
            : 'Main Wall Finish & Corner Touch-up',
        dateLabel: '25 Apr 2026',
        beforeUrl: createFieldPhotoSvgDataUri(
          '#L-062',
          'BEFORE',
          dept,
          'Pin photo before work'
        ),
        afterUrl: createFieldPhotoSvgDataUri(
          '#L-062',
          'AFTER',
          dept,
          'Approved by Owner (Resolved)'
        ),
        isLiveProjectPin: false,
        pinId: null,
      },
    ];

    return [...liveItems, ...historicalShowcase].slice(0, 6);
  }, [activeWorkerProfile, workerResolvedPins]);

  // Riwayat Proyek Pekerja
  const projectHistoryRows = useMemo(() => {
    if (!activeWorkerProfile) return [];
    const deptLabel =
      DEPARTMENT_META[
        activeWorkerProfile.specialty_department === 'all'
          ? 'listrik'
          : activeWorkerProfile.specialty_department
      ].shortLabel;

    return [
      {
        id: 'proj-row-1',
        projectName: project.name,
        location: 'Uluwatu, Bali',
        roleDept: `${deptLabel} Specialist`,
        resolvedCount: workerResolvedPins.length,
        totalAssigned: workerAllAssignedPins.length,
        ftr: `${ftrPercent}%`,
        status: 'Active',
      },
      {
        id: 'proj-row-2',
        projectName: 'Villa Cempaka Residence',
        location: 'Canggu, Bali',
        roleDept: `${deptLabel} Specialist`,
        resolvedCount: 8,
        totalAssigned: 8,
        ftr: '100%',
        status: 'Completed',
      },
      {
        id: 'proj-row-3',
        projectName: 'Jimbaran Cliff Boutique Hotel',
        location: 'Jimbaran, Bali',
        roleDept: `${deptLabel} Specialist`,
        resolvedCount: Math.max(4, activeWorkerProfile.total_resolved_pins - 8),
        totalAssigned: Math.max(4, activeWorkerProfile.total_resolved_pins - 8),
        ftr: `${ftrPercent}%`,
        status: 'Completed',
      },
    ];
  }, [
    activeWorkerProfile,
    project.name,
    workerResolvedPins.length,
    workerAllAssignedPins.length,
    ftrPercent,
  ]);

  const handleCopyCvLink = async () => {
    const url = `https://vonta.app/cv/${
      activeWorkerProfile?.email || 'budi.listrik@gmail.com'
    }`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2000);
    } catch {
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2000);
    }
  };

  if (!activeWorkerProfile) return null;

  const activeDeptLabel =
    DEPARTMENT_META[
      activeWorkerProfile.specialty_department === 'all'
        ? 'listrik'
        : activeWorkerProfile.specialty_department
    ].label;

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-4">
      {/* Bar Atas: Judul Halaman + Pemilih Pekerja + Tombol Salin CV / Cetak */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
          Worker Portfolio (CV)
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Select worker profile"
            value={selectedWorkerEmail}
            onChange={(e) => setSelectedWorkerEmail(e.target.value)}
            className="h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
          >
            {workerList.map((w) => (
              <option key={w.id} value={w.email}>
                {w.full_name} ({w.email})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopyCvLink}
            className="h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[13px] font-medium flex items-center gap-1.5 hover:border-[#1B365D]"
          >
            {copiedPublicUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>CV Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy CV Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenPrintModal}
            className="h-9 px-3.5 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-medium flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print handover report</span>
          </button>
        </div>
      </div>

      {/* 1. HEADER PROFIL PEKERJA (Nama, Email, Spesialisasi, First-Time Right, Revision Counter) */}
      <div className="p-4 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#1B365D] text-white font-mono text-[15px] font-bold flex items-center justify-center shrink-0">
            {activeWorkerProfile.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[16px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                {activeWorkerProfile.full_name}
              </h2>
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] px-2 py-0.5 rounded-[4px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346] text-[#1B365D] dark:text-[#D97706]">
                {activeDeptLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#94A3B8] font-mono mt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{activeWorkerProfile.email}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
              FIRST-TIME RIGHT
            </div>
            <div className="text-[18px] font-mono font-semibold tabular-nums text-[#16A34A] mt-0.5">
              {ftrPercent}%
            </div>
          </div>

          <div className="p-3 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
              REVISION COUNTER
            </div>
            <div className="text-[18px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC] mt-0.5">
              {workerAvgRevision}
            </div>
          </div>

          <div className="p-3 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
              VERIFIED PINS
            </div>
            <div className="text-[18px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC] mt-0.5">
              {activeWorkerProfile.total_resolved_pins} pins
            </div>
          </div>
        </div>
      </div>

      {/* 2. GALERI BEFORE-AFTER 3 KOLOM YANG RINGKAS */}
      <div className="p-4 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
          <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
            <span>Verified Before-After Gallery</span>
          </h3>
          <span className="text-[11px] font-mono uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
            {workerGalleryItems.length} photos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workerGalleryItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] overflow-hidden flex flex-col justify-between"
            >
              <div className="grid grid-cols-2 gap-0.5 bg-[#E2E6EC] dark:bg-[#263346] aspect-[16/9]">
                <div className="relative h-full overflow-hidden">
                  <img
                    src={item.beforeUrl}
                    alt={`Before ${item.pinCode}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-white font-mono text-[10px] font-semibold">
                    Before
                  </span>
                </div>
                <div className="relative h-full overflow-hidden">
                  <img
                    src={item.afterUrl}
                    alt={`After ${item.pinCode}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#16A34A] text-white font-mono text-[10px] font-semibold">
                    After
                  </span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#1B365D] dark:text-[#D97706]">
                      {item.pinCode}
                    </span>
                    <span className="text-[13px] font-medium text-[#141619] dark:text-[#F8FAFC] truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Approved: {item.dateLabel}
                  </div>
                </div>

                {item.isLiveProjectPin && item.pinId && (
                  <button
                    type="button"
                    onClick={() => onJumpToPinOnMap(item.pinId!)}
                    className="h-7 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[11px] font-medium flex items-center gap-1 shrink-0 hover:border-[#1B365D]"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Floor plan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TABEL RIWAYAT PROYEK & TITIK PENGERJAAN */}
      <div className="p-4 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
          <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
            Project &amp; Pin History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EC] dark:border-[#263346] text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Specialty</th>
                <th className="py-2.5 px-3">Resolved pins</th>
                <th className="py-2.5 px-3">First-Time Right</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
              {projectHistoryRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C] transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-[#141619] dark:text-[#F8FAFC]">
                    {row.projectName}
                  </td>
                  <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8]">
                    {row.location}
                  </td>
                  <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8]">
                    {row.roleDept}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">
                    {row.resolvedCount} / {row.totalAssigned} pins
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold tabular-nums text-[#16A34A]">
                    {row.ftr}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                    <span
                      className={
                        row.status === 'Active'
                          ? 'text-[#B45309] dark:text-[#D97706]'
                          : 'text-[#16A34A]'
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daftar Titik Aktif Pekerja Ini */}
        {workerAllAssignedPins.length > 0 && (
          <div className="pt-3 border-t border-[#E2E6EC] dark:border-[#263346]">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8] mb-2">
              Assigned Pins on Active Project ({workerAllAssignedPins.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {workerAllAssignedPins.map((pin) => {
                const stMeta = PIN_STATUS_META[pin.status];
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => onJumpToPinOnMap(pin.id)}
                    className="p-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] hover:border-[#1B365D] flex items-center justify-between gap-2 text-left text-[12px]"
                  >
                    <div className="truncate">
                      <span
                        className="font-mono font-bold px-1.5 py-0.5 rounded text-white text-[10px] mr-1.5"
                        style={{ backgroundColor: stMeta.hex }}
                      >
                        {pin.pin_code}
                      </span>
                      <span className="font-medium text-[#141619] dark:text-[#F8FAFC]">
                        {pin.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums shrink-0 text-[#475569] dark:text-[#94A3B8]">
                      R-0{pin.revision_count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
