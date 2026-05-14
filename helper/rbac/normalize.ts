import {
  AccessIdentifier,
  AccessSnapshot,
  AccessUserSummary,
  AppMenuItem,
  PermissionDefinition,
  RoleDefinition,
  UserAccessDetails,
} from "@/types/rbac";

type LooseRecord = Record<string, unknown>;

const ADMIN_SEGMENTS = new Set([
  "courses",
  "invoices",
  "enrollments",
  "settings",
  "rbac",
  "users",
  "roles",
  "access",
]);

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

const toIdentifier = (value: unknown): AccessIdentifier | null => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
};

const uniqueStrings = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean)));

const uniqueIdentifiers = (values: Array<AccessIdentifier | null>): AccessIdentifier[] =>
  Array.from(new Set(values.filter((value): value is AccessIdentifier => value !== null)));

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

const humanize = (value: string): string =>
  value
    .replace(/[_./:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const normalizeName = (value: string, fallback = "Untitled"): string => {
  const trimmed = value.trim();
  return trimmed || fallback;
};

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

  for (const key of keys) {
    if (isRecord(value[key])) {
      const nested = extractCollection(value[key], keys, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
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

const extractRecord = (value: unknown, keys: string[], depth = 0): LooseRecord | null => {
  if (!isRecord(value) || depth > 5) {
    return null;
  }

  for (const key of keys) {
    if (isRecord(value[key])) {
      return value[key];
    }
  }

  for (const key of keys) {
    if (isRecord(value[key])) {
      const nested = extractRecord(value[key], keys, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }

  for (const nestedValue of Object.values(value)) {
    if (isRecord(nestedValue)) {
      const nested = extractRecord(nestedValue, keys, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }

  return value;
};

const derivePermissionGroup = (permissionKey: string, sourceGroup?: string): string => {
  if (sourceGroup) {
    return humanize(sourceGroup.split(/[.:/]/)[0] || sourceGroup);
  }

  const derived = permissionKey.split(/[.:/]/)[0];
  return humanize(derived || "General");
};

const buildDisplayName = (input: LooseRecord): string => {
  const firstName = firstString(input, ["first_name", "firstName"]);
  const lastName = firstString(input, ["last_name", "lastName"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  return normalizeName(
    firstString(input, ["full_name", "fullName", "name", "userName", "username", "email"]),
    "Unknown User"
  );
};

export const normalizePermission = (value: unknown): PermissionDefinition => {
  if (!isRecord(value)) {
    const rawKey = toStringValue(value);
    const key = rawKey || "unknown.permission";

    return {
      key,
      label: humanize(rawKey || "Unknown Permission"),
      group: derivePermissionGroup(key),
      raw: value,
    };
  }

  const key =
    firstString(value, ["slug", "code", "key", "permission", "name", "permission_name", "permissionName"]) ||
    "unknown.permission";

  const label =
    firstString(value, ["label", "display_name", "displayName", "title", "name"]) || humanize(key);

  const resource =
    firstString(value, ["resource", "module", "category", "section"]) ||
    key.split(/[.:/]/)[0] ||
    undefined;

  const action =
    firstString(value, ["action"]) ||
    key.split(/[.:/]/)[1] ||
    undefined;

  return {
    id:
      toIdentifier(firstValue(value, ["id", "permission_id", "permissionId"])) ?? undefined,
    key,
    label,
    description: firstString(value, ["description", "details", "help_text", "helpText", "note"]) || undefined,
    group: derivePermissionGroup(key, firstString(value, ["group", "module", "category", "resource", "section"])),
    action,
    resource,
    raw: value,
  };
};

export const normalizePermissionList = (value: unknown): PermissionDefinition[] => {
  const collection = isRecord(value)
    ? extractCollection(value, ["permissions", "data", "result", "items"])
    : ensureArray(value);

  return collection
    .map((permission) => normalizePermission(permission))
    .filter((permission, index, permissions) =>
      permissions.findIndex((candidate) => candidate.key === permission.key) === index
    );
};

export const normalizeRole = (value: unknown): RoleDefinition => {
  if (!isRecord(value)) {
    const rawName = toStringValue(value);
    const name = normalizeName(rawName, "Unnamed Role");
    const key = slugify(rawName || "role");

    return {
      id: rawName || key || "role",
      key: key || "role",
      name,
      permissions: [],
      permissionIds: [],
      raw: value,
    };
  }

  const name = normalizeName(
    firstString(value, ["name", "title", "display_name", "displayName", "label", "role"]),
    "Unnamed Role"
  );

  const key =
    firstString(value, ["slug", "code", "key"]) ||
    slugify(name) ||
    "role";

  const permissionCollection = extractCollection(value, [
    "permissions",
    "permission_list",
    "permissionList",
    "effective_permissions",
  ]);

  const permissions = normalizePermissionList(permissionCollection).map((permission) => permission.key);

  const explicitPermissionIds = ensureArray(firstValue(value, ["permission_ids", "permissionIds"]))
    .map((identifier) => toIdentifier(identifier));

  const permissionIds = uniqueIdentifiers([
    ...explicitPermissionIds,
    ...normalizePermissionList(permissionCollection).map((permission) => permission.id ?? null),
  ]);

  return {
    id:
      toIdentifier(firstValue(value, ["id", "role_id", "roleId"])) ??
      key,
    key,
    name,
    description: firstString(value, ["description", "details", "note"]) || undefined,
    permissions: uniqueStrings(permissions),
    permissionIds,
    raw: value,
  };
};

export const normalizeRoleList = (value: unknown): RoleDefinition[] => {
  const collection = isRecord(value)
    ? extractCollection(value, ["roles", "data", "result", "items"])
    : ensureArray(value);

  return collection
    .map((role) => normalizeRole(role))
    .filter((role, index, roles) => roles.findIndex((candidate) => candidate.id === role.id) === index);
};

export const normalizeUserSummary = (value: unknown): AccessUserSummary => {
  if (!isRecord(value)) {
    const rawName = toStringValue(value);
    return {
      id: rawName || "user",
      name: normalizeName(rawName, "Unknown User"),
      roles: [],
      roleIds: [],
      raw: value,
    };
  }

  const userRecord = isRecord(value.user) ? value.user : value;
  const roles = normalizeRoleList(
    extractCollection(value, ["roles", "assigned_roles", "user_roles", "role_list"]).length > 0
      ? extractCollection(value, ["roles", "assigned_roles", "user_roles", "role_list"])
      : firstValue(userRecord, ["roles", "role_names", "roleNames"])
  );

  const explicitRoleIds = ensureArray(firstValue(value, ["role_ids", "roleIds"]))
    .map((identifier) => toIdentifier(identifier));

  return {
    id:
      toIdentifier(firstValue(userRecord, ["id", "user_id", "userId"])) ??
      toIdentifier(firstValue(value, ["id", "user_id", "userId"])) ??
      buildDisplayName(userRecord),
    name: buildDisplayName(userRecord),
    email: firstString(userRecord, ["email", "user_email", "userEmail"]) || undefined,
    status:
      firstString(userRecord, ["status", "state"]) ||
      (typeof userRecord.isStatus === "number"
        ? userRecord.isStatus === 1
          ? "Active"
          : "Inactive"
        : undefined),
    roles: uniqueStrings(roles.map((role) => role.name)),
    roleIds: uniqueIdentifiers([...explicitRoleIds, ...roles.map((role) => toIdentifier(role.id))]),
    raw: value,
  };
};

export const normalizeUserSummaryList = (value: unknown): AccessUserSummary[] => {
  const collection = isRecord(value)
    ? extractCollection(value, ["users", "data", "result", "items", "rows"])
    : ensureArray(value);

  return collection
    .map((user) => normalizeUserSummary(user))
    .filter((user, index, users) => users.findIndex((candidate) => candidate.id === user.id) === index);
};

export const normalizeUserAccess = (value: unknown): UserAccessDetails => {
  const source = extractRecord(value, ["data", "result", "access"]) ?? (isRecord(value) ? value : null);
  const summarySource = source ?? value;
  const summary = normalizeUserSummary(summarySource);
  const userRecord = source && isRecord(source.user) ? source.user : source;

  const permissions = normalizePermissionList(
    source
      ? extractCollection(source, ["permissions", "effective_permissions", "effectivePermissions"])
      : []
  ).map((permission) => permission.key);

  const directPermissions = normalizePermissionList(
    source
      ? extractCollection(source, [
          "direct_permissions",
          "directPermissions",
          "permission_overrides",
          "overrides",
        ])
      : []
  ).map((permission) => permission.key);

  return {
    ...summary,
    permissions: uniqueStrings(permissions),
    directPermissions: uniqueStrings(directPermissions),
    user: userRecord,
  };
};

const normalizeMenuPath = (rawPath: string): string => {
  if (!rawPath) {
    return "";
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const withSlashes = rawPath.replace(/\\/g, "/").trim();
  const normalized = withSlashes.startsWith("/") ? withSlashes : `/${withSlashes}`;

  if (normalized.startsWith("/admin/") || normalized === "/admin") {
    return normalized;
  }

  if (normalized.startsWith("/login") || normalized.startsWith("/register")) {
    return normalized;
  }

  if (normalized.startsWith("/admin")) {
    return normalized;
  }

  const withoutLeadingSlash = normalized.replace(/^\/+/, "");
  const firstSegment = withoutLeadingSlash.split("/")[0];

  if (withoutLeadingSlash.startsWith("admin/")) {
    return `/${withoutLeadingSlash}`;
  }

  if (ADMIN_SEGMENTS.has(firstSegment)) {
    return `/admin/${withoutLeadingSlash}`;
  }

  return normalized;
};

const normalizeMenuItem = (value: unknown, index: number): AppMenuItem | null => {
  if (!isRecord(value)) {
    const name = toStringValue(value);

    if (!name) {
      return null;
    }

    const fallbackPath = normalizeMenuPath(name);

    return {
      id: `${fallbackPath || slugify(name) || index}`,
      name: humanize(name),
      path: fallbackPath,
      children: [],
      raw: value,
    };
  }

  const children = extractCollection(value, ["children", "submenus", "submenu", "items", "menu"])
    .map((item, childIndex) => normalizeMenuItem(item, childIndex))
    .filter((item): item is AppMenuItem => item !== null);

  const name = normalizeName(
    firstString(value, ["name", "label", "title", "menu_name", "menuName"]),
    "Untitled Menu"
  );

  const path = normalizeMenuPath(firstString(value, ["path", "url", "route", "href", "link"]));
  const id =
    toStringValue(firstValue(value, ["id", "menu_id", "menuId"])) ||
    path ||
    slugify(name) ||
    `menu-${index}`;

  if (!path && children.length === 0) {
    return null;
  }

  return {
    id,
    name,
    path,
    icon: firstString(value, ["icon", "icon_name", "iconName"]) || undefined,
    children,
    raw: value,
  };
};

export const normalizeMenuItems = (value: unknown): AppMenuItem[] => {
  const collection = extractCollection(value, ["menu", "menus", "navigation", "sidebar", "items", "data", "result"]);

  const source = collection.length > 0 ? collection : ensureArray(value);

  return source
    .map((item, index) => normalizeMenuItem(item, index))
    .filter((item): item is AppMenuItem => item !== null);
};

export const flattenMenuItems = (menuItems: AppMenuItem[]): AppMenuItem[] => {
  return menuItems.flatMap((item) => [item, ...flattenMenuItems(item.children)]);
};

export const normalizeAccessSnapshot = (value: unknown): AccessSnapshot => {
  const source = extractRecord(value, ["data", "result"]) ?? value;
  const access = normalizeUserAccess(source);
  const embeddedMenu =
    isRecord(source) && (source.menu || source.menus || source.navigation || source.sidebar)
      ? normalizeMenuItems(
          source.menu ?? source.menus ?? source.navigation ?? source.sidebar
        )
      : [];

  return {
    user: access.user ?? null,
    roles: access.roles,
    roleIds: access.roleIds,
    permissions: access.permissions,
    directPermissions: access.directPermissions,
    menu: embeddedMenu,
  };
};
