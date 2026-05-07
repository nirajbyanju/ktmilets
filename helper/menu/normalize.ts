import { AppMenuItem } from "@/types/rbac";
import { MenuContractMeta, MenuIdentifier, MenuRecord, MenuRolePermission } from "@/types/menu";
import { normalizeMenuItems } from "@/helper/rbac/normalize";

type LooseRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ensureArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return [value];
};

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const toIdentifier = (value: unknown): MenuIdentifier | null => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
};

const toBoolean = (value: unknown, fallback = true): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "active", "enabled", "yes"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "inactive", "disabled", "no"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const firstValue = (input: LooseRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== "") {
      return input[key];
    }
  }

  return undefined;
};

const firstString = (input: LooseRecord, keys: string[]): string => {
  for (const key of keys) {
    const value = toStringValue(input[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const extractCollection = (value: unknown, keys: string[], depth = 0): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value) || depth > 5) {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  for (const nestedValue of Object.values(value)) {
    if (isRecord(nestedValue)) {
      const nested = extractCollection(nestedValue, keys, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

const normalizeMenuNode = (value: unknown, index: number): MenuRecord | null => {
  if (!isRecord(value)) {
    const name = toStringValue(value);
    if (!name) {
      return null;
    }

    return {
      id: name || `menu-${index}`,
      name,
      path: "",
      parentId: null,
      order: index,
      isActive: true,
      isPublic: false,
      rolePermissions: [],
      supportedActions: [],
      children: [],
      raw: value,
    };
  }

  const name =
    firstString(value, ["name", "label", "title", "menu_name", "menuName"]) ||
    "Untitled Menu";

  const id =
    toIdentifier(firstValue(value, ["id", "menu_id", "menuId"])) ||
    firstString(value, ["slug", "code", "key"]) ||
    slugify(name) ||
    `menu-${index}`;

  const children = extractCollection(value, ["children", "submenus", "items", "menus"])
    .map((child, childIndex) => normalizeMenuNode(child, childIndex))
    .filter((child): child is MenuRecord => child !== null);

  return {
    id,
    name,
    path: firstString(value, ["path", "url", "route", "href", "link"]),
    route: firstString(value, ["route", "path", "url"]) || undefined,
    url: firstString(value, ["url", "path", "href", "link"]) || undefined,
    icon: firstString(value, ["icon", "icon_name", "iconName"]) || undefined,
    description: firstString(value, ["description", "details", "note"]) || undefined,
    permissionName:
      firstString(value, ["permission_name", "permissionName", "permission", "permission_key"]) ||
      undefined,
    parentId: toIdentifier(firstValue(value, ["parent_id", "parentId", "parent_menu_id", "parentMenuId"])),
    order: toNumber(firstValue(value, ["sort_order", "sortOrder", "order", "position", "sequence"]), index),
    isActive: toBoolean(firstValue(value, ["is_active", "isActive", "active", "status"]), true),
    isPublic: toBoolean(firstValue(value, ["is_public", "isPublic", "public"]), false),
    rolePermissions: ensureArray(firstValue(value, ["role_permissions", "rolePermissions"]))
      .map((entry) => normalizeRolePermission(entry))
      .filter((entry): entry is MenuRolePermission => entry !== null),
    supportedActions: extractSupportedActions(value),
    children,
    raw: value,
  };
};

export const flattenMenuRecords = (items: MenuRecord[]): MenuRecord[] =>
  items.flatMap((item) => [item, ...flattenMenuRecords(item.children)]);

export const buildMenuTree = (items: MenuRecord[]): MenuRecord[] => {
  const records = items.map((item) => ({
    ...item,
    children: [],
  }));

  const map = new Map<string, MenuRecord>();
  records.forEach((item) => {
    map.set(String(item.id), item);
  });

  const roots: MenuRecord[] = [];

  records.forEach((item) => {
    if (item.parentId !== null) {
      const parent = map.get(String(item.parentId));
      if (parent) {
        parent.children.push(item);
        return;
      }
    }

    roots.push(item);
  });

  const sortTree = (nodes: MenuRecord[]): MenuRecord[] =>
    [...nodes]
      .sort((left, right) => {
        if (left.order !== right.order) {
          return left.order - right.order;
        }

        return left.name.localeCompare(right.name);
      })
      .map((node) => ({
        ...node,
        children: sortTree(node.children),
      }));

  return sortTree(roots);
};

export const normalizeMenuList = (value: unknown): MenuRecord[] => {
  const collection = isRecord(value)
    ? extractCollection(value, ["menus", "data", "result", "items", "rows"])
    : ensureArray(value);

  const normalized = collection
    .map((item, index) => normalizeMenuNode(item, index))
    .filter((item): item is MenuRecord => item !== null);

  const deduped = Array.from(
    normalized
      .flatMap((item) => flattenMenuRecords([item]))
      .reduce<Map<string, MenuRecord>>((map, item) => {
        map.set(String(item.id), { ...item, children: [] });
        return map;
      }, new Map())
      .values()
  );

  return buildMenuTree(deduped);
};

export const normalizeAccessibleMenus = (value: unknown): AppMenuItem[] =>
  normalizeMenuItems(value);

const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => toStringValue(entry))
    .filter(Boolean);
};

const normalizeRolePermission = (value: unknown): MenuRolePermission | null => {
  if (!isRecord(value)) {
    return null;
  }

  const roleId = toIdentifier(firstValue(value, ["role_id", "roleId", "id"]));
  if (roleId === null) {
    return null;
  }

  return {
    roleId,
    roleName: firstString(value, ["role_name", "roleName", "name", "label"]) || undefined,
    actions: normalizeStringList(firstValue(value, ["actions", "permissions", "allowed_actions", "allowedActions"])),
  };
};

const extractSupportedActions = (value: unknown): string[] => {
  if (!isRecord(value)) {
    return [];
  }

  const direct = normalizeStringList(
    firstValue(value, ["supported_actions", "supportedActions", "actions"])
  );

  if (direct.length > 0) {
    return direct;
  }

  const meta = isRecord(value.meta) ? value.meta : null;
  if (meta) {
    const metaActions = normalizeStringList(
      firstValue(meta, ["supported_actions", "supportedActions", "actions"])
    );
    if (metaActions.length > 0) {
      return metaActions;
    }
  }

  return [];
};

const extractRequestFields = (value: unknown): string[] => {
  if (!isRecord(value)) {
    return [];
  }

  const direct = normalizeStringList(firstValue(value, ["request_fields", "requestFields"]));
  if (direct.length > 0) {
    return direct;
  }

  const meta = isRecord(value.meta) ? value.meta : null;
  if (meta) {
    return normalizeStringList(firstValue(meta, ["request_fields", "requestFields"]));
  }

  return [];
};

export const extractMenuContractMeta = (value: unknown): MenuContractMeta => ({
  supportedActions: extractSupportedActions(value),
  requestFields: extractRequestFields(value),
});
