'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  FaBookOpen,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaUserCog,
  FaUserTie,
} from 'react-icons/fa';

import { getMyTeacherProfile } from '@/apis/teacher.api';

const statusStyle: Record<string, { bar: string; badge: string; banner: string; text: string; sub: string; msg: string }> = {
  Active: {
    bar:    'bg-emerald-500',
    badge:  'bg-emerald-100 text-emerald-700',
    banner: 'border-emerald-200 bg-emerald-50',
    text:   'text-emerald-800',
    sub:    'text-emerald-700',
    msg:    'You are currently active and teaching.',
  },
  Backup: {
    bar:    'bg-amber-400',
    badge:  'bg-amber-100 text-amber-700',
    banner: 'border-amber-200 bg-amber-50',
    text:   'text-amber-800',
    sub:    'text-amber-700',
    msg:    'You are currently on backup status.',
  },
  Inactive: {
    bar:    'bg-red-400',
    badge:  'bg-red-100 text-red-700',
    banner: 'border-red-200 bg-red-50',
    text:   'text-red-800',
    sub:    'text-red-700',
    msg:    'Your status is currently inactive.',
  },
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 shrink-0 text-opsh-primary/50">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
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

export default function TeacherDashboard({ userName }: { userName: string }) {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['teacher-my-profile'],
    queryFn: getMyTeacherProfile,
    retry: false,
  });

  const style = profile ? (statusStyle[profile.status] ?? statusStyle.Inactive) : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-opsh-secondary">Teacher Portal</p>
        <h1 className="mt-0.5 text-2xl font-black text-slate-900 sm:text-3xl">
          {greeting()}, {userName}
        </h1>
        <p className="mt-1 text-sm text-slate-400">KTM Test Prep · Teacher Dashboard</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            </div>
          ) : isError || !profile ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FaUserTie className="text-3xl text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Profile not set up yet</p>
              <p className="text-xs text-slate-400">Ask an admin to link your teacher profile.</p>
            </div>
          ) : (
            <>
              {/* Status bar */}
              <div className={`h-1.5 w-full ${style!.bar}`} />

              {/* Photo + name */}
              <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
                {profile.profile_photo ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                    <Image src={profile.profile_photo} alt={profile.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-opsh-primary/10 text-3xl font-black text-opsh-primary shadow-inner">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-black text-slate-900">{profile.name}</p>
                  <p className="text-sm text-slate-500">{profile.course} Teacher</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${style!.badge}`}>
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="divide-y divide-slate-100 px-6 pb-4">
                <InfoRow icon={<FaBookOpen size={13} />} label="Teaching"  value={profile.course} />
                <InfoRow icon={<FaClock size={13} />}    label="Available" value={profile.available_time} />
                <InfoRow icon={<FaPhone size={13} />}    label="Phone"     value={profile.phone} />
                <InfoRow icon={<FaEnvelope size={13} />} label="Email"     value={profile.email} />
              </div>

              {profile.notes && (
                <div className="mx-6 mb-5 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                  <p className="mt-1 text-sm text-slate-600">{profile.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Status banner */}
          {style && profile && (
            <div className={`rounded-2xl border px-5 py-4 ${style.banner}`}>
              <p className={`font-black ${style.text}`}>{style.msg}</p>
              <p className={`mt-0.5 text-sm ${style.sub}`}>Contact admin if you need to update your availability.</p>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Quick Access</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickLink href="/admin/settings/profile" icon={<FaUserCog />}  label="Profile Settings" desc="Update your account details" />
              <QuickLink href="/admin/courses"          icon={<FaBookOpen />} label="Course Catalog"   desc="View available courses" />
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">About Your Dashboard</p>
            <p className="text-sm text-slate-500">
              Your dashboard shows your teaching profile and current status. Student data, schedules,
              and class materials are managed by the admin team. Reach out if you need any changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
