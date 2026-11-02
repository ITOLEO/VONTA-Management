import {
  ProfileRecord,
  ProjectMemberRecord,
  VontaDatabaseState,
} from '../types/schema';
import { DEFAULT_DIVISIONS, INITIAL_VONTA_DATABASE } from '../data/initialDatabase';
import { safeGetItem, safeSetItem } from './storage';

export const STORAGE_KEY_V8 = 'vonta_supabase_db_v8';
export const STORAGE_KEY_V9 = 'vonta_supabase_db_v9';
export const BACKUP_CORRUPT_KEY = 'vonta_db_corrupt_backup_latest';
export const CURRENT_SCHEMA_VERSION = 9;

export const DEMO_WAREHOUSE_PROFILE: ProfileRecord = {
  id: 'prof-warehouse-01',
  email: 'david.warehouse@vonta.app',
  full_name: 'David Warehouse Keeper',
  avatar_url: null,
  global_role: 'warehouse',
  specialty_department: 'all',
  theme_preference: 'light',
  total_resolved_pins: 0,
  first_time_right_count: 0,
  worker_code: 'WRH-01',
  can_chat: true,
  created_at: '2026-11-01T08:00:00Z',
};

export const DEMO_WAREHOUSE_MEMBER: ProjectMemberRecord = {
  id: 'pm-warehouse-01',
  project_id: 'proj-uluwatu-01',
  user_email: 'david.warehouse@vonta.app',
  role: 'warehouse',
  department: 'all',
  can_chat: true,
};

/**
 * Idempotently migrates a legacy or unversioned database state to Schema Version 9.
 * - Maps legacy author_name / author_role to canonical sender_name / sender_role
 * - Ensures collections (divisions, attendance_records) are initialized
 * - Injects the demo warehouse user into profiles and Uluwatu project members if missing
 */
export function migrateDatabaseState(raw: any): VontaDatabaseState {
  if (!raw || typeof raw !== 'object') {
    return migrateDatabaseState(INITIAL_VONTA_DATABASE);
  }

  const base: VontaDatabaseState = {
    schema_version: CURRENT_SCHEMA_VERSION,
    profiles: Array.isArray(raw.profiles) ? [...raw.profiles] : [...INITIAL_VONTA_DATABASE.profiles],
    projects: Array.isArray(raw.projects) ? [...raw.projects] : [...INITIAL_VONTA_DATABASE.projects],
    project_members: Array.isArray(raw.project_members) ? [...raw.project_members] : [...INITIAL_VONTA_DATABASE.project_members],
    blueprints: Array.isArray(raw.blueprints) ? [...raw.blueprints] : [...INITIAL_VONTA_DATABASE.blueprints],
    pins: Array.isArray(raw.pins)
      ? raw.pins.map((pin: any) => ({
          ...pin,
          pin_comments: Array.isArray(pin.pin_comments)
            ? pin.pin_comments.map((cmt: any) => ({
                ...cmt,
                sender_name: cmt.sender_name || cmt.author_name || 'Team Member',
                sender_role: cmt.sender_role || cmt.author_role || 'worker',
              }))
            : [],
        }))
      : [...INITIAL_VONTA_DATABASE.pins],
    inventory_items: Array.isArray(raw.inventory_items) ? [...raw.inventory_items] : [...INITIAL_VONTA_DATABASE.inventory_items],
    material_allocations: Array.isArray(raw.material_allocations) ? [...raw.material_allocations] : [...INITIAL_VONTA_DATABASE.material_allocations],
    activity_streams: Array.isArray(raw.activity_streams) ? [...raw.activity_streams] : [...INITIAL_VONTA_DATABASE.activity_streams],
    divisions: Array.isArray(raw.divisions) && raw.divisions.length > 0 ? [...raw.divisions] : [...DEFAULT_DIVISIONS],
    attendance_records: Array.isArray(raw.attendance_records) ? [...raw.attendance_records] : [],
  };

  // Add demo warehouse user if not already present
  if (!base.profiles.some((p) => p.email.toLowerCase() === DEMO_WAREHOUSE_PROFILE.email.toLowerCase())) {
    base.profiles.push({ ...DEMO_WAREHOUSE_PROFILE });
  }

  if (
    !base.project_members.some(
      (pm) =>
        pm.project_id === DEMO_WAREHOUSE_MEMBER.project_id &&
        pm.user_email.toLowerCase() === DEMO_WAREHOUSE_MEMBER.user_email.toLowerCase()
    )
  ) {
    base.project_members.push({ ...DEMO_WAREHOUSE_MEMBER });
  }

  return base;
}

export interface InitialLoadResult {
  state: VontaDatabaseState;
  storageWarning: boolean;
}

/**
 * Loads database state on startup following safe migration rules:
 * 1. Checks v9 key first. If present and valid, migrates idempotently.
 * 2. If v9 absent, checks v8 key. If present and valid, migrates and writes to v9, leaving v8 untouched.
 * 3. If parsing fails, backs up corrupt string to BACKUP_CORRUPT_KEY and runs on seed data in memory.
 * 4. If neither exists, seeds and writes to v9.
 */
export function loadInitialDatabase(): InitialLoadResult {
  // Check v9 key first
  const v9Raw = safeGetItem(STORAGE_KEY_V9);
  if (v9Raw) {
    try {
      const parsed = JSON.parse(v9Raw);
      const migrated = migrateDatabaseState(parsed);
      return { state: migrated, storageWarning: false };
    } catch (err) {
      console.error('[VONTA Migration] Failed to parse v9 data; creating backup before fallback:', err);
      safeSetItem(BACKUP_CORRUPT_KEY, v9Raw);
      return { state: migrateDatabaseState(INITIAL_VONTA_DATABASE), storageWarning: false };
    }
  }

  // Check legacy v8 key
  const v8Raw = safeGetItem(STORAGE_KEY_V8);
  if (v8Raw) {
    try {
      const parsed = JSON.parse(v8Raw);
      const migrated = migrateDatabaseState(parsed);
      // Write migrated data to v9 key, leaving v8 untouched
      const writeRes = safeSetItem(STORAGE_KEY_V9, JSON.stringify(migrated));
      return {
        state: migrated,
        storageWarning: !writeRes.success,
      };
    } catch (err) {
      console.error('[VONTA Migration] Failed to parse v8 data; creating backup before fallback:', err);
      safeSetItem(BACKUP_CORRUPT_KEY, v8Raw);
      return { state: migrateDatabaseState(INITIAL_VONTA_DATABASE), storageWarning: false };
    }
  }

  // Fresh seed path
  const seeded = migrateDatabaseState(INITIAL_VONTA_DATABASE);
  const writeRes = safeSetItem(STORAGE_KEY_V9, JSON.stringify(seeded));
  return {
    state: seeded,
    storageWarning: !writeRes.success,
  };
}
