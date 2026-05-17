'use client';

import { useState } from 'react';
import { FaClipboardList, FaPlusCircle } from 'react-icons/fa';

import ExamBookingForm from '@/components/admin/examBooking/ExamBookingForm';
import MyExamBookings from '@/components/admin/examBooking/MyExamBookings';
import { isAdminUser } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

type Tab = 'book' | 'my-bookings';

export default function ExamBookingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('book');

  const roles             = useAuthStore((state) => state.roles);
  const permissions       = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const isAdmin = isAdminUser({ roles, permissions, directPermissions });

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Exam Services</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Exam Booking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit your IELTS or PTE booking request and track its progress.
        </p>
      </div>

      <div className="mb-6 flex gap-1 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('book')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'book'
              ? 'bg-opsh-primary text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaPlusCircle />
          Book Exam
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-bookings')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'my-bookings'
              ? 'bg-opsh-primary text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaClipboardList />
          My Applications
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {activeTab === 'book' ? (
          <ExamBookingForm onSuccess={() => setActiveTab('my-bookings')} />
        ) : (
          <MyExamBookings isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}
