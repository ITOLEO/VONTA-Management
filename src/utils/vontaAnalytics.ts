import {
  DepartmentOnly,
  GlobalRole,
  MaterialAllocationRecord,
  PinRecord,
  SpecialtyDepartment,
} from '../types/schema';
import { can, Action } from './permissions';

export interface TerminProgressSummary {
  totalPins: number;
  resolvedPins: number;
  inProgressPins: number;
  openPins: number;
  reopenedGhostPins: number;
  progressPercent: number;
  terminTargetPercent: number;
  isTerminUnlocked: boolean;
  remainingPercentToUnlock: number;
}

/**
 * Menghitung metrik Progress-to-Termin Unlocker berdasarkan status titik Pin proyek.
 */
export function calculateTerminProgress(
  pins: PinRecord[],
  terminTargetPercent: number
): TerminProgressSummary {
  const totalPins = pins.length;
  if (totalPins === 0) {
    return {
      totalPins: 0,
      resolvedPins: 0,
      inProgressPins: 0,
      openPins: 0,
      reopenedGhostPins: 0,
      progressPercent: 0,
      terminTargetPercent,
      isTerminUnlocked: false,
      remainingPercentToUnlock: terminTargetPercent,
    };
  }

  const resolvedPins = pins.filter((p) => p.status === 'resolved').length;
  const inProgressPins = pins.filter((p) => p.status === 'in_progress').length;
  const openPins = pins.filter((p) => p.status === 'open').length;
  const reopenedGhostPins = pins.filter((p) => p.status === 'reopened').length;

  const progressPercent = Math.round((resolvedPins / totalPins) * 100);
  const isTerminUnlocked = progressPercent >= terminTargetPercent;
  const remainingPercentToUnlock = Math.max(
    0,
    terminTargetPercent - progressPercent
  );

  return {
    totalPins,
    resolvedPins,
    inProgressPins,
    openPins,
    reopenedGhostPins,
    progressPercent,
    terminTargetPercent,
    isTerminUnlocked,
    remainingPercentToUnlock,
  };
}

/**
 * Deteksi Permintaan Ganda (Pin-Bound Material Budget Guard):
 * Mengembalikan true apabila titik Pin yang sama meminta item gudang yang sama
 * melebihi jumlah siklus revisi (revision_count) titik tersebut.
 */
export function detectDuplicateMaterialClaim(
  existingAllocations: MaterialAllocationRecord[],
  pinId: string,
  inventoryItemId: string | null,
  pinRevisionCount: number
): boolean {
  const samePinAndItemCount = existingAllocations.filter(
    (m) => m.pin_id === pinId && m.inventory_item_id === inventoryItemId
  ).length;
  return samePinAndItemCount > pinRevisionCount;
}

export interface WorkerPortfolioSummary {
  totalAssignedActive: number;
  totalResolvedCumulative: number;
  firstTimeRightCount: number;
  firstTimeRightRatioPercent: number;
  avgRevisionCounter: number;
  totalActiveRevisions: number;
}

/**
 * Menghitung metrik otomatis CV / Portofolio Pekerja (First-Time Right Ratio & Revision Counter).
 */
export function calculateWorkerPortfolioMetrics(
  pins: PinRecord[],
  workerEmail: string,
  historicalResolvedCount: number,
  historicalFirstTimeRightCount: number
): WorkerPortfolioSummary {
  const assignedPins = pins.filter(
    (p) =>
      (p.assigned_worker_email || '').toLowerCase() ===
      workerEmail.toLowerCase()
  );

  const totalRevisionSum = assignedPins.reduce(
    (sum, p) => sum + p.revision_count,
    0
  );
  const avgRevisionCounter =
    assignedPins.length > 0
      ? Number((totalRevisionSum / assignedPins.length).toFixed(1))
      : 0;

  const safeResolved = Math.max(0, historicalResolvedCount);
  const safeFtr = Math.min(
    safeResolved,
    Math.max(0, historicalFirstTimeRightCount)
  );

  const firstTimeRightRatioPercent =
    safeResolved > 0 ? Math.round((safeFtr / safeResolved) * 100) : 100;

  return {
    totalAssignedActive: assignedPins.length,
    totalResolvedCumulative: safeResolved,
    firstTimeRightCount: safeFtr,
    firstTimeRightRatioPercent,
    avgRevisionCounter,
    totalActiveRevisions: totalRevisionSum,
  };
}

export type BastScopeFilter = 'all' | 'resolved_only' | 'issues_only';

/**
 * Menyaring daftar Pin untuk dokumen BAST berdasarkan departemen dan lingkup status.
 */
export function filterPinsForBastScope(
  pins: PinRecord[],
  departmentFilter: SpecialtyDepartment,
  scope: BastScopeFilter
): PinRecord[] {
  const byDept = pins.filter((p) =>
    departmentFilter === 'all' ? true : p.department === departmentFilter
  );

  if (scope === 'resolved_only') {
    return byDept.filter((p) => p.status === 'resolved');
  }
  if (scope === 'issues_only') {
    return byDept.filter((p) => p.status !== 'resolved');
  }
  return byDept;
}

const DEFAULT_DEPT_UNIT_PRICE: Record<DepartmentOnly, number> = {
  listrik: 185000,
  pipa: 145000,
  sipil: 95000,
  cat: 265000,
};

export interface BastMaterialAuditSummary {
  totalAllocations: number;
  fromWarehouseCount: number;
  toBuyCount: number;
  duplicateFlagCount: number;
  estimatedTotalValueIdr: number;
  estimatedToBuyValueIdr: number;
}

/**
 * Step 14: Menghitung ringkasan finansial & audit material pada dokumen BAST.
 */
export function calculateBastMaterialAuditSummary(
  allocations: MaterialAllocationRecord[],
  departmentFilter: SpecialtyDepartment = 'all'
): BastMaterialAuditSummary {
  const filtered = allocations.filter((m) =>
    departmentFilter === 'all' ? true : m.department === departmentFilter
  );

  let fromWarehouseCount = 0;
  let toBuyCount = 0;
  let duplicateFlagCount = 0;
  let estimatedTotalValueIdr = 0;
  let estimatedToBuyValueIdr = 0;

  for (const item of filtered) {
    const unitPrice = DEFAULT_DEPT_UNIT_PRICE[item.department] || 150000;
    const lineValue = item.qty_requested * unitPrice;
    estimatedTotalValueIdr += lineValue;

    if (item.allocation_status === 'allocated_from_stock') {
      fromWarehouseCount += 1;
    } else {
      toBuyCount += 1;
      estimatedToBuyValueIdr += lineValue;
    }

    if (item.is_duplicate_warning) {
      duplicateFlagCount += 1;
    }
  }

  return {
    totalAllocations: filtered.length,
    fromWarehouseCount,
    toBuyCount,
    duplicateFlagCount,
    estimatedTotalValueIdr,
    estimatedToBuyValueIdr,
  };
}

export type RlsOperation =
  | 'create_pin'
  | 'upload_after_proof'
  | 'approve_reject_pin'
  | 'reopen_ghost_pin'
  | 'request_delete_pin'
  | 'direct_delete_pin'
  | 'confirm_delete_pin'
  | 'edit_termin_target';

const RLS_OPERATION_MAP: Record<RlsOperation, Action> = {
  create_pin: 'create_task',
  upload_after_proof: 'upload_after_proof',
  approve_reject_pin: 'approve_task',
  reopen_ghost_pin: 'reopen_task',
  request_delete_pin: 'request_delete_task',
  direct_delete_pin: 'delete_task',
  confirm_delete_pin: 'delete_task',
  edit_termin_target: 'edit_termin_target',
};

/**
 * Step 16: Evaluasi kebijakan keamanan Row Level Security (RLS) per peran pengguna sesuai PRD.
 * Thin wrapper delegating to the centralized can() permission service.
 */
export function evaluateRlsPermission(
  role: GlobalRole,
  operation: RlsOperation
): { allowed: boolean; reason: string } {
  const action = RLS_OPERATION_MAP[operation];
  const allowed = can(role, action);
  return {
    allowed,
    reason: allowed
      ? `Allowed: ${role} has permission for ${operation}.`
      : `Denied: ${role} does not have permission for ${operation}.`,
  };
}

export interface OfflineQueueEntry {
  id: string;
  actionType:
    | 'CREATE_PIN'
    | 'REPOSITION_PIN'
    | 'UPLOAD_AFTER_PROOF'
    | 'APPROVE_PIN'
    | 'REJECT_PIN'
    | 'REOPEN_GHOST_PIN'
    | 'DELETE_AUDIT'
    | 'MATERIAL_CLAIM'
    | 'CHAT_STREAM';
  pinCode: string;
  actorName: string;
  actorRole: GlobalRole;
  summary: string;
  createdAt: string;
}

/**
 * Step 16: Membuat entri log transaksi lokal saat Mode Offline Lapangan aktif.
 */
export function createOfflineQueueEntry(params: {
  actionType: OfflineQueueEntry['actionType'];
  pinCode: string;
  actorName: string;
  actorRole: GlobalRole;
  summary: string;
}): OfflineQueueEntry {
  return {
    id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actionType: params.actionType,
    pinCode: params.pinCode,
    actorName: params.actorName,
    actorRole: params.actorRole,
    summary: params.summary,
    createdAt: new Date().toISOString(),
  };
}
