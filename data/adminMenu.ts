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
  id: "enrollments",
  name: "Enrollments",
  icon: "FaUserGraduate",
  path: "/admin/enrollments",
  children: [],
};

export const examBookingsMenuItem: AppMenuItem = {
  id: "exam-bookings",
  name: "Exam Bookings",
  icon: "FaPassport",
  path: "/admin/exam-bookings",
  children: [],
};

export const mockTestsMenuItem: AppMenuItem = {
  id: "mock-tests",
  name: "Mock Tests",
  icon: "FaClipboardCheck",
  path: "/admin/mock-tests",
  children: [],
};

export const contactMessagesMenuItem: AppMenuItem = {
  id: "contact-messages",
  name: "Messages",
  icon: "FaEnvelope",
  path: "/admin/contact-messages",
  children: [],
};

export const messageTemplatesMenuItem: AppMenuItem = {
  id: "message-templates",
  name: "Message Templates",
  icon: "FaCommentDots",
  path: "/admin/message-templates",
  children: [],
};

export const dashboardMenuItem: AppMenuItem = {
  id: 'dashboard',
  name: 'Dashboard',
  icon: 'FaTachometerAlt',
  path: '/admin/dashboard',
  children: [],
};

export const studentPortalMenu: AppMenuItem[] = [
  dashboardMenuItem,
  { ...invoicesMenuItem,     name: "My Invoices" },
  { ...enrollmentsMenuItem,  name: "My Enrollments" },
  { ...mockTestsMenuItem,    name: "My Mock Tests" },
  { ...examBookingsMenuItem, name: "My Exam Bookings" },
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

export const KTM_ENROLLMENT_EMAIL = 'ktm.testprep@gmail.com';

export const canAccessEnrollments = (
  email: string | null | undefined,
  roles?: string[]
): boolean => {
  const normalizedEmail = (typeof email === 'string' ? email : '').toLowerCase();
  if (normalizedEmail === KTM_ENROLLMENT_EMAIL) return true;
  if (!roles || roles.length === 0) return false;
  const roleSet = new Set(roles.map((r) => r.toLowerCase()));
  return roleSet.has('super admin');
};

export const removeUserManagementMenus = (menuItems: AppMenuItem[]): AppMenuItem[] =>
  menuItems
    .filter((item) => item.path !== userManagementMenuItem.path && item.path !== "/admin/rbac")
    .map((item) => ({
      ...item,
      children: removeUserManagementMenus(item.children ?? []),
    }));

export const studentsMenuItem: AppMenuItem = {
  id: "students",
  name: "Students",
  icon: "FaClipboardList",
  path: "/admin/students",
  children: [],
};

export const teachersMenuItem: AppMenuItem = {
  id: "teachers",
  name: "Teachers",
  icon: "FaChalkboardTeacher",
  path: "/admin/teachers",
  children: [],
};

export const fallbackAdminMenu: AppMenuItem[] = [
  dashboardMenuItem,               // order 0
  courseCatalogMenuItem,           // order 1
  invoicesMenuItem,                // order 2
  enrollmentsMenuItem,             // order 3
  mockTestsMenuItem,               // order 4
  studentsMenuItem,                // order 5
  teachersMenuItem,                // order 6
  examBookingsMenuItem,            // order 7
  contactMessagesMenuItem,         // order 8
  messageTemplatesMenuItem,
  {
    id: "access-control",
    name: "Access Control",
    icon: "FaUserShield",
    path: "/admin/rbac",
    children: [],
  },                               // order 7
  userManagementMenuItem,          // order 8
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
  },                               // order 9
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
