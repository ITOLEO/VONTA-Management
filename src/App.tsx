import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  VontaDatabaseState,
  SpecialtyDepartment,
  DepartmentOnly,
  PinPriority,
  ThemePreference,
  GlobalRole,
  PinRecord,
  ActivityStreamRecord,
  MaterialAllocationRecord,
  InventoryItemRecord,
  DivisionRecord,
  AttendanceRecord,
} from './types/schema';
import {
  INITIAL_VONTA_DATABASE,
  DEFAULT_DIVISIONS,
  createBlueprintSvgDataUri,
  createFieldPhotoSvgDataUri,
} from './data/initialDatabase';
import { SpatialBlueprintCanvas } from './components/SpatialBlueprintCanvas';
import { BeforeAfterSliderGate } from './components/BeforeAfterSliderGate';
import { ContextualLiveStreamPanel } from './components/ContextualLiveStreamPanel';
import { InventoryAndShoppingView } from './components/InventoryAndShoppingView';
import { CustomPrintBastModal } from './components/CustomPrintBastModal';
import { SupabaseAndProjectManagerModal } from './components/SupabaseAndProjectManagerModal';
import {
  BottomMultiOrderPanel,
  StoreAndPurchaseRequestView,
  AttendanceView,
  ProjectSettingsPage,
  DivisionHistoryView,
} from './components/WorkspaceNewModules';
import {
  OfflineQueueEntry,
  createOfflineQueueEntry,
  detectDuplicateMaterialClaim,
} from './utils/vontaAnalytics';
import {
  InviteAuthModal,
  UploadBlueprintModal,
  CreatePinModal,
} from './components/ModalsTahap1';
import {
  VontaWebHomeLandingView,
  StandaloneProjectsDashboardView,
  ProjectsHomeView,
  ProjectOverviewDashboard,
  TeamManagementView,
} from './components/MinimalistDashboardViews';
import {
  Settings,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Printer,
  Search,
  LogOut,
  Globe,
  Users,
  CalendarCheck,
  History,
} from 'lucide-react';

const STORAGE_KEY = 'vonta_supabase_db_v8';

type WorkspaceTabId =
  | 'web_home'
  | 'dashboard_projects'
  | 'home'
  | 'overview'
  | 'spatial_map'
  | 'history'
  | 'attendance'
  | 'inventory'
  | 'shopping'
  | 'sr_pr'
  | 'team'
  | 'project_settings';

export default function App() {
  // 1. Database State
  const [db, setDb] = useState<VontaDatabaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as VontaDatabaseState;
      }
    } catch {
      // Fallback to seed database
    }
    return INITIAL_VONTA_DATABASE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore quota errors
    }
  }, [db]);

  // 2. Active User Profile & Active Project
  const [activeProfileId, setActiveProfileId] =
    useState<string>('prof-owner-01');
  const activeProfile = useMemo(
    () => db.profiles.find((p) => p.id === activeProfileId) || db.profiles[0],
    [db.profiles, activeProfileId]
  );

  const [activeProjectId, setActiveProjectId] = useState<string>(
    db.projects[0]?.id || 'proj-uluwatu-01'
  );
  const activeProject = useMemo(
    () => db.projects.find((p) => p.id === activeProjectId) || db.projects[0],
    [db.projects, activeProjectId]
  );

  // 3. Workspace Navigation & Hover-Expand Sidebar State
  // Workflow baru: saat Owner / Mandor pertama masuk ke web, langsung di tampilan Home dari web (tanpa navbar proyek)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTabId>(
    () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1') {
          return 'overview';
        }
      }
      return 'web_home';
    }
  );
  const [lastNonSettingsTab, setLastNonSettingsTab] =
    useState<WorkspaceTabId>('overview');
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState<boolean>(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [quickPinSearch, setQuickPinSearch] = useState<string>('');

  const handleNavigateTab = (tab: WorkspaceTabId) => {
    if (
      tab !== 'project_settings' &&
      tab !== 'web_home' &&
      tab !== 'dashboard_projects'
    ) {
      setLastNonSettingsTab(tab);
    }
    setActiveWorkspaceTab(tab);
  };

  // Close Avatar Popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl+K shortcut to focus pin search input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Theme State (System / Dark / Light in Avatar Popover)
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>(
    activeProfile.theme_preference || 'light'
  );

  const resolvedTheme: ThemePreference = useMemo(() => {
    if (themeMode === 'system') {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
      return 'light';
    }
    return themeMode;
  }, [themeMode]);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (resolvedTheme === 'dark') {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const handleSelectThemeMode = (nextMode: 'system' | 'dark' | 'light') => {
    setThemeMode(nextMode);
    const savedPref: ThemePreference = nextMode === 'dark' ? 'dark' : 'light';
    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, theme_preference: savedPref } : p
      ),
    }));
  };

  // 5. Multi-Blueprint Navigation & Project Divisions
  const projectBlueprints = useMemo(
    () =>
      db.blueprints
        .filter((b) => b.project_id === activeProject.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [db.blueprints, activeProject.id]
  );

  const projectDivisions = useMemo<DivisionRecord[]>(() => {
    const list = (db.divisions || []).filter(
      (d) => d.project_id === activeProject.id
    );
    return list.length > 0 ? list : DEFAULT_DIVISIONS;
  }, [db.divisions, activeProject.id]);

  const projectAttendanceRecords = useMemo<AttendanceRecord[]>(
    () =>
      (db.attendance_records || []).filter(
        (r) => r.project_id === activeProject.id
      ),
    [db.attendance_records, activeProject.id]
  );

  const [activeBlueprintId, setActiveBlueprintId] = useState<string>(
    projectBlueprints[0]?.id || 'bp-area-1'
  );
  const [isAreaLoading, setIsAreaLoading] = useState<boolean>(false);

  useEffect(() => {
    if (
      projectBlueprints.length > 0 &&
      !projectBlueprints.some((b) => b.id === activeBlueprintId)
    ) {
      setActiveBlueprintId(projectBlueprints[0].id);
    }
  }, [projectBlueprints, activeBlueprintId]);

  const activeBlueprint = useMemo(
    () => projectBlueprints.find((b) => b.id === activeBlueprintId),
    [projectBlueprints, activeBlueprintId]
  );

  const handleSelectBlueprintArea = (blueprintId: string) => {
    if (blueprintId === activeBlueprintId) return;
    setIsAreaLoading(true);
    setActiveBlueprintId(blueprintId);
    setIsPlacementMode(false);
    setTimeout(() => {
      setIsAreaLoading(false);
    }, 150);
  };

  // 6. Department Filter (tidak ada Semua Divisi pada filter kanvas; default ke divisi pertama), Canvas Mode (3D/2D), and Right Contextual Panel Tab
  const [departmentFilter, setDepartmentFilter] = useState<SpecialtyDepartment>(
    projectDivisions[0]?.code || 'listrik'
  );
  const [canvasMode, setCanvasMode] = useState<'2.5d' | '2d'>('2.5d');
  const [isPlacementMode, setIsPlacementMode] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<
    'inspector' | 'livestream'
  >('inspector');

  useEffect(() => {
    if (
      departmentFilter === 'all' ||
      (projectDivisions.length > 0 &&
        !projectDivisions.some((d) => d.code === departmentFilter))
    ) {
      setDepartmentFilter(projectDivisions[0]?.code || 'listrik');
    }
  }, [projectDivisions, departmentFilter]);

  // Offline Queue State
  const [isOfflineFieldMode, setIsOfflineFieldMode] = useState<boolean>(false);
  const [offlineQueueEntries, setOfflineQueueEntries] = useState<
    OfflineQueueEntry[]
  >([]);
  const offlinePendingQueueCount = offlineQueueEntries.length;

  const trackOfflineActionIfActive = (
    actionType: OfflineQueueEntry['actionType'] = 'UPLOAD_AFTER_PROOF',
    pinCode: string = '#PIN',
    summary: string = 'Field changes saved to local queue.'
  ) => {
    if (isOfflineFieldMode) {
      const entry = createOfflineQueueEntry({
        actionType,
        pinCode,
        actorName: activeProfile.full_name,
        actorRole: activeProfile.global_role,
        summary,
      });
      setOfflineQueueEntries((prev) => [entry, ...prev]);
    }
  };

  // Switch Profile (Role Switcher inside Avatar Popover)
  const handleSwitchProfile = (profileId: string) => {
    const target = db.profiles.find((p) => p.id === profileId);
    if (!target) return;
    setActiveProfileId(target.id);
    setIsPlacementMode(false);

    if (target.global_role === 'worker') {
      const workerDept =
        target.specialty_department === 'all'
          ? projectDivisions[0]?.code || 'listrik'
          : target.specialty_department;
      setDepartmentFilter(workerDept);
      setCanvasMode('2d');
    } else {
      setDepartmentFilter(projectDivisions[0]?.code || 'listrik');
      setCanvasMode('2.5d');
    }
  };

  // 7. Project Pins, Inventory, Allocations, Activities
  const allProjectPins = useMemo(
    () => db.pins.filter((p) => p.project_id === activeProject.id),
    [db.pins, activeProject.id]
  );

  const projectInventoryItems = useMemo(
    () => db.inventory_items.filter((i) => i.project_id === activeProject.id),
    [db.inventory_items, activeProject.id]
  );

  const projectMaterialAllocations = useMemo(
    () =>
      db.material_allocations.filter((m) => m.project_id === activeProject.id),
    [db.material_allocations, activeProject.id]
  );

  const projectActivities = useMemo(
    () => db.activity_streams.filter((a) => a.project_id === activeProject.id),
    [db.activity_streams, activeProject.id]
  );

  // Kanvas 3D & 2D hanya menampilkan titik yang belum Approve (status !== 'resolved')
  // Saat Mandor menekan Approve, titik langsung hilang dari kanvas dan masuk ke halaman History
  const filteredAreaPins = useMemo(() => {
    return allProjectPins.filter((pin) => {
      const matchBlueprint = pin.blueprint_id === activeBlueprintId;
      const matchDept =
        departmentFilter === 'all' || pin.department === departmentFilter;
      const isNotApproved = pin.status !== 'resolved';
      return matchBlueprint && matchDept && isNotApproved;
    });
  }, [allProjectPins, activeBlueprintId, departmentFilter]);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    filteredAreaPins[0]?.id || null
  );

  useEffect(() => {
    if (
      filteredAreaPins.length > 0 &&
      !filteredAreaPins.some((p) => p.id === selectedPinId)
    ) {
      setSelectedPinId(filteredAreaPins[0].id);
    } else if (filteredAreaPins.length === 0) {
      setSelectedPinId(null);
    }
  }, [filteredAreaPins, selectedPinId]);

  const selectedPin: PinRecord | undefined = useMemo(
    () => filteredAreaPins.find((p) => p.id === selectedPinId),
    [filteredAreaPins, selectedPinId]
  );

  // Check if active user has explicit chat permission in Tim Proyek
  const activeProjectMemberRecord = useMemo(
    () =>
      db.project_members.find(
        (m) =>
          m.project_id === activeProject.id &&
          m.user_email === activeProfile.email
      ),
    [db.project_members, activeProject.id, activeProfile.email]
  );

  const canActiveUserChat = useMemo(() => {
    if (
      activeProfile.global_role === 'owner' ||
      activeProfile.global_role === 'mandor'
    ) {
      return true;
    }
    if (activeProjectMemberRecord?.can_chat !== undefined) {
      return activeProjectMemberRecord.can_chat;
    }
    return !activeProject.chat_leader_only;
  }, [
    activeProfile.global_role,
    activeProjectMemberRecord,
    activeProject.chat_leader_only,
  ]);

  // 8. Modals & Toast State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUploadBlueprintModalOpen, setIsUploadBlueprintModalOpen] =
    useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProjectManagerModalOpen, setIsProjectManagerModalOpen] =
    useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [simulatedUiState, setSimulatedUiState] = useState<
    'normal' | 'loading' | 'empty' | 'error'
  >('normal');
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Activity Record Helper
  const createActivityRecord = (params: {
    blueprintId: string | null;
    pinId: string | null;
    department: SpecialtyDepartment | null;
    messageType: 'text' | 'voice_note' | 'system_event';
    content: string;
    voiceDurationSec?: number | null;
  }): ActivityStreamRecord => ({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    project_id: activeProject.id,
    blueprint_id: params.blueprintId,
    pin_id: params.pinId,
    department: params.department,
    sender_name: activeProfile.full_name,
    sender_role: activeProfile.global_role,
    message_type: params.messageType,
    content: params.content,
    voice_duration_sec: params.voiceDurationSec ?? null,
    created_at: new Date().toISOString(),
  });

  // 9. Business Logic Handlers
  const handleCreateNewProject = (payload: {
    name: string;
    targetEndDate: string;
    terminTargetPercent: number;
    generalNote: string;
  }) => {
    const newProjId = `proj-${Date.now()}`;
    const newBpId = `bp-${Date.now()}`;

    setDb((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: newProjId,
          name: payload.name,
          location: 'South Bali Construction Zone',
          business_unit_code: `UNIT-${prev.projects.length + 1}`,
          owner_id: 'prof-owner-01',
          general_note: payload.generalNote,
          chat_leader_only: true,
          termin_target_percent: payload.terminTargetPercent,
          sop_low_stock_threshold: 5,
          estimated_countdown_label: '3 Years 6 Months 0 Days',
          start_date: new Date().toISOString().slice(0, 10),
          target_end_date: payload.targetEndDate,
          created_at: new Date().toISOString(),
        },
      ],
      blueprints: [
        ...prev.blueprints,
        {
          id: newBpId,
          project_id: newProjId,
          area_name: 'Area 1: Main Floor',
          image_url: createBlueprintSvgDataUri(
            'custom',
            `${payload.name} - Area 1`
          ),
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
      ],
      divisions: [
        ...(prev.divisions || []),
        {
          id: `div-${Date.now()}-1`,
          project_id: newProjId,
          code: 'listrik',
          name: 'Electrical',
          short_code: 'ELC',
          label: 'Electrical',
          short_label: 'Electrical',
          created_at: new Date().toISOString(),
        },
        {
          id: `div-${Date.now()}-2`,
          project_id: newProjId,
          code: 'pipa',
          name: 'Plumbing',
          short_code: 'PLB',
          label: 'Plumbing',
          short_label: 'Plumbing',
          created_at: new Date().toISOString(),
        },
        {
          id: `div-${Date.now()}-3`,
          project_id: newProjId,
          code: 'sipil',
          name: 'Civil',
          short_code: 'SPL',
          label: 'Civil',
          short_label: 'Civil',
          created_at: new Date().toISOString(),
        },
        {
          id: `div-${Date.now()}-4`,
          project_id: newProjId,
          code: 'cat',
          name: 'Finishing',
          short_code: 'CAT',
          label: 'Finishing',
          short_label: 'Finishing',
          created_at: new Date().toISOString(),
        },
      ],
      project_members: [
        ...prev.project_members,
        {
          id: `pm-${Date.now()}-owner`,
          project_id: newProjId,
          user_email: 'owner@uluwaturesort.id',
          role: 'owner',
          department: 'all',
          can_chat: true,
        },
        {
          id: `pm-${Date.now()}-mandor`,
          project_id: newProjId,
          user_email: 'mandor.agus@vonta.id',
          role: 'mandor',
          department: 'all',
          can_chat: true,
        },
      ],
      inventory_items: [
        ...prev.inventory_items,
        {
          id: `inv-${Date.now()}-1`,
          project_id: newProjId,
          item_name: 'Gresik Portland Cement 40kg',
          department: 'sipil',
          unit: 'Bag',
          stock_available: 20,
          updated_at: new Date().toISOString(),
        },
        {
          id: `inv-${Date.now()}-2`,
          project_id: newProjId,
          item_name: 'Eterna NYM Cable 3x2.5mm (50m Roll)',
          department: 'listrik',
          unit: 'Roll',
          stock_available: 5,
          updated_at: new Date().toISOString(),
        },
      ],
    }));

    setActiveProjectId(newProjId);
    setActiveBlueprintId(newBpId);
    showToast(`New project "${payload.name}" created.`);
  };

  const handleInviteMember = (payload: {
    email: string;
    fullName: string;
    role: GlobalRole;
    department: SpecialtyDepartment;
  }) => {
    const newProfileId = `prof-${Date.now()}`;
    const existingProfile = db.profiles.find((p) => p.email === payload.email);
    const workerCount = db.profiles.filter(
      (p) => p.global_role === 'worker'
    ).length;

    setDb((prev) => {
      const updatedProfiles = existingProfile
        ? prev.profiles
        : [
            ...prev.profiles,
            {
              id: newProfileId,
              email: payload.email,
              full_name: payload.fullName,
              worker_code:
                payload.role === 'worker'
                  ? `TKG-${101 + workerCount}`
                  : `LDR-${101 + prev.profiles.length}`,
              avatar_url: null,
              global_role: payload.role,
              specialty_department: payload.department,
              theme_preference: resolvedTheme,
              total_resolved_pins: 0,
              first_time_right_count: 0,
              created_at: new Date().toISOString(),
            },
          ];

      const alreadyMember = prev.project_members.some(
        (m) =>
          m.project_id === activeProject.id && m.user_email === payload.email
      );

      const updatedMembers = alreadyMember
        ? prev.project_members
        : [
            ...prev.project_members,
            {
              id: `pm-${Date.now()}`,
              project_id: activeProject.id,
              user_email: payload.email,
              role: payload.role,
              department: payload.department,
              can_chat: payload.role === 'owner' || payload.role === 'mandor',
            },
          ];

      return {
        ...prev,
        profiles: updatedProfiles,
        project_members: updatedMembers,
      };
    });

    showToast(`Team member ${payload.fullName} added to project.`);
  };

  const handleUpdateMemberRole = (
    profileId: string,
    newRole: GlobalRole,
    newDept: SpecialtyDepartment
  ) => {
    const target = db.profiles.find((p) => p.id === profileId);
    if (!target) return;

    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === profileId
          ? { ...p, global_role: newRole, specialty_department: newDept }
          : p
      ),
      project_members: prev.project_members.map((pm) =>
        pm.project_id === activeProject.id && pm.user_email === target.email
          ? { ...pm, role: newRole, department: newDept }
          : pm
      ),
    }));

    showToast(
      `Role updated for ${target.full_name}.`
    );
  };

  const handleToggleMemberChatAccess = (userEmail: string) => {
    setDb((prev) => {
      const exists = prev.project_members.some(
        (pm) =>
          pm.project_id === activeProject.id && pm.user_email === userEmail
      );
      if (exists) {
        return {
          ...prev,
          project_members: prev.project_members.map((pm) => {
            if (
              pm.project_id === activeProject.id &&
              pm.user_email === userEmail
            ) {
              const current =
                pm.can_chat !== undefined
                  ? pm.can_chat
                  : pm.role === 'owner' || pm.role === 'mandor';
              return { ...pm, can_chat: !current };
            }
            return pm;
          }),
        };
      }
      const targetProf = prev.profiles.find((p) => p.email === userEmail);
      if (!targetProf) return prev;
      return {
        ...prev,
        project_members: [
          ...prev.project_members,
          {
            id: `pm-${Date.now()}`,
            project_id: activeProject.id,
            user_email: userEmail,
            role: targetProf.global_role,
            department: targetProf.specialty_department,
            can_chat: true,
          },
        ],
      };
    });
    showToast('Team member chat access updated.');
  };

  const handleRemoveMember = (profileId: string) => {
    const target = db.profiles.find((p) => p.id === profileId);
    if (!target || target.id === 'prof-owner-01') return;

    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((p) => p.id !== profileId),
      project_members: prev.project_members.filter(
        (pm) => pm.user_email !== target.email
      ),
    }));

    if (activeProfileId === profileId) {
      setActiveProfileId('prof-owner-01');
    }

    showToast(`Team member ${target.full_name} removed from project.`);
  };

  const handleAddBlueprint = (areaName: string, imageUrl: string) => {
    const newBpId = `bp-area-${db.blueprints.length + 1}-${Date.now()
      .toString()
      .slice(-3)}`;
    const nextOrder = projectBlueprints.length + 1;

    setDb((prev) => ({
      ...prev,
      blueprints: [
        ...prev.blueprints,
        {
          id: newBpId,
          project_id: activeProject.id,
          area_name: areaName,
          image_url: imageUrl,
          sort_order: nextOrder,
          created_at: new Date().toISOString(),
        },
      ],
    }));

    setActiveBlueprintId(newBpId);
    showToast(`Floor plan "${areaName}" uploaded.`);
  };

  const nextPinCode = useMemo(() => {
    const areaIndex =
      projectBlueprints.findIndex((b) => b.id === activeBlueprintId) + 1;
    const prefix = areaIndex > 0 ? areaIndex * 100 : 100;
    const countInArea = allProjectPins.filter(
      (p) => p.blueprint_id === activeBlueprintId
    ).length;
    return `#${prefix + countInArea + 1}`;
  }, [projectBlueprints, activeBlueprintId, allProjectPins]);

  const handleCreatePin = (payload: {
    title: string;
    description: string;
    department: DepartmentOnly;
    priority: PinPriority;
    assignedWorkerEmail: string;
    beforeMediaUrl: string;
    coordX: number;
    coordY: number;
  }) => {
    trackOfflineActionIfActive();
    const newPinId = `pin-${Date.now()}`;
    const newPin: PinRecord = {
      id: newPinId,
      pin_code: nextPinCode,
      project_id: activeProject.id,
      blueprint_id: activeBlueprintId,
      title: payload.title,
      description: payload.description,
      department: payload.department,
      priority: payload.priority,
      status: 'open',
      coord_x: payload.coordX,
      coord_y: payload.coordY,
      before_media_url: payload.beforeMediaUrl,
      after_media_url: null,
      assigned_worker_email: payload.assignedWorkerEmail,
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: activeProfile.id,
      created_at: new Date().toISOString(),
      resolved_at: null,
      before_revision_media_url: null,
      pin_comments: [
        {
          id: `pinc-${Date.now()}`,
          pin_id: newPinId,
          author_name: activeProfile.full_name,
          author_role: activeProfile.global_role,
          note: `Open: ${payload.description}`,
          media_url: payload.beforeMediaUrl,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const sysLog = createActivityRecord({
      blueprintId: activeBlueprintId,
      pinId: newPinId,
      department: payload.department,
      messageType: 'system_event',
      content: `Added pin ${nextPinCode} (${payload.title}) as Open at X:${payload.coordX.toFixed(1)}%, Y:${payload.coordY.toFixed(1)}%.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: [newPin, ...prev.pins],
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    setDepartmentFilter(payload.department);
    setSelectedPinId(newPinId);
    setRightPanelTab('inspector');
    setIsPlacementMode(false);
    setPendingPinCoords(null);
    showToast(`Pin ${nextPinCode} (${payload.title}) added.`);
  };

  const handleRepositionPinCoord = (
    pinId: string,
    newCoordX: number,
    newCoordY: number
  ) => {
    const targetPin = db.pins.find((p) => p.id === pinId);
    if (!targetPin) return;
    trackOfflineActionIfActive();

    const sysLog = createActivityRecord({
      blueprintId: targetPin.blueprint_id,
      pinId: targetPin.id,
      department: targetPin.department,
      messageType: 'system_event',
      content: `Moved pin ${targetPin.pin_code} to X:${newCoordX.toFixed(1)}%, Y:${newCoordY.toFixed(1)}%.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pinId
          ? { ...item, coord_x: newCoordX, coord_y: newCoordY }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Pin ${targetPin.pin_code} moved to X:${newCoordX.toFixed(1)}%, Y:${newCoordY.toFixed(1)}%.`
    );
  };

  const handleWorkerStartProgress = (pin: PinRecord) => {
    trackOfflineActionIfActive();
    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Worker started pin ${pin.pin_code} (${pin.title}). Status changed from Open to In progress.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              status: 'in_progress',
              pin_comments: [
                ...(item.pin_comments || []),
                {
                  id: `pinc-${Date.now()}`,
                  pin_id: pin.id,
                  author_name: activeProfile.full_name,
                  author_role: activeProfile.global_role,
                  note: 'Started work (Status: In progress).',
                  media_url: null,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(`Started work on ${pin.pin_code}. Status: In progress.`);
  };

  const handleAddPinComment = (
    pin: PinRecord,
    note: string,
    mediaUrl?: string | null
  ) => {
    trackOfflineActionIfActive();
    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              pin_comments: [
                ...(item.pin_comments || []),
                {
                  id: `pinc-${Date.now()}`,
                  pin_id: pin.id,
                  author_name: activeProfile.full_name,
                  author_role: activeProfile.global_role,
                  note,
                  media_url: mediaUrl || null,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : item
      ),
    }));
    showToast(`Note and photo added to pin ${pin.pin_code}.`);
  };

  const handleWorkerUploadAfterProof = (
    pin: PinRecord,
    customDataUrl?: string,
    workerCompletionNote?: string,
    voiceDurationSec?: number
  ) => {
    trackOfflineActionIfActive();
    const afterUrl =
      customDataUrl ||
      createFieldPhotoSvgDataUri(
        pin.pin_code,
        'AFTER',
        pin.department,
        `Completed by ${activeProfile.full_name}`
      );

    const noteSuffix = workerCompletionNote
      ? ` Note: "${workerCompletionNote}"`
      : '';

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Uploaded latest photo for ${pin.pin_code} (${pin.title}). Status: Pending review (awaiting Foreman review).${noteSuffix}`,
    });

    const newStreamItems = [sysLog];

    if (voiceDurationSec && voiceDurationSec > 0) {
      const voiceLog = createActivityRecord({
        blueprintId: pin.blueprint_id,
        pinId: pin.id,
        department: pin.department,
        messageType: 'voice_note',
        content:
          workerCompletionNote ||
          `Voice note (${voiceDurationSec}s) for pin ${pin.pin_code}.`,
        voiceDurationSec,
      });
      newStreamItems.unshift(voiceLog);
    }

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              after_media_url: afterUrl,
              status: 'in_preview',
              pin_comments: [
                ...(item.pin_comments || []),
                {
                  id: `pinc-${Date.now()}`,
                  pin_id: pin.id,
                  author_name: activeProfile.full_name,
                  author_role: activeProfile.global_role,
                  note:
                    workerCompletionNote ||
                    'Uploaded latest work photo (Status: Pending review).',
                  media_url: afterUrl,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : item
      ),
      activity_streams: [...newStreamItems, ...prev.activity_streams],
    }));

    showToast(
      `Latest photo uploaded for ${pin.pin_code}. Status: Pending review.`
    );
  };

  const handleLeaderUpdatePinMeta = (
    pinId: string,
    payload: {
      title: string;
      description: string;
      priority: PinPriority;
      assignedWorkerEmail: string;
    }
  ) => {
    const targetPin = db.pins.find((p) => p.id === pinId);
    if (!targetPin) return;
    trackOfflineActionIfActive();

    const sysLog = createActivityRecord({
      blueprintId: targetPin.blueprint_id,
      pinId: targetPin.id,
      department: targetPin.department,
      messageType: 'system_event',
      content: `Updated pin ${targetPin.pin_code} (${payload.title}), assigned to ${payload.assignedWorkerEmail}.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pinId
          ? {
              ...item,
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
              assigned_worker_email: payload.assignedWorkerEmail,
            }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(`Pin ${targetPin.pin_code} details updated.`);
  };

  const handleLeaderApprovePin = (
    pin: PinRecord,
    leaderApprovalNote?: string
  ) => {
    trackOfflineActionIfActive();
    const noteText = leaderApprovalNote
      ? ` Note: "${leaderApprovalNote}"`
      : '';
    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Approved pin ${pin.pin_code}. Status changed to Resolved.${noteText}`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              status: 'resolved',
              resolved_at: new Date().toISOString(),
            }
          : item
      ),
      profiles: prev.profiles.map((prof) => {
        if (prof.email === pin.assigned_worker_email) {
          return {
            ...prof,
            total_resolved_pins: prof.total_resolved_pins + 1,
            first_time_right_count:
              pin.revision_count === 0
                ? prof.first_time_right_count + 1
                : prof.first_time_right_count,
          };
        }
        return prof;
      }),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Pin ${pin.pin_code} approved and moved to History.`
    );
  };

  const handleLeaderRejectPin = (pin: PinRecord, rejectReason: string) => {
    trackOfflineActionIfActive();
    const nextRevisionCount = pin.revision_count + 1;

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Requested revision R-0${nextRevisionCount} on pin ${pin.pin_code}. Note: ${rejectReason}`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              status: 'in_progress',
              revision_count: nextRevisionCount,
              // Simpan gambar terakhir sebelum direvisi agar perbandingan Before-After menampilkan Before = sebelum revisi, After = sesudah revisi
              before_revision_media_url:
                item.after_media_url || item.before_media_url,
              pin_comments: [
                ...(item.pin_comments || []),
                {
                  id: `pinc-rev-${Date.now()}`,
                  pin_id: pin.id,
                  author_name: activeProfile.full_name,
                  author_role: activeProfile.global_role,
                  note: `[Revision R-0${nextRevisionCount}]: ${rejectReason}`,
                  media_url: item.after_media_url || null,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Revision R-0${nextRevisionCount} requested for pin ${pin.pin_code}. Note added to Notes.`
    );
  };

  const handleOwnerReopenGhostPin = (
    pin: PinRecord,
    reopenReason: string,
    recurrenceCategory?: string,
    resetAfterMedia?: boolean
  ) => {
    trackOfflineActionIfActive();
    const nextRevisionCount = pin.revision_count + 1;
    const categoryTag = recurrenceCategory
      ? ` [${recurrenceCategory.toUpperCase()}]`
      : '';

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Reopened pin ${pin.pin_code} (R-0${nextRevisionCount})${categoryTag}. Note: ${reopenReason}`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? {
              ...item,
              status: 'in_progress',
              priority: 'urgent',
              revision_count: nextRevisionCount,
              resolved_at: null,
              before_revision_media_url:
                item.after_media_url || item.before_media_url,
              after_media_url: resetAfterMedia ? null : item.after_media_url,
              description: `[REVISION R-0${nextRevisionCount}${categoryTag}]: ${reopenReason}`,
            }
          : item
      ),
      profiles: prev.profiles.map((prof) => {
        if (
          pin.status === 'resolved' &&
          prof.email === pin.assigned_worker_email
        ) {
          return {
            ...prof,
            total_resolved_pins: Math.max(0, prof.total_resolved_pins - 1),
            first_time_right_count:
              pin.revision_count === 0
                ? Math.max(0, prof.first_time_right_count - 1)
                : prof.first_time_right_count,
          };
        }
        return prof;
      }),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Revision R-0${nextRevisionCount} requested for pin ${pin.pin_code}.`
    );
  };

  const handleMandorRequestDeletePin = (
    pin: PinRecord,
    deleteReason?: string
  ) => {
    trackOfflineActionIfActive();
    const reasonLabel = deleteReason ? ` Reason: "${deleteReason}"` : '';

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Foreman requested deletion for pin ${pin.pin_code} (R-0${pin.revision_count}).${reasonLabel} Awaiting Owner approval.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? { ...item, delete_requested_by_mandor: true }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Deletion request for ${pin.pin_code} sent to Owner.`
    );
  };

  const handleOwnerConfirmDeletePin = (
    pin: PinRecord,
    ownerDecisionNote?: string
  ) => {
    trackOfflineActionIfActive();
    const noteSuffix = ownerDecisionNote
      ? ` Note: "${ownerDecisionNote}"`
      : '';

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: null,
      department: pin.department,
      messageType: 'system_event',
      content: `Owner approved permanent deletion of pin ${pin.pin_code}.${noteSuffix}`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.filter((item) => item.id !== pin.id),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(`Pin ${pin.pin_code} permanently deleted by Owner.`);
  };

  const handleOwnerCancelDeleteRequest = (pin: PinRecord) => {
    trackOfflineActionIfActive();
    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: pin.department,
      messageType: 'system_event',
      content: `Deletion request for pin ${pin.pin_code} canceled by Owner.`,
    });

    setDb((prev) => ({
      ...prev,
      pins: prev.pins.map((item) =>
        item.id === pin.id
          ? { ...item, delete_requested_by_mandor: false }
          : item
      ),
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(`Deletion request for ${pin.pin_code} declined. Pin remains active.`);
  };

  const handleSaveGeneralNote = (nextNote: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === activeProject.id
          ? { ...proj, general_note: nextNote }
          : proj
      ),
    }));
    showToast('General note updated.');
  };

  const handleToggleChatLeaderOnly = (nextVal: boolean) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === activeProject.id
          ? { ...proj, chat_leader_only: nextVal }
          : proj
      ),
    }));
    showToast(
      nextVal
        ? 'Chat restricted to Owner & Foreman.'
        : 'Chat open to all team members.'
    );
  };

  const handleSendTextMessage = (
    content: string,
    bindToSelectedPin: boolean
  ) => {
    trackOfflineActionIfActive();
    const targetPin = bindToSelectedPin ? selectedPin : undefined;
    const newMsg = createActivityRecord({
      blueprintId: activeBlueprintId,
      pinId: targetPin ? targetPin.id : null,
      department: targetPin
        ? targetPin.department
        : departmentFilter === 'all'
        ? 'all'
        : departmentFilter,
      messageType: 'text',
      content,
    });

    setDb((prev) => ({
      ...prev,
      activity_streams: [newMsg, ...prev.activity_streams],
    }));
  };

  const handleSendVoiceNote = (
    durationSec: number,
    transcriptSummary: string,
    bindToSelectedPin: boolean
  ) => {
    trackOfflineActionIfActive();
    const targetPin = bindToSelectedPin ? selectedPin : undefined;
    const newVoice = createActivityRecord({
      blueprintId: activeBlueprintId,
      pinId: targetPin ? targetPin.id : null,
      department: targetPin
        ? targetPin.department
        : departmentFilter === 'all'
        ? 'all'
        : departmentFilter,
      messageType: 'voice_note',
      content: transcriptSummary,
      voiceDurationSec: durationSec,
    });

    setDb((prev) => ({
      ...prev,
      activity_streams: [newVoice, ...prev.activity_streams],
    }));

    showToast(`Voice note (${durationSec}s) sent to Chat.`);
  };

  // Single material allocation (used by Inventory/Belanja quick form)
  const handleAllocateMaterialToPin = (payload: {
    pinId: string;
    inventoryItemId: string;
    qtyRequested: number;
    orderDate?: string;
  }) => {
    trackOfflineActionIfActive();
    const pin = db.pins.find((p) => p.id === payload.pinId);
    const invItem = db.inventory_items.find(
      (i) => i.id === payload.inventoryItemId
    );
    if (!pin || !invItem) return;

    const isDuplicateFraud = detectDuplicateMaterialClaim(
      db.material_allocations,
      pin.id,
      invItem.id,
      pin.revision_count
    );

    const todayStr = payload.orderDate || new Date().toISOString().slice(0, 10);
    const currentStock = invItem.stock_available;
    const newAllocations: MaterialAllocationRecord[] = [];
    let nextStock = currentStock;

    if (currentStock >= payload.qtyRequested) {
      nextStock = currentStock - payload.qtyRequested;
      newAllocations.push({
        id: `alloc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}-sr`,
        project_id: activeProject.id,
        pin_id: pin.id,
        inventory_item_id: invItem.id,
        item_name: invItem.item_name,
        department: invItem.department,
        qty_requested: payload.qtyRequested,
        unit: invItem.unit,
        allocation_status: 'allocated_from_stock',
        request_type: 'SR',
        order_date: todayStr,
        needed_date: null,
        is_duplicate_warning: isDuplicateFraud,
        requested_by: activeProfile.id,
        created_at: new Date().toISOString(),
      });
    } else {
      const fromStock = Math.max(0, currentStock);
      const shortageToBuy = payload.qtyRequested - fromStock;
      nextStock = 0;

      if (fromStock > 0) {
        newAllocations.push({
          id: `alloc-${Date.now()}-partsr`,
          project_id: activeProject.id,
          pin_id: pin.id,
          inventory_item_id: invItem.id,
          item_name: invItem.item_name,
          department: invItem.department,
          qty_requested: fromStock,
          unit: invItem.unit,
          allocation_status: 'allocated_from_stock',
          request_type: 'SR',
          order_date: todayStr,
          needed_date: null,
          is_duplicate_warning: isDuplicateFraud,
          requested_by: activeProfile.id,
          created_at: new Date().toISOString(),
        });
      }

      newAllocations.push({
        id: `alloc-${Date.now()}-tobuy`,
        project_id: activeProject.id,
        pin_id: pin.id,
        inventory_item_id: invItem.id,
        item_name: invItem.item_name,
        department: invItem.department,
        qty_requested: shortageToBuy,
        unit: invItem.unit,
        allocation_status: 'to_buy',
        request_type: 'PR',
        order_date: todayStr,
        needed_date: new Date(Date.now() + 3 * 86400000)
          .toISOString()
          .slice(0, 10),
        is_duplicate_warning: isDuplicateFraud,
        requested_by: activeProfile.id,
        created_at: new Date().toISOString(),
      });
    }

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: invItem.department,
      messageType: 'system_event',
      content: `Stock request "${invItem.item_name}" (${payload.qtyRequested} ${invItem.unit}) for ${pin.pin_code}. Remaining stock: ${nextStock} ${invItem.unit}.`,
    });

    setDb((prev) => ({
      ...prev,
      inventory_items: prev.inventory_items.map((item) =>
        item.id === invItem.id
          ? {
              ...item,
              stock_available: nextStock,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
      material_allocations: [
        ...newAllocations,
        ...prev.material_allocations,
      ],
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Request "${invItem.item_name}" (${payload.qtyRequested} ${invItem.unit}) recorded for ${pin.pin_code}.`
    );
  };

  // 1 Orderan Baru = 1 SR (Marketlist) berisi daftar item (order_items) yang masuk ke halaman SR & PR
  const handleSubmitMarketlistBatch = (
    pinId: string,
    rows: { inventoryItemId: string; qty: number; orderDate: string }[]
  ) => {
    trackOfflineActionIfActive();
    const pin = db.pins.find((p) => p.id === pinId) || allProjectPins[0];
    if (!pin || rows.length === 0) return;

    const activeDept: DepartmentOnly =
      departmentFilter !== 'all' ? departmentFilter : pin.department;

    const bundledItems: {
      item_name: string;
      qty: number;
      unit: string;
      inventory_item_id?: string | null;
    }[] = [];

    const stockDeductions = new Map<string, number>();

    rows.forEach((row) => {
      const invItem = db.inventory_items.find(
        (i) => i.id === row.inventoryItemId
      );
      if (!invItem) return;
      bundledItems.push({
        item_name: invItem.item_name,
        qty: row.qty,
        unit: invItem.unit,
        inventory_item_id: invItem.id,
      });
      stockDeductions.set(
        invItem.id,
        (stockDeductions.get(invItem.id) || 0) + row.qty
      );
    });

    if (bundledItems.length === 0) return;

    const srCount =
      db.material_allocations.filter((m) => m.request_type === 'SR').length + 1;
    const orderCode = `SR-ORD-${String(srCount).padStart(3, '0')}`;
    const totalQty = bundledItems.reduce((sum, item) => sum + item.qty, 0);
    const summaryLabel =
      bundledItems.length === 1
        ? bundledItems[0].item_name
        : `Stock request (${bundledItems.length} materials: ${bundledItems
            .map((b) => b.item_name)
            .join(', ')})`;

    const singleSrOrder: MaterialAllocationRecord = {
      id: `alloc-sr-${Date.now()}`,
      order_code: orderCode,
      project_id: activeProject.id,
      pin_id: pin.id,
      inventory_item_id: bundledItems[0].inventory_item_id || null,
      item_name: summaryLabel,
      department: activeDept,
      qty_requested: totalQty,
      unit: bundledItems.length === 1 ? bundledItems[0].unit : 'Bundle',
      order_items: bundledItems,
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: rows[0]?.orderDate || new Date().toISOString().slice(0, 10),
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: activeProfile.id,
      created_at: new Date().toISOString(),
    };

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: activeDept,
      messageType: 'system_event',
      content: `Created stock request (${orderCode}) with ${bundledItems.length} materials for pin ${pin.pin_code}.`,
    });

    setDb((prev) => ({
      ...prev,
      inventory_items: prev.inventory_items.map((item) => {
        const deduct = stockDeductions.get(item.id);
        if (!deduct) return item;
        return {
          ...item,
          stock_available: Math.max(0, item.stock_available - deduct),
          updated_at: new Date().toISOString(),
        };
      }),
      material_allocations: [singleSrOrder, ...prev.material_allocations],
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Stock request (${orderCode}) with ${bundledItems.length} materials added to SR & PR.`
    );
  };

  // 1 Orderan Baru = 1 PR (Purchase Request) berisi daftar item (order_items) yang masuk ke halaman SR & PR
  const handleSubmitPurchaseRequestBatch = (
    pinId: string,
    rows: {
      itemName: string;
      department: DepartmentOnly;
      qty: number;
      unit: string;
      orderDate: string;
      neededDate: string;
    }[]
  ) => {
    trackOfflineActionIfActive();
    const pin = db.pins.find((p) => p.id === pinId) || allProjectPins[0];
    if (!pin || rows.length === 0) return;

    const activeDept: DepartmentOnly =
      rows[0]?.department ||
      (departmentFilter !== 'all' ? departmentFilter : pin.department);

    const bundledItems = rows.map((r) => ({
      item_name: r.itemName,
      qty: r.qty,
      unit: r.unit || 'Unit',
      inventory_item_id: null,
    }));

    const prCount =
      db.material_allocations.filter((m) => m.request_type === 'PR').length + 1;
    const orderCode = `PR-ORD-${String(prCount).padStart(3, '0')}`;
    const totalQty = bundledItems.reduce((sum, item) => sum + item.qty, 0);
    const summaryLabel =
      bundledItems.length === 1
        ? bundledItems[0].item_name
        : `Purchase request (${bundledItems.length} materials: ${bundledItems
            .map((b) => b.item_name)
            .join(', ')})`;

    const singlePrOrder: MaterialAllocationRecord = {
      id: `alloc-pr-${Date.now()}`,
      order_code: orderCode,
      project_id: activeProject.id,
      pin_id: pin.id,
      inventory_item_id: null,
      item_name: summaryLabel,
      department: activeDept,
      qty_requested: totalQty,
      unit: bundledItems.length === 1 ? bundledItems[0].unit : 'Bundle',
      order_items: bundledItems,
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: rows[0]?.orderDate || new Date().toISOString().slice(0, 10),
      needed_date:
        rows[0]?.neededDate ||
        new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      is_duplicate_warning: false,
      requested_by: activeProfile.id,
      created_at: new Date().toISOString(),
    };

    const sysLog = createActivityRecord({
      blueprintId: pin.blueprint_id,
      pinId: pin.id,
      department: activeDept,
      messageType: 'system_event',
      content: `Created purchase request (${orderCode}) with ${bundledItems.length} materials for pin ${pin.pin_code}.`,
    });

    setDb((prev) => ({
      ...prev,
      material_allocations: [singlePrOrder, ...prev.material_allocations],
      activity_streams: [sysLog, ...prev.activity_streams],
    }));

    showToast(
      `Purchase request (${orderCode}) with ${bundledItems.length} materials added to SR & PR.`
    );
  };

  const handleAddNewInventoryItem = (payload: {
    itemName: string;
    department: DepartmentOnly;
    unit: string;
    initialStock: number;
  }) => {
    const newItem: InventoryItemRecord = {
      id: `inv-${Date.now()}`,
      project_id: activeProject.id,
      item_name: payload.itemName,
      department: payload.department,
      unit: payload.unit,
      stock_available: payload.initialStock,
      updated_at: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      inventory_items: [...prev.inventory_items, newItem],
    }));

    showToast(`Material "${payload.itemName}" added to warehouse stock.`);
  };

  const handleRestockInventoryItem = (
    inventoryItemId: string,
    addedQty: number
  ) => {
    setDb((prev) => ({
      ...prev,
      inventory_items: prev.inventory_items.map((item) =>
        item.id === inventoryItemId
          ? {
              ...item,
              stock_available: item.stock_available + addedQty,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
    showToast(`Warehouse stock increased by +${addedQty}.`);
  };

  const handleMarkShoppingItemBought = (allocationId: string) => {
    setDb((prev) => ({
      ...prev,
      material_allocations: prev.material_allocations.map((alloc) =>
        alloc.id === allocationId
          ? { ...alloc, allocation_status: 'allocated_from_stock' }
          : alloc
      ),
    }));
    showToast('To buy material marked as purchased.');
  };

  const handleUpdateShoppingItemQty = (
    allocationId: string,
    nextQty: number
  ) => {
    setDb((prev) => ({
      ...prev,
      material_allocations: prev.material_allocations.map((alloc) =>
        alloc.id === allocationId
          ? { ...alloc, qty_requested: Math.max(1, nextQty) }
          : alloc
      ),
    }));
  };

  const handleUpdateTerminTarget = (targetPercent: number) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === activeProject.id
          ? { ...proj, termin_target_percent: targetPercent }
          : proj
      ),
    }));
    showToast(`Payment stage target updated to ${targetPercent}%.`);
  };

  // Division Management & SOP Settings Handlers
  const handleAddDivision = (name: string, shortCode: string) => {
    const slugCode = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const newDiv: DivisionRecord = {
      id: `div-${Date.now()}`,
      project_id: activeProject.id,
      code: slugCode || `div_${Date.now()}`,
      name,
      short_code: shortCode,
      created_at: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      divisions: [...(prev.divisions || DEFAULT_DIVISIONS), newDiv],
    }));

    showToast(
      `Division "${name}" (${shortCode}) added and linked to SR, PR, and Attendance.`
    );
  };

  const handleUpdateDivisionName = (divisionId: string, nextName: string) => {
    setDb((prev) => ({
      ...prev,
      divisions: (prev.divisions || DEFAULT_DIVISIONS).map((d) =>
        d.id === divisionId ? { ...d, name: nextName } : d
      ),
    }));
    showToast(`Division name updated to "${nextName}".`);
  };

  const handleUpdateProjectSettings = (payload: {
    sopLowStockThreshold: number;
    terminTargetPercent: number;
    estimatedCountdownLabel: string;
  }) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === activeProject.id
          ? {
              ...proj,
              sop_low_stock_threshold: payload.sopLowStockThreshold,
              termin_target_percent: payload.terminTargetPercent,
              estimated_countdown_label: payload.estimatedCountdownLabel,
            }
          : proj
      ),
    }));
    showToast(
      `Low-stock threshold (<= ${payload.sopLowStockThreshold} units) and project settings saved.`
    );
  };

  // Attendance Handlers
  const handleWorkerSubmitAttendance = (payload: {
    workerCode: string;
    divisionCode: string;
    attendanceType: 'masuk' | 'pulang';
    faceVerified: boolean;
  }): { ok: boolean; message: string } => {
    const matchedWorker = db.profiles.find(
      (p) =>
        (p.worker_code || '').toUpperCase() === payload.workerCode.toUpperCase()
    );
    const workerName = matchedWorker
      ? matchedWorker.full_name
      : `${activeProfile.full_name} (${payload.workerCode})`;
    const workerId = matchedWorker ? matchedWorker.id : activeProfile.id;

    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      project_id: activeProject.id,
      worker_profile_id: workerId,
      worker_name: workerName,
      worker_code: payload.workerCode,
      division_code: payload.divisionCode,
      attendance_type: payload.attendanceType,
      verification_method: 'face_scan',
      face_verified: payload.faceVerified,
      recorded_by_name: workerName,
      created_at: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      attendance_records: [newAtt, ...(prev.attendance_records || [])],
    }));

    return {
      ok: true,
      message: `${payload.attendanceType === 'masuk' ? 'Check in' : 'Check out'} recorded for ${workerName} [${
        payload.workerCode
      }] via face verification.`,
    };
  };

  const handleLeaderManualAttendance = (payload: {
    workerProfileId: string;
    divisionCode: string;
    attendanceType: 'masuk' | 'pulang';
  }) => {
    const worker = db.profiles.find((p) => p.id === payload.workerProfileId);
    if (!worker) return;

    const newAtt: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      project_id: activeProject.id,
      worker_profile_id: worker.id,
      worker_name: worker.full_name,
      worker_code: worker.worker_code || 'TKG-101',
      division_code: payload.divisionCode,
      attendance_type: payload.attendanceType,
      verification_method: 'manual_leader',
      face_verified: true,
      recorded_by_name: activeProfile.full_name,
      created_at: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      attendance_records: [newAtt, ...(prev.attendance_records || [])],
    }));

    showToast(
      `Manual ${payload.attendanceType === 'masuk' ? 'check in' : 'check out'} recorded for ${
        worker.full_name
      }.`
    );
  };

  const handleJumpToPinFromStream = (pinId: string) => {
    const targetPin = db.pins.find((p) => p.id === pinId);
    if (!targetPin) return;
    if (targetPin.project_id !== activeProjectId) {
      setActiveProjectId(targetPin.project_id);
    }
    if (targetPin.blueprint_id !== activeBlueprintId) {
      setActiveBlueprintId(targetPin.blueprint_id);
    }
    if (
      targetPin.department !== departmentFilter &&
      activeProfile.global_role !== 'worker'
    ) {
      setDepartmentFilter(targetPin.department);
    }
    if (targetPin.status === 'resolved') {
      handleNavigateTab('history');
      return;
    }
    setSelectedPinId(targetPin.id);
    handleNavigateTab('spatial_map');
    setRightPanelTab('inspector');
  };

  const handleQuickPinSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickPinSearch.trim().toLowerCase();
    if (!q) return;
    const found =
      allProjectPins.find(
        (p) =>
          p.pin_code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q)
      ) ||
      db.pins.find(
        (p) =>
          p.pin_code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q)
      );
    if (found) {
      handleJumpToPinFromStream(found.id);
      setQuickPinSearch('');
    } else {
      showToast(`Pin "${quickPinSearch}" not found.`);
    }
  };

  // Isolasi penuh personel & pekerja untuk setiap project (Unit Bisnis Berbeda)
  const projectProfiles = useMemo(() => {
    const memberEmails = new Set(
      db.project_members
        .filter((m) => m.project_id === activeProject.id)
        .map((m) => m.user_email)
    );
    const list = db.profiles.filter((p) => memberEmails.has(p.email));
    return list.length > 0 ? list : db.profiles;
  }, [db.project_members, db.profiles, activeProject.id]);

  const workerProfiles = useMemo(
    () => projectProfiles.filter((p) => p.global_role === 'worker'),
    [projectProfiles]
  );

  const toBuyCount = useMemo(
    () =>
      projectMaterialAllocations.filter(
        (m) => m.allocation_status === 'to_buy'
      ).length,
    [projectMaterialAllocations]
  );

  const areaActivitiesCount = useMemo(
    () =>
      projectActivities.filter(
        (a) =>
          a.blueprint_id === activeBlueprintId &&
          (departmentFilter === 'all' ||
            a.department === departmentFilter ||
            a.department === 'all')
      ).length,
    [projectActivities, activeBlueprintId, departmentFilter]
  );

  // TAMPILAN KHUSUS STEP 1: WEB HOME LANDING TANPA NAVBAR PROYEK (MIRIP FOTO 2)
  if (activeWorkspaceTab === 'web_home') {
    return (
      <>
        <VontaWebHomeLandingView
          activeProfile={activeProfile}
          profiles={db.profiles}
          projectsCount={db.projects.length}
          totalPinsCount={db.pins.length}
          onOpenDashboardProjects={() =>
            handleNavigateTab('dashboard_projects')
          }
          onSwitchProfile={handleSwitchProfile}
          themeMode={themeMode}
          onSelectThemeMode={handleSelectThemeMode}
        />
      </>
    );
  }

  // TAMPILAN KHUSUS STEP 2: DASHBOARD PROJECTS TANPA SIDEBAR PROYEK (MIRIP FOTO 3)
  if (activeWorkspaceTab === 'dashboard_projects') {
    return (
      <>
        <StandaloneProjectsDashboardView
          projects={db.projects}
          activeProjectId={activeProject.id}
          blueprints={db.blueprints}
          pins={db.pins}
          profiles={db.profiles}
          projectMembers={db.project_members}
          inventoryItems={db.inventory_items}
          materialAllocations={db.material_allocations}
          activeProfile={activeProfile}
          onSelectProjectAndOpenOverview={(projId) => {
            setActiveProjectId(projId);
            handleNavigateTab('overview');
          }}
          onOpenNewProjectModal={() => setIsProjectManagerModalOpen(true)}
          onBackToWebHome={() => handleNavigateTab('web_home')}
          onSwitchProfile={handleSwitchProfile}
        />

        <SupabaseAndProjectManagerModal
          isOpen={isProjectManagerModalOpen}
          onClose={() => setIsProjectManagerModalOpen(false)}
          dbState={db}
          activeProjectId={activeProject.id}
          onSelectProject={(projId) => setActiveProjectId(projId)}
          onCreateNewProject={handleCreateNewProject}
          onImportDatabaseJson={(importedDb) => {
            setDb(importedDb);
            if (importedDb.projects[0]) {
              setActiveProjectId(importedDb.projects[0].id);
            }
            showToast('Vonta database JSON backup imported.');
          }}
          isOfflineFieldMode={isOfflineFieldMode}
          onToggleOfflineFieldMode={(val) => {
            setIsOfflineFieldMode(val);
            showToast(
              val
                ? 'Offline mode active: changes saved to local queue.'
                : 'Back online.'
            );
          }}
          offlinePendingQueueCount={offlinePendingQueueCount}
          offlineQueueEntries={offlineQueueEntries}
          onSimulateOfflineAction={() => {}}
          onSyncOfflineQueueNow={() => {
            setOfflineQueueEntries([]);
            setIsOfflineFieldMode(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#0F141C] text-[#141619] dark:text-[#F8FAFC] transition-colors">
      {/* 1. GLOBAL TOP BREADCRUMB BAR (FIXED AT TOP, HEIGHT 48PX, CLEAN LIKE SUPABASE) */}
      <header className="no-print fixed top-0 left-0 right-0 z-40 h-12 bg-white dark:bg-[#161F2C] border-b border-[#E2E6EC] dark:border-[#263346] px-4 sm:px-5 flex items-center justify-between gap-3">
        {/* Left Side: Breadcrumb [Logo Vonta] / [Uluwatu Resort Group] / [Active Project] / [Blueprint Area Dropdown] */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleNavigateTab('web_home')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#1B365D] text-white hover:bg-[#152a4a] transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Back to Vonta home"
          >
            <span className="font-mono text-[11.5px] font-bold tracking-[0.06em]">
              VONTA
            </span>
          </button>

          <span className="text-[#475569]/60 dark:text-[#94A3B8]/60 text-xs select-none">
            /
          </span>

          <button
            type="button"
            onClick={() => handleNavigateTab('dashboard_projects')}
            className="text-[13px] font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC] transition-colors truncate max-w-[160px] cursor-pointer"
          >
            Uluwatu Resort Group
          </button>

          <span className="text-[#475569]/60 dark:text-[#94A3B8]/60 text-xs select-none">
            /
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigateTab('overview')}
              className="text-[13px] font-semibold text-[#141619] dark:text-[#F8FAFC] hover:text-[#B45309] dark:hover:text-[#D97706] transition-colors truncate max-w-[210px] cursor-pointer"
            >
              {activeProject.name}
            </button>
          </div>

          <span className="text-[#475569]/60 dark:text-[#94A3B8]/60 text-xs select-none hidden md:inline">
            /
          </span>

          {/* Blueprint Area Selector Dropdown */}
          <select
            aria-label="Select floor plan area"
            value={activeBlueprintId}
            onChange={(e) => {
              handleSelectBlueprintArea(e.target.value);
            }}
            className="hidden md:block h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D] transition-colors"
          >
            {projectBlueprints.map((bp) => (
              <option key={bp.id} value={bp.id}>
                {bp.area_name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Compact Search + Absensi Shortcut + Export BAST + Avatar Popover Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <form
            onSubmit={handleQuickPinSearchSubmit}
            className="relative hidden sm:flex items-center"
          >
            <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] absolute left-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={quickPinSearch}
              onChange={(e) => setQuickPinSearch(e.target.value)}
              placeholder="Search #101... (Ctrl K)"
              className="h-8 w-44 lg:w-52 pl-8 pr-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-mono text-[#141619] dark:text-[#F8FAFC] placeholder:text-[#475569] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D] transition-colors"
            />
          </form>

          {/* Shortcut Absensi Proyek di Top Navbar */}
          <button
            type="button"
            onClick={() => handleNavigateTab('attendance')}
            className={`h-8 px-3 rounded-[6px] border text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeWorkspaceTab === 'attendance'
                ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-2xs'
                : 'border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="hidden md:inline">Attendance</span>
          </button>

          {/* Thin Export BAST Button */}
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="h-8 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C] text-[12.5px] font-medium text-[#141619] dark:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#1B365D] dark:text-[#D97706]" />
            <span className="hidden md:inline">Print handover report</span>
          </button>

          {/* 2. AVATAR POPOVER MENU TRIGGER */}
          <div ref={avatarMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarMenuOpen((v) => !v)}
              aria-label="Account and role menu"
              className="w-8 h-8 rounded-full bg-[#1B365D] text-white font-mono text-[11px] font-semibold flex items-center justify-center border border-[#E2E6EC] dark:border-[#263346] hover:ring-2 hover:ring-[#B45309]/40 transition-all cursor-pointer"
            >
              {activeProfile.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </button>

            {isAvatarMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-[248px] rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-lg z-50 divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px] overflow-hidden">
                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#141619] dark:text-[#F8FAFC] truncate">
                      {activeProfile.full_name}
                    </p>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] px-1.5 py-0.5 rounded bg-[#1B365D]/10 dark:bg-white/10 text-[#1B365D] dark:text-[#D97706] shrink-0">
                      {activeProfile.global_role === 'mandor' ? 'foreman' : activeProfile.global_role}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
                    {activeProfile.email}
                  </p>
                </div>

                <div className="p-2 space-y-1.5">
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8] block mb-1.5">
                      Switch role
                    </span>
                    <div className="space-y-1">
                      {[
                        {
                          id: 'prof-owner-01',
                          label: 'Owner (Ir. Hendra)',
                        },
                        {
                          id: 'prof-mandor-01',
                          label: 'Foreman (Agus)',
                        },
                        {
                          id: 'prof-worker-listrik',
                          label: 'Worker Budi (Electrical)',
                        },
                      ].map((roleOpt) => {
                        const isSelected = activeProfile.id === roleOpt.id;
                        return (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => {
                              handleSwitchProfile(roleOpt.id);
                              setIsAvatarMenuOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-[6px] text-left text-[12px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#1B365D] text-white'
                                : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                            }`}
                          >
                            <span>{roleOpt.label}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8] block mb-1.5 px-1">
                    Theme
                  </span>
                  <div className="space-y-1">
                    {(
                      [
                        { id: 'system', label: 'System' },
                        { id: 'dark', label: 'Dark' },
                        { id: 'light', label: 'Light' },
                      ] as const
                    ).map((t) => {
                      const isChecked = themeMode === t.id;
                      return (
                        <label
                          key={t.id}
                          onClick={() => handleSelectThemeMode(t.id)}
                          className="flex items-center gap-2.5 px-2 py-1 rounded-[6px] cursor-pointer hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isChecked
                                ? 'border-[#B45309] dark:border-[#D97706]'
                                : 'border-[#475569] dark:border-[#94A3B8]'
                            }`}
                          >
                            {isChecked && (
                              <span className="w-2 h-2 rounded-full bg-[#B45309] dark:bg-[#D97706]" />
                            )}
                          </span>
                          <span>{t.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2.5 space-y-1.5">
                  <div className="px-1.5 py-1 flex items-center gap-1.5 text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Timezone: Auto (Asia/Makassar)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      handleSwitchProfile('prof-owner-01');
                      showToast('Session reset to primary Owner account.');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-[6px] text-left text-[13px] font-medium text-[#DC2626] hover:bg-[#DC2626]/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Feedback Banner (Fixed Floating) */}
      {toastBanner && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-4 right-4 z-50 rounded-lg shadow-lg bg-[#1B365D] text-white px-4 py-2 text-[12px] font-medium border border-white/15"
        >
          {toastBanner}
        </div>
      )}

      {/* WORKSPACE BODY: FIXED LEFT SIDEBAR + MAIN VIEWPORT */}
      <div className="no-print flex-1 flex pt-12 min-h-screen">
        {/* 3. LEFT SIDEBAR NAVIGATION (FIXED, TIDAK IKUT TURUN SAAT PAGE DI-SCROLL) */}
        <aside
          aria-label="Main navigation sidebar"
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`fixed top-12 left-0 bottom-0 z-30 h-[calc(100vh-48px)] ${
            isSidebarHovered ? 'w-[236px]' : 'w-14'
          } shrink-0 border-r border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] flex flex-col justify-between transition-all duration-200 overflow-hidden`}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#E2E6EC] dark:divide-[#263346]">
            {/* Kategori 1 (Proyek & Absensi) */}
            <div className="p-2.5 space-y-1">
              {isSidebarHovered && (
                <span className="px-2.5 py-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8] truncate">
                  Project
                </span>
              )}

              {(
                [
                  {
                    id: 'overview',
                    label: 'Project overview',
                    icon: BarChart3,
                  },
                  {
                    id: 'spatial_map',
                    label: '3D floor plan',
                    icon: Layers,
                  },
                  {
                    id: 'history',
                    label: 'History',
                    icon: History,
                  },
                  {
                    id: 'attendance',
                    label: 'Attendance',
                    icon: CalendarCheck,
                  },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive = activeWorkspaceTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigateTab(item.id)}
                    title={item.label}
                    className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {isSidebarHovered && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Kategori 2 (Manajemen, Inventory, Belanja, SR & PR, Audit) */}
            <div className="p-2.5 space-y-1">
              {isSidebarHovered && (
                <span className="px-2.5 py-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8] truncate">
                  Management &amp; audit
                </span>
              )}

              <button
                type="button"
                onClick={() => handleNavigateTab('inventory')}
                title="Warehouse stock"
                className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeWorkspaceTab === 'inventory'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                {isSidebarHovered && (
                  <span className="truncate">Warehouse stock</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('shopping')}
                title="Shopping list"
                className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  activeWorkspaceTab === 'shopping'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {isSidebarHovered && (
                    <span className="truncate">Shopping list</span>
                  )}
                </span>
                {isSidebarHovered && toBuyCount > 0 && (
                  <span className="font-mono tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#B45309] text-white shrink-0">
                    {toBuyCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('sr_pr')}
                title="Stock & purchase requests (SR & PR)"
                className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeWorkspaceTab === 'sr_pr'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                }`}
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                {isSidebarHovered && (
                  <span className="truncate">SR &amp; PR</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('team')}
                title="Project team"
                className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeWorkspaceTab === 'team'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-[#141619] dark:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                {isSidebarHovered && (
                  <span className="truncate">Project team</span>
                )}
              </button>
            </div>
          </div>

          {/* Kategori 3 (Bawah): Pengaturan Proyek (Membuka Halaman Khusus, Tanpa Tombol Collapse) */}
          <div className="p-2.5 border-t border-[#E2E6EC] dark:border-[#263346] shrink-0">
            <button
              type="button"
              onClick={() => handleNavigateTab('project_settings')}
              title="Project settings"
              className={`w-full h-9 px-2.5 rounded-[6px] text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeWorkspaceTab === 'project_settings'
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {isSidebarHovered && (
                <span className="truncate">Project settings</span>
              )}
            </button>
          </div>
        </aside>

        {/* 4. MAIN PAGE VIEWPORT */}
        <main
          className={`flex-1 min-w-0 transition-all duration-200 ${
            isSidebarHovered ? 'pl-[236px]' : 'pl-14'
          }`}
        >
          {/* HALAMAN C: KANVAS SPASIAL 3D/2D + CHAT ROOM PER AREA + PANEL MULTI-ORDER DI BAWAHNYA */}
          {activeWorkspaceTab === 'spatial_map' && (
            <div className="flex flex-col min-h-[calc(100vh-48px)]">
              {/* Top Split: 72% Left Blueprint 3D/2D Stage + 28% Right Inspeksi / Chat Room */}
              <div className="flex flex-col lg:flex-row flex-1">
                <div className="w-full lg:w-[72%] p-4">
                  <SpatialBlueprintCanvas
                    blueprint={activeBlueprint}
                    pins={filteredAreaPins}
                    divisions={projectDivisions}
                    selectedPinId={selectedPinId}
                    onSelectPin={(id) => {
                      setSelectedPinId(id);
                      setRightPanelTab('inspector');
                    }}
                    activeRole={activeProfile.global_role}
                    canvasMode={canvasMode}
                    onChangeCanvasMode={setCanvasMode}
                    isPlacementMode={isPlacementMode}
                    onTogglePlacementMode={() => setIsPlacementMode((v) => !v)}
                    onRequestCreatePinAtCoord={(x, y) => {
                      setPendingPinCoords({ x, y });
                    }}
                    onRepositionPinCoord={handleRepositionPinCoord}
                    isAreaLoading={isAreaLoading}
                    simulatedUiState={simulatedUiState}
                    onResetSimulatedState={() => setSimulatedUiState('normal')}
                    activeDepartmentFilter={departmentFilter}
                    onChangeDepartmentFilter={setDepartmentFilter}
                    selectedPinAllocations={
                      selectedPin
                        ? projectMaterialAllocations.filter(
                            (m) => m.pin_id === selectedPin.id
                          )
                        : []
                    }
                    onOpenPinVerification={() => setRightPanelTab('inspector')}
                    onOpenUploadBlueprintModal={() =>
                      setIsUploadBlueprintModalOpen(true)
                    }
                  />
                </div>

                {/* 28% Right Contextual Panel: Inspeksi Pin & Chat Room per Area */}
                <aside className="w-full lg:w-[28%] border-t lg:border-t-0 lg:border-l border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] flex flex-col">
                  <div className="h-11 px-2 border-b border-[#E2E6EC] dark:border-[#263346] grid grid-cols-2 gap-1 items-center shrink-0 bg-[#F8F7F4] dark:bg-[#0F141C]">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('inspector')}
                      className={`h-8 px-2.5 rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        rightPanelTab === 'inspector'
                          ? 'bg-white dark:bg-[#161F2C] text-[#141619] dark:text-[#F8FAFC] border border-[#E2E6EC] dark:border-[#263346] shadow-2xs'
                          : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#B45309] dark:text-[#D97706] shrink-0" />
                      <span className="truncate">
                        Pin details ({selectedPin ? selectedPin.pin_code : '-'})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightPanelTab('livestream')}
                      className={`h-8 px-2.5 rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        rightPanelTab === 'livestream'
                          ? 'bg-white dark:bg-[#161F2C] text-[#141619] dark:text-[#F8FAFC] border border-[#E2E6EC] dark:border-[#263346] shadow-2xs'
                          : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#1B365D] dark:text-[#D97706] shrink-0" />
                      <span className="truncate">
                        Chat ({areaActivitiesCount})
                      </span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3.5 max-h-[600px]">
                    {rightPanelTab === 'inspector' ? (
                      selectedPin ? (
                        <BeforeAfterSliderGate
                          pin={selectedPin}
                          areaPins={filteredAreaPins}
                          onSelectPin={(id) => setSelectedPinId(id)}
                          workers={workerProfiles}
                          activeRole={activeProfile.global_role}
                          activeUserName={activeProfile.full_name}
                          inventoryItems={projectInventoryItems}
                          pinAllocations={projectMaterialAllocations.filter(
                            (m) => m.pin_id === selectedPin.id
                          )}
                          onAllocateMaterialToPin={handleAllocateMaterialToPin}
                          onWorkerStartProgress={handleWorkerStartProgress}
                          onWorkerUploadAfter={handleWorkerUploadAfterProof}
                          onAddPinComment={handleAddPinComment}
                          onLeaderUpdatePinMeta={handleLeaderUpdatePinMeta}
                          onLeaderApprovePin={handleLeaderApprovePin}
                          onLeaderRejectPin={handleLeaderRejectPin}
                          onOwnerReopenGhostPin={handleOwnerReopenGhostPin}
                          onMandorRequestDeletePin={
                            handleMandorRequestDeletePin
                          }
                          onOwnerConfirmDeletePin={handleOwnerConfirmDeletePin}
                          onOwnerCancelDeleteRequest={
                            handleOwnerCancelDeleteRequest
                          }
                          onOpenPrintBast={() => setIsPrintModalOpen(true)}
                        />
                      ) : (
                        <div className="py-12 text-center text-[13px] text-[#475569] dark:text-[#94A3B8]">
                          Select a pin on the floor plan or change the division filter.
                        </div>
                      )
                    ) : (
                      <ContextualLiveStreamPanel
                        activities={projectActivities}
                        pins={allProjectPins}
                        divisions={projectDivisions}
                        activeAreaId={activeBlueprintId}
                        activeAreaName={
                          activeBlueprint?.area_name || 'Floor plan area'
                        }
                        activeDepartmentFilter={departmentFilter}
                        selectedPin={selectedPin}
                        activeRole={activeProfile.global_role}
                        activeUserName={activeProfile.full_name}
                        canUserChat={canActiveUserChat}
                        generalNote={activeProject.general_note}
                        onSaveGeneralNote={handleSaveGeneralNote}
                        chatLeaderOnly={activeProject.chat_leader_only}
                        onToggleChatLeaderOnly={handleToggleChatLeaderOnly}
                        onSendTextMessage={handleSendTextMessage}
                        onSendVoiceNote={handleSendVoiceNote}
                        onSelectPinFromStream={handleJumpToPinFromStream}
                        onQuickApprovePin={handleLeaderApprovePin}
                        onQuickRejectPin={handleLeaderRejectPin}
                        onOpenPinVerification={() =>
                          setRightPanelTab('inspector')
                        }
                        onOpenTeamPermissions={() => handleNavigateTab('team')}
                      />
                    )}
                  </div>
                </aside>
              </div>

              {/* Bottom Section: Pengorderan Barang Multi-Item (Mengikuti Divisi yang Sedang Dibuka di Kanvas) */}
              <div className="px-4 pb-5">
                <BottomMultiOrderPanel
                  selectedPin={selectedPin}
                  pins={filteredAreaPins}
                  inventoryItems={projectInventoryItems}
                  divisions={projectDivisions}
                  activeDepartmentFilter={departmentFilter}
                  pinAllocations={projectMaterialAllocations.filter(
                    (m) =>
                      departmentFilter === 'all' ||
                      m.department === departmentFilter
                  )}
                  onSubmitMarketlistBatch={handleSubmitMarketlistBatch}
                  onSubmitPurchaseRequestBatch={
                    handleSubmitPurchaseRequestBatch
                  }
                />
              </div>
            </div>
          )}

          {/* HALAMAN HISTORY PENYELESAIAN TITIK PER DIVISI (SAAT MANDOR APPROVE) */}
          {activeWorkspaceTab === 'history' && (
            <DivisionHistoryView
              pins={allProjectPins}
              divisions={projectDivisions}
              profiles={projectProfiles}
              activeDepartmentFilter={departmentFilter}
            />
          )}

          {/* HALAMAN A: SEMUA PROYEK (USER HOMEPAGE) */}
          {activeWorkspaceTab === 'home' && (
            <div className="max-w-[1360px] mx-auto p-5">
              <ProjectsHomeView
                projects={db.projects}
                activeProjectId={activeProject.id}
                blueprints={db.blueprints}
                pins={db.pins}
                profiles={db.profiles}
                inventoryItems={db.inventory_items}
                materialAllocations={db.material_allocations}
                activeProfile={activeProfile}
                offlinePendingCount={offlinePendingQueueCount}
                onSelectProjectAndOpenOverview={(projId) => {
                  setActiveProjectId(projId);
                  handleNavigateTab('overview');
                }}
                onOpenNewProjectModal={() => setIsProjectManagerModalOpen(true)}
                onNavigateTab={(tab) => handleNavigateTab(tab)}
              />
            </div>
          )}

          {/* HALAMAN B: PROJECT OVERVIEW (DENGAN GAMBAR BLUEPRINT & FILTER AREA LANGSUNG) */}
          {activeWorkspaceTab === 'overview' && (
            <div className="max-w-[1360px] mx-auto p-5">
              <ProjectOverviewDashboard
                project={activeProject}
                blueprints={projectBlueprints}
                activeBlueprint={activeBlueprint}
                pins={allProjectPins}
                profiles={projectProfiles}
                divisions={projectDivisions}
                inventoryItems={projectInventoryItems}
                materialAllocations={projectMaterialAllocations}
                onNavigateTab={(tab) => handleNavigateTab(tab)}
                onSelectBlueprintArea={(bpId) => {
                  handleSelectBlueprintArea(bpId);
                }}
                onSelectBlueprintAndOpenCanvas={(bpId) => {
                  handleSelectBlueprintArea(bpId);
                  handleNavigateTab('spatial_map');
                }}
                onJumpToPinOnMap={handleJumpToPinFromStream}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
              />
            </div>
          )}

          {/* HALAMAN ABSENSI PROYEK (TERISOLASI PER PROYEK) */}
          {activeWorkspaceTab === 'attendance' && (
            <AttendanceView
              activeProfile={activeProfile}
              profiles={projectProfiles}
              divisions={projectDivisions}
              attendanceRecords={projectAttendanceRecords}
              onWorkerSubmitAttendance={handleWorkerSubmitAttendance}
              onLeaderManualAttendance={handleLeaderManualAttendance}
            />
          )}

          {/* HALAMAN D1 & D2: INVENTORY GUDANG ATAU DAFTAR BELANJA (TERPISAH & TERISOLASI PER PROYEK) */}
          {(activeWorkspaceTab === 'inventory' ||
            activeWorkspaceTab === 'shopping') && (
            <InventoryAndShoppingView
              inventoryItems={projectInventoryItems}
              materialAllocations={projectMaterialAllocations}
              pins={allProjectPins}
              divisions={projectDivisions}
              sopLowStockThreshold={activeProject.sop_low_stock_threshold ?? 5}
              activeDepartmentFilter={departmentFilter}
              activeRole={activeProfile.global_role}
              selectedPinId={selectedPinId}
              onAllocateMaterialToPin={handleAllocateMaterialToPin}
              onAddNewInventoryItem={handleAddNewInventoryItem}
              onRestockInventoryItem={handleRestockInventoryItem}
              onMarkShoppingItemBought={handleMarkShoppingItemBought}
              onUpdateShoppingItemQty={handleUpdateShoppingItemQty}
              onJumpToPinOnMap={handleJumpToPinFromStream}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onOpenSettingsPage={() => handleNavigateTab('project_settings')}
              simulatedUiState={simulatedUiState}
              onResetSimulatedState={() => setSimulatedUiState('normal')}
              sectionMode={
                activeWorkspaceTab === 'shopping' ? 'shopping' : 'inventory'
              }
              onSwitchSectionMode={(mode) => handleNavigateTab(mode)}
            />
          )}

          {/* HALAMAN SR & PR (STORE REQUEST & PURCHASE REQUEST PER DIVISI PROYEK) */}
          {activeWorkspaceTab === 'sr_pr' && (
            <StoreAndPurchaseRequestView
              divisions={projectDivisions}
              materialAllocations={projectMaterialAllocations}
              inventoryItems={projectInventoryItems}
              pins={allProjectPins}
              onJumpToPinOnMap={handleJumpToPinFromStream}
              onSubmitMarketlistBatch={handleSubmitMarketlistBatch}
              onSubmitPurchaseRequestBatch={handleSubmitPurchaseRequestBatch}
            />
          )}

          {/* HALAMAN TIM PROYEK (DENGAN PENGATURAN IZIN CHAT ROOM) */}
          {activeWorkspaceTab === 'team' && (
            <div className="max-w-[1360px] mx-auto p-5">
              <TeamManagementView
                profiles={projectProfiles}
                projectMembers={db.project_members.filter(
                  (m) => m.project_id === activeProject.id
                )}
                divisions={projectDivisions}
                activeProfile={activeProfile}
                pins={allProjectPins}
                chatLeaderOnly={activeProject.chat_leader_only}
                onToggleChatLeaderOnly={handleToggleChatLeaderOnly}
                onToggleMemberChatAccess={handleToggleMemberChatAccess}
                onOpenInviteModal={() => setIsInviteModalOpen(true)}
                onUpdateMemberRole={handleUpdateMemberRole}
                onRemoveMember={handleRemoveMember}
                onSwitchActiveProfile={handleSwitchProfile}
              />
            </div>
          )}

          {/* HALAMAN KHUSUS PENGATURAN PROYEK (BUKAN POPUP + ADA NAVBAR TAMBAHAN & TOMBOL KEMBALI KE PROYEK) */}
          {activeWorkspaceTab === 'project_settings' && (
            <ProjectSettingsPage
              project={activeProject}
              divisions={projectDivisions}
              theme={resolvedTheme}
              onToggleTheme={handleSelectThemeMode}
              onAddDivision={handleAddDivision}
              onUpdateDivisionName={handleUpdateDivisionName}
              onUpdateProjectSettings={handleUpdateProjectSettings}
              onBackToProject={() => handleNavigateTab(lastNonSettingsTab)}
              dbState={db}
              onResetDatabase={() => {
                localStorage.removeItem(STORAGE_KEY);
                setDb(INITIAL_VONTA_DATABASE);
                setActiveProfileId('prof-owner-01');
                setActiveProjectId('proj-uluwatu-01');
                setThemeMode('light');
                setDepartmentFilter('listrik');
                showToast('Database reset to default seed data.');
              }}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <InviteAuthModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        profiles={db.profiles}
        activeProfileId={activeProfile.id}
        onSelectProfile={handleSwitchProfile}
        onInviteMember={handleInviteMember}
      />

      <UploadBlueprintModal
        isOpen={isUploadBlueprintModalOpen}
        onClose={() => setIsUploadBlueprintModalOpen(false)}
        onAddBlueprint={handleAddBlueprint}
      />

      <CreatePinModal
        isOpen={pendingPinCoords !== null}
        onClose={() => setPendingPinCoords(null)}
        coordX={pendingPinCoords?.x || 50}
        coordY={pendingPinCoords?.y || 50}
        nextPinCode={nextPinCode}
        workers={workerProfiles}
        onCreatePin={handleCreatePin}
      />

      <CustomPrintBastModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        project={activeProject}
        activeBlueprint={activeBlueprint}
        pins={allProjectPins}
        materialAllocations={projectMaterialAllocations}
        activeDepartmentFilter={departmentFilter}
      />

      <SupabaseAndProjectManagerModal
        isOpen={isProjectManagerModalOpen}
        onClose={() => setIsProjectManagerModalOpen(false)}
        dbState={db}
        activeProjectId={activeProject.id}
        onSelectProject={(projId) => setActiveProjectId(projId)}
        onCreateNewProject={handleCreateNewProject}
        onImportDatabaseJson={(importedDb) => {
          setDb(importedDb);
          if (importedDb.projects[0]) {
            setActiveProjectId(importedDb.projects[0].id);
          }
          showToast('Vonta database JSON backup imported.');
        }}
        isOfflineFieldMode={isOfflineFieldMode}
        onToggleOfflineFieldMode={(val) => {
          setIsOfflineFieldMode(val);
          showToast(
            val
              ? 'Offline mode active: changes saved to local queue.'
              : 'Back online.'
          );
        }}
        offlinePendingQueueCount={offlinePendingQueueCount}
        offlineQueueEntries={offlineQueueEntries}
        onSimulateOfflineAction={() => {
          setIsOfflineFieldMode(true);
          const pinTarget = selectedPin || allProjectPins[0];
          const entry = createOfflineQueueEntry({
            actionType: 'UPLOAD_AFTER_PROOF',
            pinCode: pinTarget?.pin_code || '#101',
            actorName: activeProfile.full_name,
            actorRole: activeProfile.global_role,
            summary: `Uploaded After photo and 15s voice note on pin ${
              pinTarget?.pin_code || '#101'
            } while offline.`,
          });
          setOfflineQueueEntries((prev) => [entry, ...prev]);
          showToast(`Offline action (${entry.pinCode}) added to outbox.`);
        }}
        onSyncOfflineQueueNow={() => {
          setOfflineQueueEntries([]);
          setIsOfflineFieldMode(false);
          showToast('Local queue synced to database.');
        }}
      />
    </div>
  );
}
