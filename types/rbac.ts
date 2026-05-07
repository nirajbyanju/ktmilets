export type AccessIdentifier = string | number;

export interface PermissionDefinition {
  id?: AccessIdentifier;
  key: string;
  label: string;
  description?: string;
  group: string;
  action?: string;
  resource?: string;
  raw?: unknown;
}

export interface RoleDefinition {
  id: AccessIdentifier;
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  permissionIds: AccessIdentifier[];
  raw?: unknown;
}

export interface AccessUserSummary {
  id: AccessIdentifier;
  name: string;
  email?: string;
  status?: string;
  roles: string[];
  roleIds: AccessIdentifier[];
  raw?: unknown;
}

export interface UserAccessDetails extends AccessUserSummary {
  permissions: string[];
  directPermissions: string[];
  user?: Record<string, unknown> | null;
}

export interface AppMenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children: AppMenuItem[];
  raw?: unknown;
}

export interface AccessSnapshot {
  user: Record<string, unknown> | null;
  roles: string[];
  roleIds: AccessIdentifier[];
  permissions: string[];
  directPermissions: string[];
  menu: AppMenuItem[];
}

export interface RoleMutationPayload {
  name: string;
  description?: string;
  permissions: string[];
  permissionIds: AccessIdentifier[];
}

export interface UserRoleAssignmentPayload {
  roles: string[];
  roleIds: AccessIdentifier[];
}

export interface PermissionAssignmentPayload {
  permissions: string[];
  permissionIds: AccessIdentifier[];
}
