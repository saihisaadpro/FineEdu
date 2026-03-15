/**
 * Canonical role and permission system for WorkReady Finance.
 *
 * Single source of truth for:
 * - Role definitions and labels
 * - Role groups (learner, facilitator-level, module-lead-level)
 * - Per-role permissions
 * - Role → home-route mapping
 *
 * All other files import Role from here (or re-export it).
 * Do NOT define Role types elsewhere.
 */

export const ROLES = {
  guest: 'guest',
  student: 'student',
  pin_learner: 'pin_learner',
  facilitator: 'facilitator',
  lecturer: 'lecturer',
  module_lead: 'module_lead',
  admin: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Roles that exist in the Supabase `profiles.role` CHECK constraint.
 * `student` and `pin_learner` are client-only — they never reach the DB.
 */
export type DbRole = 'guest' | 'facilitator' | 'lecturer' | 'module_lead' | 'admin';

// ── Functional role groups ──────────────────────────────────────────

export const LEARNER_ROLES: readonly Role[] = ['guest', 'student', 'pin_learner'];
export const FACILITATOR_ROLES: readonly Role[] = ['facilitator', 'lecturer', 'admin'];
export const MODULE_LEAD_ROLES: readonly Role[] = ['module_lead', 'lecturer', 'admin'];
export const ALL_STAFF_ROLES: readonly Role[] = ['facilitator', 'lecturer', 'module_lead', 'admin'];

// ── Permissions ─────────────────────────────────────────────────────

export type Permission =
  | 'view_dashboard'
  | 'view_modules'
  | 'attempt_stages'
  | 'view_facilitator_dashboard'
  | 'override_gates'
  | 'reset_sessions'
  | 'flag_content'
  | 'view_module_lead_dashboard'
  | 'manage_scenarios'
  | 'publish_scenarios'
  | 'review_content'
  | 'view_analytics'
  | 'export_data';

const LEARNER_PERMS: Permission[] = ['view_dashboard', 'view_modules', 'attempt_stages'];

const FACILITATOR_PERMS: Permission[] = [
  ...LEARNER_PERMS,
  'view_facilitator_dashboard',
  'override_gates',
  'reset_sessions',
  'flag_content',
];

const MODULE_LEAD_PERMS: Permission[] = [
  ...LEARNER_PERMS,
  'view_module_lead_dashboard',
  'manage_scenarios',
  'publish_scenarios',
  'review_content',
  'view_analytics',
  'export_data',
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  guest: LEARNER_PERMS,
  student: LEARNER_PERMS,
  pin_learner: LEARNER_PERMS,
  facilitator: FACILITATOR_PERMS,
  lecturer: [...new Set([...FACILITATOR_PERMS, ...MODULE_LEAD_PERMS])],
  module_lead: MODULE_LEAD_PERMS,
  admin: [...new Set([...FACILITATOR_PERMS, ...MODULE_LEAD_PERMS])],
};

/** Check whether a role has a specific permission. */
export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

// ── Convenience helpers used across UI ──────────────────────────────

export function canAccessFacilitatorDashboard(role: Role | null): boolean {
  return hasPermission(role, 'view_facilitator_dashboard');
}

export function canAccessModuleLeadDashboard(role: Role | null): boolean {
  return hasPermission(role, 'view_module_lead_dashboard');
}

/** True for guest / student / pin_learner. */
export function isLearnerRole(role: Role | null): role is Role {
  return role !== null && (LEARNER_ROLES as readonly string[]).includes(role);
}

/** True for any role that exists only in the frontend (not in the DB CHECK). */
export function isClientOnlyRole(role: Role | null): role is 'student' | 'pin_learner' {
  return role === 'student' || role === 'pin_learner';
}

// ── Route & label mappings ──────────────────────────────────────────

/** Where each role lands after login. */
export const ROLE_HOME_ROUTES: Record<Role, string> = {
  guest: '/dashboard',
  student: '/dashboard',
  pin_learner: '/dashboard',
  facilitator: '/facilitator',
  lecturer: '/dashboard',
  module_lead: '/module-lead',
  admin: '/dashboard',
};

/** Human-readable labels for display. */
export const ROLE_LABELS: Record<Role, string> = {
  guest: 'Guest Learner',
  student: 'Learner',
  pin_learner: 'PIN Learner',
  facilitator: 'Facilitator',
  lecturer: 'Lecturer',
  module_lead: 'Module Lead',
  admin: 'Administrator',
};
