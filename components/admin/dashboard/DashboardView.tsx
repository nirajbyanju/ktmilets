'use client';

import useAuthStore from '@/stores/auth/AuthStore';
import { canManageUsers, isPrivilegedUser } from '@/data/adminMenu';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const toText = (v: unknown) => (typeof v === 'string' ? v : '');

export default function DashboardView() {
  const user              = useAuthStore((s) => s.user as Record<string, unknown> | null);
  const roles             = useAuthStore((s) => s.roles);
  const permissions       = useAuthStore((s) => s.permissions);
  const directPermissions = useAuthStore((s) => s.directPermissions);

  const firstName  = toText(user?.first_name) || toText(user?.firstName);
  const lastName   = toText(user?.last_name)  || toText(user?.lastName);
  const userName   = [firstName, lastName].filter(Boolean).join(' ').trim()
    || toText(user?.name) || toText(user?.username) || 'there';

  const isAdmin   = isPrivilegedUser({ roles, permissions, directPermissions });
  const roleSet   = new Set(roles.map((r) => r.toLowerCase()));
  const isTeacher = !isAdmin && roleSet.has('teacher');

  if (isAdmin) {
    return <AdminDashboard userName={userName} />;
  }

  if (isTeacher) {
    return <TeacherDashboard userName={userName} />;
  }

  return <StudentDashboard userName={userName} />;
}
