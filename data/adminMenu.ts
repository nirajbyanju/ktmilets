import { AppMenuItem } from "@/types/rbac";

export const settingsProfileMenuItem: AppMenuItem = {
  id: "settings-profile",
  name: "Profile Settings",
  icon: "FaUserCog",
  path: "/admin/settings/profile",
  children: [],
};

export const userManagementMenuItem: AppMenuItem = {
  id: "user-management",
  name: "User Management",
  icon: "FaUsers",
  path: "/admin/user-management",
  children: [],
};



export const courseCatalogMenuItem: AppMenuItem = {
  id: "course-catalog",
  name: "Course Catalog",
  icon: "FaGraduationCap",
  path: "/admin/courses",
  children: [],
};

export const invoicesMenuItem: AppMenuItem = {
  id: "invoices",
  name: "Invoices",
  icon: "FaFileInvoiceDollar",
  path: "/admin/invoices",
  children: [],
};

export const enrollmentsMenuItem: AppMenuItem = {
  id: "my-enrollments",
  name: "My Courses",
  icon: "FaBookOpen",
  path: "/admin/enrollments",
  children: [],
};

export const studentPortalMenu: AppMenuItem[] = [
  {
    ...invoicesMenuItem,
    name: "My Invoices",
  },
  enrollmentsMenuItem,
  settingsProfileMenuItem,
];

export const isPrivilegedUser = (source: {
  roles?: string[];
  permissions?: string[];
  directPermissions?: string[];
}): boolean => {
  const roles = new Set((source.roles ?? []).map((role) => role.toLowerCase()));
  const permissions = new Set([...(source.permissions ?? []), ...(source.directPermissions ?? [])]);

  return (
    permissions.has("manage_all") ||
    roles.has("super admin") ||
    roles.has("admin") ||
    roles.has("manager") ||
    roles.has("owner")
  );
};

export const canManageUsers = (source: {
  roles?: string[];
}): boolean => {
  const roles = new Set((source.roles ?? []).map((role) => role.toLowerCase()));

  return roles.has("super admin");
};

export const isAdminUser = (source: {
  roles?: string[];
  permissions?: string[];
  directPermissions?: string[];
}): boolean => {
  const roles = new Set((source.roles ?? []).map((role) => role.toLowerCase()));
  const permissions = new Set([...(source.permissions ?? []), ...(source.directPermissions ?? [])]);

  return (
    permissions.has("manage_all") ||
    roles.has("super admin") ||
    roles.has("admin")
  );
};

export const removeUserManagementMenus = (menuItems: AppMenuItem[]): AppMenuItem[] =>
  menuItems
    .filter((item) => item.path !== userManagementMenuItem.path && item.path !== "/admin/rbac")
    .map((item) => ({
      ...item,
      children: removeUserManagementMenus(item.children ?? []),
    }));

export const fallbackAdminMenu: AppMenuItem[] = [
  courseCatalogMenuItem,
  invoicesMenuItem,
  enrollmentsMenuItem,
 
  userManagementMenuItem,

  {
    id: "access-control",
    name: "Access Control",
    icon: "FaUserShield",
    path: "/admin/rbac",
    children: [],
  },
  {
    id: "settings",
    name: "Settings",
    icon: "FaCog",
    path: "/admin/settings",
    children: [
      settingsProfileMenuItem,
      {
        id: "settings-menu",
        name: "Menu Manager",
        icon: "FaSitemap",
        path: "/admin/settings/menu",
        children: [],
      },
    ],
  },
];

export const ensureSettingsProfileMenu = (menuItems: AppMenuItem[]): AppMenuItem[] => {
  const hasDirectProfileEntry = menuItems.some((item) => item.path === settingsProfileMenuItem.path);
  const hasSettingsRoot = menuItems.some((item) => item.path === "/admin/settings");
  const hasCourseCatalogEntry = menuItems.some((item) => item.path === courseCatalogMenuItem.path);
  const hasInvoicesEntry = menuItems.some((item) => item.path === invoicesMenuItem.path);

  const nextMenuItems = menuItems.map((item) => {
    if (item.path !== "/admin/settings") {
      return item;
    }

    const hasProfileChild = item.children.some((child) => child.path === settingsProfileMenuItem.path);
    if (hasProfileChild || hasDirectProfileEntry) {
      return item;
    }

    return {
      ...item,
      children: [settingsProfileMenuItem, ...item.children],
    };
  });

  if (hasSettingsRoot || hasDirectProfileEntry) {
    return [
      ...nextMenuItems,
      ...(hasCourseCatalogEntry ? [] : [courseCatalogMenuItem]),
      ...(hasInvoicesEntry ? [] : [invoicesMenuItem]),
    ];
  }

  const menuWithSettings = [
    ...nextMenuItems,
    {
      id: "settings",
      name: "Settings",
      icon: "FaCog",
      path: "/admin/settings",
      children: [settingsProfileMenuItem],
    },
  ];

  return [
    ...menuWithSettings,
    ...(hasCourseCatalogEntry ? [] : [courseCatalogMenuItem]),
    ...(hasInvoicesEntry ? [] : [invoicesMenuItem]),
  ];
};
