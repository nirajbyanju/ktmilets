'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import * as Icons from 'react-icons/fa';
import { IconType } from 'react-icons';

import Logo from '@/public/apple-icon.png';
import useAuthStore from '@/stores/auth/AuthStore';
import {
  canManageUsers,
  ensureSettingsProfileMenu,
  fallbackAdminMenu,
  isPrivilegedUser,
  removeUserManagementMenus,
  studentPortalMenu,
} from '@/data/adminMenu';
import { AppMenuItem } from '@/types/rbac';

interface AdminSidebarProps {
  isExpand: boolean;
  setIsExpand: (isExpand: boolean) => void;
}

const toText = (value: unknown): string => (typeof value === 'string' ? value : '');

const getDisplayName = (user: Record<string, unknown> | null) => {
  const firstName = toText(user?.first_name) || toText(user?.firstName);
  const lastName = toText(user?.last_name) || toText(user?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName || toText(user?.name) || toText(user?.full_name) || toText(user?.username) || 'Admin User';
};

const isPathMatch = (pathname: string, menuPath: string) => {
  if (!menuPath) {
    return false;
  }

  if (pathname === menuPath) {
    return true;
  }

  return pathname.startsWith(`${menuPath}/`);
};

const getIconComponent = (iconName?: string) => {
  const IconComponent = (Icons as Record<string, IconType>)[iconName || 'FaCircle'];
  return IconComponent ? <IconComponent /> : <Icons.FaCircle />;
};

const hasActiveChild = (pathname: string, menu: AppMenuItem) =>
  menu.children.some((child) => isPathMatch(pathname, child.path));

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isExpand }) => {
  const pathname = usePathname();
  const menu = useAuthStore((state) => state.menu);
  const menuLoaded = useAuthStore((state) => state.menuLoaded);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const [submenuStates, setSubmenuStates] = useState<Record<string, boolean>>({});

  const canManageSystem = isPrivilegedUser({ roles, permissions, directPermissions });
  const canManageUserAccounts = canManageUsers({ roles });
  const adminMenu = ensureSettingsProfileMenu(menuLoaded ? menu : fallbackAdminMenu);
  const sidebarMenu = canManageSystem
    ? canManageUserAccounts
      ? adminMenu
      : removeUserManagementMenus(adminMenu)
    : studentPortalMenu;

  const toggleSubmenu = (id: string) => {
    setSubmenuStates((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <nav
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
        isExpand ? 'w-64' : 'w-20'
      }`}
    >
      <div className="relative flex flex-col h-screen">
        <SimpleBar style={{ height: 'calc(100% - 72px)' }}>
          <div className="text-gray-600">
            <div className="flex flex-col items-center mt-6 mb-4 overflow-x-hidden">
              <Link href="/" className="flex items-center justify-center group">
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpand ? 'h-16 w-16' : 'h-10 w-10'
                  }`}
                >
                  <Image src={Logo} alt="Logo" width={300} height={300} className="w-full h-auto" />
                </div>
                <div
                  className={`text-xl font-bold text-opsh-primary ml-2 truncate transition-opacity duration-300 ${
                    isExpand ? 'opacity-100' : 'opacity-0 hidden'
                  }`}
                >
                  KTM Test Prep
                </div>
              </Link>
            </div>

            <div className="px-3 mt-2">
              <ul className="space-y-1">
                {sidebarMenu.map((item) => {
                  const hasChildren = item.children.length > 0;
                  const isOpen = submenuStates[item.id] ?? hasActiveChild(pathname, item);
                  const isActive = isPathMatch(pathname, item.path);
                  const isActiveParent = hasActiveChild(pathname, item);

                  return (
                    <li key={item.id}>
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleSubmenu(item.id)}
                            className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                              isOpen || isActiveParent
                                ? 'bg-opsh-primary/5 text-opsh-primary'
                                : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                            } ${isExpand ? 'pr-3' : 'justify-center'}`}
                            title={!isExpand ? item.name : undefined}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xl ${
                                  isOpen || isActiveParent
                                    ? 'text-opsh-primary'
                                    : 'text-gray-500 group-hover:text-opsh-primary-hover'
                                }`}
                              >
                                {getIconComponent(item.icon)}
                              </span>
                              {isExpand && <span className="text-sm font-medium">{item.name}</span>}
                            </div>
                            {isExpand && (
                              <Icons.FaChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                } ${
                                  isOpen || isActiveParent
                                    ? 'text-opsh-primary'
                                    : 'text-gray-400 group-hover:text-opsh-primary'
                                }`}
                              />
                            )}
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isOpen ? 'max-h-96 mt-1' : 'max-h-0'
                            }`}
                          >
                            <ul className={`${isExpand ? 'pl-11' : 'pl-0'} space-y-0.5 pr-2`}>
                              {item.children.map((child) => {
                                const isChildActive = isPathMatch(pathname, child.path);

                                return (
                                  <li key={child.id}>
                                    <Link
                                      href={child.path || '#'}
                                      className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                                        isChildActive
                                          ? 'bg-opsh-primary/5 text-opsh-primary font-medium'
                                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                      } ${!isExpand ? 'justify-center' : ''}`}
                                      title={!isExpand ? child.name : undefined}
                                    >
                                      {isExpand && <span className="mr-2 text-xs">-</span>}
                                      {isExpand && <span className="truncate">{child.name}</span>}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.path || '#'}
                          className={`group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-opsh-primary/5 text-opsh-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          } ${isExpand ? 'pr-3' : 'justify-center'}`}
                          title={!isExpand ? item.name : undefined}
                        >
                          <span
                            className={`text-xl ${
                              isActive ? 'text-opsh-primary' : 'text-gray-500 group-hover:text-opsh-primary-hover'
                            }`}
                          >
                            {getIconComponent(item.icon)}
                          </span>
                          {isExpand && <span className="ml-3 text-sm font-medium truncate">{item.name}</span>}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </SimpleBar>

        {isExpand && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-opsh-primary/5 rounded-full flex items-center justify-center">
                <Icons.FaUser className="text-opsh-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{getDisplayName(user)}</p>
                <p className="text-xs text-gray-500 truncate">{toText(user?.email) || 'Signed in user'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminSidebar;
