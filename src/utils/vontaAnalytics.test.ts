import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTerminProgress,
  detectDuplicateMaterialClaim,
  calculateWorkerPortfolioMetrics,
  filterPinsForBastScope,
  calculateBastMaterialAuditSummary,
  evaluateRlsPermission,
  createOfflineQueueEntry,
} from './vontaAnalytics';
import { INITIAL_VONTA_DATABASE } from '../data/initialDatabase';

test('calculateTerminProgress calculates green pin ratio and termin unlock state accurately', () => {
  const pins = INITIAL_VONTA_DATABASE.pins;
  const summary50 = calculateTerminProgress(pins, 50);

  assert.equal(summary50.totalPins, pins.length);
  assert.ok(summary50.resolvedPins > 0);
  assert.equal(
    summary50.progressPercent,
    Math.round((summary50.resolvedPins / pins.length) * 100)
  );

  const summary95 = calculateTerminProgress(pins, 95);
  assert.equal(summary95.isTerminUnlocked, false);
  assert.equal(
    summary95.remainingPercentToUnlock,
    95 - summary95.progressPercent
  );
});

test('detectDuplicateMaterialClaim triggers Budget Guard warning when claims exceed revision count', () => {
  const allocations = INITIAL_VONTA_DATABASE.material_allocations;
  const firstAlloc = allocations[0];
  assert.ok(firstAlloc, 'Seed allocations should exist');

  // If revision count is 0 and 1 allocation already exists for this pin + item, a second claim is a duplicate fraud
  const isDuplicateAtRev0 = detectDuplicateMaterialClaim(
    allocations,
    firstAlloc.pin_id,
    firstAlloc.inventory_item_id,
    0
  );
  assert.equal(isDuplicateAtRev0, true);

  // If the pin underwent 3 revisions, a second claim is permitted
  const isDuplicateAtRev3 = detectDuplicateMaterialClaim(
    allocations,
    firstAlloc.pin_id,
    firstAlloc.inventory_item_id,
    3
  );
  assert.equal(isDuplicateAtRev3, false);
});

test('calculateWorkerPortfolioMetrics computes First-Time Right percentage and revision average', () => {
  const pins = INITIAL_VONTA_DATABASE.pins;
  const metrics = calculateWorkerPortfolioMetrics(
    pins,
    'budi.listrik@gmail.com',
    48,
    46
  );

  assert.equal(metrics.totalResolvedCumulative, 48);
  assert.equal(metrics.firstTimeRightCount, 46);
  assert.equal(metrics.firstTimeRightRatioPercent, 96);
  assert.ok(metrics.totalAssignedActive >= 1);
  assert.ok(metrics.totalActiveRevisions >= 0);
});

test('filterPinsForBastScope filters by department and status scope properly', () => {
  const pins = INITIAL_VONTA_DATABASE.pins;
  const allListrik = filterPinsForBastScope(pins, 'listrik', 'all');
  const resolvedListrik = filterPinsForBastScope(
    pins,
    'listrik',
    'resolved_only'
  );
  const issuesListrik = filterPinsForBastScope(pins, 'listrik', 'issues_only');

  assert.equal(
    allListrik.length,
    resolvedListrik.length + issuesListrik.length
  );
  assert.ok(allListrik.every((p) => p.department === 'listrik'));
  assert.ok(resolvedListrik.every((p) => p.status === 'resolved'));
  assert.ok(issuesListrik.every((p) => p.status !== 'resolved'));
});

test('Step 14: calculateBastMaterialAuditSummary aggregates warehouse vs to-buy and budget guard flags', () => {
  const allocations = INITIAL_VONTA_DATABASE.material_allocations;
  const auditAll = calculateBastMaterialAuditSummary(allocations, 'all');

  assert.equal(auditAll.totalAllocations, allocations.length);
  assert.equal(
    auditAll.fromWarehouseCount + auditAll.toBuyCount,
    allocations.length
  );
  assert.ok(auditAll.estimatedTotalValueIdr > 0);
  assert.ok(auditAll.duplicateFlagCount >= 1);
});

test('Step 16: evaluateRlsPermission enforces anti-manipulation rules and createOfflineQueueEntry records outbox', () => {
  assert.equal(
    evaluateRlsPermission('mandor', 'direct_delete_pin').allowed,
    false
  );
  assert.equal(
    evaluateRlsPermission('mandor', 'request_delete_pin').allowed,
    true
  );
  assert.equal(
    evaluateRlsPermission('owner', 'confirm_delete_pin').allowed,
    true
  );
  assert.equal(evaluateRlsPermission('worker', 'create_pin').allowed, false);
  assert.equal(
    evaluateRlsPermission('worker', 'upload_after_proof').allowed,
    true
  );

  const entry = createOfflineQueueEntry({
    actionType: 'UPLOAD_AFTER_PROOF',
    pinCode: '#101',
    actorName: 'Budi Listrik',
    actorRole: 'worker',
    summary: 'Mengunggah foto bukti After di basement tanpa sinyal',
  });
  assert.equal(entry.pinCode, '#101');
  assert.equal(entry.actionType, 'UPLOAD_AFTER_PROOF');
  assert.ok(entry.id.startsWith('off-'));
});
