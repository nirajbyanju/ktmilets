'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminFooter from "@/components/layout/AdminFooter";
import AdminLoader from "@/components/loader/Loader";
import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import useAuthStore from "@/stores/auth/AuthStore";
import useOptionStore from "@/stores/common/OptionStore";
import { canManageUsers, isPrivilegedUser } from "@/data/adminMenu";

const studentAllowedPaths = ["/admin/dashboard", "/admin/invoices", "/admin/enrollments", "/admin/settings/profile"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpand, setIsExpand] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [bootMessage, setBootMessage] = useState("Verifying your session.");

  const {
    isAuthenticated,
    token,
    initializeAuth,
    menuLoaded,
    loadUserMenu,
    roles,
    permissions,
    directPermissions,
  } = useAuthStore();

  const {
    fetchAllOptions,
    isLoaded,
  } = useOptionStore();

  const canManageSystem = isPrivilegedUser({ roles, permissions, directPermissions });
  const canManageUserAccounts = canManageUsers({ roles });

  useEffect(() => {
    const checkAuth = async () => {
      setBootMessage("Verifying your session.");
      await initializeAuth();
      const state = useAuthStore.getState();

      if (state.isAuthenticated && state.token) {
        setIsReady(true);
        return;
      }

      router.replace("/login");
    };

    void checkAuth();
  }, [initializeAuth, router]);

  useEffect(() => {
    const loadAdminDependencies = async () => {
      if (!isReady || !isAuthenticated || !token) {
        return;
      }

      setHasBootstrapped(false);

      try {
        if (!menuLoaded) {
          setBootMessage("Loading your navigation and access menu.");
          await loadUserMenu();
        }

        if (canManageSystem && !isLoaded()) {
          setBootMessage("Loading shared options and admin data.");
          await fetchAllOptions();
        }
      } finally {
        setHasBootstrapped(true);
      }
    };

    void loadAdminDependencies();
  }, [
    isReady,
    isAuthenticated,
    token,
    menuLoaded,
    loadUserMenu,
    fetchAllOptions,
    isLoaded,
    canManageSystem,
  ]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || canManageSystem) {
      return;
    }

    const isAllowed =
      pathname === "/admin" ||
      studentAllowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (!isAllowed) {
      router.replace("/admin/invoices");
    }
  }, [canManageSystem, isAuthenticated, isReady, pathname, router]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !canManageSystem || canManageUserAccounts) {
      return;
    }

    if (pathname.startsWith("/admin/user-management") || pathname.startsWith("/admin/rbac")) {
      router.replace("/admin/courses");
    }
  }, [canManageSystem, canManageUserAccounts, isAuthenticated, isReady, pathname, router]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || (isAuthenticated && !hasBootstrapped)) {
    return (
      <AdminLoader
        title={isReady ? "Preparing Admin Workspace" : "Loading Admin Workspace"}
        message={bootMessage}
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-row h-screen">
      <AdminSidebar isExpand={isExpand} setIsExpand={setIsExpand} />
      <div className="flex flex-1 flex-col overflow-auto">
        <AdminNavbar isExpand={isExpand} setIsExpand={setIsExpand} />
        <main className="flex-1">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
