import { AccessIdentifier, AppMenuItem } from "@/types/rbac";

export type MenuIdentifier = AccessIdentifier;

export interface MenuRolePermission {
  roleId: AccessIdentifier;
  roleName?: string;
  actions: string[];
}

export interface MenuContractMeta {
  supportedActions: string[];
  requestFields: string[];
}

export interface MenuRecord {
  id: MenuIdentifier;
  name: string;
  path: string;
  route?: string;
  url?: string;
  icon?: string;
  description?: string;
  permissionName?: string;
  parentId: MenuIdentifier | null;
  order: number;
  isActive: boolean;
  isPublic: boolean;
  rolePermissions: MenuRolePermission[];
  supportedActions: string[];
  children: MenuRecord[];
  raw?: unknown;
}

export interface MenuMutationPayload {
  name: string;
  path: string;
  route?: string;
  icon?: string;
  description?: string;
  parentId?: MenuIdentifier | null;
  order?: number;
  isActive?: boolean;
  permissionName?: string;
  isPublic?: boolean;
  rolePermissions?: MenuRolePermission[];
}

export interface MenuReorderItem {
  id: MenuIdentifier;
  parentId: MenuIdentifier | null;
  order: number;
}

export interface MenuReorderPayload {
  items: MenuReorderItem[];
}

export interface AccessibleMenuSnapshot {
  items: AppMenuItem[];
}
