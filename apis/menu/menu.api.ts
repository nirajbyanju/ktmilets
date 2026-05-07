import { api, Response } from "@/apis/https.api";
import {
  MenuMutationPayload,
  MenuRolePermission,
  MenuReorderPayload,
} from "@/types/menu";

const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: unknown } };

  if (apiError.response?.data) {
    return Promise.reject(apiError.response.data);
  }

  return Promise.reject(error);
};

const toRolePermissionPayload = (rolePermissions: MenuRolePermission[] = []) =>
  rolePermissions
    .filter((entry) => entry.roleId !== undefined && entry.roleId !== null)
    .map((entry) => ({
      role_id: entry.roleId,
      actions: entry.actions,
    }));

const toMutationPayload = (payload: MenuMutationPayload) => ({
  name: payload.name,
  title: payload.name,
  label: payload.name,
  path: payload.path,
  url: payload.path,
  route: payload.route,
  icon: payload.icon,
  description: payload.description,
  parent_id: payload.parentId ?? null,
  sort_order: payload.order ?? 0,
  order: payload.order ?? 0,
  position: payload.order ?? 0,
  is_status: payload.isActive ?? true,
  is_active: payload.isActive ?? true,
  active: payload.isActive ?? true,
  permission_name: payload.permissionName,
  is_public: payload.isPublic ?? false,
  role_permissions: toRolePermissionPayload(payload.rolePermissions),
});

export const getMenus = async (): Promise<Response> => {
  try {
    const response = await api.get<Response>("/menus");
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getAccessibleMenus = async (): Promise<Response> => {
  try {
    const response = await api.get<Response>("/menus/accessible");
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const createMenu = async (payload: MenuMutationPayload): Promise<Response> => {
  try {
    const response = await api.post<Response>("/menus", toMutationPayload(payload));
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateMenu = async (
  menuId: string | number,
  payload: MenuMutationPayload
): Promise<Response> => {
  try {
    const response = await api.put<Response>(`/menus/${menuId}`, toMutationPayload(payload));
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const deleteMenu = async (menuId: string | number): Promise<Response> => {
  try {
    const response = await api.delete<Response>(`/menus/${menuId}`);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const syncMenuRolePermissions = async (
  menuId: string | number,
  rolePermissions: MenuRolePermission[]
): Promise<Response> => {
  try {
    const response = await api.put<Response>(`/menus/${menuId}/role-permissions`, {
      role_permissions: toRolePermissionPayload(rolePermissions),
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const reorderMenus = async (payload: MenuReorderPayload): Promise<Response> => {
  const items = payload.items.map((item, index) => ({
    id: item.id,
    parent_id: item.parentId,
    sort_order: item.order || index,
    order: item.order || index,
    position: item.order || index,
  }));

  try {
    const response = await api.post<Response>("/menus/reorder", {
      items,
      menus: items,
      order: items.map((item) => item.id),
      menu_ids: items.map((item) => item.id),
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};
