import React, { useState } from 'react';
import {
  GlobalRole,
  ProjectRecord,
  VontaDatabaseState,
} from '../types/schema';
import {
  SUPABASE_SQL_SCHEMA_STRING,
  generateDynamicSqlSeed,
} from '../data/initialDatabase';
import {
  OfflineQueueEntry,
  RlsOperation,
  evaluateRlsPermission,
} from '../utils/vontaAnalytics';
import { safeSetItem, safeGetItem } from '../utils/storage';
import { ROLE_DISPLAY_LABELS } from '../utils/permissions';
import {
  X,
  FolderPlus,
  Database,
  Copy,
  Check,
  Download,
  Upload,
  Wifi,
  WifiOff,
  RefreshCw,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';

interface SupabaseAndProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbState: VontaDatabaseState;
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: (payload: {
    name: string;
    targetEndDate: string;
    terminTargetPercent: number;
    generalNote: string;
  }) => void;
  onImportDatabaseJson: (importedDb: VontaDatabaseState) => void;
  isOfflineFieldMode: boolean;
  onToggleOfflineFieldMode: (val: boolean) => void;
  offlinePendingQueueCount: number;
  offlineQueueEntries?: OfflineQueueEntry[];
  onSimulateOfflineAction?: () => void;
  onSyncOfflineQueueNow: () => void;
}

const RLS_TEST_OPERATIONS: { id: RlsOperation; label: string }[] = [
  { id: 'create_pin', label: 'Place New Pin' },
  { id: 'upload_after_proof', label: 'Upload After Photo + Voice Note' },
  { id: 'approve_reject_pin', label: 'Approve / Reject Pin' },
  { id: 'reopen_ghost_pin', label: 'Reopen Resolved Pin' },
  { id: 'request_delete_pin', label: 'Request Pin Deletion' },
  { id: 'direct_delete_pin', label: 'Permanently Delete Pin (Anti-Tamper)' },
  { id: 'edit_termin_target', label: 'Edit Payment Stage Target %' },
];

export const SupabaseAndProjectManagerModal: React.FC<
  SupabaseAndProjectManagerModalProps
> = ({
  isOpen,
  onClose,
  dbState,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onImportDatabaseJson,
  isOfflineFieldMode,
  onToggleOfflineFieldMode,
  offlinePendingQueueCount,
  offlineQueueEntries = [],
  onSimulateOfflineAction,
  onSyncOfflineQueueNow,
}) => {
  const [activeTab, setActiveTab] = useState<
    'projects' | 'supabase_rls' | 'offline_sync'
  >('projects');
  const [rlsTestRole, setRlsTestRole] = useState<GlobalRole>('mandor');

  // Form Buat Proyek Baru
  const [projName, setProjName] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('2027-02-28');
  const [terminTarget, setTerminTarget] = useState<number>(80);
  const [generalNote, setGeneralNote] = useState(
    'Follow site safety rules and upload After photo proof before marking work complete.'
  );

  // State Salin SQL & Konfigurasi Manual Supabase
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(
    safeGetItem('vonta_manual_supabase_url') || ''
  );
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(
    safeGetItem('vonta_manual_supabase_key') || ''
  );
  const [savedConfigMsg, setSavedConfigMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    onCreateNewProject({
      name: projName.trim(),
      targetEndDate,
      terminTargetPercent: terminTarget,
      generalNote: generalNote.trim(),
    });
    setProjName('');
    onClose();
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_STRING);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleCopySeed = () => {
    const seedSql = generateDynamicSqlSeed(dbState);
    navigator.clipboard.writeText(seedSql);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(dbState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vonta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          const parsed = JSON.parse(reader.result) as VontaDatabaseState;
          if (parsed.projects && parsed.pins && parsed.blueprints) {
            onImportDatabaseJson(parsed);
            onClose();
          }
        }
      } catch {
        // Abaikan jika format JSON tidak sesuai
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSupabaseCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const r1 = safeSetItem('vonta_manual_supabase_url', supabaseUrlInput.trim());
    const r2 = safeSetItem('vonta_manual_supabase_key', supabaseAnonKeyInput.trim());
    if (r1.success && r2.success) {
      setSavedConfigMsg(
        'Supabase URL & Anon Key saved locally and ready for client SDK.'
      );
    } else {
      setSavedConfigMsg(
        'Storage quota exceeded: credentials could not be saved to local storage.'
      );
    }
    setTimeout(() => setSavedConfigMsg(null), 3500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tahap4-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-3xl rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 text-[#141619] dark:text-[#F8FAFC] shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1B365D] text-white">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-[#FCD34D]" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/15 text-[#FCD34D] font-bold">
                WORKSPACE &amp; SYNC MANAGEMENT
              </span>
              <h2 id="modal-tahap4-title" className="text-base font-bold mt-0.5">
                Multi-Project Manager, Supabase + RLS &amp; Offline Field Sync
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project management modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#E2E6EC] dark:border-slate-800 bg-white dark:bg-slate-950 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-[#D97706] text-[#1B365D] dark:text-[#38BDF8]'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Projects ({dbState.projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase_rls')}
            className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'supabase_rls'
                ? 'border-[#D97706] text-[#1B365D] dark:text-[#38BDF8]'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Connector, SQL + RLS &amp; JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline_sync')}
            className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'offline_sync'
                ? 'border-[#D97706] text-[#1B365D] dark:text-[#38BDF8]'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            {isOfflineFieldMode ? (
              <WifiOff className="w-4 h-4 text-[#D97706]" />
            ) : (
              <Wifi className="w-4 h-4 text-[#16A34A]" />
            )}
            <span>Offline-First Field Sync</span>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* TAB 1: MULTI-PROJECT SWITCHER & BUAT PROYEK BARU */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase text-[#1B365D] dark:text-[#38BDF8] mb-2">
                  Active Construction Projects (public.projects)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dbState.projects.map((proj: ProjectRecord) => {
                    const isCurrent = proj.id === activeProjectId;
                    const projPins = dbState.pins.filter(
                      (p) => p.project_id === proj.id
                    );
                    const projResolved = projPins.filter(
                      (p) => p.status === 'resolved'
                    ).length;

                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-colors flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? 'border-[#1B365D] dark:border-[#38BDF8] bg-[#1B365D]/8 dark:bg-sky-400/10'
                            : 'border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#D97706]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm text-[#141619] dark:text-white">
                            {proj.name}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#16A34A] text-white shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                          <span>
                            Pins: {projResolved}/{projPins.length} Resolved
                          </span>
                          <span>Stage Target: {proj.termin_target_percent}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-[#E2E6EC] dark:border-slate-800" />

              <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#D97706]" />
                  <span>Create New Construction / Renovation Project</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      New Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      placeholder="e.g. Canggu Roastery & Cafe Build"
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Target Completion
                    </label>
                    <input
                      type="date"
                      value={targetEndDate}
                      onChange={(e) => setTargetEndDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Payment Stage Target (%)
                    </label>
                    <select
                      value={terminTarget}
                      onChange={(e) => setTerminTarget(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                    >
                      <option value={50}>50% Resolved Pins</option>
                      <option value={80}>80% Resolved Pins</option>
                      <option value={100}>100% Resolved Pins (Handover)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Initial Project Note
                    </label>
                    <input
                      type="text"
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs sm:text-sm font-bold"
                  >
                    Create Project &amp; Setup Floor Plans
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SUPABASE CONNECTOR + SQL RLS + JSON BACKUP */}
          {activeTab === 'supabase_rls' && (
            <div className="space-y-5">
              {/* Form Simpan Kredensial Supabase Manual */}
              <form
                onSubmit={handleSaveSupabaseCredentials}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E6EC] dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-[#1B365D] dark:text-[#38BDF8] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span>Manual Supabase Project Connection</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    READY FOR SUPABASE-JS
                  </span>
                </div>

                {savedConfigMsg && (
                  <div className="p-2.5 rounded-lg bg-[#16A34A]/15 border border-[#16A34A] text-xs font-semibold text-[#16A34A]">
                    {savedConfigMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold mb-1">
                      SUPABASE PROJECT URL
                    </label>
                    <input
                      type="url"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-semibold mb-1">
                      SUPABASE ANON PUBLIC KEY
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#1B365D] dark:border-[#38BDF8] text-[#1B365D] dark:text-[#38BDF8] text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Database (.JSON)</span>
                    </button>

                    <label className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#D97706]">
                      <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Import Backup (.JSON)</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleImportJsonFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-bold"
                  >
                    Save Supabase Endpoint
                  </button>
                </div>
              </form>

              {/* SQL DDL + RLS Copy Block */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold">
                      8-Table PostgreSQL Schema + Row Level Security (RLS) Policies
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Includes Anti-Tamper Pin Deletion RLS policies and Owner/Foreman approval locks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySeed}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#D97706] text-[#D97706] text-xs font-bold flex items-center gap-1.5"
                    >
                      {copiedSeed ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedSeed ? 'Seed Summary Copied' : 'Copy SQL Seed Summary'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySchema}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      {copiedSchema ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedSchema ? 'Schema + RLS Copied!' : 'Copy SQL Schema + RLS'}
                      </span>
                    </button>
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-[220px] border border-slate-800">
                  {SUPABASE_SQL_SCHEMA_STRING}
                </pre>

                {/* Interactive RLS Policy Evaluator Matrix */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E6EC] dark:border-slate-700 space-y-3 mt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase text-[#1B365D] dark:text-[#38BDF8]">
                        ROW LEVEL SECURITY (RLS) POLICY SIMULATOR
                      </span>
                      <h5 className="text-xs font-bold mt-0.5">
                        Role Access Permission Matrix
                      </h5>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(['owner', 'mandor', 'warehouse', 'worker'] as GlobalRole[]).map(
                        (roleOpt) => (
                          <button
                            key={roleOpt}
                            type="button"
                            onClick={() => setRlsTestRole(roleOpt)}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors ${
                              rlsTestRole === roleOpt
                                ? 'bg-[#1B365D] text-white'
                                : 'bg-[#F8F7F4] dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-[#E2E6EC] dark:border-slate-700'
                            }`}
                          >
                            {ROLE_DISPLAY_LABELS[roleOpt]}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-[#E2E6EC] dark:divide-slate-700 text-xs">
                    {RLS_TEST_OPERATIONS.map((op) => {
                      const check = evaluateRlsPermission(rlsTestRole, op.id);
                      return (
                        <div
                          key={op.id}
                          className="py-2 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-semibold text-[#141619] dark:text-white">
                              {op.label}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {check.reason}
                            </p>
                          </div>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                              check.allowed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            }`}
                          >
                            {check.allowed ? 'ALLOWED (RLS PASS)' : 'BLOCKED (RLS DENY)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE-FIRST FIELD SYNC (UNTUK PEKERJA DI BASEMENT / AREA BLANK SPOT) */}
          {activeTab === 'offline_sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E6EC] dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold uppercase text-[#D97706]">
                      FIELD SIGNAL RESILIENCE (OFFLINE-FIRST OUTBOX QUEUE)
                    </span>
                    <h3 className="text-base font-bold mt-0.5">
                      Basement / Dead-Zone Offline Field Mode
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      When workers are in underground pump rooms or low-signal villa areas, all After photos, voice notes, and material requests are queued locally and synced automatically once back online.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleOfflineFieldMode(!isOfflineFieldMode)}
                    className={`min-h-[44px] px-4 py-2 rounded-lg font-mono text-xs font-bold shrink-0 transition-colors ${
                      isOfflineFieldMode
                        ? 'bg-[#D97706] text-white'
                        : 'bg-[#16A34A] text-white'
                    }`}
                  >
                    {isOfflineFieldMode
                      ? 'OFFLINE FIELD MODE ACTIVE'
                      : 'ONLINE (REAL-TIME SYNC)'}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E2E6EC] dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-xs">
                    <span className="text-slate-500">
                      LOCAL TRANSACTION QUEUE (OUTBOX):{' '}
                    </span>
                    <strong className="text-[#141619] dark:text-white">
                      {offlinePendingQueueCount} Changes Pending Server Sync
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onSimulateOfflineAction && (
                      <button
                        type="button"
                        onClick={onSimulateOfflineAction}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#D97706] text-[#D97706] text-xs font-bold hover:bg-[#D97706]/10"
                      >
                        + Simulate Offline Action
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onSyncOfflineQueueNow}
                      className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Queue Now</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Outbox Log */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase text-slate-500">
                    <span>LOCAL TRANSACTION LOG (INDEXED-DB / STORAGE OUTBOX)</span>
                    <span>{offlineQueueEntries.length} ITEMS</span>
                  </div>
                  {offlineQueueEntries.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-[#E2E6EC] dark:border-slate-700 text-center text-xs text-slate-500">
                      Outbox queue is empty (0 pending). Enable Offline Field Mode or click &quot;+ Simulate Offline Action&quot; to test offline queueing.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {offlineQueueEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-3 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#D97706]/40 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-[#D97706] text-white font-bold">
                                {entry.actionType}
                              </span>
                              <span className="font-bold text-[#1B365D] dark:text-[#38BDF8]">
                                {entry.pinCode}
                              </span>
                              <span className="text-slate-500">
                                by {entry.actorName} ({ROLE_DISPLAY_LABELS[entry.actorRole as GlobalRole] || entry.actorRole})
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#141619] dark:text-white mt-1">
                              {entry.summary}
                            </p>
                          </div>
                          <span className="font-mono text-[10px] text-[#D97706] font-bold shrink-0">
                            PENDING SYNC
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
