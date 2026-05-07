'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminFooter from "@/components/layout/AdminFooter";
import AdminLoader from "@/components/loader/Loader";
import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import useAuthStore from "@/stores/auth/AuthStore";
import useOptionStore from "@/stores/common/OptionStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
  } = useAuthStore();

  const {
    fetchAllOptions,
    isLoaded,
  } = useOptionStore();

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

        if (!isLoaded()) {
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
  ]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || (isAuthenticated && !hasBootstrapped)) {
    return (
      <AdminLoader
        title={isReady ? "Preparing Admin Dashboard" : "Loading Admin Workspace"}
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
