'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FaChevronRight,
  FaClipboardCheck,
  FaFileInvoiceDollar,
  FaPassport,
  FaUserCog,
  FaUserGraduate,
} from 'react-icons/fa';

import { getInvoices } from '@/apis/invoice.api';
import { getMyEnrollments } from '@/apis/enrollment.api';
import { getMyMockTestEnrollments } from '@/apis/mock-test-enrollment.api';
import { getMyExamBookings } from '@/apis/examBooking.api';

const statusColors: Record<string, string> = {
  paid:        'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  unpaid:      'text-amber-700 bg-amber-50 ring-1 ring-amber-200',
  pending:     'text-amber-700 bg-amber-50 ring-1 ring-amber-200',
  booked:      'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  cancelled:   'text-red-700 bg-red-50 ring-1 ring-red-200',
  new_request: 'text-blue-700 bg-blue-50 ring-1 ring-blue-200',
  active:      'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  expired:     'text-red-700 bg-red-50 ring-1 ring-red-200',
};

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
  label, count, icon, href, accent, loading,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${accent}`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition group-hover:scale-105 ${accent.includes('opsh') ? 'bg-opsh-primary/10 text-opsh-primary' : accent.includes('violet') ? 'bg-violet-50 text-violet-600' : accent.includes('emerald') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {loading ? <Skeleton className="mt-1.5 h-7 w-10" /> : (
          <p className="mt-0.5 text-2xl font-black text-slate-900">{count}</p>
        )}
      </div>
      <FaChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
    </Link>
  );
}

function SectionCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-black text-slate-700">{title}</p>
        <Link href={href} className="text-xs font-bold text-opsh-primary hover:underline">View all →</Link>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function RowItem({ primary, secondary, badge, badgeClass }: {
  primary: string;
  secondary: string;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{primary}</p>
        <p className="text-xs text-slate-400">{secondary}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${badgeClass}`}>
        {badge.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, msg, href, cta }: { icon: React.ReactNode; msg: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <span className="text-4xl text-slate-200">{icon}</span>
      <p className="text-sm text-slate-400">{msg}</p>
      {href && cta && (
        <Link href={href} className="mt-1 text-xs font-bold text-opsh-primary hover:underline">{cta} →</Link>
      )}
    </div>
  );
}

export default function StudentDashboard({ userName }: { userName: string }) {
  const invoices    = useQuery({ queryKey: ['dash-my-invoices'],    queryFn: () => getInvoices({ limit: 5 }) });
  const enrollments = useQuery({ queryKey: ['dash-my-enrollments'], queryFn: () => getMyEnrollments({ limit: 5 }) });
  const mockTests   = useQuery({ queryKey: ['dash-my-mocks'],       queryFn: () => getMyMockTestEnrollments({ limit: 5 }) });
  const examBks     = useQuery({ queryKey: ['dash-my-exams'],       queryFn: getMyExamBookings });

  const invoiceList    = invoices.data?.data ?? [];
  const enrollmentList = enrollments.data?.data ?? [];
  const mockList       = mockTests.data?.data ?? [];
  const examList       = examBks.data ?? [];

  const today       = new Date().toISOString().slice(0, 10);
  const unpaidCount = invoiceList.filter((i) => i.status !== 'paid').length;
  const activeMocks = mockList.filter((m) => m.subscription_end && m.subscription_end >= today).length;

  const nextExam = examList
    .filter((b) => b.preferred_date >= today && b.status !== 'cancelled')
    .sort((a, b) => a.preferred_date.localeCompare(b.preferred_date))[0];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-opsh-secondary">Student Portal</p>
        <h1 className="mt-0.5 text-2xl font-black text-slate-900 sm:text-3xl">
          {greeting()}, {userName}
        </h1>
        <p className="mt-1 text-sm text-slate-400">KTM Test Prep · Your learning dashboard</p>
      </div>

      {/* Alerts */}
      <div className="mb-5 space-y-3">
        {unpaidCount > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <FaFileInvoiceDollar className="mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-black text-amber-800">
                {unpaidCount} unpaid invoice{unpaidCount > 1 ? 's' : ''} awaiting payment
              </p>
              <p className="text-xs text-amber-700">
                Complete your payment to confirm enrollment.{' '}
                <Link href="/admin/invoices" className="font-bold underline">Pay now →</Link>
              </p>
            </div>
          </div>
        )}
        {nextExam && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <FaPassport className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-black text-blue-800">Upcoming exam on {nextExam.preferred_date}</p>
              <p className="text-xs text-blue-700">
                {nextExam.examBooking?.exam_type ?? nextExam.exam_booking?.exam_type ?? 'Exam'} · {nextExam.passport_name} ·{' '}
                <span className="capitalize">{(nextExam.status ?? '').replace(/_/g, ' ')}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="My Invoices"
          count={invoices.data?.pagination?.total ?? invoiceList.length}
          icon={<FaFileInvoiceDollar />}
          href="/admin/invoices"
          accent="border-opsh-primary/20"
          loading={invoices.isLoading}
        />
        <StatCard
          label="Enrollments"
          count={enrollments.data?.pagination?.total ?? enrollmentList.length}
          icon={<FaUserGraduate />}
          href="/admin/enrollments"
          accent="border-violet-200"
          loading={enrollments.isLoading}
        />
        <StatCard
          label="Active Mocks"
          count={activeMocks}
          icon={<FaClipboardCheck />}
          href="/admin/mock-tests"
          accent="border-emerald-200"
          loading={mockTests.isLoading}
        />
        <StatCard
          label="Exam Bookings"
          count={examList.length}
          icon={<FaPassport />}
          href="/admin/exam-bookings"
          accent="border-amber-200"
          loading={examBks.isLoading}
        />
      </div>

      {/* Recent sections */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">

        <SectionCard title="Recent Invoices" href="/admin/invoices">
          {invoices.isLoading ? <SkeletonRows /> : invoiceList.length === 0 ? (
            <EmptyState icon={<FaFileInvoiceDollar />} msg="No invoices yet" />
          ) : invoiceList.slice(0, 4).map((inv) => (
            <RowItem
              key={inv.id}
              primary={`#${inv.invoice_number}`}
              secondary={`NPR ${Number(inv.total_npr ?? 0).toLocaleString()}`}
              badge={inv.status}
              badgeClass={statusColors[inv.status] ?? 'text-slate-600 bg-slate-100'}
            />
          ))}
        </SectionCard>

        <SectionCard title="My Enrollments" href="/admin/enrollments">
          {enrollments.isLoading ? <SkeletonRows /> : enrollmentList.length === 0 ? (
            <EmptyState icon={<FaUserGraduate />} msg="No enrollments yet" href="/admin/courses" cta="Browse courses" />
          ) : enrollmentList.slice(0, 4).map((enr) => (
            <RowItem
              key={enr.id}
              primary={enr.batch?.course?.course_name ?? 'Course'}
              secondary={enr.batch?.batch_type ?? '—'}
              badge={enr.payment_status ?? 'pending'}
              badgeClass={statusColors[enr.payment_status ?? ''] ?? 'text-slate-600 bg-slate-100'}
            />
          ))}
        </SectionCard>

        <SectionCard title="Mock Test Access" href="/admin/mock-tests">
          {mockTests.isLoading ? <SkeletonRows /> : mockList.length === 0 ? (
            <EmptyState icon={<FaClipboardCheck />} msg="No mock test subscriptions yet" />
          ) : mockList.slice(0, 4).map((mt) => {
            const isActive = mt.subscription_end && mt.subscription_end >= today;
            return (
              <RowItem
                key={mt.id}
                primary={mt.subscription?.subscriptions_name ?? 'Mock Test'}
                secondary={`Expires: ${mt.subscription_end ?? '—'}`}
                badge={isActive ? 'Active' : 'Expired'}
                badgeClass={isActive ? statusColors.active : statusColors.expired}
              />
            );
          })}
        </SectionCard>

        <SectionCard title="Exam Bookings" href="/admin/exam-bookings">
          {examBks.isLoading ? <SkeletonRows /> : examList.length === 0 ? (
            <EmptyState icon={<FaPassport />} msg="No exam bookings yet" />
          ) : examList.slice(0, 4).map((bk) => (
            <RowItem
              key={bk.id}
              primary={`${bk.examBooking?.exam_type ?? bk.exam_booking?.exam_type ?? '—'} · ${bk.passport_name}`}
              secondary={bk.preferred_date}
              badge={bk.status ?? 'pending'}
              badgeClass={statusColors[bk.status ?? ''] ?? 'text-slate-600 bg-slate-100'}
            />
          ))}
        </SectionCard>
      </div>

      {/* Quick links */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Quick Access</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { href: '/admin/invoices',         icon: <FaFileInvoiceDollar />, label: 'Invoices' },
            { href: '/admin/enrollments',      icon: <FaUserGraduate />,      label: 'Enrollments' },
            { href: '/admin/mock-tests',       icon: <FaClipboardCheck />,    label: 'Mock Tests' },
            { href: '/admin/exam-bookings',    icon: <FaPassport />,          label: 'Exam Bookings' },
            { href: '/admin/settings/profile', icon: <FaUserCog />,           label: 'Profile' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white py-5 text-center shadow-sm transition hover:border-opsh-primary/30 hover:shadow-md"
            >
              <span className="text-xl text-opsh-primary">{icon}</span>
              <span className="text-xs font-bold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
