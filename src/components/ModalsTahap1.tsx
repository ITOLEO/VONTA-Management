import React, { useState } from 'react';
import {
  DepartmentOnly,
  GlobalRole,
  PinPriority,
  ProfileRecord,
  SpecialtyDepartment,
  ThemePreference,
  VontaDatabaseState,
} from '../types/schema';
import {
  createBlueprintSvgDataUri,
  createFieldPhotoSvgDataUri,
  DEPARTMENT_META,
  SUPABASE_SQL_SCHEMA_STRING,
} from '../data/initialDatabase';
import { ROLE_DISPLAY_LABELS } from '../utils/permissions';
import { PhotoCaptureAndMarkupStudio } from './PhotoCaptureAndMarkupStudio';
import {
  X,
  Mail,
  Moon,
  Sun,
  Upload,
  Database,
  Copy,
  Check,
  PlusCircle,
  UserPlus,
  Bell,
  Sliders,
} from 'lucide-react';

// 1. MODAL INVITE VIA EMAIL / GOOGLE OAUTH (public.project_members & public.profiles)
interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ProfileRecord[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onInviteMember: (payload: {
    email: string;
    fullName: string;
    role: GlobalRole;
    department: SpecialtyDepartment;
  }) => void;
}

export const InviteAuthModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onInviteMember,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<GlobalRole>('worker');
  const [department, setDepartment] = useState<SpecialtyDepartment>('listrik');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;
    onInviteMember({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      department: role === 'worker' ? department : 'all',
    });
    setFeedbackMsg(
      `Magic Link invitation sent to ${email.trim().toLowerCase()} and added to public.project_members.`
    );
    setEmail('');
    setFullName('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-invite-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 text-[#141619] dark:text-[#F8FAFC] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1B365D] text-white">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#FCD34D]" />
            <h2 id="modal-invite-title" className="text-base font-bold">
              Email &amp; Google OAuth Sign-In (No Phone Required)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invite modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#1B365D] dark:text-[#38BDF8] mb-2">
              1-Click Registered Account Switcher (public.profiles)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Select a profile below to preview Owner, Foreman, or Worker access.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profiles.map((prof) => {
                const isCurrent = prof.id === activeProfileId;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => {
                      onSelectProfile(prof.id);
                      onClose();
                    }}
                    className={`min-h-[48px] p-3 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                      isCurrent
                        ? 'border-[#D97706] bg-[#D97706]/10 dark:bg-[#F59E0B]/15'
                        : 'border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#141619] dark:text-white truncate">
                        {prof.full_name}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#1B365D]/10 dark:bg-slate-700 text-[#1B365D] dark:text-[#38BDF8]">
                        {ROLE_DISPLAY_LABELS[prof.global_role]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        {prof.email}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {prof.specialty_department.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-[#E2E6EC] dark:border-slate-800" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-bold">
                Register New Worker / Foreman &amp; Issue Worker ID
              </h3>
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded-lg bg-[#16A34A]/15 border border-[#16A34A] text-xs font-medium text-[#141619] dark:text-white">
                {feedbackMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Full Name (Worker / Foreman)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Hendro Plumbing"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worker.name@gmail.com"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Project Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as GlobalRole)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="worker">Worker (Field Specialist)</option>
                  <option value="mandor">Foreman (Site Supervisor)</option>
                  <option value="warehouse">Warehouse Keeper (Materials)</option>
                  <option value="owner">Co-Owner / Architect</option>
                </select>
              </div>

              {role === 'worker' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Division
                  </label>
                  <select
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value as SpecialtyDepartment)
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="listrik">Electrical</option>
                    <option value="pipa">Plumbing</option>
                    <option value="sipil">Civil</option>
                    <option value="cat">Finishing</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs sm:text-sm font-bold transition-colors"
              >
                Send Invite &amp; Issue Worker ID
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 2. MODAL PENGATURAN / SETTINGS (Tempat Penyimpanan Aman Toggle Night Mode + Skema SQL)
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemePreference;
  onToggleTheme: (nextTheme: ThemePreference) => void;
  emailNotifEnabled: boolean;
  onToggleEmailNotif: (val: boolean) => void;
  simulatedUiState: 'normal' | 'loading' | 'empty' | 'error';
  onChangeSimulatedUiState: (state: 'normal' | 'loading' | 'empty' | 'error') => void;
  dbState: VontaDatabaseState;
  onResetDatabase: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  emailNotifEnabled,
  onToggleEmailNotif,
  simulatedUiState,
  onChangeSimulatedUiState,
  dbState,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'sql_schema'>('preferences');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_STRING);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 text-[#141619] dark:text-[#F8FAFC] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1B365D] text-white">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#FCD34D]" />
            <h2 id="modal-settings-title" className="text-base font-bold">
              Field Preferences, Theme &amp; Supabase Database Schema
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#E2E6EC] dark:border-slate-800 bg-white dark:bg-slate-950 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-[#D97706] text-[#1B365D] dark:text-[#38BDF8]'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            Field Preferences &amp; Theme
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql_schema')}
            className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sql_schema'
                ? 'border-[#D97706] text-[#1B365D] dark:text-[#38BDF8]'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase SQL Schema (PostgreSQL)</span>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {activeTab === 'preferences' ? (
            <>
              <div className="p-4 rounded-xl border border-[#E2E6EC] dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[11px] font-bold uppercase text-[#D97706]">
                      ACCIDENTAL TOUCH PROTECTION (ANTI-MISCLICK)
                    </span>
                    <h3 className="text-sm font-bold mt-0.5">
                      Display Theme (Daylight vs Night Mode)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      The theme switch is placed inside Settings to prevent accidental taps while capturing photos on site.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleTheme('light')}
                    className={`min-h-[52px] p-3 rounded-lg border-2 flex items-center gap-3 text-left transition-colors ${
                      theme === 'light'
                        ? 'border-[#1B365D] bg-[#F8F7F4] text-[#141619]'
                        : 'border-[#E2E6EC] dark:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-[#D97706] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">
                        High-Contrast Light Mode (Default)
                      </div>
                      <div className="font-mono text-[11px] opacity-75">
                        #F8F7F4 Paper White (Outdoor Sunlight)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleTheme('dark')}
                    className={`min-h-[52px] p-3 rounded-lg border-2 flex items-center gap-3 text-left transition-colors ${
                      theme === 'dark'
                        ? 'border-[#38BDF8] bg-[#0F172A] text-[#F8FAFC]'
                        : 'border-[#E2E6EC] dark:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-[#38BDF8] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">
                        Night / Dark Inspection Mode
                      </div>
                      <div className="font-mono text-[11px] opacity-75">
                        #0F172A Deep Slate (OLED Power Saving)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E6EC] dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-[#1B365D] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">
                      Email Notifications on Pin Status Changes
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Send instant emails to the Owner when a worker uploads an After photo or when an urgent pin is added.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleEmailNotif(!emailNotifEnabled)}
                  className={`min-h-[44px] px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors shrink-0 ${
                    emailNotifEnabled
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {emailNotifEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E6EC] dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">
                    Field Network State Simulator
                  </h3>
                  <span className="font-mono text-[11px] text-[#1B365D] dark:text-[#38BDF8]">
                    STATE: {simulatedUiState.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Test Vonta UI behavior under slow, empty, or disconnected site network conditions:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'normal', label: 'Normal (Active)' },
                      { id: 'loading', label: 'Loading State' },
                      { id: 'empty', label: 'Empty State' },
                      { id: 'error', label: 'Error State' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onChangeSimulatedUiState(st.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        simulatedUiState === st.id
                          ? 'bg-[#1B365D] text-white border-[#1B365D] dark:bg-[#38BDF8] dark:text-slate-950'
                          : 'bg-[#F8F7F4] dark:bg-slate-900 border-[#E2E6EC] dark:border-slate-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetDatabase();
                    onClose();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-[#DC2626]/50 text-[#DC2626] text-xs font-semibold hover:bg-[#DC2626]/10 transition-colors"
                >
                  Reset All Project Data to Default
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-[#1B365D] text-white text-xs sm:text-sm font-bold"
                >
                  Save &amp; Close Settings
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold">
                    Supabase SQL DDL (Ready for Supabase SQL Editor)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Current app state holds {dbState.profiles.length} profiles,{' '}
                    {dbState.blueprints.length} floor plans, and {dbState.pins.length} pins with 100% matching columns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[340px] border border-slate-800">
                {SUPABASE_SQL_SCHEMA_STRING}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. MODAL UPLOAD BLUEPRINT BARU (public.blueprints)
interface UploadBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlueprint: (areaName: string, imageUrl: string) => void;
}

export const UploadBlueprintModal: React.FC<UploadBlueprintModalProps> = ({
  isOpen,
  onClose,
  onAddBlueprint,
}) => {
  const [areaName, setAreaName] = useState('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;
    const finalImage =
      uploadedDataUrl || createBlueprintSvgDataUri('custom', areaName.trim());
    onAddBlueprint(areaName.trim(), finalImage);
    setAreaName('');
    setUploadedDataUrl(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-blueprint-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 text-[#141619] dark:text-[#F8FAFC] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1B365D] text-white">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#FCD34D]" />
            <h2 id="modal-blueprint-title" className="text-base font-bold">
              Upload New Area Floor Plan (public.blueprints)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close floor plan upload modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Area / Building Floor Name
            </label>
            <input
              type="text"
              required
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="e.g. Area 4: Rooftop Lounge & Panel Room"
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Floor Plan Image (JPG / PNG / SVG) or Leave Blank for Auto CAD
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-dashed border-[#1B365D] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs cursor-pointer"
            />
            {uploadedDataUrl && (
              <p className="font-mono text-[11px] text-[#16A34A] mt-1">
                Floor plan image loaded and ready for the 3D/2D canvas.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs sm:text-sm font-bold"
            >
              Save &amp; Open Area Floor Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. MODAL TAMBAH TITIK PIN BARU OLEH LEADER (public.pins) + LIVE CAMERA & PHOTO MARKUP STUDIO
interface CreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordX: number;
  coordY: number;
  nextPinCode: string;
  workers: ProfileRecord[];
  onCreatePin: (payload: {
    title: string;
    description: string;
    department: DepartmentOnly;
    priority: PinPriority;
    assignedWorkerEmail: string;
    beforeMediaUrl: string;
    coordX: number;
    coordY: number;
  }) => void;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({
  isOpen,
  onClose,
  coordX,
  coordY,
  nextPinCode,
  workers,
  onCreatePin,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<DepartmentOnly>('listrik');
  const [priority, setPriority] = useState<PinPriority>('urgent');
  const [assignedEmail, setAssignedEmail] = useState<string>('budi.listrik@gmail.com');
  const [annotatedBeforePhoto, setAnnotatedBeforePhoto] = useState<string | null>(
    null
  );

  if (!isOpen) return null;

  const handleDepartmentChange = (nextDept: DepartmentOnly) => {
    setDepartment(nextDept);
    const matchingWorker = workers.find((w) => w.specialty_department === nextDept);
    if (matchingWorker) {
      setAssignedEmail(matchingWorker.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const beforeUrl =
      annotatedBeforePhoto ||
      createFieldPhotoSvgDataUri(nextPinCode, 'BEFORE', department, title.trim());

    onCreatePin({
      title: title.trim(),
      description:
        description.trim() ||
        'Requires inspection and follow-up per working drawings.',
      department,
      priority,
      assignedWorkerEmail: assignedEmail,
      beforeMediaUrl: beforeUrl,
      coordX,
      coordY,
    });

    setTitle('');
    setDescription('');
    setAnnotatedBeforePhoto(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-create-pin-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#E2E6EC] dark:border-slate-700 bg-[#F8F7F4] dark:bg-slate-900 text-[#141619] dark:text-[#F8FAFC] shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1B365D] text-white">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#FCD34D]" />
            <h2 id="modal-create-pin-title" className="text-base font-bold">
              Place New Pin ({nextPinCode}) &amp; Field Photo Markup
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add pin modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[82vh] overflow-y-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-[#1B365D]/10 dark:bg-slate-800 font-mono text-xs">
            <span className="font-bold text-[#1B365D] dark:text-[#38BDF8]">
              AUTO CODE: {nextPinCode}
            </span>
            <span>
              CANVAS TARGET · X: {coordX.toFixed(1)}% · Y:{' '}
              {coordY.toFixed(1)}%
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Issue Title / Work Task
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bar Counter Outlet Missing Grounding Wire"
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Division
              </label>
              <select
                value={department}
                onChange={(e) =>
                  handleDepartmentChange(e.target.value as DepartmentOnly)
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                {(Object.keys(DEPARTMENT_META) as DepartmentOnly[]).map((dept) => (
                  <option key={dept} value={dept}>
                    {DEPARTMENT_META[dept].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PinPriority)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="urgent">URGENT (High Priority)</option>
                <option value="normal">NORMAL (Standard)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Assign to Worker (Account Email)
              </label>
              <select
                value={assignedEmail}
                onChange={(e) => setAssignedEmail(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.email}>
                    {w.full_name} ({w.email}) - [
                    {w.specialty_department.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Brief Field Instruction Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe action details for the worker..."
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Studio Kamera Live & Coretan Anotasi Foto (Step 5 Opsi 3 Enhancement) */}
          <PhotoCaptureAndMarkupStudio
            pinCode={nextPinCode}
            phase="BEFORE"
            department={department}
            titleHint={title}
            coordX={coordX}
            coordY={coordY}
            onImageReady={(dataUrl) => setAnnotatedBeforePhoto(dataUrl)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E6EC] dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#b86305] text-white text-xs sm:text-sm font-bold"
            >
              Place Pin {nextPinCode} with Markup Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

