import React, { useState, useMemo, useEffect } from 'react';
import {
  BlueprintRecord,
  DivisionRecord,
  GlobalRole,
  InventoryItemRecord,
  MaterialAllocationRecord,
  PinRecord,
  ProfileRecord,
  ProjectMemberRecord,
  ProjectRecord,
  SpecialtyDepartment,
} from '../types/schema';
import { getDepartmentMeta, PIN_STATUS_META } from '../data/initialDatabase';
import {
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  Layers,
  Package,
  Lock,
  UserPlus,
  ArrowUpRight,
  Trash2,
  X,
  Printer,
  Clock,
  Unlock,
  Users,
  MessageSquare,
} from 'lucide-react';

// ============================================================================
// KOMPONEN 0A: "WEB HOME LANDING VIEW" (PALET ARCHITECTURAL BLUEPRINT & BRASS SESUAI PRD)
// Light Mode Default: Bg #F8F7F4, Card #FFFFFF, Border #E2E6EC, Brand #1B365D, Accent #B45309
// Dark Mode: Bg #0F141C, Card #161F2C, Border #263346, Text #F8FAFC, Accent #D97706
// ============================================================================
interface VontaWebHomeLandingViewProps {
  activeProfile: ProfileRecord;
  profiles: ProfileRecord[];
  projectsCount: number;
  totalPinsCount: number;
  onOpenDashboardProjects: () => void;
  onSwitchProfile: (profileId: string) => void;
  themeMode: 'system' | 'dark' | 'light';
  onSelectThemeMode: (mode: 'system' | 'dark' | 'light') => void;
}

export const VontaWebHomeLandingView: React.FC<VontaWebHomeLandingViewProps> = ({
  activeProfile,
  profiles,
  projectsCount,
  totalPinsCount,
  onOpenDashboardProjects,
  onSwitchProfile,
  themeMode,
  onSelectThemeMode,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen pt-14 flex flex-col bg-[#F8F7F4] dark:bg-[#0F141C] text-[#141619] dark:text-[#F8FAFC] transition-colors">
      {/* Top Web Header (Fixed di atas, Sesuai Palet PRD Vonta + Tombol "Dashboard" di dekat Avatar Profile Kanan) */}
      <header className="h-14 border-b border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] px-6 lg:px-12 flex items-center justify-between gap-8 fixed top-0 left-0 right-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-2.5 py-1 rounded-[6px] bg-[#1B365D] text-white font-mono text-[13px] font-bold tracking-wider">
            VONTA
          </div>
        </div>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#475569] dark:text-[#94A3B8]">
          <a
            href="#spatial-audit"
            className="hover:text-[#141619] dark:hover:text-white transition-colors whitespace-nowrap"
          >
            3D &amp; 2D Floor Plan
          </a>
          <a
            href="#warehouse-sr-pr"
            className="hover:text-[#141619] dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Warehouse &amp; SR/PR
          </a>
          <a
            href="#face-attendance"
            className="hover:text-[#141619] dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Attendance &amp; Team
          </a>
        </nav>

        {/* Zone 3: Primary Action "Dashboard" Button Right Next to Profile Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
            {projectsCount} Projects
          </span>

          <button
            type="button"
            onClick={onOpenDashboardProjects}
            className="h-9 px-4 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            Dashboard
          </button>

          {/* Avatar Profile Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((v) => !v)}
              aria-label="User profile menu"
              className="w-9 h-9 rounded-full bg-[#B45309] text-white font-mono text-[11px] font-semibold flex items-center justify-center border border-[#E2E6EC] dark:border-[#263346] hover:ring-2 hover:ring-[#B45309]/40 transition-all cursor-pointer"
            >
              {activeProfile.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-lg z-50 divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[12px] text-[#141619] dark:text-[#F8FAFC]">
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">
                      {activeProfile.full_name}
                    </p>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#1B365D]/10 dark:bg-white/10 text-[#1B365D] dark:text-[#D97706]">
                      {activeProfile.global_role === 'mandor'
                        ? 'foreman'
                        : activeProfile.global_role}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
                    {activeProfile.email}
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <span className="px-2 py-0.5 block text-[10px] font-mono uppercase text-[#475569] dark:text-[#94A3B8]">
                    Switch Role (Owner / Foreman)
                  </span>
                  {profiles
                    .filter(
                      (p) =>
                        p.global_role === 'owner' || p.global_role === 'mandor'
                    )
                    .slice(0, 3)
                    .map((prof) => {
                      const isCurrent = prof.id === activeProfile.id;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            onSwitchProfile(prof.id);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full px-2 py-1.5 rounded-[6px] text-left flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-[#1B365D] text-white font-semibold'
                              : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                          }`}
                        >
                          <span className="truncate">
                            {prof.full_name} (
                            {(prof.global_role === 'mandor'
                              ? 'foreman'
                              : prof.global_role
                            ).toUpperCase()}
                            )
                          </span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          )}
                        </button>
                      );
                    })}
                </div>

                <div className="p-2 flex items-center justify-between gap-1">
                  {(['light', 'dark', 'system'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onSelectThemeMode(m)}
                      className={`flex-1 py-1 rounded text-[11px] font-medium capitalize ${
                        themeMode === m
                          ? 'bg-[#B45309] text-white'
                          : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Feature Grid (Palet Architectural Blueprint & Brass) */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 lg:px-12 py-14 lg:py-20 flex flex-col justify-between gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-[12px] font-mono uppercase tracking-[0.08em] text-[#B45309] dark:text-[#D97706]">
              Spatial Construction &amp; Field Audit Workspace
            </div>
            <h1 className="text-[38px] sm:text-[46px] font-semibold tracking-[-0.03em] leading-[1.12] text-[#141619] dark:text-[#F8FAFC]">
              Construction Quality Control.
              <span className="block text-[#1B365D] dark:text-[#D97706] mt-1">
                Precision at Every Pin.
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenDashboardProjects}
                className="h-10 px-5 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Open Dashboard
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-[15px] leading-relaxed text-[#475569] dark:text-[#94A3B8]">
            <p className="text-[#141619] dark:text-[#F8FAFC] font-medium">
              Spatial construction management for Owners and Foremen with
              isolated project workspaces.
            </p>
            <p>
              Each project includes Overview, 3D/2D Floor Plan, Face
              Attendance, Warehouse Stock, Shopping List, SR/PR by Division,
              and Project Team.
            </p>
          </div>
        </div>

        {/* 3 Architectural Feature Cards (Surface #FFFFFF, Border #E2E6EC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            id="spatial-audit"
            className="p-6 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between gap-6"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                <Layers className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
                <span>3D Floor Plan &amp; Before-After Gate</span>
              </div>
              <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Place pins directly on area floor plans and lock payment stage
                release until After photos are verified.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
              <span>VISUAL VERIFICATION</span>
              <span className="text-[#16A34A] font-semibold">ACTIVE</span>
            </div>
          </div>

          <div
            id="warehouse-sr-pr"
            className="p-6 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between gap-6"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                <Package className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
                <span>Dedicated Warehouse, SR &amp; PR</span>
              </div>
              <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Warehouse stock, To-Buy shopping list, Store Requests (SR), and
                Purchase Requests (PR) isolated per project and division.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
              <span>MATERIAL CONTROL</span>
              <span className="text-[#B45309] dark:text-[#D97706] font-semibold">
                INTEGRATED
              </span>
            </div>
          </div>

          <div
            id="face-attendance"
            className="p-6 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between gap-6"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                <Users className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
                <span>Project Team, Area Chat &amp; Attendance</span>
              </div>
              <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Manage division personnel, verify daily worker face attendance,
                and control Chat permissions per floor plan area.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
              <span>TEAM &amp; ATTENDANCE</span>
              <span className="text-[#16A34A] font-semibold">ISOLATED</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// KOMPONEN 0B: "STANDALONE PROJECTS DASHBOARD" (FOTO 1, 2, 3)
// Aturan Mutlak:
// - Klik kartu proyek mengubah Ringkasan Eksekutif di sisi kanan (dengan data Project Overview).
// - Pada mobile view (lg:hidden), tombol Open Project tampil di masing-masing kartu proyek.
// - Keterangan proyek menampilkan: {memberCount} Personel · {areaCount} Area · {totalPins} Titik
//   (tanpa jenis gudang dan tanpa tulisan Area di pojok kanan atas).
// ============================================================================
interface StandaloneProjectsDashboardViewProps {
  projects: ProjectRecord[];
  activeProjectId: string;
  blueprints: BlueprintRecord[];
  pins: PinRecord[];
  profiles: ProfileRecord[];
  projectMembers: ProjectMemberRecord[];
  inventoryItems: InventoryItemRecord[];
  materialAllocations: MaterialAllocationRecord[];
  activeProfile: ProfileRecord;
  onSelectProjectAndOpenOverview: (projectId: string) => void;
  onSelectProjectAndOpenCanvas: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onBackToWebHome: () => void;
  onSwitchProfile: (profileId: string) => void;
}

const PROJECT_LOCATIONS: Record<string, string> = {
  'proj-uluwatu-01': 'Jl. Pantai Suluban No. 8, Uluwatu, Bali',
  'proj-cempaka-02': 'Jl. Cempaka Raya No. 14, Canggu, Bali',
  'proj-jimbaran-03': 'Jl. Bukit Permai No. 22, Jimbaran, Bali',
};

export const StandaloneProjectsDashboardView: React.FC<
  StandaloneProjectsDashboardViewProps
> = ({
  projects,
  activeProjectId,
  blueprints,
  pins,
  profiles,
  projectMembers,
  inventoryItems,
  materialAllocations,
  activeProfile,
  onSelectProjectAndOpenOverview,
  onOpenNewProjectModal,
  onBackToWebHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'termin'>(
    'all'
  );
  // Klik kartu project mengubah Ringkasan Eksekutif di kanan
  const [previewProjectId, setPreviewProjectId] =
    useState<string>(activeProjectId);

  useEffect(() => {
    setPreviewProjectId(activeProjectId);
  }, [activeProjectId]);

  const enrichedProjects = useMemo(() => {
    return projects
      .map((proj, index) => {
        const projPins = pins.filter((p) => p.project_id === proj.id);
        const resolvedPins = projPins.filter(
          (p) => p.status === 'resolved'
        ).length;
        const progress =
          projPins.length > 0
            ? Math.round((resolvedPins / projPins.length) * 100)
            : 0;
        const isTerminReady = progress >= proj.termin_target_percent;
        const locationText =
          proj.location ||
          PROJECT_LOCATIONS[proj.id] ||
          'South Bali Construction Zone';
        const areaCount = blueprints.filter(
          (b) => b.project_id === proj.id
        ).length;
        const memberCount = projectMembers.filter(
          (m) => m.project_id === proj.id
        ).length;
        const terminLabel =
          index === 0
            ? `Stage 2 (${progress}% / ${proj.termin_target_percent}%)`
            : `Stage 1 (${progress}% / ${proj.termin_target_percent}%)`;

        return {
          ...proj,
          totalPins: projPins.length,
          resolvedPins,
          progress,
          isTerminReady,
          locationText,
          areaCount,
          memberCount,
          terminLabel,
        };
      })
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          p.locationText
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase());
        if (!matchesSearch) return false;
        if (statusFilter === 'termin') return p.isTerminReady;
        if (statusFilter === 'active') return !p.isTerminReady;
        return true;
      });
  }, [
    projects,
    pins,
    blueprints,
    projectMembers,
    searchQuery,
    statusFilter,
  ]);

  const previewProject = useMemo(
    () =>
      projects.find((p) => p.id === previewProjectId) ||
      projects[0],
    [projects, previewProjectId]
  );

  const previewPins = useMemo(
    () => pins.filter((p) => p.project_id === previewProject?.id),
    [pins, previewProject]
  );

  const resolvedGreenCount = previewPins.filter(
    (p) => p.status === 'resolved'
  ).length;
  const previewCompletionRate =
    previewPins.length > 0
      ? Math.round((resolvedGreenCount / previewPins.length) * 100)
      : 0;
  const isPreviewTerminUnlocked =
    previewCompletionRate >= (previewProject?.termin_target_percent ?? 80);

  const previewEmployedWorkersCount = useMemo(() => {
    if (!previewProject) return 0;
    const memberEmails = new Set(
      projectMembers
        .filter((m) => m.project_id === previewProject.id)
        .map((m) => m.user_email.toLowerCase())
    );
    return profiles.filter(
      (p) =>
        p.global_role === 'worker' &&
        memberEmails.has(p.email.toLowerCase())
    ).length;
  }, [profiles, projectMembers, previewProject]);

  const previewCountdownText =
    previewProject?.estimated_countdown_label || '5y 3m 2d';

  const totalItemsOwned = useMemo(
    () =>
      inventoryItems.filter((i) => i.project_id === previewProject?.id).length,
    [inventoryItems, previewProject]
  );

  const toBuyUnitsCount = useMemo(
    () =>
      materialAllocations
        .filter(
          (m) =>
            m.project_id === previewProject?.id &&
            m.allocation_status === 'to_buy'
        )
        .reduce((acc, m) => acc + m.qty_requested, 0),
    [materialAllocations, previewProject]
  );

  return (
    <div className="min-h-screen pt-12 flex flex-col bg-[#F8F7F4] dark:bg-[#0F141C] text-[#141619] dark:text-[#F8FAFC]">
      {/* Standalone Top Header Fixed Tanpa Sidebar Kiri */}
      <header className="h-12 bg-white dark:bg-[#161F2C] border-b border-[#E2E6EC] dark:border-[#263346] px-4 sm:px-8 flex items-center justify-between gap-4 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToWebHome}
            className="flex items-center gap-2 px-2 py-1 rounded-[6px] bg-[#1B365D] text-white hover:bg-[#152a4a] transition-colors shrink-0 cursor-pointer"
          >
            <span className="font-mono text-[12px] font-bold tracking-wider">
              VONTA
            </span>
          </button>
          <span className="text-[#475569] dark:text-[#94A3B8] text-xs">/</span>
          <span className="text-[13px] font-semibold text-[#141619] dark:text-[#F8FAFC] truncate">
            Uluwatu Resort Group
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBackToWebHome}
            className="h-8 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2E6EC] dark:border-[#263346]">
            <span className="hidden sm:inline text-[12px] font-medium text-[#475569] dark:text-[#94A3B8]">
              {activeProfile.full_name}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white font-mono text-[11px] font-semibold flex items-center justify-center border border-[#D97706]">
              {activeProfile.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Directory Content */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E6EC] dark:border-[#263346] pb-5">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
              Projects
            </h1>
            <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
              Select a project to preview its summary and open the workspace.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                aria-label="Search organization or project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project or location..."
                className="h-9 w-48 sm:w-56 pl-8 pr-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC] placeholder:text-[#475569] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D] transition-all"
              />
            </div>

            <select
              aria-label="Filter project status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'termin')
              }
              className="h-9 px-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D] transition-all whitespace-nowrap shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="active">In Progress</option>
              <option value="termin">Stage Unlocked</option>
            </select>

            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="h-9 px-3.5 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
          {/* KIRI (70%): Grid Kartu Proyek */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedProjects.map((proj) => {
              const isPreviewed = proj.id === previewProject?.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setPreviewProjectId(proj.id)}
                  className={`p-5 rounded-xl bg-white dark:bg-[#161F2C] border shadow-2xs transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isPreviewed
                      ? 'border-[#1B365D] dark:border-[#D97706] ring-1 ring-[#1B365D]/20 dark:ring-[#D97706]/30'
                      : 'border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D]/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC] leading-snug">
                        {proj.name}
                      </h2>
                    </div>

                    <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                      {proj.locationText}
                    </p>

                    <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#475569] dark:text-[#94A3B8] pt-1">
                      <span>{proj.memberCount} members</span>
                      <span>·</span>
                      <span>{proj.areaCount} areas</span>
                      <span>·</span>
                      <span>{proj.totalPins} pins</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E2E6EC] dark:border-[#263346]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        {proj.terminLabel}
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                        {proj.resolvedPins} resolved
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#E2E6EC] dark:bg-[#263346] overflow-hidden">
                      <div
                        className="h-full bg-[#16A34A] transition-all duration-200"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-[11px] font-medium uppercase tracking-[0.04em] ${
                          proj.isTerminReady
                            ? 'text-[#16A34A]'
                            : 'text-[#B45309] dark:text-[#D97706]'
                        }`}
                      >
                        {proj.isTerminReady ? 'Stage Unlocked' : 'Stage Locked'}
                      </span>

                      <span className="hidden lg:inline text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                        {isPreviewed ? 'Selected' : 'Click to preview'}
                      </span>
                    </div>

                    {/* Tombol Open Project di masing-masing kartu saat Mobile View */}
                    <div className="pt-2 lg:hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectAndOpenOverview(proj.id);
                        }}
                        className="w-full h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* KANAN (30%): Ringkasan Eksekutif (Menampilkan Data Project Overview) + Tombol "Open Project" */}
          <aside className="lg:col-span-3 p-5 rounded-xl bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
              <div>
                <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                  Executive Summary
                </h2>
                <p className="text-[12px] font-medium text-[#B45309] dark:text-[#D97706] truncate max-w-[220px] mt-0.5">
                  {previewProject?.name}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Payment Stage
                </span>
                <span
                  className={`font-mono font-semibold tabular-nums text-right ${
                    isPreviewTerminUnlocked
                      ? 'text-[#16A34A]'
                      : 'text-[#B45309] dark:text-[#D97706]'
                  }`}
                >
                  {isPreviewTerminUnlocked ? 'Unlocked' : 'Locked'} (
                  {previewCompletionRate}%/
                  {previewProject?.termin_target_percent ?? 80}%)
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Resolved Pins
                </span>
                <span className="font-mono font-semibold tabular-nums text-[#16A34A]">
                  {resolvedGreenCount} pins
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Total Pins
                </span>
                <span className="font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                  {previewPins.length} pins
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Est. Completion
                </span>
                <span className="font-mono font-semibold tabular-nums text-[12px] text-[#141619] dark:text-[#F8FAFC] text-right">
                  {previewCountdownText}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Total Workers
                </span>
                <span className="font-mono font-semibold tabular-nums text-[#1B365D] dark:text-[#D97706]">
                  {previewEmployedWorkersCount} workers
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Warehouse &amp; To-Buy
                </span>
                <span className="font-mono font-semibold tabular-nums text-[12px] text-[#141619] dark:text-[#F8FAFC] text-right">
                  {totalItemsOwned} items · {toBuyUnitsCount} to buy
                </span>
              </div>
            </div>

            {previewProject && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onSelectProjectAndOpenOverview(previewProject.id)
                  }
                  className="w-full h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// HALAMAN A: "PROJECTS" (JIKA DIAKSES DARI VIEW PROYEK)
// ============================================================================
interface ProjectsHomeViewProps {
  projects: ProjectRecord[];
  activeProjectId: string;
  blueprints: BlueprintRecord[];
  pins: PinRecord[];
  profiles: ProfileRecord[];
  inventoryItems: InventoryItemRecord[];
  materialAllocations: MaterialAllocationRecord[];
  activeProfile: ProfileRecord;
  offlinePendingCount: number;
  onSelectProjectAndOpenOverview: (projectId: string) => void;
  onSelectProjectAndOpenCanvas: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const ProjectsHomeView: React.FC<ProjectsHomeViewProps> = ({
  projects,
  activeProjectId,
  blueprints,
  pins,
  profiles,
  inventoryItems,
  materialAllocations,
  onSelectProjectAndOpenOverview,
  onOpenNewProjectModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'termin'>(
    'all'
  );
  const [previewProjectId, setPreviewProjectId] =
    useState<string>(activeProjectId);

  useEffect(() => {
    setPreviewProjectId(activeProjectId);
  }, [activeProjectId]);

  const enrichedProjects = useMemo(() => {
    return projects
      .map((proj, index) => {
        const projPins = pins.filter((p) => p.project_id === proj.id);
        const resolvedPins = projPins.filter(
          (p) => p.status === 'resolved'
        ).length;
        const progress =
          projPins.length > 0
            ? Math.round((resolvedPins / projPins.length) * 100)
            : 0;
        const isTerminReady = progress >= proj.termin_target_percent;
        const locationText =
          proj.location ||
          PROJECT_LOCATIONS[proj.id] ||
          'South Bali Construction Zone';
        const areaCount = blueprints.filter(
          (b) => b.project_id === proj.id
        ).length;
        const terminLabel =
          index === 0
            ? `Stage 2 (${progress}% / ${proj.termin_target_percent}%)`
            : `Stage 1 (${progress}% / ${proj.termin_target_percent}%)`;

        return {
          ...proj,
          totalPins: projPins.length,
          resolvedPins,
          progress,
          isTerminReady,
          locationText,
          areaCount,
          terminLabel,
        };
      })
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          p.locationText
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase());
        if (!matchesSearch) return false;
        if (statusFilter === 'termin') return p.isTerminReady;
        if (statusFilter === 'active') return !p.isTerminReady;
        return true;
      });
  }, [projects, blueprints, pins, searchQuery, statusFilter]);

  const previewProject = useMemo(
    () =>
      projects.find((p) => p.id === previewProjectId) ||
      projects.find((p) => p.id === activeProjectId) ||
      projects[0],
    [projects, previewProjectId, activeProjectId]
  );

  const previewProjectPins = useMemo(
    () => pins.filter((p) => p.project_id === previewProject?.id),
    [pins, previewProject]
  );

  const resolvedGreenCount = previewProjectPins.filter(
    (p) => p.status === 'resolved'
  ).length;
  const previewCompletionRate =
    previewProjectPins.length > 0
      ? Math.round((resolvedGreenCount / previewProjectPins.length) * 100)
      : 0;
  const isPreviewTerminUnlocked =
    previewCompletionRate >= (previewProject?.termin_target_percent ?? 80);

  const previewCountdownText =
    previewProject?.estimated_countdown_label || '5y 3m 2d';

  const previewWorkersCount = useMemo(
    () => profiles.filter((p) => p.global_role === 'worker').length,
    [profiles]
  );

  const totalItemsOwned = useMemo(
    () =>
      inventoryItems.filter((i) => i.project_id === previewProject?.id).length,
    [inventoryItems, previewProject]
  );

  const toBuyUnitsCount = useMemo(
    () =>
      materialAllocations
        .filter(
          (m) =>
            m.project_id === previewProject?.id &&
            m.allocation_status === 'to_buy'
        )
        .reduce((acc, m) => acc + m.qty_requested, 0),
    [materialAllocations, previewProject]
  );

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-start">
        {/* KOLOM KIRI (70% -> lg:col-span-7): Daftar Proyek */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
              Projects
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search projects"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or location..."
                  className="h-9 w-48 sm:w-56 pl-8 pr-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC] placeholder:text-[#475569] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1B365D]"
                />
              </div>

              <select
                aria-label="Filter project status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as 'all' | 'active' | 'termin'
                  )
                }
                className="h-9 px-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1B365D]"
              >
                <option value="all">All Statuses</option>
                <option value="active">In Progress</option>
                <option value="termin">Stage Unlocked</option>
              </select>

              <button
                type="button"
                onClick={onOpenNewProjectModal}
                className="h-9 px-3.5 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedProjects.map((proj) => {
              const isPreviewSelected = proj.id === previewProject?.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setPreviewProjectId(proj.id)}
                  className={`p-5 rounded-xl bg-white dark:bg-[#161F2C] border shadow-2xs transition-colors cursor-pointer flex flex-col justify-between gap-4 ${
                    isPreviewSelected
                      ? 'border-[#1B365D] dark:border-[#D97706] ring-1 ring-[#1B365D]/20 dark:ring-[#D97706]/30'
                      : 'border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D]/60'
                  }`}
                >
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] leading-snug">
                      {proj.name}
                    </h2>
                    <p className="text-[12px] text-[#475569] dark:text-[#94A3B8] mt-1">
                      {proj.locationText}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#475569] dark:text-[#94A3B8] pt-1.5">
                      <span>{proj.areaCount} areas</span>
                      <span>·</span>
                      <span>{proj.totalPins} pins</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E2E6EC] dark:border-[#263346]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        {proj.terminLabel}
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                        {proj.resolvedPins} resolved
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#E2E6EC] dark:bg-[#263346] overflow-hidden">
                      <div
                        className="h-full bg-[#16A34A] transition-all duration-200"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-[11px] font-medium uppercase tracking-[0.04em] ${
                          proj.isTerminReady
                            ? 'text-[#16A34A]'
                            : 'text-[#B45309] dark:text-[#D97706]'
                        }`}
                      >
                        {proj.isTerminReady ? 'Stage Unlocked' : 'Stage Locked'}
                      </span>
                      <span className="hidden lg:inline text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                        {isPreviewSelected ? 'Selected' : 'Click to preview'}
                      </span>
                    </div>

                    <div className="pt-2 lg:hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectAndOpenOverview(proj.id);
                        }}
                        className="w-full h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM KANAN (30% -> lg:col-span-3): Panel Ringkasan Eksekutif + Satu Tombol "Open Project" */}
        <aside className="lg:col-span-3 p-5 rounded-xl bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
            <div>
              <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Executive Summary
              </h2>
              <p className="text-[12px] font-medium text-[#B45309] dark:text-[#D97706] truncate max-w-[200px] mt-0.5">
                {previewProject?.name}
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Payment Stage
              </span>
              <span
                className={`font-mono font-semibold tabular-nums text-right ${
                  isPreviewTerminUnlocked
                    ? 'text-[#16A34A]'
                    : 'text-[#B45309] dark:text-[#D97706]'
                }`}
              >
                {isPreviewTerminUnlocked ? 'Unlocked' : 'Locked'} (
                {previewCompletionRate}%/
                {previewProject?.termin_target_percent ?? 80}%)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Resolved Pins
              </span>
              <span className="font-mono font-semibold tabular-nums text-[#16A34A]">
                {resolvedGreenCount} pins
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Total Pins
              </span>
              <span className="font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                {previewProjectPins.length} pins
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Est. Completion
              </span>
              <span className="font-mono font-semibold tabular-nums text-[12px] text-[#141619] dark:text-[#F8FAFC] text-right">
                {previewCountdownText}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Total Workers
              </span>
              <span className="font-mono font-semibold tabular-nums text-[#1B365D] dark:text-[#D97706]">
                {previewWorkersCount} workers
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Warehouse &amp; To-Buy
              </span>
              <span className="font-mono font-semibold tabular-nums text-[12px] text-[#141619] dark:text-[#F8FAFC] text-right">
                {totalItemsOwned} items · {toBuyUnitsCount} to buy
              </span>
            </div>
          </div>

          {previewProject && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onSelectProjectAndOpenOverview(previewProject.id)
                }
                className="w-full h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// ============================================================================
// HALAMAN B: "PROJECT OVERVIEW" (GAMBAR 1 / FOTO 4 - MASTER AREA BLUEPRINT VIEWER + METRIK PENUH)
// ============================================================================
interface ProjectOverviewDashboardProps {
  project: ProjectRecord;
  blueprints: BlueprintRecord[];
  activeBlueprint?: BlueprintRecord;
  pins: PinRecord[];
  profiles: ProfileRecord[];
  divisions?: DivisionRecord[];
  inventoryItems: InventoryItemRecord[];
  materialAllocations: MaterialAllocationRecord[];
  onNavigateTab: (tab: any) => void;
  onSelectBlueprintArea?: (blueprintId: string) => void;
  onSelectBlueprintAndOpenCanvas?: (blueprintId: string) => void;
  onJumpToPinOnMap?: (pinId: string) => void;
  onOpenPrintModal: () => void;
}

export const ProjectOverviewDashboard: React.FC<
  ProjectOverviewDashboardProps
> = ({
  project,
  blueprints,
  activeBlueprint,
  pins,
  profiles,
  divisions,
  inventoryItems,
  materialAllocations,
  onNavigateTab,
  onSelectBlueprintArea,
  onJumpToPinOnMap,
  onOpenPrintModal,
}) => {
  // Filter Area di dalam Master Area Blueprint (tanpa pindah ke halaman Kanvas)
  const [previewBlueprintId, setPreviewBlueprintId] = useState<string>(
    activeBlueprint?.id || blueprints[0]?.id || ''
  );

  useEffect(() => {
    if (
      blueprints.length > 0 &&
      !blueprints.some((b) => b.id === previewBlueprintId)
    ) {
      setPreviewBlueprintId(blueprints[0].id);
    }
  }, [blueprints, previewBlueprintId]);

  const currentPreviewBlueprint = useMemo(
    () =>
      blueprints.find((b) => b.id === previewBlueprintId) || blueprints[0],
    [blueprints, previewBlueprintId]
  );

  const previewAreaPins = useMemo(
    () =>
      pins.filter(
        (p) =>
          currentPreviewBlueprint &&
          p.blueprint_id === currentPreviewBlueprint.id
      ),
    [pins, currentPreviewBlueprint]
  );

  const totalPins = pins.length;
  const resolvedPins = pins.filter((p) => p.status === 'resolved').length;
  const completionRate =
    totalPins > 0 ? Math.round((resolvedPins / totalPins) * 100) : 0;
  const isTerminUnlocked = completionRate >= project.termin_target_percent;

  // Jumlah pekerja yang dipekerjakan khusus pada proyek ini
  const employedWorkersCount = useMemo(
    () => profiles.filter((p) => p.global_role === 'worker').length,
    [profiles]
  );

  // Countdown Estimasi Waktu Penyelesaian Proyek
  const countdownText =
    project.estimated_countdown_label || '5y 3m 2d';

  const totalItemTypesInWarehouse = inventoryItems.length;
  const toBuyTotalUnits = useMemo(
    () =>
      materialAllocations
        .filter((m) => m.allocation_status === 'to_buy')
        .reduce((acc, m) => acc + m.qty_requested, 0),
    [materialAllocations]
  );

  const departmentBreakdown = useMemo(() => {
    const activeDivs =
      divisions && divisions.length > 0
        ? divisions.map((d) => ({
            code: d.code,
            label: d.short_label || d.name || d.label || d.code,
          }))
        : [
            { code: 'listrik', label: 'Electrical' },
            { code: 'pipa', label: 'Plumbing' },
            { code: 'sipil', label: 'Civil' },
            { code: 'cat', label: 'Finishing' },
          ];

    return activeDivs.map((div) => {
      const deptPins = pins.filter((p) => p.department === div.code);
      const deptResolved = deptPins.filter(
        (p) => p.status === 'resolved'
      ).length;
      const pct =
        deptPins.length > 0
          ? Math.round((deptResolved / deptPins.length) * 100)
          : 0;
      return {
        dept: div.code,
        label: div.label,
        resolved: deptResolved,
        total: deptPins.length,
        pct,
      };
    });
  }, [pins, divisions]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 min-h-[calc(100vh-56px)] flex flex-col justify-between gap-4">
      {/* Bagian Atas: Judul Proyek + Progress-to-Termin Unlocker */}
      <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
            {project.name}
          </h1>
          <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Payment Stage Progress ({completionRate}% of{' '}
            {project.termin_target_percent}% Stage 2 target)
          </p>
        </div>

        <div className="w-full md:w-80 space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#475569] dark:text-[#94A3B8]">
              Stage Status
            </span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                isTerminUnlocked
                  ? 'text-[#16A34A]'
                  : 'text-[#B45309] dark:text-[#D97706]'
              }`}
            >
              {completionRate}% / {project.termin_target_percent}%
            </span>
          </div>
          <div className="relative w-full h-2.5 rounded-full bg-[#E2E6EC] dark:bg-[#263346] overflow-hidden">
            <div
              className="h-full bg-[#16A34A] transition-all duration-200"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layout 2 Kolom Memenuhi Layar (50% Kiri Blok Metrik, 50% Kanan Tempat Gambar Blueprint + Filter Area) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* KIRI (50% -> lg:col-span-6): Grid Kartu Metrik yang Memenuhi Area Vertikal */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 content-stretch">
          {/* Kartu 1: Status Termin */}
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                PAYMENT STAGE
              </span>
              {isTerminUnlocked ? (
                <Unlock className="w-4 h-4 text-[#16A34A]" />
              ) : (
                <Lock className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
              )}
            </div>
            <div className="text-[22px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
              {isTerminUnlocked ? 'Unlocked' : 'Locked'}
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Requires {project.termin_target_percent}% resolved ({completionRate}% now)
            </div>
          </div>

          {/* Kartu 2: Titik Selesai (Hanya angka yang sudah dikerjakan saja) */}
          <button
            type="button"
            onClick={() => onNavigateTab('spatial_map')}
            className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px] text-left transition-colors"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                RESOLVED PINS
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-[22px] font-mono font-semibold tabular-nums text-[#16A34A]">
              {resolvedPins} pins
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Total pins verified and approved
            </div>
          </button>

          {/* Kartu 3: Titik Pengerjaan (Menggantikan Red Flag Detector) */}
          <button
            type="button"
            onClick={() => onNavigateTab('spatial_map')}
            className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px] text-left transition-colors"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                TOTAL PINS
              </span>
              <MapPin className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
            </div>
            <div className="text-[22px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
              {totalPins} pins
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Updates as new pins are placed
            </div>
          </button>

          {/* Kartu 4: Estimasi Waktu Penyelesaian Proyek (Countdown) */}
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                EST. COMPLETION TIME
              </span>
              <Clock className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
            </div>
            <div className="text-[18px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
              {countdownText}
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Remaining project countdown
            </div>
          </div>

          {/* Kartu 5: Total Pekerja yang Dipekerjakan */}
          <button
            type="button"
            onClick={() => onNavigateTab('attendance')}
            className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px] text-left transition-colors"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                TOTAL WORKERS
              </span>
              <Users className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
            </div>
            <div className="text-[22px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
              {employedWorkersCount} workers
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Active personnel across project divisions
            </div>
          </button>

          {/* Kartu 6: Total Item di Gudang & Cetak BAST */}
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col justify-between min-h-[144px]">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                WAREHOUSE &amp; HANDOVER
              </span>
              <Package className="w-4 h-4 text-[#1B365D] dark:text-[#94A3B8]" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="text-[20px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC] hover:text-[#1B365D]"
              >
                {totalItemTypesInWarehouse} materials
              </button>
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="h-8 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[12px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print handover report</span>
              </button>
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              {toBuyTotalUnits} units in shopping list
            </div>
          </div>
        </div>

        {/* KANAN (50% -> lg:col-span-6): Tempat Gambar Master Area Blueprint (dengan Filter Area) + Bar Divisi */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Kotak Tempat Gambar Blueprint dengan Filter Area langsung di tempat */}
          <div className="flex-1 p-4 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] dark:bg-[radial-gradient(#263346_1px,transparent_1px)] bg-[size:16px_16px] shadow-2xs flex flex-col justify-between gap-3">
            <div className="p-3.5 rounded-lg border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
                <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                  Area Floor Plan
                </h2>
              </div>

              {/* Filter Area Blueprint (Mengganti gambar blueprint di tempat tanpa pindah ke Kanvas) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                  Area:
                </span>
                <select
                  aria-label="Filter area floor plan"
                  value={currentPreviewBlueprint?.id || ''}
                  onChange={(e) => {
                    setPreviewBlueprintId(e.target.value);
                    if (onSelectBlueprintArea) {
                      onSelectBlueprintArea(e.target.value);
                    }
                  }}
                  className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D]"
                >
                  {blueprints.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.area_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tempat Gambar Blueprint Interaktif */}
            {currentPreviewBlueprint && (
              <div className="relative flex-1 min-h-[290px] rounded-lg border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] overflow-hidden flex items-center justify-center">
                <img
                  src={currentPreviewBlueprint.image_url}
                  alt={currentPreviewBlueprint.area_name}
                  className="w-full h-full max-h-[340px] object-contain p-2 select-none"
                />

                {/* Titik Pin Aktif pada Gambar Blueprint Area Terpilih (Titik Approve Masuk ke History) */}
                {previewAreaPins
                  .filter((pin) => pin.status !== 'resolved')
                  .map((pin) => {
                    const st = PIN_STATUS_META[pin.status];
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => {
                          if (onJumpToPinOnMap) {
                            onJumpToPinOnMap(pin.id);
                          }
                        }}
                        style={{
                          left: `${pin.coord_x}%`,
                          top: `${pin.coord_y}%`,
                        }}
                        title={`${pin.pin_code}: ${pin.title}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-[4px] text-white font-mono text-[10px] font-bold shadow-md border border-white hover:scale-110 transition-transform"
                      >
                        <span
                          className="px-1.5 py-0.5 rounded-[3px]"
                          style={{ backgroundColor: st.hex }}
                        >
                          {pin.pin_code}
                        </span>
                      </button>
                    );
                  })}

                <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-[6px] bg-white/95 dark:bg-[#161F2C]/95 border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#141619] dark:text-[#F8FAFC]">
                    {currentPreviewBlueprint.area_name}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-[#475569] dark:text-[#94A3B8]">
                    {
                      previewAreaPins.filter((p) => p.status === 'resolved')
                        .length
                    }{' '}
                    resolved · {previewAreaPins.length} total pins
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bar Metrik Departemen / Divisi tepat di bawah kotak */}
          <div className="p-4 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {departmentBreakdown.map((item) => (
                <div
                  key={item.dept}
                  className="space-y-1 pr-2 border-r last:border-r-0 border-[#E2E6EC] dark:border-[#263346]"
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8] truncate">
                    {item.label}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                      {item.resolved} resolved
                    </span>
                    <span className="text-[12px] font-mono tabular-nums text-[#16A34A]">
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// KOMPONEN MANAJEMEN TIM & PENGATURAN IZIN CHAT ROOM
// ============================================================================
interface TeamManagementViewProps {
  profiles: ProfileRecord[];
  projectMembers: ProjectMemberRecord[];
  activeProfile: ProfileRecord;
  pins: PinRecord[];
  divisions?: DivisionRecord[];
  chatLeaderOnly?: boolean;
  onToggleChatLeaderOnly?: (nextVal: boolean) => void;
  onToggleMemberChatAccess?: (userEmail: string) => void;
  onToggleMemberChatPermission?: (profileId: string, nextVal: boolean) => void;
  onOpenInviteModal: () => void;
  onUpdateMemberRole: (
    profileId: string,
    newRole: GlobalRole,
    newDept: SpecialtyDepartment
  ) => void;
  onRemoveMember: (profileId: string) => void;
  onSwitchActiveProfile: (profileId: string) => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  profiles,
  projectMembers,
  activeProfile,
  pins,
  divisions,
  chatLeaderOnly = true,
  onToggleChatLeaderOnly,
  onToggleMemberChatAccess,
  onToggleMemberChatPermission,
  onOpenInviteModal,
  onUpdateMemberRole,
  onRemoveMember,
  onSwitchActiveProfile,
}) => {
  const [searchMember, setSearchMember] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const canManageTeam =
    activeProfile.global_role === 'owner' ||
    activeProfile.global_role === 'mandor';

  const divisionOptions = useMemo(() => {
    if (divisions && divisions.length > 0) {
      return divisions;
    }
    return [
      { code: 'listrik', short_label: 'Electrical', label: 'Electrical' },
      { code: 'pipa', short_label: 'Plumbing', label: 'Plumbing' },
      { code: 'sipil', short_label: 'Civil', label: 'Civil' },
      { code: 'cat', short_label: 'Finishing', label: 'Finishing' },
    ];
  }, [divisions]);

  const filteredMembers = useMemo(() => {
    const q = searchMember.trim().toLowerCase();
    return profiles.filter((p) => {
      const matchQuery =
        q.length === 0 ||
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q);
      const matchDept =
        deptFilter === 'all' || p.specialty_department === deptFilter;
      const matchRole = roleFilter === 'all' || p.global_role === roleFilter;
      return matchQuery && matchDept && matchRole;
    });
  }, [profiles, searchMember, deptFilter, roleFilter]);

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
            Project Team &amp; Chat Permissions
          </h1>
          <p className="text-[13px] text-[#475569] dark:text-[#94A3B8]">
            Manage division personnel and Area Chat posting permissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Search members..."
              className="h-9 w-48 pl-8 pr-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1B365D]"
            />
          </div>

          <select
            aria-label="Filter division"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-9 px-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
          >
            <option value="all">All Divisions</option>
            {divisionOptions.map((d) => (
              <option key={d.code} value={d.code}>
                {d.short_label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="mandor">Foreman</option>
            <option value="worker">Worker</option>
          </select>

          {canManageTeam && (
            <button
              type="button"
              onClick={onOpenInviteModal}
              className="h-9 px-3.5 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Bar Pengaturan Kebijakan Chat Room (Default Hanya Owner & Mandor, Bisa Diatur dari Sini) */}
      <div className="p-4 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
          <div>
            <div className="text-[13px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Area Chat Access Policy
            </div>
            <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              {chatLeaderOnly
                ? 'Chat is restricted to Owner & Foreman (plus members granted access below).'
                : 'All project team members can post notes to Area Chat.'}
            </div>
          </div>
        </div>

        {canManageTeam && onToggleChatLeaderOnly && (
          <button
            type="button"
            onClick={() => onToggleChatLeaderOnly(!chatLeaderOnly)}
            className={`h-9 px-3.5 rounded-[6px] text-[12px] font-medium border flex items-center gap-1.5 transition-colors ${
              chatLeaderOnly
                ? 'bg-[#1B365D] text-white border-[#1B365D]'
                : 'bg-[#F8F7F4] dark:bg-[#0F141C] text-[#141619] dark:text-[#F8FAFC] border-[#E2E6EC] dark:border-[#263346]'
            }`}
          >
            {chatLeaderOnly ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Owner &amp; Foreman Only (Active)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Open to All Members</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                <th className="py-3.5 px-4">Member &amp; ID</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Chat Access</th>
                <th className="py-3.5 px-4">Assigned Pins</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
              {filteredMembers.map((member) => {
                const isSelf = member.id === activeProfile.id;
                const isLeaderRole =
                  member.global_role === 'owner' ||
                  member.global_role === 'mandor';
                const pmRecord = projectMembers.find(
                  (pm) => pm.user_email === member.email
                );
                const explicitCanChat =
                  pmRecord?.can_chat !== undefined
                    ? pmRecord.can_chat
                    : Boolean(member.can_chat);
                const memberCanChat =
                  isLeaderRole || explicitCanChat || !chatLeaderOnly;
                const assignedPinsCount = pins.filter(
                  (p) =>
                    p.assigned_worker_email?.toLowerCase() ===
                    member.email.toLowerCase()
                ).length;

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#141619] dark:text-[#F8FAFC]">
                          {member.full_name} {isSelf ? '(You)' : ''}
                        </span>
                        {member.worker_code && (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346] text-[#1B365D] dark:text-[#D97706]">
                            {member.worker_code}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] font-mono text-[#475569] dark:text-[#94A3B8]">
                        {member.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {canManageTeam ? (
                        <select
                          aria-label={`Change division for ${member.full_name}`}
                          value={member.specialty_department}
                          onChange={(e) =>
                            onUpdateMemberRole(
                              member.id,
                              member.global_role,
                              e.target.value as SpecialtyDepartment
                            )
                          }
                          className="h-8 px-2.5 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346] text-[12px]"
                        >
                          <option value="all">All Divisions</option>
                          {divisionOptions.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.short_label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {
                            getDepartmentMeta(
                              member.specialty_department,
                              divisions
                            ).shortLabel
                          }
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {canManageTeam ? (
                        <select
                          aria-label={`Change role for ${member.full_name}`}
                          value={member.global_role}
                          onChange={(e) =>
                            onUpdateMemberRole(
                              member.id,
                              e.target.value as GlobalRole,
                              member.specialty_department
                            )
                          }
                          className="h-8 px-2.5 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346] text-[12px]"
                        >
                          <option value="owner">Owner</option>
                          <option value="mandor">Foreman</option>
                          <option value="worker">Worker</option>
                        </select>
                      ) : (
                        <span>
                          {(member.global_role === 'mandor'
                            ? 'foreman'
                            : member.global_role
                          ).toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isLeaderRole ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#16A34A]/15 text-[#16A34A] font-mono text-[11px] font-semibold">
                          <Unlock className="w-3 h-3" />
                          <span>Full Access</span>
                        </span>
                      ) : canManageTeam &&
                        (onToggleMemberChatAccess ||
                          onToggleMemberChatPermission) ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleMemberChatAccess) {
                              onToggleMemberChatAccess(member.email);
                            } else if (onToggleMemberChatPermission) {
                              onToggleMemberChatPermission(
                                member.id,
                                !explicitCanChat
                              );
                            }
                          }}
                          className={`h-7 px-2.5 rounded-[6px] font-mono text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                            memberCanChat
                              ? 'bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/40'
                              : 'bg-[#F8F7F4] dark:bg-[#0F141C] text-[#475569] dark:text-[#94A3B8] border-[#E2E6EC] dark:border-[#263346]'
                          }`}
                        >
                          {memberCanChat ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Chat Allowed</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Locked (Enable)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="font-mono text-[11px]">
                          {memberCanChat ? 'Allowed' : 'Locked'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-[#141619] dark:text-[#F8FAFC]">
                      {assignedPinsCount} pins
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => onSwitchActiveProfile(member.id)}
                            className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px] font-medium hover:border-[#B45309]"
                          >
                            Switch Account
                          </button>
                        )}
                        {canManageTeam &&
                          !isSelf &&
                          member.id !== 'prof-owner-01' && (
                            <button
                              type="button"
                              onClick={() => onRemoveMember(member.id)}
                              aria-label={`Remove ${member.full_name}`}
                              className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[#475569] hover:text-[#DC2626] flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

