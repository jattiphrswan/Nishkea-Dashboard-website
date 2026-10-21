/**
 * Role-Based Access Control (RBAC) & Authorization Guards — Node 3
 * Follows docs/PERMISSIONS.md rules: Deny by default, server-side mandatory,
 * supplier cost isolation, and immutable audit logging.
 */

import { query } from './db.js';

// Master Role-Permission matrix
export const ROLE_PERMISSIONS = {
  owner: [
    'product:create', 'product:edit', 'product:publish', 'product:archive',
    'inventory:view', 'inventory:receive', 'inventory:adjust', 'inventory:transfer',
    'cost:view', 'order:view', 'order:dispatch', 'order:refund',
    'review:decision', 'report:view', 'report:export', 'role:manage', 'audit:view',
    'crm:view', 'crm:edit', 'task:view', 'task:create', 'task:edit', 'task:assign', 'task:delete', 'support:view', 'support:edit'
  ],
  manager: [
    'product:create', 'product:edit', 'product:publish',
    'inventory:view', 'inventory:receive', 'inventory:adjust', 'inventory:transfer',
    'cost:view', 'order:view', 'order:dispatch', 'order:refund',
    'review:decision', 'report:view', 'report:export', 'audit:view',
    'crm:view', 'crm:edit', 'task:view', 'task:create', 'task:edit', 'task:assign', 'task:delete', 'support:view', 'support:edit'
  ],
  sales_support: [
    'order:view', 'product:create',
    'crm:view', 'crm:edit', 'task:view', 'task:create', 'task:edit', 'support:view', 'support:edit'
  ],
  inventory_staff: [
    'inventory:view', 'inventory:receive', 'inventory:adjust', 'inventory:transfer',
    'order:view', 'order:dispatch',
    'task:view', 'task:edit'
  ],
  accounts_staff: [
    'cost:view', 'order:view', 'order:refund', 'report:view', 'report:export',
    'task:view', 'task:edit'
  ]
};

/**
 * Check if a staff user possesses a specific permission
 * @param {Object} user - User object containing roleId
 * @param {string} permission - Granular permission key (e.g. 'cost:view')
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function checkPermission(user, permission) {
  if (!user || !user.roleId) {
    return {
      allowed: false,
      reason: 'Authentication required. No active staff session identified.'
    };
  }

  const role = user.roleId.toLowerCase();
  const grantedPermissions = ROLE_PERMISSIONS[role] || [];

  if (grantedPermissions.includes(permission)) {
    return { allowed: true };
  }

  // Explicit security audit failure reasons
  if (permission === 'cost:view') {
    return {
      allowed: false,
      reason: `Access Denied: Supplier costs and margins are restricted from role '${role}'.`
    };
  }

  if (permission === 'role:manage') {
    return {
      allowed: false,
      reason: `Access Denied: Staff role management requires Company Owner authorization.`
    };
  }

  return {
    allowed: false,
    reason: `Access Denied: Role '${role}' lacks the '${permission}' grant.`
  };
}

/**
 * Assert permission or throw an AuthorizationError
 */
export function assertPermission(user, permission) {
  const result = checkPermission(user, permission);
  if (!result.allowed) {
    const error = new Error(result.reason);
    error.statusCode = user ? 403 : 401;
    error.code = user ? 'FORBIDDEN' : 'UNAUTHORIZED';
    throw error;
  }
}

/**
 * Record an immutable audit log entry
 */
export async function logAuditEvent({
  actorId = 'anonymous',
  action,
  resourceType,
  resourceId = null,
  metadata = {},
  ipAddress = null
}) {
  try {
    await query(
      `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorId, action, resourceType, resourceId, JSON.stringify(metadata), ipAddress]
    );
  } catch (err) {
    // Audit write attempt is logged to stderr if database is offline
    console.warn('[Audit Log Fallback]:', { actorId, action, resourceType, resourceId, metadata, error: err.message });
  }
}
