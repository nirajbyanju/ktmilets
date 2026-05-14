"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isPrivilegedUser } from "@/data/adminMenu";
import useAuthStore from "@/stores/auth/AuthStore";

export default function DashboardPage() {
  const router = useRouter();
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);

  useEffect(() => {
    const canManageSystem = isPrivilegedUser({ roles, permissions, directPermissions });
    router.replace(canManageSystem ? "/admin/courses" : "/admin/invoices");
  }, [directPermissions, permissions, roles, router]);

  return null;
}
