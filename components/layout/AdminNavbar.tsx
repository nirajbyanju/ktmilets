'use client';

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js router
import useAuthStore from '@/stores/auth/AuthStore';
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import ProfileDropdown from "./ProfileDropdown";
import AdminNotificationBell from "./AdminNotificationBell";
import {
  canManageUsers,
  isPrivilegedUser,
  removeUserManagementMenus,
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

  const activeMenu =
    canManageSystem && !canManageUserAccounts
      ? removeUserManagementMenus(menu)
      : menu;
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
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        {/* Left — collapse toggle + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-opsh-primary"
            onClick={() => setIsExpand(!isExpand)}
            aria-label="Toggle sidebar"
          >
            <IoReorderThreeOutline className="text-2xl" />
          </button>

          <form className="relative w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="admin-search" className="sr-only">Search menu</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="text"
                id="admin-search"
                ref={searchInputRef}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-20 text-sm text-gray-900 transition focus:border-opsh-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-opsh-primary/20"
                placeholder="Search menu… (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className="inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-sans text-gray-400 shadow-sm">
                  Ctrl+K
                </kbd>
              </div>
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div ref={searchResultsRef} className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-opsh-lg">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-opsh-primary"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.name}
                  </button>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery && (
              <div ref={searchResultsRef} className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-400 shadow-opsh-lg">
                No results found
              </div>
            )}
          </form>
        </div>

        {/* Right — notifications + user */}
        <div className="flex shrink-0 items-center gap-3">
          {canManageSystem ? <AdminNotificationBell /> : null}

          <div className="relative flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-gray-700 lg:block">
              {displayName || toText(user?.email) || "Admin"}
            </span>

            <button
              type="button"
              onClick={handleProfileClick}
              className="group relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-opsh-primary/30 bg-opsh-primary/5 transition hover:border-opsh-primary hover:shadow-sm"
              aria-label="Open profile menu"
            >
              <ProfileAvatar
                firstName={profile?.first_name || ""}
                lastName={profile?.last_name || ""}
                imageUrl={profile?.userdetail?.profilePicture || null}
                size="sm"
                className="h-full w-full text-sm font-medium"
              />
            </button>

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
