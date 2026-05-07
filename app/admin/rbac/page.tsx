"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaLock, FaPlus, FaRedoAlt, FaSearch, FaShieldAlt, FaUsers,
  FaTimes, FaChevronDown, FaChevronRight, FaCheckCircle,
  FaExclamationCircle, FaSpinner, FaUserCog, FaLayerGroup
} from "react-icons/fa";

import {
  assignRbacUserRoles,
  createRbacRole,
  getRbacPermissions,
  getRbacRoles,
  getRbacUserAccess,
  getRbacUsers,
  updateRbacRolePermissions,
  updateRbacUserPermissions,
} from "@/apis/rbac/rbac.api";
import {
  normalizePermissionList,
  normalizeRoleList,
  normalizeUserAccess,
  normalizeUserSummaryList,
} from "@/helper/rbac/normalize";
import {
  AccessIdentifier,
  AccessUserSummary,
  PermissionDefinition,
  RoleDefinition,
  UserAccessDetails,
} from "@/types/rbac";

type AccessTab = "roles" | "users";

const idsMatch = (left: AccessIdentifier | null, right: AccessIdentifier | null) =>
  left !== null && right !== null && String(left) === String(right);

const toggleStringSelection = (items: string[], value: string) =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

const toggleIdentifierSelection = (items: AccessIdentifier[], value: AccessIdentifier) =>
  items.some((item) => String(item) === String(value))
    ? items.filter((item) => String(item) !== String(value))
    : [...items, value];

const getErrorMessage = (error: unknown) => {
  const appError = error as { error?: { message?: string }; message?: string };
  return appError?.error?.message || appError?.message || "Something went wrong. Please try again.";
};

// Updated color classes using opsh-* colors
const sectionCardClass = "rounded-2xl border border-opsh-grey bg-white shadow-opsh-sm hover:shadow-opsh-md transition-all-smooth";
const buttonPrimaryClass = "inline-flex items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-primary-hover transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed";
const buttonSecondaryClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-opsh-secondary px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-secondary-hover transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed";
const buttonOutlineClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-opsh-grey bg-white px-4 py-2.5 text-sm font-medium text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed";

// Loading Skeleton Component
const SkeletonLoader = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-opsh-grey rounded ${className}`} />
);

// Permission Group Component
const PermissionGroup = ({
  groupName,
  permissions,
  selectedKeys,
  onChange,
  expanded,
  onToggleExpand,
}: {
  groupName: string;
  permissions: PermissionDefinition[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) => {
  const groupKeys = permissions.map((p) => p.key);
  const allSelected = groupKeys.every((key) => selectedKeys.includes(key));
  const selectedCount = groupKeys.filter((key) => selectedKeys.includes(key)).length;

  return (
    <div className="rounded-xl border border-opsh-grey bg-white overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-opsh-background-muted transition-colors-smooth text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-opsh-primary">
            {expanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-opsh-black">{groupName}</h3>
            <p className="text-xs text-opsh-text-dark mt-0.5">
              {selectedCount} of {permissions.length} selected
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(
              allSelected
                ? selectedKeys.filter((key) => !groupKeys.includes(key))
                : Array.from(new Set([...selectedKeys, ...groupKeys]))
            );
          }}
          className="rounded-lg border border-opsh-grey bg-white px-3 py-1 text-xs font-medium text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </button>

      {expanded && (
        <div className="border-t border-opsh-grey p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {permissions.map((permission) => (
              <label
                key={permission.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-opsh-background-muted transition-colors-smooth"
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(permission.key)}
                  onChange={() => onChange(toggleStringSelection(selectedKeys, permission.key))}
                  className="mt-0.5 h-4 w-4 rounded border-opsh-primary text-opsh-success focus:ring-opsh-success focus:ring-2"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-opsh-black">{permission.label}</p>
                  <p className="mt-0.5 text-xs font-mono text-opsh-muted">{permission.key}</p>
                  {permission.description && (
                    <p className="mt-1 text-xs text-opsh-text-dark">{permission.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Search Input Component
const SearchInput = ({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="relative">
    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted text-sm" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-opsh-grey py-2.5 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 focus:border-opsh-primary"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-opsh-muted hover:text-opsh-primary"
      >
        <FaTimes size={12} />
      </button>
    )}
  </div>
);

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="bg-white rounded-xl shadow-opsh-sm border border-opsh-grey p-6 hover:shadow-opsh-md transition-all-smooth">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-opsh-muted">{label}</p>
        <p className="text-3xl font-bold text-opsh-black mt-2">{value}</p>
      </div>
      <div className="w-12 h-12 bg-opsh-primary/10 rounded-lg flex items-center justify-center">
        <Icon size={22} className="text-opsh-secondary" />
      </div>
    </div>
  </div>
);

export default function RbacPage() {
  const [activeTab, setActiveTab] = useState<AccessTab>("roles");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingUserRoles, setSavingUserRoles] = useState(false);
  const [savingUserPermissions, setSavingUserPermissions] = useState(false);

  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [users, setUsers] = useState<AccessUserSummary[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<AccessIdentifier | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<AccessIdentifier | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [selectedUserRoleIds, setSelectedUserRoleIds] = useState<AccessIdentifier[]>([]);
  const [selectedUserDirectPermissions, setSelectedUserDirectPermissions] = useState<string[]>([]);
  const [selectedUserAccess, setSelectedUserAccess] = useState<UserAccessDetails | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const loadUserAccess = async (userId: AccessIdentifier) => {
    setAccessLoading(true);
    try {
      const response = await getRbacUserAccess(userId);
      const access = normalizeUserAccess(response.data);
      setSelectedUserAccess(access);
      setSelectedUserRoleIds(access.roleIds);
      setSelectedUserDirectPermissions(access.directPermissions);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSelectedUserAccess(null);
      setSelectedUserRoleIds([]);
      setSelectedUserDirectPermissions([]);
    } finally {
      setAccessLoading(false);
    }
  };

  const loadData = useCallback(async (
    quiet = false,
    preferredRoleId: AccessIdentifier | null = null,
    preferredUserId: AccessIdentifier | null = null,
    withUserAccess = false
  ) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [permissionResponse, roleResponse, userResponse] = await Promise.all([
        getRbacPermissions(),
        getRbacRoles(),
        getRbacUsers(),
      ]);

      const nextPermissions = normalizePermissionList(permissionResponse.data);
      const nextRoles = normalizeRoleList(roleResponse.data);
      const nextUsers = normalizeUserSummaryList(userResponse.data);

      setPermissions(nextPermissions);
      setRoles(nextRoles);
      setUsers(nextUsers);

      const nextRoleId =
        preferredRoleId && nextRoles.some((role) => idsMatch(role.id, preferredRoleId))
          ? preferredRoleId
          : nextRoles[0]?.id ?? null;
      setSelectedRoleId(nextRoleId);

      const nextUserId =
        preferredUserId && nextUsers.some((user) => idsMatch(user.id, preferredUserId))
          ? preferredUserId
          : nextUsers[0]?.id ?? null;
      setSelectedUserId(nextUserId);

      if (withUserAccess && nextUserId !== null) {
        await loadUserAccess(nextUserId);
      } else {
        setSelectedUserAccess((current) =>
          current && nextUserId !== null && idsMatch(current.id, nextUserId) ? current : null
        );
        setSelectedUserRoleIds((current) =>
          current.length > 0 && nextUserId !== null ? current : []
        );
        setSelectedUserDirectPermissions((current) =>
          current.length > 0 && nextUserId !== null ? current : []
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab !== "users" || selectedUserId === null) {
      return;
    }

    if (selectedUserAccess && idsMatch(selectedUserAccess.id, selectedUserId)) {
      return;
    }

    void loadUserAccess(selectedUserId);
  }, [activeTab, selectedUserId, selectedUserAccess]);

  useEffect(() => {
    const role = roles.find((item) => idsMatch(item.id, selectedRoleId));
    setSelectedRolePermissions(role?.permissions ?? []);
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((role) => idsMatch(role.id, selectedRoleId)) ?? null;
  const selectedUser = users.find((user) => idsMatch(user.id, selectedUserId)) ?? null;

  const visibleRoles = useMemo(() => roles.filter((role) => {
    const query = roleSearch.trim().toLowerCase();
    return !query || [role.name, role.description, role.key].some((value) => value?.toLowerCase().includes(query));
  }), [roles, roleSearch]);

  const visibleUsers = useMemo(() => users.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    return !query || [user.name, user.email, user.roles.join(" ")].some((value) => value?.toLowerCase().includes(query));
  }), [users, userSearch]);

  const filteredPermissions = useMemo(() => permissions.filter((permission) => {
    const query = permissionSearch.trim().toLowerCase();
    return (
      !query ||
      [permission.label, permission.key, permission.group, permission.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }), [permissions, permissionSearch]);

  const permissionGroups = useMemo(() => {
    return filteredPermissions.reduce<Record<string, PermissionDefinition[]>>((groups, permission) => {
      const key = permission.group || "General";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(permission);
      return groups;
    }, {});
  }, [filteredPermissions]);

  const permissionEntries = useMemo(() => Object.entries(permissionGroups).sort(([left], [right]) => left.localeCompare(right)), [permissionGroups]);

  const buildPermissionPayload = (permissionKeys: string[]) => {
    const uniqueKeys = Array.from(new Set(permissionKeys));
    const permissionIds = permissions
      .filter((permission) => uniqueKeys.includes(permission.key))
      .map((permission) => permission.id)
      .filter((id): id is AccessIdentifier => id !== undefined);

    return { permissions: uniqueKeys, permissionIds };
  };

  const buildRoleAssignmentPayload = (roleIds: AccessIdentifier[]) => ({
    roles: roles.filter((role) => roleIds.some((roleId) => idsMatch(role.id, roleId))).map((role) => role.name),
    roleIds,
  });

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required.");
      return;
    }

    setCreatingRole(true);
    try {
      await createRbacRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        ...buildPermissionPayload([]),
      });
      toast.success("Role created successfully.");
      setNewRoleName("");
      setNewRoleDescription("");
      await loadData(true, selectedRoleId, selectedUserId, false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreatingRole(false);
    }
  };

  const handleSaveRole = async () => {
    if (!selectedRole) {
      toast.error("Select a role first.");
      return;
    }

    setSavingRole(true);
    try {
      await updateRbacRolePermissions(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description,
        ...buildPermissionPayload(selectedRolePermissions),
      });
      toast.success("Role permissions updated.");
      await loadData(true, selectedRole.id, selectedUserId, false);
      setSelectedRoleId(selectedRole.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveUserRoles = async () => {
    if (!selectedUserId) {
      toast.error("Select a user first.");
      return;
    }

    setSavingUserRoles(true);
    try {
      await assignRbacUserRoles(selectedUserId, buildRoleAssignmentPayload(selectedUserRoleIds));
      toast.success("User roles updated.");
      await loadData(true, selectedRoleId, selectedUserId, true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingUserRoles(false);
    }
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUserId) {
      toast.error("Select a user first.");
      return;
    }

    setSavingUserPermissions(true);
    try {
      await updateRbacUserPermissions(selectedUserId, buildPermissionPayload(selectedUserDirectPermissions));
      toast.success("User permission overrides updated.");
      await loadData(true, selectedRoleId, selectedUserId, true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingUserPermissions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-background-dark to-opsh-background px-4 py-5 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
        <h5 className="hidden text-sm text-opsh-secondary md:block">Role & Access Management</h5>
        <hr className="flex-grow w-full mt-2 border-opsh-grey border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
        <h5 className="hidden text-sm md:block">Data Overview</h5>
        <h5 className="hidden text-sm text-opsh-muted md:block">Security Console</h5>
      </div>
      
      <div className="mb-5 rounded">
        <div className="grid gap-3 md:grid-cols-4">
          <StatsCard icon={FaShieldAlt} label="Permissions" value={permissions.length} />
          <StatsCard icon={FaLayerGroup} label="Roles" value={roles.length} />
          <StatsCard icon={FaUsers} label="Users" value={users.length} />
          <button
            type="button"
            onClick={() => void loadData(true, selectedRoleId, selectedUserId, activeTab === "users")}
            disabled={refreshing}
            className={buttonOutlineClass + " bg-opsh-background-muted/30 hover:bg-opsh-background-muted"}
          >
            {refreshing ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
            Refresh data
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="">
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all-smooth ${
              activeTab === "roles"
                ? "bg-opsh-primary text-white shadow-opsh-md"
                : "bg-white text-opsh-text-dark hover:bg-opsh-background-muted border border-opsh-grey"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaLayerGroup size={14} />
              Roles & Permissions
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all-smooth ${
              activeTab === "users"
                ? "bg-opsh-primary text-white shadow-opsh-md"
                : "bg-white text-opsh-text-dark hover:bg-opsh-background-muted border border-opsh-grey"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaUserCog size={14} />
              User Access
            </div>
          </button>
        </div>

        {activeTab === "roles" ? (
          <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
            {/* Left Sidebar - Role List */}
            <div className="space-y-6">
              {/* Create Role Card */}
              <div className={sectionCardClass + " p-5"}>
                <h2 className="text-base font-semibold text-opsh-black">Create New Role</h2>
                <p className="mt-1 text-xs text-opsh-text-dark">Define a new role with initial permissions</p>
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(event) => setNewRoleName(event.target.value)}
                    placeholder="Role name *"
                    className="w-full rounded-xl border border-opsh-grey px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 focus:border-opsh-primary transition-all"
                  />
                  <textarea
                    value={newRoleDescription}
                    onChange={(event) => setNewRoleDescription(event.target.value)}
                    placeholder="Role description (optional)"
                    rows={3}
                    className="w-full rounded-xl border border-opsh-grey px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 focus:border-opsh-primary transition-all resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateRole}
                    disabled={creatingRole}
                    className={buttonSecondaryClass + " w-full"}
                  >
                    {creatingRole ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                    {creatingRole ? "Creating..." : "Create Role"}
                  </button>
                </div>
              </div>

              {/* Role List Card */}
              <div className={sectionCardClass + " p-5"}>
                <SearchInput
                  value={roleSearch}
                  onChange={setRoleSearch}
                  placeholder="Search roles..."
                />
                <div className="mt-4 space-y-2 overflow-y-auto max-h-[600px]">
                  {visibleRoles.length === 0 ? (
                    <div className="text-center py-8">
                      <FaTimes className="mx-auto text-opsh-muted text-2xl" />
                      <p className="mt-2 text-sm text-opsh-text-dark">No roles found</p>
                    </div>
                  ) : (
                    visibleRoles.map((role) => (
                      <button
                        key={String(role.id)}
                        type="button"
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all-smooth ${
                          idsMatch(role.id, selectedRoleId)
                            ? "border-opsh-success bg-opsh-success/10 ring-2 ring-opsh-success/20"
                            : "border-opsh-grey hover:border-opsh-primary hover:shadow-opsh-sm"
                        }`}
                      >
                        <p className="font-semibold text-opsh-black">{role.name}</p>
                        <p className="mt-1 text-xs text-opsh-text-dark line-clamp-2">
                          {role.description || "No description provided"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-opsh-background px-2 py-0.5 text-xs text-opsh-text-dark">
                            {role.permissions.length} permissions
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Role Editor */}
            <div className={sectionCardClass + " p-6"}>
              {selectedRole ? (
                <>
                  <div className="mb-6 flex flex-col gap-4 border-b border-opsh-grey pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaLayerGroup className="text-opsh-success text-sm" />
                        <p className="text-xs font-medium uppercase tracking-wider text-opsh-success">Editing Role</p>
                      </div>
                      <h2 className="text-2xl font-bold text-opsh-black">{selectedRole.name}</h2>
                      <p className="mt-2 text-sm text-opsh-text-dark">{selectedRole.description || "No description available."}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-opsh-muted">
                        <span>ID: {String(selectedRole.id)}</span>
                        {selectedRole.key && <span>• Key: {selectedRole.key}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveRole}
                      disabled={savingRole}
                      className={buttonPrimaryClass}
                    >
                      {savingRole ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                      {savingRole ? "Saving..." : "Save Permissions"}
                    </button>
                  </div>

                  <SearchInput
                    value={permissionSearch}
                    onChange={setPermissionSearch}
                    placeholder="Search permissions..."
                  />

                  <div className="mt-4 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {permissionEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <FaSearch className="mx-auto text-opsh-muted text-3xl" />
                        <p className="mt-3 text-sm text-opsh-text-dark">No permissions match your search</p>
                      </div>
                    ) : (
                      permissionEntries.map(([groupName, groupPermissions]) => (
                        <PermissionGroup
                          key={groupName}
                          groupName={groupName}
                          permissions={groupPermissions}
                          selectedKeys={selectedRolePermissions}
                          onChange={setSelectedRolePermissions}
                          expanded={expandedGroups.has(groupName)}
                          onToggleExpand={() => toggleGroup(groupName)}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[500px] items-center justify-center rounded-xl border-2 border-dashed border-opsh-grey bg-opsh-background-muted/50 text-center">
                  <div>
                    <FaLock className="mx-auto text-opsh-muted text-4xl" />
                    <p className="mt-4 text-lg font-semibold text-opsh-black">No role selected</p>
                    <p className="mt-2 text-sm text-opsh-text-dark">Choose a role from the list to manage its permissions.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
            {/* Left Sidebar - User List */}
            <div className={sectionCardClass + " p-5"}>
              <SearchInput
                value={userSearch}
                onChange={setUserSearch}
                placeholder="Search users..."
              />
              <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto">
                {visibleUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="mx-auto text-opsh-muted text-2xl" />
                    <p className="mt-2 text-sm text-opsh-text-dark">No users found</p>
                  </div>
                ) : (
                  visibleUsers.map((user) => (
                    <button
                      key={String(user.id)}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        void loadUserAccess(user.id);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition-all-smooth ${
                        idsMatch(user.id, selectedUserId)
                          ? "border-opsh-success bg-opsh-success/10 ring-2 ring-opsh-success/20"
                          : "border-opsh-grey hover:border-opsh-primary"
                      }`}
                    >
                      <p className="font-semibold text-opsh-black">{user.name}</p>
                      <p className="mt-0.5 text-xs text-opsh-text-dark truncate">{user.email || "No email"}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <span key={role} className="inline-flex items-center rounded-full bg-opsh-background px-2 py-0.5 text-xs text-opsh-text-dark">
                            {role}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="inline-flex items-center rounded-full bg-opsh-background px-2 py-0.5 text-xs text-opsh-text-dark">
                            +{user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - User Access Editor */}
            <div className={sectionCardClass + " p-4"}>
              {selectedUser ? (
                accessLoading ? (
                  <div className="space-y-4">
                    <SkeletonLoader className="h-32 w-full" />
                    <SkeletonLoader className="h-64 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="mb-5 border-b border-opsh-grey pb-1">
                      <div className="flex items-center gap-2">
                        <FaUserCog className="text-opsh-secondary text-lg" />
                        <p className="text-xxs font-medium uppercase tracking-wider text-opsh-secondary">User Access Details</p>
                      </div>
                      <div className="flex justify-between">
                        <div className="">
                          <h2 className="text-lg font-bold text-opsh-primary">{selectedUser.name}</h2>
                          <p className="text-sm text-opsh-muted">{selectedUser.email || "No email available"}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs text-opsh-text-dark">Assigned Roles</p>
                            <p className="text-sm font-semibold text-opsh-black">{selectedUserRoleIds.length}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs text-opsh-text-dark">Effective Permissions</p>
                            <p className="text-sm font-semibold text-opsh-black">{selectedUserAccess?.permissions.length ?? 0}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs text-opsh-text-dark">Direct Overrides</p>
                            <p className="text-sm font-semibold text-opsh-black">{selectedUserDirectPermissions.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 2xl:grid-cols-[360px,minmax(0,1fr)]">
                      {/* Role Assignment Section */}
                      <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-base font-semibold text-opsh-black">Assign Roles</h3>
                            <p className="mt-0.5 text-xs text-opsh-text-dark">Manage user's role memberships</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveUserRoles}
                            disabled={savingUserRoles}
                            className={buttonPrimaryClass + " text-sm px-3 py-2"}
                          >
                            {savingUserRoles ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            {savingUserRoles ? "Saving..." : "Save"}
                          </button>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {roles.map((role) => (
                            <label key={String(role.id)} className="flex items-center gap-3 rounded-lg p-3 hover:bg-white transition-colors-smooth cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedUserRoleIds.some((roleId) => idsMatch(roleId, role.id))}
                                onChange={() =>
                                  setSelectedUserRoleIds((current) => toggleIdentifierSelection(current, role.id))
                                }
                                className="h-4 w-4 rounded border-opsh-primary text-opsh-success focus:ring-opsh-success focus:ring-2"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-opsh-black">{role.name}</p>
                                <p className="text-xs text-opsh-text-dark">{role.permissions.length} permissions</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Direct Permissions & Effective Permissions */}
                      <div className="space-y-6">
                        {/* Direct Permission Overrides */}
                        <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-base font-semibold text-opsh-black">Direct Permission Overrides</h3>
                              <p className="mt-0.5 text-xs text-opsh-text-dark">Explicitly grant or override permissions</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleSaveUserPermissions}
                              disabled={savingUserPermissions}
                              className={buttonSecondaryClass + " text-sm px-3 py-2"}
                            >
                              {savingUserPermissions ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                              {savingUserPermissions ? "Saving..." : "Save Overrides"}
                            </button>
                          </div>

                          <SearchInput
                            value={permissionSearch}
                            onChange={setPermissionSearch}
                            placeholder="Search permissions..."
                          />

                          <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {permissionEntries.length === 0 ? (
                              <div className="text-center py-8">
                                <FaExclamationCircle className="mx-auto text-opsh-muted text-2xl" />
                                <p className="mt-2 text-sm text-opsh-text-dark">No permissions match your search</p>
                              </div>
                            ) : (
                              permissionEntries.map(([groupName, groupPermissions]) => (
                                <PermissionGroup
                                  key={groupName}
                                  groupName={groupName}
                                  permissions={groupPermissions}
                                  selectedKeys={selectedUserDirectPermissions}
                                  onChange={setSelectedUserDirectPermissions}
                                  expanded={expandedGroups.has(groupName)}
                                  onToggleExpand={() => toggleGroup(groupName)}
                                />
                              ))
                            )}
                          </div>
                        </div>

                        {/* Effective Permissions Summary */}
                        <div className="rounded-xl border border-opsh-grey bg-opsh-success/5 p-5">
                          <h3 className="text-base font-semibold text-opsh-black mb-3">Effective Permissions</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedUserAccess?.permissions.length ? (
                              selectedUserAccess.permissions.map((permissionKey) => (
                                <span key={permissionKey} className="inline-flex items-center gap-1 rounded-full bg-opsh-success/10 px-3 py-1 text-xs font-medium text-opsh-success">
                                  <FaCheckCircle size={10} />
                                  {permissionKey}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-opsh-text-dark">No effective permissions granted.</p>
                            )}
                          </div>
                          {selectedUserAccess?.permissions.length > 0 && (
                            <p className="mt-3 text-xs text-opsh-text-dark">
                              These permissions are derived from assigned roles and direct overrides.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <div className="flex min-h-[500px] items-center justify-center rounded-xl border-2 border-dashed border-opsh-grey bg-opsh-background-muted/50 text-center">
                  <div>
                    <FaUsers className="mx-auto text-opsh-muted text-4xl" />
                    <p className="mt-4 text-lg font-semibold text-opsh-black">No user selected</p>
                    <p className="mt-2 text-sm text-opsh-text-dark">Choose a user from the list to inspect access details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}