"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaEye,
  FaList,
  FaPlus,
  FaProjectDiagram,
  FaRedoAlt,
  FaSave,
  FaSearch,
  FaSitemap,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

import {
  createMenu,
  deleteMenu,
  getAccessibleMenus,
  getMenus,
  reorderMenus,
  syncMenuRolePermissions,
  updateMenu,
} from "@/apis/menu/menu.api";
import {
  buildMenuTree,
  extractMenuContractMeta,
  flattenMenuRecords,
  normalizeAccessibleMenus,
  normalizeMenuList,
} from "@/helper/menu/normalize";
import { getRbacRoles } from "@/apis/rbac/rbac.api";
import { normalizeRoleList } from "@/helper/rbac/normalize";
import { MenuIdentifier, MenuRecord, MenuRolePermission } from "@/types/menu";
import { AppMenuItem, RoleDefinition } from "@/types/rbac";

type ViewTab = "manage" | "accessible";

type MenuFormState = {
  name: string;
  path: string;
  route: string;
  icon: string;
  description: string;
  permissionName: string;
  parentId: string;
  order: string;
  isActive: boolean;
  isPublic: boolean;
  rolePermissions: MenuRolePermission[];
};

const DEFAULT_MENU_ACTIONS = ["view", "create", "edit", "delete", "approve", "export", "upload", "manage"];

// Updated color classes using opsh-* colors
const sectionCardClass = "rounded-2xl border border-opsh-grey bg-white shadow-opsh-sm hover:shadow-opsh-md transition-all-smooth";
const buttonPrimaryClass = "inline-flex items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-primary-hover transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed";
const buttonOutlineClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-opsh-grey bg-white px-4 py-2.5 text-sm font-medium text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass = "w-full rounded-xl border border-opsh-grey px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all";

const emptyFormState = (order = 0): MenuFormState => ({
  name: "",
  path: "",
  route: "",
  icon: "",
  description: "",
  permissionName: "",
  parentId: "",
  order: String(order),
  isActive: true,
  isPublic: false,
  rolePermissions: [],
});

const idsMatch = (left: MenuIdentifier | null, right: MenuIdentifier | null) =>
  left !== null && right !== null && String(left) === String(right);

const getErrorMessage = (error: unknown) => {
  const appError = error as { error?: { message?: string }; message?: string };
  return appError?.error?.message || appError?.message || "Something went wrong. Please try again.";
};

const extractPersistedMenuId = (value: unknown): MenuIdentifier | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const nested = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null;
  const directId = record.id ?? record.menu_id;
  const nestedId = nested?.id ?? nested?.menu_id;
  const resolvedId = nestedId ?? directId;

  return typeof resolvedId === "string" || typeof resolvedId === "number" ? resolvedId : null;
};

const toFormState = (menu: MenuRecord): MenuFormState => ({
  name: menu.name,
  path: menu.path,
  route: menu.route || "",
  icon: menu.icon || "",
  description: menu.description || "",
  permissionName: menu.permissionName || "",
  parentId: menu.parentId === null ? "" : String(menu.parentId),
  order: String(menu.order),
  isActive: menu.isActive,
  isPublic: menu.isPublic,
  rolePermissions: menu.rolePermissions,
});

const flattenMenusWithDepth = (
  items: MenuRecord[],
  depth = 0
): Array<{ menu: MenuRecord; depth: number }> =>
  items.flatMap((menu) => [{ menu, depth }, ...flattenMenusWithDepth(menu.children, depth + 1)]);

const flattenAccessibleMenus = (
  items: AppMenuItem[],
  depth = 0
): Array<{ menu: AppMenuItem; depth: number }> =>
  items.flatMap((menu) => [{ menu, depth }, ...flattenAccessibleMenus(menu.children, depth + 1)]);

const collectDescendantIds = (menu: MenuRecord): Set<string> => {
  const ids = new Set<string>();

  const visit = (items: MenuRecord[]) => {
    items.forEach((item) => {
      ids.add(String(item.id));
      visit(item.children);
    });
  };

  visit(menu.children);
  return ids;
};

const getNextOrder = (menus: MenuRecord[], parentId: MenuIdentifier | null) => {
  const siblings = menus.filter((menu) =>
    parentId === null ? menu.parentId === null : idsMatch(menu.parentId, parentId)
  );

  if (siblings.length === 0) {
    return 0;
  }

  return Math.max(...siblings.map((menu) => menu.order)) + 1;
};

export default function MenuManagerPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("manage");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [accessibleMenus, setAccessibleMenus] = useState<AppMenuItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>([]);
  const [supportedActions, setSupportedActions] = useState<string[]>(DEFAULT_MENU_ACTIONS);
  const [selectedMenuId, setSelectedMenuId] = useState<MenuIdentifier | null>(null);
  const [form, setForm] = useState<MenuFormState>(emptyFormState());
  const [search, setSearch] = useState("");
  const selectedMenuIdRef = useRef<MenuIdentifier | null>(null);

  const allMenus = useMemo(() => flattenMenuRecords(menus), [menus]);
  const selectedMenu = allMenus.find((menu) => idsMatch(menu.id, selectedMenuId)) ?? null;

  useEffect(() => {
    selectedMenuIdRef.current = selectedMenuId;
  }, [selectedMenuId]);

  const loadData = useCallback(
    async (quiet = false, preferredSelectedId?: MenuIdentifier | null) => {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [menusResult, accessibleResult, rolesResult] = await Promise.allSettled([
          getMenus(),
          getAccessibleMenus(),
          getRbacRoles(),
        ]);

        if (menusResult.status === "rejected") {
          throw menusResult.reason;
        }

        const nextMenus = normalizeMenuList(menusResult.value.data);
        const contractMeta = extractMenuContractMeta(menusResult.value);
        setMenus(nextMenus);
        setSupportedActions(
          contractMeta.supportedActions.length > 0 ? contractMeta.supportedActions : DEFAULT_MENU_ACTIONS
        );

        if (accessibleResult.status === "fulfilled") {
          setAccessibleMenus(normalizeAccessibleMenus(accessibleResult.value.data));
        }

        if (rolesResult.status === "fulfilled") {
          setAvailableRoles(normalizeRoleList(rolesResult.value.data));
        }

        const flatMenus = flattenMenuRecords(nextMenus);
        const activeSelectedId =
          preferredSelectedId !== undefined ? preferredSelectedId : selectedMenuIdRef.current;

        const nextSelectedMenu =
          flatMenus.find((menu) => idsMatch(menu.id, activeSelectedId)) ?? flatMenus[0] ?? null;

        selectedMenuIdRef.current = nextSelectedMenu?.id ?? null;
        setSelectedMenuId(nextSelectedMenu?.id ?? null);
        setForm(
          nextSelectedMenu
            ? toFormState(nextSelectedMenu)
            : emptyFormState(getNextOrder(flatMenus, null))
        );
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleMenus = useMemo(() => {
    const query = search.trim().toLowerCase();
    const flattened = flattenMenusWithDepth(menus);

    if (!query) {
      return flattened;
    }

    return flattened.filter(({ menu }) =>
      [menu.name, menu.path, menu.route, menu.icon, menu.description, menu.permissionName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [menus, search]);

  const accessiblePreview = useMemo(
    () => flattenAccessibleMenus(accessibleMenus),
    [accessibleMenus]
  );

  const descendantIds = useMemo(
    () => (selectedMenu ? collectDescendantIds(selectedMenu) : new Set<string>()),
    [selectedMenu]
  );

  const parentOptions = useMemo(
    () =>
      allMenus.filter((menu) => {
        if (selectedMenu && idsMatch(menu.id, selectedMenu.id)) {
          return false;
        }

        return !descendantIds.has(String(menu.id));
      }),
    [allMenus, descendantIds, selectedMenu]
  );

  const activeSupportedActions = useMemo(
    () =>
      (selectedMenu?.supportedActions.length ? selectedMenu.supportedActions : supportedActions).filter(Boolean),
    [selectedMenu, supportedActions]
  );

  const handleRoleActionToggle = (roleId: MenuIdentifier, action: string) => {
    setForm((current) => {
      const existing = current.rolePermissions.find((entry) => String(entry.roleId) === String(roleId));
      const nextActions = existing?.actions.includes(action)
        ? existing.actions.filter((item) => item !== action)
        : [...(existing?.actions ?? []), action];

      const nextRolePermissions = current.rolePermissions
        .filter((entry) => String(entry.roleId) !== String(roleId))
        .concat(
          nextActions.length > 0
            ? [
                {
                  roleId,
                  roleName:
                    availableRoles.find((role) => String(role.id) === String(roleId))?.name || undefined,
                  actions: nextActions,
                },
              ]
            : []
        );

      return {
        ...current,
        rolePermissions: nextRolePermissions,
      };
    });
  };

  const handleSelectMenu = (menu: MenuRecord) => {
    selectedMenuIdRef.current = menu.id;
    setSelectedMenuId(menu.id);
    setForm(toFormState(menu));
  };

  const handleCreateRoot = () => {
    selectedMenuIdRef.current = null;
    setSelectedMenuId(null);
    setForm(emptyFormState(getNextOrder(allMenus, null)));
    setActiveTab("manage");
  };

  const handleCreateChild = () => {
    const parentId = selectedMenu ? selectedMenu.id : null;
    selectedMenuIdRef.current = null;
    setSelectedMenuId(null);
    setForm({
      ...emptyFormState(getNextOrder(allMenus, parentId)),
      parentId: parentId === null ? "" : String(parentId),
    });
    setActiveTab("manage");
  };

  const handleMove = (menu: MenuRecord, direction: -1 | 1) => {
    const flatMenus = allMenus.map((item) => ({ ...item, children: [] }));
    const siblings = flatMenus
      .filter((item) =>
        menu.parentId === null
          ? item.parentId === null
          : idsMatch(item.parentId, menu.parentId)
      )
      .sort((left, right) => left.order - right.order);

    const currentIndex = siblings.findIndex((item) => idsMatch(item.id, menu.id));
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
      return;
    }

    const current = siblings[currentIndex];
    const target = siblings[targetIndex];

    const updated = flatMenus.map((item) => {
      if (idsMatch(item.id, current.id)) {
        return { ...item, order: target.order };
      }

      if (idsMatch(item.id, target.id)) {
        return { ...item, order: current.order };
      }

      return item;
    });

    setMenus(buildMenuTree(updated));
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await reorderMenus({
        items: allMenus.map((menu) => ({
          id: menu.id,
          parentId: menu.parentId,
          order: menu.order,
        })),
      });
      toast.success("Menu order updated.");
      await loadData(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Menu name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      path: form.path.trim(),
      route: form.route.trim() || undefined,
      icon: form.icon.trim() || undefined,
      description: form.description.trim() || undefined,
      permissionName: form.permissionName.trim() || undefined,
      parentId: form.parentId ? form.parentId : null,
      order: Number(form.order) || 0,
      isActive: form.isActive,
      isPublic: form.isPublic,
      rolePermissions: form.rolePermissions,
    };

    setSaving(true);
    try {
      const response = selectedMenu
        ? await updateMenu(selectedMenu.id, payload)
        : await createMenu(payload);

      const targetMenuId = selectedMenu?.id ?? extractPersistedMenuId(response);
      if (targetMenuId !== null) {
        await syncMenuRolePermissions(targetMenuId, form.rolePermissions);
      }

      if (selectedMenu) {
        toast.success("Menu updated.");
        await loadData(true, selectedMenu.id);
      } else {
        toast.success("Menu created.");
        await loadData(true, null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMenu) {
      return;
    }

    const confirmed = window.confirm(`Delete menu "${selectedMenu.name}"?`);
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await deleteMenu(selectedMenu.id);
      toast.success("Menu deleted.");
      selectedMenuIdRef.current = null;
      setSelectedMenuId(null);
      setForm(emptyFormState(getNextOrder(allMenus, null)));
      await loadData(true, null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-background-dark to-opsh-background px-4 py-5 md:px-6">
        <div className={`${sectionCardClass} p-10 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-opsh-background">
            <FaSitemap className="text-2xl text-opsh-primary animate-pulse" />
          </div>
          <p className="mt-4 text-lg font-medium text-opsh-black">Loading menu manager</p>
          <p className="mt-2 text-sm text-opsh-text-dark">
            Fetching menu resources and accessible navigation preview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-background-dark to-opsh-background px-4 py-5 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
        <h5 className="hidden text-sm text-opsh-secondary md:block">Navigation Management</h5>
        <hr className="flex-grow w-full mt-2 border-opsh-grey border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
        <h5 className="hidden text-sm md:block">Menu Structure</h5>
        <h5 className="hidden text-sm text-opsh-muted md:block">Navigation Console</h5>
      </div>

      {/* Stats Section */}
      <div className="mb-5 rounded">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="bg-white rounded-xl shadow-opsh-sm border border-opsh-grey p-6 hover:shadow-opsh-md transition-all-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-opsh-muted">Total Menus</p>
                <p className="text-3xl font-bold text-opsh-black mt-2">{allMenus.length}</p>
              </div>
              <div className="w-12 h-12 bg-opsh-primary/10 rounded-lg flex items-center justify-center">
                <FaSitemap size={22} className="text-opsh-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-opsh-sm border border-opsh-grey p-6 hover:shadow-opsh-md transition-all-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-opsh-muted">Root Menus</p>
                <p className="text-3xl font-bold text-opsh-black mt-2">{menus.length}</p>
              </div>
              <div className="w-12 h-12 bg-opsh-primary/10 rounded-lg flex items-center justify-center">
                <FaProjectDiagram size={22} className="text-opsh-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-opsh-sm border border-opsh-grey p-6 hover:shadow-opsh-md transition-all-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-opsh-muted">Accessible Preview</p>
                <p className="text-3xl font-bold text-opsh-black mt-2">{accessiblePreview.length}</p>
              </div>
              <div className="w-12 h-12 bg-opsh-primary/10 rounded-lg flex items-center justify-center">
                <FaEye size={22} className="text-opsh-primary" />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData(true)}
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
            onClick={() => setActiveTab("manage")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all-smooth ${
              activeTab === "manage"
                ? "bg-opsh-primary text-white shadow-opsh-md"
                : "bg-white text-opsh-text-dark hover:bg-opsh-background-muted border border-opsh-grey"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FaProjectDiagram size={14} />
              Manage Menus
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accessible")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all-smooth ${
              activeTab === "accessible"
                ? "bg-opsh-primary text-white shadow-opsh-md"
                : "bg-white text-opsh-text-dark hover:bg-opsh-background-muted border border-opsh-grey"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FaEye size={14} />
              Accessible Preview
            </span>
          </button>
        </div>

        {activeTab === "manage" ? (
          <div className="grid gap-6 xl:grid-cols-[380px,minmax(0,1fr)]">
            {/* Left Sidebar - Menu List */}
            <div className={`${sectionCardClass} p-5`}>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search menus..."
                  className="w-full rounded-xl border border-opsh-grey py-2.5 pl-10 pr-4 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={handleCreateRoot} className={buttonPrimaryClass}>
                  <FaPlus />
                  New root
                </button>
                <button type="button" onClick={handleCreateChild} className={buttonOutlineClass}>
                  <FaPlus />
                  New child
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={savingOrder || allMenus.length === 0}
                  className={buttonOutlineClass}
                >
                  {savingOrder ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save order
                </button>
              </div>

              <div className="mt-5 space-y-2 max-h-[650px] overflow-y-auto">
                {visibleMenus.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-opsh-grey p-8 text-center text-sm text-opsh-text-dark">
                    No menus match the current filter.
                  </div>
                ) : (
                  visibleMenus.map(({ menu, depth }) => (
                    <div
                      key={String(menu.id)}
                      className={`rounded-xl border p-3 transition-all-smooth ${
                        idsMatch(menu.id, selectedMenuId)
                          ? "border-opsh-success bg-opsh-success/10 ring-2 ring-opsh-success/20"
                          : "border-opsh-grey hover:border-opsh-primary"
                      }`}
                      style={{ marginLeft: `${depth * 12}px` }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectMenu(menu)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-opsh-black">{menu.name}</p>
                            <p className="mt-1 truncate text-xs text-opsh-text-dark">
                              {menu.path || "Container menu"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-opsh-background px-2 py-0.5 text-xs text-opsh-text-dark">
                                order {menu.order}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  menu.isActive
                                    ? "bg-opsh-success/10 text-opsh-success"
                                    : "bg-opsh-danger/10 text-opsh-danger"
                                }`}
                              >
                                {menu.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMove(menu, -1);
                              }}
                              className="rounded-lg border border-opsh-grey p-2 text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth"
                              title="Move up"
                            >
                              <FaArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMove(menu, 1);
                              }}
                              className="rounded-lg border border-opsh-grey p-2 text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth"
                              title="Move down"
                            >
                              <FaArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Menu Editor */}
            <div className={`${sectionCardClass} p-6`}>
              <div className="mb-6 flex flex-col gap-4 border-b border-opsh-grey pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-opsh-success">
                    {selectedMenu ? "Editing Menu" : "Create Menu"}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-opsh-black">
                    {selectedMenu ? selectedMenu.name : "New Menu Item"}
                  </h2>
                  <p className="mt-2 text-sm text-opsh-text-dark">
                    Configure labels, routes, parent relationships, and visibility for this menu item.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={buttonPrimaryClass}
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    {saving ? "Saving..." : selectedMenu ? "Update Menu" : "Create Menu"}
                  </button>
                  {selectedMenu && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-opsh-danger px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-danger-hover transition-colors-smooth disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Menu Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Property Management"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Route Key</label>
                  <input
                    type="text"
                    value={form.route}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, route: event.target.value }))
                    }
                    placeholder="settings-menu"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Permission Base</label>
                  <input
                    type="text"
                    value={form.permissionName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, permissionName: event.target.value }))
                    }
                    placeholder="settings_menu"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Route / Path</label>
                  <input
                    type="text"
                    value={form.path}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, path: event.target.value }))
                    }
                    placeholder="/admin/settings/menu"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, icon: event.target.value }))
                    }
                    placeholder="FaSitemap"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Sort Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, order: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Parent Menu</label>
                  <select
                    value={form.parentId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, parentId: event.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="">Root level</option>
                    {parentOptions.map((menu) => (
                      <option key={String(menu.id)} value={String(menu.id)}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <label className="inline-flex items-center gap-3 rounded-xl border border-opsh-grey px-4 py-3 text-sm text-opsh-text-dark">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isActive: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-opsh-grey text-opsh-success focus:ring-opsh-success focus:ring-2"
                    />
                    Active Menu
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-xl border border-opsh-grey px-4 py-3 text-sm text-opsh-text-dark">
                    <input
                      type="checkbox"
                      checked={form.isPublic}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isPublic: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-opsh-grey text-opsh-primary focus:ring-opsh-primary focus:ring-2"
                    />
                    Public Menu
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-opsh-black">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={4}
                    placeholder="Optional note for administrators"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-opsh-black">Role Permission Mapping</h3>
                        <p className="mt-1 text-xs text-opsh-text-dark">
                          Assign generated menu actions to roles using the supported action contract from the API.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-opsh-text-dark">
                        {activeSupportedActions.length} actions
                      </span>
                    </div>

                    {availableRoles.length === 0 ? (
                      <p className="mt-4 text-sm text-opsh-text-dark">
                        No roles were returned from RBAC. Save the menu now or refresh once roles are available.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {availableRoles.map((role) => {
                          const selectedActions =
                            form.rolePermissions.find((entry) => String(entry.roleId) === String(role.id))?.actions ?? [];

                          return (
                            <div
                              key={String(role.id)}
                              className="rounded-xl border border-opsh-grey bg-white px-4 py-3"
                            >
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-opsh-black">{role.name}</p>
                                  <p className="text-xs text-opsh-text-dark">{selectedActions.length} action(s) selected</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {activeSupportedActions.map((action) => {
                                    const checked = selectedActions.includes(action);

                                    return (
                                      <label
                                        key={`${role.id}-${action}`}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                          checked
                                            ? "border-opsh-primary bg-opsh-primary text-white"
                                            : "border-opsh-grey bg-opsh-background text-opsh-text-dark"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => handleRoleActionToggle(role.id, action)}
                                          className="sr-only"
                                        />
                                        {action}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedMenu && (
                <div className="mt-6 rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-4">
                  <h3 className="text-sm font-semibold text-opsh-black">Current Menu Snapshot</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-opsh-muted">Menu ID</p>
                      <p className="mt-1 text-sm text-opsh-text-dark">{String(selectedMenu.id)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-opsh-muted">Parent ID</p>
                      <p className="mt-1 text-sm text-opsh-text-dark">
                        {selectedMenu.parentId === null ? "Root" : String(selectedMenu.parentId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-opsh-muted">Permission Base</p>
                      <p className="mt-1 text-sm text-opsh-text-dark">
                        {selectedMenu.permissionName || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-opsh-muted">Route Key</p>
                      <p className="mt-1 text-sm text-opsh-text-dark">{selectedMenu.route || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${sectionCardClass} p-6`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-opsh-success">
                  Current User Preview
                </p>
                <h2 className="mt-2 text-2xl font-bold text-opsh-black">Accessible Menus</h2>
                <p className="mt-2 text-sm text-opsh-text-dark">
                  This list uses `GET /menus/accessible` so you can verify the menu tree visible to the current session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadData(true)}
                disabled={refreshing}
                className={buttonOutlineClass}
              >
                {refreshing ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
                Reload preview
              </button>
            </div>

            {accessiblePreview.length === 0 ? (
              <div className="rounded-xl border border-dashed border-opsh-grey p-10 text-center">
                <FaList className="mx-auto text-3xl text-opsh-muted" />
                <p className="mt-4 text-sm text-opsh-text-dark">No accessible menus were returned for this user.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accessiblePreview.map(({ menu, depth }) => (
                  <div
                    key={menu.id}
                    className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 px-4 py-3"
                    style={{ marginLeft: `${depth * 16}px` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-opsh-black">{menu.name}</p>
                        <p className="mt-1 truncate text-xs text-opsh-text-dark">{menu.path || "Container menu"}</p>
                      </div>
                      {menu.icon && (
                        <span className="rounded-full bg-white px-2 py-1 text-xs text-opsh-muted">
                          {menu.icon}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
