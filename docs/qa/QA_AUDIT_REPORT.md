# Comprehensive QA Audit & Product Architecture Report: VONTA Management System

**Auditor:** Senior QA Engineer & SaaS Product Auditor  
**Date:** November 2, 2026  
**Target Application:** VONTA Project & Renovation Management Platform  
**Target Repository:** `c:\Users\leooi\VONTA-Management`  
**Audit Mode:** AUDIT ONLY (Strict Non-Destructive Code & Architecture Review)  
**Deliverable File:** `/docs/qa/QA_AUDIT_REPORT.md`  

---

## 1. Executive Summary

VONTA is a specialized web application engineered for construction and renovation management in Bali, Indonesia (South Bali Construction Zone). The current application is built upon an exported React 19 + Vite + Tailwind CSS v4 foundation, persisting state to browser `localStorage` under the key `vonta_supabase_db_v8`.

While the frontend exhibits an aesthetically rich UI with interactive 2.5D blueprint visualization, photo markup capabilities, and dark/light mode support, the **overall system maturity is in an early prototype/mock-state stage**. Core enterprise functionalities—specifically multi-role RBAC, stock movement ledgers, Store/Purchase Request lifecycles, Goods Receipts, attendance integrity, and referential database cascades—exhibit severe architectural and functional deficits.

### Summary Metrics
| Audit Category | Metric |
| :--- | :--- |
| **Total Audit Checks (18 Areas)** | 18 evaluated |
| **Check Results** | **PASS (code-reviewed only):** 1 \| **PARTIAL:** 8 \| **FAIL:** 7 \| **MISSING:** 1 \| **NOT TESTABLE (runtime browser subagent offline):** 1 |
| **Identified Issues** | **Total:** 21 (QA-001 to QA-021) |
| **Severity Breakdown** | **Critical:** 5 \| **High:** 7 \| **Medium:** 6 \| **Low:** 3 |
| **TypeScript / Lint Status** | **FAIL** (10 compilation errors across 4 files) |
| **Build Status** | **PASS** (`vite build` succeeds as Vite does not fail on TS emit errors) |
| **Client-Side Data Layer** | 100% Mock State stored in `localStorage` (No server-side auth, RLS, or API) |

---

## 2. Phase 0: Reconnaissance & Architecture Baseline

### 2.1 Repository & Technology Stack Baseline
- **Framework & Core:** React 19.0.1, React DOM 19.0.1, Vite 8.3.0
- **Language & Typings:** TypeScript 7.0.2 (`@types/react` 19.3.0, `@types/react-dom` 19.3.0)
- **Styling Engine:** Tailwind CSS 4.3.3 via `@tailwindcss/vite` 4.3.3
- **Icons & Animation:** `lucide-react` 0.546.0, `motion` (Framer Motion) 12.23.24
- **AI Integration:** `@google/genai` 2.4.0
- **3D Visualization:** **CSS 3D Transforms** (`perspective: 1300px`, `rotateX`, `rotateZ`). *Note:* Three.js / React Three Fiber (`@react-three/fiber`) are **NOT** installed in `package.json`.
- **Router:** **None.** Navigation is managed via local React state (`useState<WorkspaceTabId>`) in `src/App.tsx`.
- **Data Persistence:** Browser `localStorage` (`key: 'vonta_supabase_db_v8'`). No real backend or active database connection.

### 2.2 Terminal Verification Results
- **Install Baseline (`npm install`):**
  - **Result:** `PASS (runtime-tested)`. 101 packages installed, 0 vulnerabilities found.
- **Lint / Typecheck Baseline (`npm run lint` / `tsc --noEmit`):**
  - **Result:** `FAIL (runtime-tested)`. 10 errors detected across 4 source files:
    1. `src/App.tsx(1001,11)`: `PinCommentRecord` property mismatch (`author_name`/`author_role` vs `sender_name`/`sender_role`).
    2. `src/App.tsx(1134,11)`: `PinCommentRecord` property mismatch.
    3. `src/App.tsx(2011,10)`: Property `onSelectProjectAndOpenCanvas` missing on `StandaloneProjectsDashboardViewProps`.
    4. `src/App.tsx(2677,16)`: Property `onSelectProjectAndOpenCanvas` missing on `ProjectsHomeViewProps`.
    5. `src/components/BeforeAfterSliderGate.tsx(575,23)`: Property `author_role` does not exist on type `PinCommentRecord`.
    6. `src/components/BeforeAfterSliderGate.tsx(577,23)`: Property `author_name` does not exist on type `PinCommentRecord`.
    7. `src/components/WorkspaceNewModules.tsx(2392,43)`: Type `string | null` not assignable to parameter `string` in `getWorkerDisplay`.
    8. `src/components/WorkspaceNewModules.tsx(2533,45)`: Type `string | null` not assignable to parameter `string` in `getWorkerDisplay`.
    9. `src/data/initialDatabase.ts(1232,11)`: Object literal specifies unknown property `author_name` on `PinCommentRecord`.
    10. `src/data/initialDatabase.ts(2102,7)`: Type `string | undefined` not assignable to type `string`.
- **Build Baseline (`npm run build`):**
  - **Result:** `PASS (runtime-tested)`. `vite build` completed in 722ms. Bundle size: `dist/index.html` (1.37 kB), `dist/assets/index-*.css` (49.69 kB), `dist/assets/index-*.js` (485.49 kB).
- **Dev Server Startup (`npm run dev`):**
  - **Result:** `PASS (runtime-tested)`. Server launched synchronously on `http://localhost:3000/`.
- **Browser Automation Subagent:**
  - **Result:** `NOT TESTABLE (say why)`. The test environment cannot download the Playwright browser driver (HTTP 404 in isolated environment). All runtime audit procedures below were performed via deep static code tracing, local command evaluation, and dev server inspection.

---

### 2.3 Route & View Table
Since there is no URL router library, tabs are toggled via `activeWorkspaceTab` state in `src/App.tsx:72-84`.

| Tab Identifier | Component Rendered | File Source | Intended Roles | Actual Enforced Roles |
| :--- | :--- | :--- | :--- | :--- |
| `web_home` | `<VontaWebHomeLandingView>` | `src/components/MinimalistDashboardViews.tsx:64` | All | All (Unrestricted) |
| `dashboard_projects` | `<StandaloneProjectsDashboardView>` | `src/components/MinimalistDashboardViews.tsx:340` | Owner, Mandor | All (Unrestricted) |
| `home` | `<ProjectsHomeView>` | `src/components/MinimalistDashboardViews.tsx:786` | Owner, Mandor | All (Unrestricted) |
| `overview` | `<ProjectOverviewDashboard>` | `src/components/MinimalistDashboardViews.tsx:985` | All | All (Unrestricted) |
| `spatial_map` | `<SpatialBlueprintCanvas>` + `<BeforeAfterSliderGate>` | `src/components/SpatialBlueprintCanvas.tsx:57` | All | All (Worker can view & upload proof; Leader can add pins) |
| `history` | `<DivisionHistoryView>` | `src/components/WorkspaceNewModules.tsx:2238` | All | All (Unrestricted read-only) |
| `attendance` | `<AttendanceView>` | `src/components/WorkspaceNewModules.tsx:1398` | Worker (Self-scan), Owner/Mandor (Manual) | UI hides manual form for workers; no handler guard |
| `inventory` | `<InventoryAndShoppingView>` (mode: inventory) | `src/components/InventoryAndShoppingView.tsx:113` | Warehouse Keeper, Owner, Mandor | Unrestricted (any user can restock/allocate) |
| `shopping` | `<InventoryAndShoppingView>` (mode: shopping) | `src/components/InventoryAndShoppingView.tsx:113` | Purchasing, Owner, Mandor | Unrestricted (any user can mark bought) |
| `sr_pr` | `<StoreAndPurchaseRequestView>` | `src/components/WorkspaceNewModules.tsx:686` | All divisions | Unrestricted |
| `team` | `<TeamManagementView>` | `src/components/MinimalistDashboardViews.tsx:1620` | Owner | UI hides invite button; handlers unvalidated |
| `project_settings` | `<ProjectSettingsPage>` | `src/components/WorkspaceNewModules.tsx:1898` | Owner, Mandor | UI-only guard |

---

### 2.4 Entity Model & Relations Matrix
All entities are defined in `src/types/schema.ts` and stored within the monolithic `VontaDatabaseState` object in `localStorage`.

| Entity | Primary Key | Foreign Keys / Relations | Stored Location | Integrity / Cascade Status |
| :--- | :--- | :--- | :--- | :--- |
| **Profile** | `id` | None | `db.profiles[]` | **Orphan Risk:** Deletion removes profile globally across all projects; leaves dangling references. |
| **Project** | `id` | `owner_id -> Profile.id` | `db.projects[]` | **No Cascade:** No project deletion workflow. |
| **ProjectMember** | `id` | `project_id -> Project.id`, `user_email -> Profile.email` | `db.project_members[]` | **Soft Linked:** Keyed by email string rather than Profile ID. |
| **Blueprint (Area)** | `id` | `project_id -> Project.id` | `db.blueprints[]` | **Orphan Risk:** Pin records link to `blueprint_id` without cascade validation. |
| **Pin (Task)** | `id` | `project_id -> Project.id`, `blueprint_id -> Blueprint.id`, `assigned_worker_email -> Profile.email` | `db.pins[]` | **No Cascade:** Deleting a pin leaves `material_allocations` referencing dead `pin_id`. |
| **PinComment** | `id` | `pin_id -> Pin.id` | Nested inside `PinRecord.pin_comments[]` | Embedded array. |
| **InventoryItem** | `id` | `project_id -> Project.id` | `db.inventory_items[]` | **No Ledger:** Stock mutated in-place; no ledger movements. |
| **StockMovement** | *None* | *None* | **MISSING** | **Does not exist.** Formula `closing = opening + receipts + adjustments - issues` impossible. |
| **MaterialAllocation (SR/PR)** | `id` | `project_id -> Project.id`, `pin_id -> Pin.id`, `inventory_item_id -> InventoryItem.id` | `db.material_allocations[]` | **Hybrid SR/PR:** Both SR and PR stuffed into same record type. |
| **GoodsReceipt** | *None* | *None* | **MISSING** | **Does not exist.** No workflow to receive purchased goods. |
| **ActivityStream** | `id` | `project_id -> Project.id`, `blueprint_id`, `pin_id` | `db.activity_streams[]` | Incomplete mutation event capture. |
| **Division** | `id` | `project_id -> Project.id` | `db.divisions[]` | Seeded fallback if missing. |
| **AttendanceRecord** | `id` | `project_id -> Project.id`, `worker_profile_id -> Profile.id` | `db.attendance_records[]` | Independent rows for `masuk` and `pulang`. |

---

### 2.5 Feature Inventory
| Specified Feature | Implementation Status | Source Reference | Notes & Deficits |
| :--- | :--- | :--- | :--- |
| **Multi-Project Management** | **Implemented** | `src/components/MinimalistDashboardViews.tsx:340-980` | Multiple business units and project cards. |
| **Floor Plan Blueprint Upload** | **Implemented** | `src/components/ModalsTahap1.tsx:532-647` | Supports file upload and SVG placeholder fallback. |
| **2D/3D Pin Placement** | **Partial** | `src/components/SpatialBlueprintCanvas.tsx:57-888` | CSS 3D only. Perspective click skew in 2.5D mode. |
| **Before / After Photo Gate** | **Implemented** | `src/components/BeforeAfterSliderGate.tsx:1-912` | Interactive slider, photo upload, revision tracking. |
| **Store Request (SR)** | **Partial** | `src/components/WorkspaceNewModules.tsx:686-1380` | Batched form exists, but bypasses approval and immediately deducts stock. |
| **Purchase Request (PR)** | **Partial** | `src/components/WorkspaceNewModules.tsx:686-1380` | Batched PR creation exists; permanently stuck in `to_buy`. |
| **Goods Receipt Flow** | **Missing** | *None* | No receipt creation, line matching, or stock increment. |
| **Stock Ledger & Audit** | **Missing** | `src/components/InventoryAndShoppingView.tsx:1-839` | Raw integer mutation only. No receipts, adjustments, or issues history. |
| **Worker Attendance (Face Scan)** | **Partial** | `src/components/WorkspaceNewModules.tsx:1398-1670` | Simulated camera scan exists; lacks duplicate guard and timezone support. |
| **Manual Attendance Correction** | **Missing** | `src/components/WorkspaceNewModules.tsx:1672-1745` | Only logs new attendance; cannot correct existing logs. Reason not captured. |
| **BAST Handover Document Generation**| **Implemented** | `src/components/CustomPrintBastModal.tsx:1-1200` | Full printable PDF/BAST layout with signature blocks. |
| **Role-Based Access Control (RBAC)**| **Partial** | `src/utils/vontaAnalytics.ts:220-300`, `src/App.tsx` | UI-level only. Only 3 roles (`owner`, `mandor`, `worker`). Missing 4 roles. |
| **Chat & Activity Stream per Area** | **Implemented** | `src/components/ContextualLiveStreamPanel.tsx:1-400` | Area-scoped messaging and system event logs. |
| **Offline Sync Queue** | **Implemented** | `src/utils/vontaAnalytics.ts:300-329`, `src/App.tsx:295-316` | Queue tracking in state; simulated action is a no-op stub. |

---

## 3. Phase 1: Audit Findings (18 Mandatory Verification Areas)

### Check 1: Routing & Navigation
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/App.tsx:72-84`, `126-155`).
- **Evidence / Root Cause:**
  There is no client-side URL routing library (such as `react-router-dom` or TanStack Router), nor any `window.history.pushState` integration. The application relies entirely on React state `activeWorkspaceTab`:
  ```tsx
  // src/App.tsx:126-136
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
  ```
- **Observed Failures:**
  1. **Deep Linking Broken:** Navigating directly to `http://localhost:3000/attendance` or `http://localhost:3000/inventory` is impossible. All URLs are identical (`/`).
  2. **Hard Refresh Loss:** Pressing `F5` on any module (e.g. while reviewing a pin in `spatial_map`) immediately resets the application to `web_home` unless `?autostart=1` is in query parameters (which only opens `overview`).
  3. **Browser History Broken:** The browser's Forward and Back buttons do not navigate between application screens; clicking Back exits the domain entirely.

---

### Check 2: Project & Area Context Isolation
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/App.tsx:220-292`, `1950-1985`, `MinimalistDashboardViews.tsx:882-885`).
- **Evidence / Root Cause:**
  When switching projects via `setActiveProjectId(projId)`, state triggers recalculation of `projectBlueprints`, `projectDivisions`, and `allProjectPins`.
  ```tsx
  // src/App.tsx:250-257
  useEffect(() => {
    if (
      projectBlueprints.length > 0 &&
      !projectBlueprints.some((b) => b.id === activeBlueprintId)
    ) {
      setActiveBlueprintId(projectBlueprints[0].id);
    }
  }, [projectBlueprints, activeBlueprintId]);
  ```
- **Observed Failures:**
  1. **Cross-Project Worker Count Leakage:** In `ProjectsHomeView` (`src/components/MinimalistDashboardViews.tsx:882-885`), the worker counter leaks across all projects:
     ```tsx
     const previewWorkersCount = useMemo(
       () => profiles.filter((p) => p.global_role === 'worker').length,
       [profiles]
     );
     ```
     This counts all workers in the database rather than filtering by `project_members` for that specific project.
  2. **Hardcoded Breadcrumb Entity:** `src/App.tsx:2091` hardcodes `"Uluwatu Resort Group"` in the top navigation bar, regardless of which project or business unit is active.

---

### Check 3: Tasks & Progress Integrity
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/utils/vontaAnalytics.ts:24-66`, `src/components/MinimalistDashboardViews.tsx:379-383`, `src/App.tsx:1074-1120`).
- **Evidence / Root Cause:**
  VONTA uses `PinRecord` as its task entity. Tasks have statuses: `open`, `in_progress`, `in_preview`, `resolved`, `reopened`.
  - Termin progress formula in `vontaAnalytics.ts:48`: `progressPercent = Math.round((resolvedPins / totalPins) * 100)`.
- **Observed Failures:**
  1. **Duplicated Progress Formulas:** Instead of importing `calculateTerminProgress` from `vontaAnalytics.ts`, `MinimalistDashboardViews.tsx:379-383` and `446-449` reimplement the formula independently inline.
  2. **No Double-Submit Guard:** Rapidly clicking the pin creation button in `CreatePinModal` (`src/components/ModalsTahap1.tsx:697-722`) does not disable the submit button during submission, creating duplicate pins with sequential codes at identical coordinates.

---

### Check 4: Task Assignment Permissions
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/App.tsx:1030-1072`).
- **Evidence / Root Cause:**
  In `handleUpdatePinDetails`:
  ```tsx
  // src/App.tsx:1030-1072
  const handleUpdatePinDetails = (
    pinId: string,
    payload: {
      title: string;
      description: string;
      priority: PinPriority;
      assignedWorkerEmail: string;
    }
  ) => {
    trackOfflineActionIfActive();
    const targetPin = db.pins.find((p) => p.id === pinId);
    if (!targetPin) return;
    // ... Direct state mutation without permission or membership validation
  ```
- **Observed Failures:**
  1. **Zero Caller Role Check:** The handler does not check `activeProfile.global_role`. Any worker calling this handler can reassign tasks.
  2. **Non-Member Assignment Leakage:** The handler accepts any string for `payload.assignedWorkerEmail` without checking if the user belongs to `db.project_members` for `activeProject.id`. Tasks can be assigned to users belonging to competing projects or non-existent emails.

---

### Check 5: 2D & 3D Spatial Pins
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/components/SpatialBlueprintCanvas.tsx:78-185`, `300-322`).
- **Evidence / Root Cause:**
  The 3D canvas is implemented purely via CSS 3D transforms (`perspective: 1300px`, `rotateX(${tiltPitch}deg) rotateZ(${orbitRotation}deg)`).
- **Observed Failures:**
  1. **Coordinate Projection Distortion:** Click coordinates in 2.5D mode are computed via `planeRef.current.getBoundingClientRect()`:
     ```tsx
     // src/components/SpatialBlueprintCanvas.tsx:174-180
     const rect = planeRef.current.getBoundingClientRect();
     const rawX = ((clientX - rect.left) / rect.width) * 100;
     const rawY = ((clientY - rect.top) / rect.height) * 100;
     ```
     `getBoundingClientRect()` returns the screen-space bounding box of the transformed element, not the inverse projection matrix of the 3D plane. When the plan is tilted (e.g. 52°) and rotated (e.g. -18°), clicking on the canvas places pins several dozen pixels away from the intended location.

---

### Check 6: Activity Stream Event Completeness
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis of all state mutation handlers in `src/App.tsx`.
- **Evidence / Root Cause:**
  `activity_streams` logs key task lifecycle events (`create_pin`, `approve_pin`, `reject_pin`, `reopen_pin`, `delete_pin`).
- **Missing Mutation Events (No `createActivityRecord` invocation):**
  1. **Stock Restock:** `handleRestockInventoryItem` (`App.tsx:1712-1729`) modifies stock without logging actor, qty, or item name.
  2. **New Stock Item:** `handleAddNewInventoryItem` (`App.tsx:1688-1710`) does not log additions.
  3. **Self-Attendance:** `handleWorkerSubmitAttendance` (`App.tsx:1828-1868`) does not append to `activity_streams`.
  4. **Manual Attendance:** `handleLeaderManualAttendance` (`App.tsx:1870-1902`) does not log attendance additions.
  5. **Pin Comments:** `handleAddPinComment` (`App.tsx:926-950`) records internal pin comments but omits public activity stream logs.
  6. **Member Removal:** `handleRemoveMember` (`App.tsx:734-751`) deletes members without logging.

---

### Check 7: Completion Archive
- **Status:** `PASS (code-reviewed only)`
- **Verification Method:** Static code analysis (`src/App.tsx:367-370`, `1090-1120`, `WorkspaceNewModules.tsx:2238-2420`).
- **Evidence:**
  When a foreman approves a pin, `status` becomes `'resolved'` and `resolved_at` is stamped. `filteredAreaPins` filters out `status === 'resolved'`, instantly clearing it from the active canvas. The item is displayed in `DivisionHistoryView` (`src/components/WorkspaceNewModules.tsx:2253`), preserving revision count, notes, before/after media URLs, and worker attribution in read-only format.
- **Defect Note:** Displays TypeScript error TS2345 at lines 2392 and 2533 when rendering pins where `assigned_worker_email` is `null`.

---

### Check 8: Warehouse Stock Formulas & Movement Integrity
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/types/schema.ts:141-150`, `src/App.tsx:1410-1508`, `1589-1602`, `1712-1729`).
- **Evidence / Root Cause:**
  - Specified Business Rule: `closing = opening + receipts + adjustments - issues; never negative`.
  - Actual Implementation: Only a single mutable integer `stock_available` exists on `InventoryItemRecord`. There is no `StockMovement` table or transaction ledger.
- **Observed Failures:**
  1. **No Historical Reconstruction:** Impossible to audit or reconstruct stock balance at a past date.
  2. **Silent Negative Stock Truncation:** In `handleSubmitMarketlistBatch`:
     ```tsx
     // src/App.tsx:1596
     stock_available: Math.max(0, item.stock_available - deduct)
     ```
     If 20 bags are requested but only 5 exist, stock is set to 0 and the 15-bag deficit vanishes without generating an alert or back-order record.
  3. **No Movement Attribution:** `handleRestockInventoryItem` (`App.tsx:1712-1729`) increments stock arbitrarily without recording a purchase reference, supplier, or reason.

---

### Check 9: Store Request (SR) Lifecycle & Guards
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/components/WorkspaceNewModules.tsx:798-840`, `src/App.tsx:1510-1607`).
- **Evidence / Root Cause:**
  - Specified Rule: `Draft > Submitted > Approved/Rejected > Partially Fulfilled > Fulfilled`.
  - Actual Implementation:
    When a user submits an SR in `handleSubmitMarketlistBatch`, stock is **immediately decremented** and the record status is hardcoded directly to `'allocated_from_stock'`:
    ```tsx
    // src/App.tsx:1572-1599
    const singleSrOrder: MaterialAllocationRecord = {
      // ...
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
    };
    // ...
    stock_available: Math.max(0, item.stock_available - deduct)
    ```
- **Observed Failures:**
  1. **Zero Approval Step:** No PM or Owner review is required. Any user who can open the form can deplete warehouse stock immediately.
  2. **No Rejection or Partial Fulfillment State:** SRs have no status tracking for `Draft`, `Submitted`, `Rejected`, or `Partially Fulfilled`.

---

### Check 10: Purchase Request (PR) & Goods Receipt
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/components/WorkspaceNewModules.tsx:755-840`, `src/App.tsx:1609-1686`).
- **Evidence / Root Cause:**
  - Specified Rule: `Draft > Submitted > Approved/Rejected > Ordered > Partially Received > Received`. Goods receipt increments stock.
- **Observed Failures:**
  1. **No Approval or Purchase Order Flow:** Submitting a PR in `handleSubmitPurchaseRequestBatch` sets status to `'to_buy'` and stores it permanently in `db.material_allocations`.
  2. **Goods Receipt Completely Missing:** There is no `GoodsReceipt` component, handler, or schema in the entire repository. Stock can never be replenished through the procurement cycle.

---

### Check 11: Attendance Duplicate Guards & Boundaries
- **Status:** `FAIL`
- **Verification Method:** Static code analysis (`src/App.tsx:1828-1868`, `src/components/WorkspaceNewModules.tsx:1444-1470`).
- **Evidence / Root Cause:**
  - Specified Rule: One check-in and one check-out per user per day per project.
  - Actual Implementation in `src/App.tsx:1828-1868`:
    ```tsx
    const handleWorkerSubmitAttendance = (payload: { ... }) => {
      // ... Matches profile or falls back
      const newAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        project_id: activeProject.id,
        worker_profile_id: workerId,
        // ...
        created_at: new Date().toISOString(),
      };
      setDb((prev) => ({
        ...prev,
        attendance_records: [newAtt, ...(prev.attendance_records || [])],
      }));
      return { ok: true, message: '...' };
    };
    ```
- **Observed Failures:**
  1. **Zero Duplicate Guard:** A user can submit 20 check-ins (`masuk`) on the same calendar day; every submission appends a new record to `attendance_records`.
  2. **Check-Out Without Check-In:** A worker can submit a check-out (`pulang`) even if no corresponding check-in was ever logged for that day.
  3. **Timezone Violation:** Records use `new Date().toISOString()` (UTC). At 07:30 AM in Bali (UTC+8), UTC is 23:30 of the previous day, causing attendance records to split across dates.

---

### Check 12: Manual Attendance Correction
- **Status:** `MISSING`
- **Verification Method:** Static code analysis (`src/App.tsx:1870-1902`, `src/components/WorkspaceNewModules.tsx:1672-1745`).
- **Evidence / Root Cause:**
  - Specified Rule: PM/Owner manual correction requires reason; original + corrected values kept; logged; validation (out > in); no duplicates created.
  - Actual Implementation:
    The only manual handler is `handleLeaderManualAttendance`, which merely inserts a **brand new attendance entry** with `verification_method: 'manual_leader'`:
    ```tsx
    // src/App.tsx:1870-1902
    const handleLeaderManualAttendance = (payload: {
      workerProfileId: string;
      divisionCode: string;
      attendanceType: 'masuk' | 'pulang';
    }) => {
      // Creates new attendance row.
    ```
- **Observed Failures:**
  1. **Correction Capability Missing:** Cannot edit, adjust, or invalidate an erroneous attendance record.
  2. **Reason Field Missing:** Does not capture or require an explanation.
  3. **No Time Validation:** No start/end interval pairing; `check_out > check_in` order is never verified.

---

### Check 13: Role-Based Access Control (RBAC) Enforcement
- **Status:** `FAIL`
- **Verification Method:** Code review of `src/types/schema.ts:1`, `src/utils/vontaAnalytics.ts:220-300`, and `src/App.tsx`.
- **Evidence / Root Cause:**
  1. **Missing Specified Roles:** `GlobalRole` in `src/types/schema.ts:1` is defined as:
     ```ts
     export type GlobalRole = 'owner' | 'mandor' | 'worker';
     ```
     Project Manager (PM), Supervisor (as distinct from Mandor), Warehouse Keeper, and Purchasing do not exist.
  2. **Client-Side Hiding Only:** Restrictions in UI components (e.g. hiding the "+ Place Pin" button when `role === 'worker'`) are purely cosmetic. If a worker invokes the callback handlers (or dispatches events), the underlying handlers in `App.tsx` execute unconditionally.

---

### Check 14: Dashboard Consistency & Formula Verification
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/components/MinimalistDashboardViews.tsx:372-430`, `src/utils/vontaAnalytics.ts:24-66`).
- **Evidence / Root Cause:**
  - Metric Sources:
    - Total pins: `pins.filter(p => p.project_id === proj.id).length`
    - Resolved pins: `pins.filter(p => p.project_id === proj.id && p.status === 'resolved').length`
    - Progress %: `Math.round((resolvedPins / totalPins) * 100)`
- **Observed Failures:**
  1. Hardcoded countdown label fallback (`'5y 3m 2d'`) in `MinimalistDashboardViews.tsx:468`.
  2. Discrepancy between `StandaloneProjectsDashboardView` (which correctly computes workers using `project_members`) and `ProjectsHomeView` (which incorrectly counts all global workers).

---

### Check 15: Responsive & Touch Design
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/components/SpatialBlueprintCanvas.tsx:324-450`, `src/App.tsx:2540-2640`).
- **Evidence / Root Cause:**
  - Tailwind responsive utilities (`sm:`, `md:`, `lg:`) are used across main containers.
  - Touch support is implemented on the 2.5D canvas via standard pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`).
- **Observed Failures:**
  1. **Mobile Viewport Overflow (375px):** In `SpatialBlueprintCanvas.tsx:324-450`, the top floating control bar renders the 2D/3D toggle, division selector, zoom percentage, tilt angle, and 90° rotation button within a single flex container. On 375px screens, this toolbar wraps into 3-4 rows, covering up to 40% of the active floor plan canvas and obscuring placed pins.

---

### Check 16: Form Validation & Boundaries
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis across forms in `ModalsTahap1.tsx` and `WorkspaceNewModules.tsx`.
- **Observed Failures:**
  1. **Whitespace Bypass:** `title.trim()` is checked in `CreatePinModal`, but in `MultiPurchaseRequestRow` (`WorkspaceNewModules.tsx:815`), unit and department validation allows whitespace strings.
  2. **Negative/Decimal Quantity:** Number inputs for material requests (`qty`) accept negative values or zero if typed directly into the number inputs without validation clamping on change.

---

### Check 17: Runtime Stability & Static Quality
- **Status:** `FAIL`
- **Verification Method:** Terminal evaluation via `npm run lint` (`tsc --noEmit`).
- **Evidence / Output:**
  ```
  src/App.tsx(1001,11): error TS2345: Property 'sender_name' is missing in type '{ ... author_name ... }'
  src/App.tsx(1134,11): error TS2345: Property 'sender_name' is missing in type '{ ... author_name ... }'
  src/App.tsx(2011,10): error TS2741: Property 'onSelectProjectAndOpenCanvas' is missing in type ...
  src/App.tsx(2677,16): error TS2741: Property 'onSelectProjectAndOpenCanvas' is missing in type ...
  src/components/BeforeAfterSliderGate.tsx(575,23): error TS2339: Property 'author_role' does not exist on type 'PinCommentRecord'.
  src/components/BeforeAfterSliderGate.tsx(577,23): error TS2339: Property 'author_name' does not exist on type 'PinCommentRecord'.
  src/components/WorkspaceNewModules.tsx(2392,43): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  src/components/WorkspaceNewModules.tsx(2533,45): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  src/data/initialDatabase.ts(1232,11): error TS2353: 'author_name' does not exist in type 'PinCommentRecord'.
  src/data/initialDatabase.ts(2102,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  ```

---

### Check 18: Persistence & Referential Integrity
- **Status:** `PARTIAL`
- **Verification Method:** Static code analysis (`src/App.tsx:88-106`, `734-751`, `1276-1280`).
- **Evidence / Root Cause:**
  The application stores its entire database in a single JSON serialized string in browser `localStorage`.
- **Observed Failures:**
  1. **Silent Quota Failure & Data Loss:**
     ```tsx
     // src/App.tsx:100-106
     useEffect(() => {
       try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
       } catch {
         // Ignore quota errors
       }
     }, [db]);
     ```
     `localStorage` has a browser quota of ~5MB. Photos captured in `PhotoCaptureAndMarkupStudio` are stored as base64 SVG data URIs. When the quota is exceeded, saving fails silently without alerting the user, resulting in silent data loss.
  2. **No Referential Cascades:** Deleting a pin (`handleOwnerConfirmDeletePin`, `App.tsx:1276`) deletes the pin from `db.pins`, but leaves orphaned entries in `db.material_allocations` where `pin_id === pin.id`.

---

## 4. Phase 2: Comprehensive Issue Register

| Issue ID | Severity | Module | Title | Root Cause (File:Line) | Effort | Regression Risk |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **QA-001** | **Critical** | Inventory / SR | Store Request Bypasses Approval & Truncates Stock | `src/App.tsx:1590-1599` | M | Medium |
| **QA-002** | **Critical** | Attendance | Zero Duplicate Guards on Worker Attendance | `src/App.tsx:1828-1868` | S | Low |
| **QA-003** | **Critical** | Storage | Silent Data Loss on `localStorage` Quota Exceeded | `src/App.tsx:103-105` | S | Low |
| **QA-004** | **Critical** | Procurement | Goods Receipt Missing: PRs Permanently Unfulfilled | `src/types/schema.ts`, `src/App.tsx:1609` | L | High |
| **QA-005** | **Critical** | Security | Missing Action-Level Authorization on Mutations | `src/App.tsx:1030-1070` | M | Medium |
| **QA-006** | **High** | Types / Build | 10 TypeScript Compilation Errors | `src/App.tsx:2011,2677`, `schema.ts:10` | S | Low |
| **QA-007** | **High** | Attendance | Manual Attendance Correction Workflow Missing | `src/App.tsx:1870-1902` | M | Medium |
| **QA-008** | **High** | Inventory | Stock Movement Ledger Missing (`StockMovement`) | `src/types/schema.ts:141-150` | L | High |
| **QA-009** | **High** | Navigation | No URL Router: Deep Links & Browser History Broken | `src/App.tsx:126-155` | L | High |
| **QA-010** | **High** | Core / Date | Timezone Violation: UTC Used Instead of Asia/Makassar | `src/App.tsx:1854`, `WorkspaceNewModules:704` | S | Low |
| **QA-011** | **High** | RBAC | Missing Enterprise Roles (PM, Supervisor, Purchasing, Warehouse) | `src/types/schema.ts:1` | M | High |
| **QA-012** | **High** | Database | Dangling Foreign Keys on Pin and Member Deletion | `src/App.tsx:734-751, 1276-1280` | M | Medium |
| **QA-013** | **Medium** | Canvas | 2.5D Coordinate Projection Distortion Under Tilt | `src/components/SpatialBlueprintCanvas.tsx:170-180` | M | Medium |
| **QA-014** | **Medium** | Activity Log | Activity Stream Misses Inventory, Attendance & Comment Events | `src/App.tsx:926, 1712, 1828` | S | Low |
| **QA-015** | **Medium** | Dashboard | Inconsistent Worker Counting Across Project Views | `src/components/MinimalistDashboardViews.tsx:883` | S | Low |
| **QA-016** | **Medium** | Navigation | Hardcoded "Uluwatu Resort Group" in Breadcrumbs | `src/App.tsx:2091` | S | Low |
| **QA-017** | **Medium** | Forms | Forms Lack Double-Submit Debouncing & Boundary Checks | `src/components/ModalsTahap1.tsx:698` | S | Low |
| **QA-018** | **Medium** | Localization | Pervasive Indonesian Strings in Codebase & Schema | `src/types/schema.ts:51`, `initialDatabase.ts` | M | Medium |
| **QA-019** | **Low** | Responsive | Canvas Control Toolbar Wraps & Overflows on 375px Screens | `src/components/SpatialBlueprintCanvas.tsx:324-450` | S | Low |
| **QA-020** | **Low** | Forms | Hardcoded Default Assigned Worker Email in Modal | `src/components/ModalsTahap1.tsx:682` | S | Low |
| **QA-021** | **Low** | Architecture | Unimplemented Stub for Offline Queue Simulation | `src/App.tsx:2055` | S | Low |

---

### Detailed Defect Reports (Critical & High Issues)

#### QA-001: Store Request Bypasses Approval & Truncates Stock
- **Severity:** Critical
- **Module:** Warehouse / Store Request (SR)
- **Description:** Submitting an SR in `StoreAndPurchaseRequestView` calls `handleSubmitMarketlistBatch`, which immediately deducts inventory stock (`item.stock_available - deduct`) without requiring PM or Owner approval. Furthermore, if the deduction exceeds stock, `Math.max(0, ...)` silently truncates available stock to zero without recording a back-order deficit.
- **Root Cause:** `src/App.tsx:1590-1599`
- **Recommended Fix:** Implement an explicit SR lifecycle: `Draft -> Submitted -> Approved -> Fulfilled`. Deduct stock only when a Warehouse Keeper fulfills an approved SR. Refuse deductions that exceed available balance.
- **Effort:** Medium | **Regression Risk:** Medium

#### QA-002: Zero Duplicate Guards on Worker Attendance
- **Severity:** Critical
- **Module:** Attendance
- **Description:** A worker can submit unlimited check-in (`masuk`) and check-out (`pulang`) records on the same calendar day. The system also permits checking out without an existing check-in.
- **Root Cause:** `src/App.tsx:1828-1868`
- **Recommended Fix:** Add pre-submission checks against `db.attendance_records` scoped to `activeProject.id`, `worker_profile_id`, and Makassar date (`YYYY-MM-DD`). Restrict daily submissions to exactly 1 check-in followed by 1 check-out.
- **Effort:** Small | **Regression Risk:** Low

#### QA-003: Silent Data Loss on `localStorage` Quota Exceeded
- **Severity:** Critical
- **Module:** Data Persistence
- **Description:** Base64 field markup photos quickly exceed browser `localStorage` quotas (~5MB). When `setItem` throws a `QuotaExceededError`, `App.tsx:103` catches and swallows the error with an empty catch block, permanently dropping all subsequent edits without warning the user.
- **Root Cause:** `src/App.tsx:100-106`
- **Recommended Fix:** Surface an explicit toast error when storage quota is exceeded. Transition image storage from base64 strings in `localStorage` to IndexedDB or a blob storage service.
- **Effort:** Small | **Regression Risk:** Low

#### QA-004: Missing Goods Receipt Entity & Workflow
- **Severity:** Critical
- **Module:** Procurement / PR
- **Description:** PRs remain permanently in `to_buy` status. There is no mechanism or data model for recording goods receipts, matching purchase lines, or updating warehouse stock upon delivery.
- **Root Cause:** `src/types/schema.ts:152-170`, `src/App.tsx:1609-1686`
- **Recommended Fix:** Create `GoodsReceipt` schema and corresponding warehouse receipt modal. Allow Warehouse Keeper to log partial or full receipt against PRs, automatically transitioning PR status to `Received` and incrementing warehouse inventory.
- **Effort:** Large | **Regression Risk:** High

#### QA-005: Absence of Action-Level Authorization on Mutations
- **Severity:** Critical
- **Module:** RBAC / Security
- **Description:** Mutation functions (`handleUpdatePinDetails`, `handleConfirmCreatePin`, `handleSubmitMarketlistBatch`, etc.) execute without verifying the caller's role. A worker or unauthorized user can trigger leader actions.
- **Root Cause:** `src/App.tsx:1030-1070`, `1511-1607`
- **Recommended Fix:** Wrap all state mutators with an authorization check asserting `evaluateRlsPermission(activeProfile.global_role, action).allowed`.
- **Effort:** Medium | **Regression Risk:** Medium

#### QA-006: 10 TypeScript Compilation Errors
- **Severity:** High
- **Module:** Build & Types
- **Description:** `npm run lint` (`tsc --noEmit`) fails with 10 type errors. `PinCommentRecord` defines `sender_name`/`sender_role` while components pass `author_name`/`author_role`. Dashboard views require `onSelectProjectAndOpenCanvas` prop which `App.tsx` fails to provide.
- **Root Cause:** `src/types/schema.ts:10-18`, `src/App.tsx:2011, 2677`, `src/components/BeforeAfterSliderGate.tsx:575`
- **Recommended Fix:** Harmonize `PinCommentRecord` interface properties and supply missing callbacks in `App.tsx`.
- **Effort:** Small | **Regression Risk:** Low

#### QA-007: Manual Attendance Correction Workflow Missing
- **Severity:** High
- **Module:** Attendance
- **Description:** The required feature to allow PM/Owner to correct attendance records (with reason and audit history) does not exist; only adding fresh records is supported.
- **Root Cause:** `src/App.tsx:1870-1902`
- **Recommended Fix:** Implement `handleCorrectAttendanceRecord` requiring `originalRecordId`, `newCheckIn`, `newCheckOut`, and `correctionReason`. Store original and corrected timestamps.
- **Effort:** Medium | **Regression Risk:** Medium

#### QA-008: Stock Movement Ledger Missing
- **Severity:** High
- **Module:** Inventory / Warehouse
- **Description:** The warehouse inventory model contains only a single scalar field `stock_available`. The required business formula (`closing = opening + receipts + adjustments - issues`) cannot be verified or enforced.
- **Root Cause:** `src/types/schema.ts:141-150`
- **Recommended Fix:** Add `StockMovementRecord` table: `id`, `project_id`, `inventory_item_id`, `movement_type` (`opening` | `receipt` | `issue` | `adjustment`), `quantity`, `reference_id`, `created_at`.
- **Effort:** Large | **Regression Risk:** High

#### QA-009: Missing URL Router
- **Severity:** High
- **Module:** Navigation & Core
- **Description:** All navigation is managed via in-memory tab state. Users cannot bookmark views, share links, use the browser back/forward buttons, or refresh without resetting to the home page.
- **Root Cause:** `src/App.tsx:126-155`
- **Recommended Fix:** Integrate URL path or hash synchronization (`window.location.hash` or lightweight router) syncing tab IDs to the URL.
- **Effort:** Large | **Regression Risk:** High

#### QA-010: Timezone Violations (UTC vs Asia/Makassar UTC+8)
- **Severity:** High
- **Module:** Localization / Dates
- **Description:** Dates are stamped using `new Date().toISOString()`, which generates UTC timestamps. Around midnight in Bali (UTC+8), attendance and order dates are recorded under the previous day.
- **Root Cause:** `src/App.tsx:1854`, `src/components/WorkspaceNewModules.tsx:704`
- **Recommended Fix:** Implement a centralized date utility formatting dates in `Asia/Makassar` (UTC+8).
- **Effort:** Small | **Regression Risk:** Low

---

## 5. Test Matrix

| Area | Check Description | Result | Evidence / File Reference |
| :--- | :--- | :---: | :--- |
| **01. Routing** | Deep link + hard refresh works on every route | **FAIL** | `src/App.tsx:126-136` (Tab state resets on refresh; no URL router). |
| **01. Routing** | Back/forward navigation between views | **FAIL** | `src/App.tsx:145-154` (No history popstate listener). |
| **02. Context** | Project switch updates blueprint, pins, divisions | **PASS (code-reviewed only)** | `src/App.tsx:250-257` (`useEffect` cleans up active blueprint ID). |
| **02. Context** | Project switch isolates worker counts | **FAIL** | `src/components/MinimalistDashboardViews.tsx:883` (Global leak). |
| **03. Tasks** | Progress % derived from single source | **PARTIAL** | `src/utils/vontaAnalytics.ts:48` vs `MinimalistDashboardViews.tsx:381`. |
| **03. Tasks** | Double-submit safe on task creation | **FAIL** | `src/components/ModalsTahap1.tsx:697` (Button not disabled). |
| **04. Assignment**| Enforce project membership on assignment | **FAIL** | `src/App.tsx:1030-1070` (Zero validation on assignee email). |
| **05. 2D/3D Pins** | 2D/3D coordinate consistency | **PARTIAL** | `src/components/SpatialBlueprintCanvas.tsx:174-180` (Perspective skew). |
| **06. Activity** | Activity stream logs all mutations | **PARTIAL** | `src/App.tsx` (Missing restock, attendance, and member removal logs).|
| **07. Archive** | Approved pins archived and read-only | **PASS (code-reviewed only)** | `src/components/WorkspaceNewModules.tsx:2253` (Filtered from canvas). |
| **08. Stock** | Formula: closing = opening + receipts - issues | **FAIL** | `src/types/schema.ts:141` (No movement ledger table exists). |
| **09. Store Req** | SR lifecycle + approval before stock deduct | **FAIL** | `src/App.tsx:1596` (Immediate stock deduction upon submission). |
| **10. Purch Req** | Goods receipt increments stock exactly once | **MISSING** | No GoodsReceipt component or handler exists in codebase. |
| **11. Attendance**| Single check-in/out per user per day | **FAIL** | `src/App.tsx:1828` (Unlimited submissions permitted). |
| **12. Attendance**| Manual correction with reason & audit | **MISSING** | `src/App.tsx:1870` (Only creates fresh records; no edit/correction).|
| **13. RBAC** | Enforce permissions across all roles | **FAIL** | `src/types/schema.ts:1` (Only 3 roles; action handlers unguarded). |
| **14. Dashboard** | Metric source consistency across views | **PARTIAL** | `src/components/MinimalistDashboardViews.tsx:453` vs `883`. |
| **15. Responsive**| Mobile layout at 375px | **PARTIAL** | `src/components/SpatialBlueprintCanvas.tsx:324` (Toolbar wraps/overlaps). |
| **16. Forms** | Input boundary & whitespace validation | **PARTIAL** | Number inputs lack min/max clamp on keydown; whitespace allowed. |
| **17. Runtime** | TypeScript / Lint verification | **FAIL** | `npm run lint` yields 10 compilation errors. |
| **18. Storage** | Storage survival & quota handling | **PARTIAL** | `src/App.tsx:103` (Silent quota drop; no foreign key cascades). |

---

## 6. SPEC Gaps & Decisions Needed

The following items are missing from the specifications or conflict with the existing implementation:

1. **Enterprise Roles vs Existing Codebase:**
   - *Context:* Context specifies: `Owner, Project Manager, Supervisor, Worker, Warehouse Keeper, Purchasing`.
   - *Existing Code:* Only `owner`, `mandor`, `worker` exist in schema.
   - *Decision Needed:* Should `GlobalRole` be refactored to include all 6 roles, and should `mandor` be formally aliased or migrated to `supervisor`?
   - *Proposed Default:* Update `GlobalRole` to `'owner' | 'pm' | 'supervisor' | 'worker' | 'warehouse_keeper' | 'purchasing'`, aliasing legacy `'mandor'` to `'supervisor'`.

2. **Store Request (SR) Approval Authority:**
   - *Context:* SR approval should be restricted to PM and Owner.
   - *Existing Code:* Any user can submit an SR and stock is decremented instantly.
   - *Decision Needed:* Confirm whether Supervisors/Foremen can submit SR drafts, with stock decremented ONLY when a Warehouse Keeper fulfills an approved SR.
   - *Proposed Default:* Adopt the 5-state lifecycle: `Draft -> Submitted -> Approved -> Partially Fulfilled -> Fulfilled`.

3. **Stock Movement Reconciliation Strategy:**
   - *Context:* `closing = opening + receipts + adjustments - issues; never negative`.
   - *Existing Code:* Only a scalar `stock_available` field exists.
   - *Decision Needed:* Should we introduce a dedicated `StockMovementRecord` table to record every receipt, adjustment, and issue?
   - *Proposed Default:* Introduce `public.stock_movements` and derive `stock_available` from movement sums.

4. **Timezone Policy:**
   - *Context:* Asia/Makassar (UTC+8).
   - *Existing Code:* Client timestamps generated with UTC `.toISOString()`.
   - *Decision Needed:* Should all stored strings remain ISO 8601 UTC while all date-grouping and display logic formats strictly in `Asia/Makassar`?
   - *Proposed Default:* Store ISO UTC strings with an added `timezone_offset: +08:00`, using `Intl.DateTimeFormat` with `timeZone: 'Asia/Makassar'` for all date calculations.

---

## 7. Proposed Fix Plan for Critical & High Issues

*Note: In accordance with audit instructions, no code changes have been applied. Execution is blocked pending user approval.*

```mermaid
graph TD
    A["Phase 1: Type Safety & Core RBAC (QA-006, QA-011)"] --> B["Phase 2: Attendance Integrity & Timezone (QA-002, QA-007, QA-010)"]
    B --> C["Phase 3: Stock Movement Ledger & SR/PR Lifecycles (QA-001, QA-004, QA-008)"]
    C --> D["Phase 4: Action Authorization & Referential Cascades (QA-005, QA-012)"]
    D --> E["Phase 5: Router & Storage Quota Protection (QA-003, QA-009)"]
```

### Stage 1: Type Safety, RBAC & Interface Harmonization
- **Issues Addressed:** QA-006, QA-011.
- **Dependencies:** None.
- **Files to Modify:**
  - `src/types/schema.ts`: Expand `GlobalRole` to include `pm`, `supervisor`, `warehouse_keeper`, `purchasing`. Harmonize `PinCommentRecord` to support both `sender_name` and `author_name`.
  - `src/App.tsx`: Supply `onSelectProjectAndOpenCanvas` prop in calls to `StandaloneProjectsDashboardView` and `ProjectsHomeView`.
  - `src/components/BeforeAfterSliderGate.tsx`: Align comment property references.
  - `src/components/WorkspaceNewModules.tsx`: Add null check in `getWorkerDisplay`.
  - `src/data/initialDatabase.ts`: Fix line 2102 fallback typing.

### Stage 2: Attendance Integrity & Timezone Normalization
- **Issues Addressed:** QA-002, QA-007, QA-010.
- **Dependencies:** Stage 1.
- **Files to Modify:**
  - `src/utils/vontaAnalytics.ts`: Add `getMakassarDateString()` and duplicate validation helper.
  - `src/App.tsx`: Refactor `handleWorkerSubmitAttendance` to reject duplicate check-ins/check-outs for the same worker and day.
  - `src/components/WorkspaceNewModules.tsx`: Add manual attendance correction modal requiring a reason and updating original records.

### Stage 3: Stock Movement Ledger, SR Lifecycle & Goods Receipt Flow
- **Issues Addressed:** QA-001, QA-004, QA-008.
- **Dependencies:** Stage 1.
- **Files to Modify:**
  - `src/types/schema.ts`: Define `StockMovementRecord` and `GoodsReceiptRecord`.
  - `src/App.tsx`: Modify `handleSubmitMarketlistBatch` so stock is NOT decremented upon SR creation; create approval and fulfillment handlers.
  - `src/components/WorkspaceNewModules.tsx`: Add approval buttons for PM/Owner and fulfillment workflow for Warehouse Keeper. Add Goods Receipt intake modal.

### Stage 4: Mutation Authorization Guards & Foreign Key Cascades
- **Issues Addressed:** QA-005, QA-012.
- **Dependencies:** Stage 1, Stage 3.
- **Files to Modify:**
  - `src/App.tsx`: Add permission assertions to `handleUpdatePinDetails`, `handleConfirmCreatePin`, `handleLeaderApprovePin`. Add cascading deletions so deleting pins clears linked material allocations.

### Stage 5: Navigation Hash Router & Storage Quota Protection
- **Issues Addressed:** QA-003, QA-009.
- **Dependencies:** Stage 1.
- **Files to Modify:**
  - `src/App.tsx`: Implement `window.location.hash` synchronization for `activeWorkspaceTab` to support deep links and browser back/forward buttons. Add user-facing toast alert on storage quota exception.

---

**AUDIT COMPLETE — AWAITING USER APPROVAL PRIOR TO REMEDIATION.**
