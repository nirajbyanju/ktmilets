'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FaBookOpen,
  FaCheckCircle,
  FaClipboardList,
  FaEnvelope,
  FaExclamationTriangle,
  FaPassport,
  FaUserGraduate,
  FaUsers,
  FaChalkboardTeacher,
} from 'react-icons/fa';

import { getAdminEnrollmentStats } from '@/apis/enrollment.api';
import { getExamBookingStats } from '@/apis/examBooking.api';
import { getMockTestEnrollmentStats } from '@/apis/mock-test-enrollment.api';
import { getContactMessageStats } from '@/apis/contactMessage.api';
import { canManageUsers } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ''}`} />;
}

function StatCard({
  label, value, sub, icon, accent, loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${accent}`}>
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accent.replace('border-', 'bg-').split(' ')[0]}`} />
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {loading ? (
            <>
              <Skeleton className="mt-2 h-8 w-16" />
              <Skeleton className="mt-1.5 h-3 w-24" />
            </>
          ) : (
            <>
              <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
              {sub && <p className="mt-0.5 truncate text-xs text-slate-400">{sub}</p>}
            </>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accent.includes('opsh') ? 'bg-opsh-primary/10 text-opsh-primary' : accent.includes('violet') ? 'bg-violet-50 text-violet-600' : accent.includes('emerald') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-50 px-3 py-3 text-center">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="mt-0.5 text-xs text-slate-500">{label}</span>
    </div>
  );
}

function SectionCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-black text-slate-700">{title}</p>
        <Link href={href} className="text-xs font-bold text-opsh-primary hover:underline">View all →</Link>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function QuickLink({ href, icon, label, desc }: { href: string; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-opsh-primary/30 hover:shadow-md"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-opsh-primary/10 text-base text-opsh-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="truncate text-xs text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const roles = useAuthStore((s) => s.roles);
  const isSuperAdmin = canManageUsers({ roles });

  const enrollStats = useQuery({ queryKey: ['dash-enroll-stats'],  queryFn: getAdminEnrollmentStats });
  const examStats   = useQuery({ queryKey: ['dash-exam-stats'],    queryFn: getExamBookingStats });
  const mockStats   = useQuery({ queryKey: ['dash-mock-stats'],    queryFn: getMockTestEnrollmentStats });
  const msgStats    = useQuery({ queryKey: ['dash-msg-stats'],     queryFn: getContactMessageStats });

  const es  = enrollStats.data;
  const exs = examStats.data;
  const ms  = mockStats.data;
  const mgs = msgStats.data;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-opsh-secondary">{isSuperAdmin ? 'Super Admin' : 'Admin'} · Overview</p>
          <h1 className="mt-0.5 text-2xl font-black text-slate-900 sm:text-3xl">
            {greeting()}, {userName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{today}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Enrollments"
          value={enrollStats.isLoading ? 0 : (es?.total ?? 0)}
          sub={es ? `${es.paid} paid · ${es.payment_due} pending` : undefined}
          icon={<FaUserGraduate />}
          accent="border-opsh-primary/20"
          loading={enrollStats.isLoading}
        />
        <StatCard
          label="Exam Bookings"
          value={examStats.isLoading ? 0 : (exs?.total ?? 0)}
          sub={exs ? `${exs.booked} booked · ${exs.new_request} new` : undefined}
          icon={<FaPassport />}
          accent="border-violet-200"
          loading={examStats.isLoading}
        />
        <StatCard
          label="Mock Tests Active"
          value={mockStats.isLoading ? 0 : (ms?.active ?? 0)}
          sub={ms ? `${ms.total} total · ${ms.expired} expired` : undefined}
          icon={<FaClipboardList />}
          accent="border-emerald-200"
          loading={mockStats.isLoading}
        />
        <StatCard
          label="New Messages"
          value={msgStats.isLoading ? 0 : (mgs?.new ?? 0)}
          sub={mgs ? `${mgs.total} total · ${mgs.in_progress} in progress` : undefined}
          icon={<FaEnvelope />}
          accent="border-amber-200"
          loading={msgStats.isLoading}
        />
      </div>

      {/* Pending payment alert */}
      {es && es.payment_due > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-black text-amber-800">
              {es.payment_due} enrollment{es.payment_due > 1 ? 's' : ''} with pending payment
            </p>
            <p className="text-xs text-amber-700">
              Follow up with students to confirm payment.{' '}
              <Link href="/admin/enrollments" className="font-bold underline">View now →</Link>
            </p>
          </div>
        </div>
      )}

      {/* New messages alert */}
      {mgs && mgs.new > 0 && (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <FaEnvelope className="mt-0.5 shrink-0 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-black text-blue-800">
              {mgs.new} new message{mgs.new > 1 ? 's' : ''} awaiting response
            </p>
            <p className="text-xs text-blue-700">
              <Link href="/admin/contact-messages" className="font-bold underline">Open inbox →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Breakdowns */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <SectionCard title="Enrollment Breakdown" href="/admin/enrollments">
          {enrollStats.isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : es ? (
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Paid"        value={es.paid}          color="text-emerald-600" />
              <MiniStat label="Pending"     value={es.payment_due}   color="text-amber-500" />
              <MiniStat label="Completed"   value={es.completed}     color="text-opsh-primary" />
              <MiniStat label="Cert. Ready" value={es.cert_eligible} color="text-violet-600" />
              <MiniStat label="Total"       value={es.total}         color="text-slate-700" />
            </div>
          ) : <p className="text-xs text-slate-400">No data</p>}
        </SectionCard>

        <SectionCard title="Exam Booking Status" href="/admin/exam-bookings">
          {examStats.isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : exs ? (
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="New"       value={exs.new_request}     color="text-blue-600" />
              <MiniStat label="Booked"    value={exs.booked}          color="text-emerald-600" />
              <MiniStat label="Pmt Due"   value={exs.payment_pending} color="text-amber-500" />
              <MiniStat label="Cancelled" value={exs.cancelled}       color="text-red-500" />
            </div>
          ) : <p className="text-xs text-slate-400">No data</p>}
        </SectionCard>

        <SectionCard title="Contact Messages" href="/admin/contact-messages">
          {msgStats.isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : mgs ? (
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="New"         value={mgs.new}         color="text-blue-600" />
              <MiniStat label="In Progress" value={mgs.in_progress} color="text-amber-500" />
              <MiniStat label="Replied"     value={mgs.replied}     color="text-violet-600" />
              <MiniStat label="Resolved"    value={mgs.resolved}    color="text-emerald-600" />
              <MiniStat label="Spam"        value={mgs.spam}        color="text-red-500" />
              <MiniStat label="Total"       value={mgs.total}       color="text-slate-700" />
            </div>
          ) : <p className="text-xs text-slate-400">No data</p>}
        </SectionCard>
      </div>

      {/* Quick links */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Quick Access</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <QuickLink href="/admin/courses"          icon={<FaBookOpen />}         label="Course Catalog"   desc="Manage IELTS & PTE courses" />
          <QuickLink href="/admin/enrollments"      icon={<FaUserGraduate />}     label="Enrollments"      desc="Course enrollment management" />
          <QuickLink href="/admin/exam-bookings"    icon={<FaPassport />}         label="Exam Bookings"    desc="Booking requests & status" />
          <QuickLink href="/admin/mock-tests"       icon={<FaClipboardList />}    label="Mock Tests"       desc="Subscription plans & access" />
          <QuickLink href="/admin/contact-messages" icon={<FaEnvelope />}         label="Messages"         desc="Student enquiries & support" />
          <QuickLink href="/admin/teachers"         icon={<FaChalkboardTeacher />} label="Teachers"        desc="Manage teaching staff" />
          {isSuperAdmin && (
            <QuickLink href="/admin/user-management" icon={<FaUsers />}           label="User Management"  desc="Accounts & access control" />
          )}
          <QuickLink href="/admin/settings/profile" icon={<FaCheckCircle />}      label="Profile Settings" desc="Update your account details" />
        </div>
      </div>
    </div>
  );
}
