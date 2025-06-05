// Role definitions for the helideck inspection system
const ROLES = {
  ADMIN: 'admin',
  BP: 'bp',
  HLO: 'hlo',
  SUPPLIER: 'supplier'
};

// Role display names
const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.BP]: 'BP Aviation Team',
  [ROLES.HLO]: 'HLO Operator',
  [ROLES.SUPPLIER]: 'Supplier'
};

// Role descriptions
const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access for configuration and maintenance',
  [ROLES.BP]: 'BP Aviation Team members and employees',
  [ROLES.HLO]: 'Offshore HLO operators',
  [ROLES.SUPPLIER]: 'External suppliers (BMT, PHI, Bristow, etc.)'
};

// Permission definitions
const PERMISSIONS = {
  // Inspection permissions
  VIEW_ALL_INSPECTIONS: 'view_all_inspections',
  VIEW_OWN_INSPECTIONS: 'view_own_inspections',
  CREATE_INSPECTION: 'create_inspection',
  EDIT_ALL_INSPECTIONS: 'edit_all_inspections',
  EDIT_OWN_INSPECTIONS: 'edit_own_inspections',
  DELETE_INSPECTION: 'delete_inspection',
  
  // Facility permissions
  VIEW_FACILITIES: 'view_facilities',
  MANAGE_FACILITIES: 'manage_facilities',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // System permissions
  SYSTEM_CONFIG: 'system_config',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
};

// Role-permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to everything
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_ALL_INSPECTIONS,
    PERMISSIONS.DELETE_INSPECTION,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.BP]: [
    // BP team can view all inspections and analytics
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.HLO]: [
    // HLO operators can create and edit inspections
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_OWN_INSPECTIONS,
    PERMISSIONS.VIEW_FACILITIES
  ],
  [ROLES.SUPPLIER]: [
    // Suppliers can view their own inspections
    PERMISSIONS.VIEW_OWN_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_OWN_INSPECTIONS,
    PERMISSIONS.VIEW_FACILITIES
  ]
};

// Helper function to check if a role has a specific permission
function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Get all valid roles
function getValidRoles() {
  return Object.values(ROLES);
}

// Validate if a role is valid
function isValidRole(role) {
  return getValidRoles().includes(role);
}

module.exports = {
  ROLES,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getValidRoles,
  isValidRole
};