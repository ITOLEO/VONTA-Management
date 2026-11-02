export type GlobalRole = 'owner' | 'mandor' | 'worker';
export type DepartmentOnly = 'listrik' | 'pipa' | 'sipil' | 'cat' | string;
export type SpecialtyDepartment = 'all' | DepartmentOnly;
export type ThemePreference = 'light' | 'dark';
export type PinPriority = 'normal' | 'urgent';
export type PinStatus = 'open' | 'in_progress' | 'in_preview' | 'resolved' | 'reopened';
export type AllocationStatus = 'allocated_from_stock' | 'to_buy';
export type MessageType = 'text' | 'voice_note' | 'system_event';

export interface PinCommentRecord {
  id: string;
  sender_name: string;
  sender_role: GlobalRole;
  note: string;
  media_url?: string | null;
  status_label?: string;
  created_at: string;
}

export interface OrderBundledItem {
  item_name: string;
  qty: number;
  unit: string;
  inventory_item_id?: string | null;
}

// Divisi Proyek Dinamis (Terhubung ke Kanvas, SR/PR, Inventory, dan Absensi)
export interface DivisionRecord {
  id: string;
  project_id: string;
  code: string;
  name: string;
  short_code: string;
  label?: string;
  short_label?: string;
  badge_bg?: string;
  badge_text?: string;
  created_at?: string;
}

// Rekam Absensi Pekerja (Wajib Divisi, Kode Pekerja & Absen Wajah / Manual Leader)
export interface AttendanceRecord {
  id: string;
  project_id: string;
  profile_id?: string;
  worker_profile_id: string;
  worker_name: string;
  worker_code: string;
  division_code: string;
  date?: string;
  attendance_type: 'masuk' | 'pulang';
  check_in_time?: string | null;
  check_out_time?: string | null;
  method?: 'face_scan' | 'manual_leader';
  verification_method: 'face_scan' | 'manual_leader';
  face_verified: boolean;
  recorded_by?: string;
  recorded_by_name: string;
  created_at: string;
}

// 1. Tabel public.profiles
export interface ProfileRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  global_role: GlobalRole;
  specialty_department: SpecialtyDepartment;
  theme_preference: ThemePreference;
  total_resolved_pins: number;
  first_time_right_count: number;
  worker_code?: string;
  can_chat?: boolean;
  created_at: string;
}

// 2. Tabel public.projects
export interface ProjectRecord {
  id: string;
  name: string;
  location?: string;
  business_unit_code?: string;
  owner_id: string;
  general_note: string;
  chat_leader_only: boolean;
  termin_target_percent: number;
  sop_low_stock_threshold?: number;
  estimated_countdown_label?: string;
  start_date: string;
  target_end_date: string | null;
  created_at: string;
}

// 3. Tabel public.project_members
export interface ProjectMemberRecord {
  id: string;
  project_id: string;
  user_email: string;
  role: GlobalRole;
  department: SpecialtyDepartment;
  can_chat?: boolean;
}

// 4. Tabel public.blueprints
export interface BlueprintRecord {
  id: string;
  project_id: string;
  area_name: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

// 5. Tabel public.pins
export interface PinRecord {
  id: string;
  pin_code: string;
  project_id: string;
  blueprint_id: string;
  title: string;
  description: string | null;
  department: DepartmentOnly;
  priority: PinPriority;
  status: PinStatus;
  coord_x: number;
  coord_y: number;
  before_media_url: string;
  before_revision_media_url?: string | null;
  after_media_url: string | null;
  assigned_worker_email: string | null;
  revision_count: number;
  delete_requested_by_mandor: boolean;
  pin_comments?: PinCommentRecord[];
  created_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

// 6. Tabel public.inventory_items
export interface InventoryItemRecord {
  id: string;
  project_id: string;
  item_name: string;
  department: DepartmentOnly;
  unit: string;
  stock_available: number;
  updated_at: string;
}

// 7. Tabel public.material_allocations (Terhubung dengan Marketlist / SR & PR)
export interface MaterialAllocationRecord {
  id: string;
  project_id: string;
  pin_id: string;
  inventory_item_id: string | null;
  item_name: string;
  department: DepartmentOnly;
  qty_requested: number;
  unit: string;
  allocation_status: AllocationStatus;
  request_type?: 'SR' | 'PR';
  order_code?: string;
  order_items?: OrderBundledItem[];
  order_date?: string;
  needed_date?: string | null;
  is_duplicate_warning: boolean;
  requested_by: string | null;
  created_at: string;
}

// 8. Tabel public.activity_streams (Chat Room Per Area)
export interface ActivityStreamRecord {
  id: string;
  project_id: string;
  blueprint_id: string | null;
  pin_id: string | null;
  department: SpecialtyDepartment | null;
  sender_name: string;
  sender_role: string;
  message_type: MessageType;
  content: string;
  voice_duration_sec: number | null;
  created_at: string;
}

// Struktur Database Lengkap Vonta
export interface VontaDatabaseState {
  profiles: ProfileRecord[];
  projects: ProjectRecord[];
  project_members: ProjectMemberRecord[];
  blueprints: BlueprintRecord[];
  pins: PinRecord[];
  inventory_items: InventoryItemRecord[];
  material_allocations: MaterialAllocationRecord[];
  activity_streams: ActivityStreamRecord[];
  divisions?: DivisionRecord[];
  attendance_records?: AttendanceRecord[];
}
