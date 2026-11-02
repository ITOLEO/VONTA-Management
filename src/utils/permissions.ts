import { GlobalRole } from '../types/schema';

export type WorkspaceTabId =
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

export type Action =
  // Task actions
  | 'create_task'
  | 'reposition_task'
  | 'edit_task_details'
  | 'start_progress'
  | 'upload_after_proof'
  | 'add_pin_comment'
  | 'approve_task'
  | 'reject_task'
  | 'reopen_task'
  | 'request_delete_task'
  | 'delete_task'
  | 'cancel_delete_request'
  | 'allocate_material_to_pin'
  | 'add_blueprint'
  // Material & Inventory actions
  | 'create_store_request'
  | 'create_purchase_request'
  | 'manage_inventory_item'
  | 'restock_inventory_item'
  | 'mark_shopping_item_bought'
  | 'update_shopping_item_qty'
  // Project & Blueprint actions
  | 'edit_termin_target'
  | 'add_division'
  | 'update_division_name'
  | 'edit_project_settings'
  // Team & Member actions
  | 'invite_member'
  | 'update_member_role'
  | 'toggle_member_chat_access'
  | 'remove_member'
  // Attendance actions
  | 'submit_self_attendance'
  | 'log_manual_attendance'
  // Chat actions
  | 'send_chat_message'
  | 'toggle_chat_leader_only'
  | 'save_general_note'
  // Global / System actions
  | 'create_project'
  | 'reset_database'
  | 'import_database'
  // Tab view actions
  | 'view_tab_overview'
  | 'view_tab_spatial_map'
  | 'view_tab_history'
  | 'view_tab_attendance'
  | 'view_tab_inventory'
  | 'view_tab_shopping'
  | 'view_tab_sr_pr'
  | 'view_tab_team'
  | 'view_tab_project_settings';

export const ROLE_DISPLAY_LABELS: Record<GlobalRole, string> = {
  owner: 'Owner',
  mandor: 'Foreman',
  worker: 'Worker',
  warehouse: 'Warehouse Keeper',
};

export const DEFAULT_TAB_BY_ROLE: Record<GlobalRole, WorkspaceTabId> = {
  owner: 'overview',
  mandor: 'overview',
  worker: 'spatial_map',
  warehouse: 'inventory',
};

/**
 * Strict role-to-permissions map using Record<GlobalRole, Record<Action, boolean>>.
 * Any missing action or role will cause a compile-time TypeScript error.
 */
const ROLE_PERMISSIONS: Record<GlobalRole, Record<Action, boolean>> = {
  owner: {
    create_task: true,
    reposition_task: true,
    edit_task_details: true,
    start_progress: true,
    upload_after_proof: true,
    add_pin_comment: true,
    approve_task: true,
    reject_task: true,
    reopen_task: true,
    request_delete_task: true,
    delete_task: true,
    cancel_delete_request: true,
    allocate_material_to_pin: true,
    add_blueprint: true,
    create_store_request: true,
    create_purchase_request: true,
    manage_inventory_item: true,
    restock_inventory_item: true,
    mark_shopping_item_bought: true,
    update_shopping_item_qty: true,
    edit_termin_target: true,
    add_division: true,
    update_division_name: true,
    edit_project_settings: true,
    invite_member: true,
    update_member_role: true,
    toggle_member_chat_access: true,
    remove_member: true,
    submit_self_attendance: true,
    log_manual_attendance: true,
    send_chat_message: true,
    toggle_chat_leader_only: true,
    save_general_note: true,
    create_project: true,
    reset_database: true,
    import_database: true,
    view_tab_overview: true,
    view_tab_spatial_map: true,
    view_tab_history: true,
    view_tab_attendance: true,
    view_tab_inventory: true,
    view_tab_shopping: true,
    view_tab_sr_pr: true,
    view_tab_team: true,
    view_tab_project_settings: true,
  },
  mandor: {
    create_task: true,
    reposition_task: true,
    edit_task_details: true,
    start_progress: true,
    upload_after_proof: true,
    add_pin_comment: true,
    approve_task: true,
    reject_task: true,
    reopen_task: true,
    request_delete_task: true,
    delete_task: false, // Only owner can delete task
    cancel_delete_request: true,
    allocate_material_to_pin: true,
    add_blueprint: true,
    create_store_request: true,
    create_purchase_request: true,
    manage_inventory_item: true,
    restock_inventory_item: true,
    mark_shopping_item_bought: true,
    update_shopping_item_qty: true,
    edit_termin_target: false, // Only owner can change payment termin
    add_division: true,
    update_division_name: true,
    edit_project_settings: false, // Only owner
    invite_member: false, // Only owner
    update_member_role: false, // Only owner
    toggle_member_chat_access: false, // Only owner
    remove_member: false, // Only owner
    submit_self_attendance: true,
    log_manual_attendance: true,
    send_chat_message: true,
    toggle_chat_leader_only: true,
    save_general_note: true,
    create_project: false,
    reset_database: false,
    import_database: false,
    view_tab_overview: true,
    view_tab_spatial_map: true,
    view_tab_history: true,
    view_tab_attendance: true,
    view_tab_inventory: true,
    view_tab_shopping: true,
    view_tab_sr_pr: true,
    view_tab_team: false, // Owner only
    view_tab_project_settings: false, // Owner only
  },
  worker: {
    create_task: false,
    reposition_task: false,
    edit_task_details: false,
    start_progress: true,
    upload_after_proof: true,
    add_pin_comment: true,
    approve_task: false,
    reject_task: false,
    reopen_task: false,
    request_delete_task: false,
    delete_task: false,
    cancel_delete_request: false,
    allocate_material_to_pin: false,
    add_blueprint: false,
    // Note: worker store-request creation currently issues stock immediately (QA-001 deferred to Run 2)
    create_store_request: true,
    create_purchase_request: true,
    manage_inventory_item: false,
    restock_inventory_item: false,
    mark_shopping_item_bought: false,
    update_shopping_item_qty: false,
    edit_termin_target: false,
    add_division: false,
    update_division_name: false,
    edit_project_settings: false,
    invite_member: false,
    update_member_role: false,
    toggle_member_chat_access: false,
    remove_member: false,
    submit_self_attendance: true,
    log_manual_attendance: false,
    send_chat_message: true, // Subject to member can_chat flag
    toggle_chat_leader_only: false,
    save_general_note: false,
    create_project: false,
    reset_database: false,
    import_database: false,
    view_tab_overview: true,
    view_tab_spatial_map: true,
    view_tab_history: true,
    view_tab_attendance: true,
    view_tab_inventory: false,
    view_tab_shopping: false,
    view_tab_sr_pr: true,
    view_tab_team: false,
    view_tab_project_settings: false,
  },
  warehouse: {
    create_task: false,
    reposition_task: false,
    edit_task_details: false,
    start_progress: false,
    upload_after_proof: false,
    add_pin_comment: false,
    approve_task: false,
    reject_task: false,
    reopen_task: false,
    request_delete_task: false,
    delete_task: false,
    cancel_delete_request: false,
    allocate_material_to_pin: false,
    add_blueprint: false,
    create_store_request: true,
    create_purchase_request: true,
    manage_inventory_item: true,
    restock_inventory_item: true,
    mark_shopping_item_bought: true,
    update_shopping_item_qty: false,
    edit_termin_target: false,
    add_division: false,
    update_division_name: false,
    edit_project_settings: false,
    invite_member: false,
    update_member_role: false,
    toggle_member_chat_access: false,
    remove_member: false,
    submit_self_attendance: true,
    log_manual_attendance: false,
    send_chat_message: true,
    toggle_chat_leader_only: false,
    save_general_note: false,
    create_project: false,
    reset_database: false,
    import_database: false,
    view_tab_overview: true,
    view_tab_spatial_map: true, // Read-only viewing
    view_tab_history: true,
    view_tab_attendance: true,
    view_tab_inventory: true,
    view_tab_shopping: true,
    view_tab_sr_pr: true,
    view_tab_team: false, // Forbidden
    view_tab_project_settings: false, // Forbidden
  },
};

/**
 * Central pure permission evaluation function.
 * If role is null or undefined (e.g. non-member in active project), returns false (DENY).
 */
export function can(role: GlobalRole | null | undefined, action: Action): boolean {
  if (!role) return false;
  const roleRules = ROLE_PERMISSIONS[role];
  if (!roleRules) return false;
  return roleRules[action] === true;
}
