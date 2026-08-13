/**
 * Role-Based Access Control (RBAC) Engine & Permission Matrix
 */

const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRATOR: 'Administrator',
  KNOWLEDGE_MANAGER: 'Knowledge Manager',
  REVIEWER: 'Reviewer',
  STANDARD_USER: 'Standard User'
};

const PERMISSIONS = {
  // Page access
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ASSISTANT: 'view_assistant',
  VIEW_CATALOG: 'view_catalog',
  MANAGE_CATALOG: 'manage_catalog',
  VIEW_REVIEWS: 'view_reviews',
  MANAGE_REVIEWS: 'manage_reviews',
  VIEW_EVALUATIONS: 'view_evaluations',
  MANAGE_EVALUATIONS: 'manage_evaluations',
  VIEW_RECOMMENDATIONS: 'view_recommendations',
  MANAGE_RECOMMENDATIONS: 'manage_recommendations',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  VIEW_SYSTEM_HEALTH: 'view_system_health',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SETTINGS: 'manage_settings'
};

const PERMISSION_MATRIX = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMINISTRATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSISTANT,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_CATALOG,
    PERMISSIONS.VIEW_REVIEWS,
    PERMISSIONS.MANAGE_REVIEWS,
    PERMISSIONS.VIEW_EVALUATIONS,
    PERMISSIONS.MANAGE_EVALUATIONS,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.MANAGE_RECOMMENDATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  [ROLES.KNOWLEDGE_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSISTANT,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_CATALOG,
    PERMISSIONS.VIEW_REVIEWS,
    PERMISSIONS.VIEW_EVALUATIONS,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.MANAGE_RECOMMENDATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH
  ],
  [ROLES.REVIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSISTANT,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.VIEW_REVIEWS,
    PERMISSIONS.MANAGE_REVIEWS,
    PERMISSIONS.VIEW_EVALUATIONS,
    PERMISSIONS.MANAGE_EVALUATIONS,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.MANAGE_RECOMMENDATIONS
  ],
  [ROLES.STANDARD_USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSISTANT,
    PERMISSIONS.VIEW_CATALOG
  ]
};

function hasPermission(role, permission) {
  const allowed = PERMISSION_MATRIX[role] || [];
  return allowed.includes(permission);
}

function canAccessRoute(role, route) {
  switch (route) {
    case 'dashboard': return hasPermission(role, PERMISSIONS.VIEW_DASHBOARD);
    case 'assistant': return hasPermission(role, PERMISSIONS.VIEW_ASSISTANT);
    case 'catalog': return hasPermission(role, PERMISSIONS.VIEW_CATALOG);
    case 'reviews': return hasPermission(role, PERMISSIONS.VIEW_REVIEWS);
    case 'evaluation': return hasPermission(role, PERMISSIONS.VIEW_EVALUATIONS);
    case 'recommendations': return hasPermission(role, PERMISSIONS.VIEW_RECOMMENDATIONS);
    case 'analytics': return hasPermission(role, PERMISSIONS.VIEW_ANALYTICS);
    case 'users': return hasPermission(role, PERMISSIONS.MANAGE_USERS);
    case 'health': return hasPermission(role, PERMISSIONS.VIEW_SYSTEM_HEALTH);
    case 'audit': return hasPermission(role, PERMISSIONS.VIEW_AUDIT_LOGS);
    case 'settings': return hasPermission(role, PERMISSIONS.MANAGE_SETTINGS);
    default: return true;
  }
}

window.ROLES = ROLES;
window.PERMISSIONS = PERMISSIONS;
window.hasPermission = hasPermission;
window.canAccessRoute = canAccessRoute;
