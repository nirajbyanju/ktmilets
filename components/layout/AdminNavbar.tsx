'use client';

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js router
import useAuthStore from '@/stores/auth/AuthStore';
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import ProfileDropdown from "./ProfileDropdown";
import AdminNotificationBell from "./AdminNotificationBell";
import {
  canManageUsers,
  ensureSettingsProfileMenu,
  fallbackAdminMenu,
  isPrivilegedUser,
  removeUserManagementMenus,
  studentPortalMenu,
} from "@/data/adminMenu";
import { flattenMenuItems } from "@/helper/rbac/normalize";
import {
  IoReorderThreeOutline,
} from "@/assets/icons/Icons";

interface HeaderProps {
  isExpand: boolean;
  setIsExpand: (isExpand: boolean) => void;
}

interface SearchResult {
  id: number;
  name: string;
  route: string;
}

interface Profile {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  userdetail?: {
    profilePicture?: string;
  };
}

const toText = (value: unknown): string => (typeof value === "string" ? value : "");
const toRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const Header: React.FC<HeaderProps> = ({ isExpand, setIsExpand }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const user = useAuthStore((state) => state.user as Record<string, unknown> | null);
  const menu = useAuthStore((state) => state.menu);
  const menuLoaded = useAuthStore((state) => state.menuLoaded);
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const canManageSystem = isPrivilegedUser({ roles, permissions, directPermissions });
  const canManageUserAccounts = canManageUsers({ roles });
  const userDetail = toRecord(user?.userdetail) ?? toRecord(user?.userDetail) ?? toRecord(user?.user_detail);
  const profile: Profile = {
    first_name: toText(user?.first_name) || toText(user?.firstName),
    middle_name: toText(user?.middle_name) || toText(user?.middleName),
    last_name: toText(user?.last_name) || toText(user?.lastName),
    userdetail: {
      profilePicture:
        toText(userDetail?.profilePicture) ||
        toText(userDetail?.profile_picture_url) ||
        toText(userDetail?.profilePictureUrl) ||
        toText(user?.profile_picture_url) ||
        toText(user?.profilePictureUrl),
    },
  };

  // Fixed ref declarations
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => setIsDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
    if (
      searchResultsRef.current &&
      !searchResultsRef.current.contains(event.target as Node) &&
      searchInputRef.current &&
      !searchInputRef.current.contains(event.target as Node)
    ) {
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery(result.name);
    setShowSearchResults(false);
    if (result.route) {
      router.push(result.route);
    }
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      setShowSearchResults(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        focusSearchInput();
      }
      if (event.key === 'Escape' && showSearchResults) {
        setShowSearchResults(false);
        if (searchInputRef.current) searchInputRef.current.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchResults]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    setIsExpand(!mediaQuery.matches);
    const handleScreenChange = (e: MediaQueryListEvent) => setIsExpand(!e.matches);
    mediaQuery.addEventListener('change', handleScreenChange);
    return () => mediaQuery.removeEventListener('change', handleScreenChange);
  }, [setIsExpand]);

  const displayName = [
    toText(user?.first_name) || toText(user?.firstName),
    toText(user?.last_name) || toText(user?.lastName),
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || toText(user?.name) || toText(user?.full_name) || toText(user?.username) || "";

  const userData = {
    firstName: toText(user?.first_name) || toText(user?.firstName) || displayName,
    lastName: toText(user?.last_name) || toText(user?.lastName) || "",
    email: toText(user?.email) || "",
  };

  const adminMenu = ensureSettingsProfileMenu(menuLoaded ? menu : fallbackAdminMenu);
  const activeMenu = canManageSystem
    ? canManageUserAccounts
      ? adminMenu
      : removeUserManagementMenus(adminMenu)
    : studentPortalMenu;
  const searchableMenus = flattenMenuItems(activeMenu).filter(
    (item) => item.path
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults: SearchResult[] = normalizedSearchQuery
    ? searchableMenus
        .filter((item) => item.name.toLowerCase().includes(normalizedSearchQuery) || item.path.toLowerCase().includes(normalizedSearchQuery))
        .slice(0, 8)
        .map((item, index) => ({
          id: index + 1,
          name: item.name,
          route: item.path,
        }))
    : [];

  return (
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-between p-1">
        <div className="flex gap-3" style={{ width: "430px" }}>
          <button
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsExpand(!isExpand)}
          >
            <IoReorderThreeOutline className="text-3xl" />
          </button>
          <form className="flex items-center w-full relative" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="simple-search" className="sr-only">Search</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"/>
                </svg>
              </div>
              <input
                type="text"
                id="simple-search"
                ref={searchInputRef}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-20 p-2"
                placeholder="Search menu (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <kbd className="inline-flex items-center px-2 py-1 text-xs font-sans text-gray-400 bg-gray-100 border border-gray-300 rounded">
                  Ctrl+K
                </kbd>
              </div>
            </div>
            <button type="submit" className="p-2 ml-2 text-sm font-medium text-white bg-opsh-primary rounded-lg border border-opsh-primary hover:bg-opsh-primary-hover focus:ring-4 focus:outline-none focus:ring-blue-300">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
              <span className="sr-only">Search</span>
            </button>

            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div ref={searchResultsRef} className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.name}
                  </div>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery && (
              <div ref={searchResultsRef} className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-2 text-gray-500">
                  No results found
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-4 mr-4">
          {canManageSystem ? <AdminNotificationBell /> : null}
          
          {/* FIXED: Added relative positioning to the profile container */}
          <div className="relative flex flex-row gap-4 items-center">
            <label className="text-opsh-primary text-lg">
              {displayName || toText(user?.email) || "Admin"}
            </label>
            
            <div 
              onClick={handleProfileClick} 
              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-opsh-primary overflow-hidden bg-gray-100 transition-all duration-200 hover:border-opsh-primary-dark hover:shadow-sm cursor-pointer"
            >
              <ProfileAvatar 
                firstName={profile?.first_name || ""} 
                lastName={profile?.last_name || ""} 
                imageUrl={profile?.userdetail?.profilePicture || null}
                size="sm" 
                className="w-full h-full text-sm font-medium text-gray-600 group-hover:text-opsh-primary-dark"
              />
            </div>
            
            {/* ProfileDropdown - now properly positioned relative to parent container */}
            <ProfileDropdown 
              isOpen={isDropdownOpen} 
              dropdownRef={dropdownRef} 
              profile={profile} 
              userData={userData} 
              canManageSystem={canManageSystem}
              canManageUsers={canManageUserAccounts}
              onClose={() => setIsDropdownOpen(false)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
