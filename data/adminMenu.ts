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

export const propertyLikesMenuItem: AppMenuItem = {
  id: "property-likes",
  name: "Property Likes",
  icon: "FaHeart",
  path: "/admin/property-likes",
  children: [],
};

export const fallbackAdminMenu: AppMenuItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "FaTachometerAlt",
    path: "/admin/dashboard",
    children: [],
  },
  {
    id: "property",
    name: "Property Management",
    icon: "FaBuilding",
    path: "/admin/property",
    children: [],
  },
  {
    id: "field-visit",
    name: "Field Visit",
    icon: "FaMapMarkedAlt",
    path: "/admin/fieldVisit",
    children: [],
  },
  {
    id: "property-inquiry",
    name: "Property Inquiry",
    icon: "FaClipboardList",
    path: "/admin/propertyInquery",
    children: [],
  },
  userManagementMenuItem,
  propertyLikesMenuItem,
  {
    id: "blog",
    name: "Blog",
    icon: "FaNewspaper",
    path: "/admin/blog",
    children: [],
  },
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
        id: "settings-option",
        name: "Option Manager",
        icon: "FaList",
        path: "/admin/settings/option",
        children: [],
      },
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
  const hasUserManagementEntry = menuItems.some((item) => item.path === userManagementMenuItem.path);
  const hasPropertyLikesEntry = menuItems.some((item) => item.path === propertyLikesMenuItem.path);

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
      ...(hasUserManagementEntry ? [] : [userManagementMenuItem]),
      ...(hasPropertyLikesEntry ? [] : [propertyLikesMenuItem]),
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
    ...(hasUserManagementEntry ? [] : [userManagementMenuItem]),
    ...(hasPropertyLikesEntry ? [] : [propertyLikesMenuItem]),
  ];
};
