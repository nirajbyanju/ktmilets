import { api, Response } from "@/apis/https.api";
import {
  PermissionAssignmentPayload,
  RoleMutationPayload,
  UserRoleAssignmentPayload,
} from "@/types/rbac";

const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: unknown } };

  if (apiError.response?.data) {
    return Promise.reject(apiError.response.data);
  }

  return Promise.reject(error);
};

export const getRbacPermissions = async (): Promise<Response> => {
  try {
    const response = await api.get<Response>("/rbac/permissions");
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getRbacRoles = async (): Promise<Response> => {
  try {
    const response = await api.get<Response>("/rbac/roles");
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const createRbacRole = async (payload: RoleMutationPayload): Promise<Response> => {
  try {
    const response = await api.post<Response>("/rbac/roles", {
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions,
      permission_ids: payload.permissionIds,
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateRbacRolePermissions = async (
  roleId: string | number,
  payload: RoleMutationPayload
): Promise<Response> => {
  try {
    const response = await api.put<Response>(`/rbac/roles/${roleId}`, {
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions,
      permission_ids: payload.permissionIds,
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getRbacUsers = async (params?: Record<string, unknown>): Promise<Response> => {
  try {
    const response = await api.get<Response>("/rbac/users", { params });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getRbacUserAccess = async (userId: string | number): Promise<Response> => {
  try {
    const response = await api.get<Response>(`/rbac/users/${userId}/access`);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const assignRbacUserRoles = async (
  userId: string | number,
  payload: UserRoleAssignmentPayload
): Promise<Response> => {
  try {
    const response = await api.put<Response>(`/rbac/users/${userId}/roles`, {
      roles: payload.roles,
      role_ids: payload.roleIds,
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateRbacUserPermissions = async (
  userId: string | number,
  payload: PermissionAssignmentPayload
): Promise<Response> => {
  try {
    const response = await api.put<Response>(`/rbac/users/${userId}/permissions`, {
      permissions: payload.permissions,
      permission_ids: payload.permissionIds,
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getCurrentUserMenu = async (): Promise<Response> => {
  try {
    const response = await api.get<Response>("/user/menu");
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};
