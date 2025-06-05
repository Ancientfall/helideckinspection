// Role definitions for the helideck inspection system
export const ROLES = {
  ADMIN: 'admin',
  BP: 'bp',
  HLO: 'hlo',
  SUPPLIER: 'supplier'
};

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.BP]: 'BP Aviation Team',
  [ROLES.HLO]: 'HLO Operator',
  [ROLES.SUPPLIER]: 'Supplier'
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access for configuration and maintenance',
  [ROLES.BP]: 'BP Aviation Team members and employees - full read/write access',
  [ROLES.HLO]: 'Offshore HLO operators - can upload and view items',
  [ROLES.SUPPLIER]: 'External suppliers (BMT, PHI, Bristow, etc.)'
};

// Permission definitions
export const PERMISSIONS = {
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
  
  // Helideck plate permissions
  VIEW_HELIDECK_PLATES: 'view_helideck_plates',
  UPLOAD_HELIDECK_PLATES: 'upload_helideck_plates',
  MANAGE_HELIDECK_PLATES: 'manage_helideck_plates',
  
  // NOTAM permissions
  VIEW_NOTAMS: 'view_notams',
  UPLOAD_NOTAMS: 'upload_notams',
  UPDATE_NOTAMS: 'update_notams',
  CLEAR_NOTAMS: 'clear_notams',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // System permissions
  SYSTEM_CONFIG: 'system_config',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
};

// Role-permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to everything
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_ALL_INSPECTIONS,
    PERMISSIONS.DELETE_INSPECTION,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.VIEW_HELIDECK_PLATES,
    PERMISSIONS.UPLOAD_HELIDECK_PLATES,
    PERMISSIONS.MANAGE_HELIDECK_PLATES,
    PERMISSIONS.VIEW_NOTAMS,
    PERMISSIONS.UPLOAD_NOTAMS,
    PERMISSIONS.UPDATE_NOTAMS,
    PERMISSIONS.CLEAR_NOTAMS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.BP]: [
    // BP team has read/write access to most things including clearing NOTAMs
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_ALL_INSPECTIONS,
    PERMISSIONS.DELETE_INSPECTION,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.VIEW_HELIDECK_PLATES,
    PERMISSIONS.UPLOAD_HELIDECK_PLATES,
    PERMISSIONS.MANAGE_HELIDECK_PLATES,
    PERMISSIONS.VIEW_NOTAMS,
    PERMISSIONS.CLEAR_NOTAMS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_USERS
  ],
  [ROLES.HLO]: [
    // HLO operators can upload and view items
    PERMISSIONS.VIEW_ALL_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_OWN_INSPECTIONS,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.VIEW_HELIDECK_PLATES,
    PERMISSIONS.UPLOAD_HELIDECK_PLATES,
    PERMISSIONS.VIEW_NOTAMS
  ],
  [ROLES.SUPPLIER]: [
    // Suppliers (PHI, Bristow, BMT) can upload/update NOTAMs and view inspections
    PERMISSIONS.VIEW_OWN_INSPECTIONS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.EDIT_OWN_INSPECTIONS,
    PERMISSIONS.VIEW_FACILITIES,
    PERMISSIONS.VIEW_NOTAMS,
    PERMISSIONS.UPLOAD_NOTAMS,
    PERMISSIONS.UPDATE_NOTAMS
  ]
};

// Helper function to check if a role has a specific permission
export function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Get all valid roles
export function getValidRoles() {
  return Object.values(ROLES);
}

// Validate if a role is valid
export function isValidRole(role) {
  return getValidRoles().includes(role);
}