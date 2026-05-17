'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaFileUpload,
  FaIdCard,
  FaMapMarkerAlt,
  FaPassport,
  FaPhoneAlt,
  FaSpinner,
  FaTimes,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa';

import { submitExamBooking } from '@/apis/examBooking.api';
import type { ExamBookingSubmitPayload, TestType } from '@/types/examBooking';

type FormValues = {
  test_type: TestType | '';
  student_name: string;
  phone: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
  preferred_test_centre: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  special_message: string;
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorClass = 'mt-1 text-xs text-red-500';

export default function ExamBookingForm({ onSuccess }: { onSuccess?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      test_type: '',
      student_name: '',
      phone: '',
      email: '',
      preferred_date: '',
      preferred_time: '',
      preferred_test_centre: '',
      passport_name: '',
      passport_number: '',
      date_of_birth: '',
      special_message: '',
    },
  });

  const submitMutation = useMutation({
    mutationFn: (payload: ExamBookingSubmitPayload) => submitExamBooking(payload),
    onSuccess: () => {
      toast.success('Booking request submitted successfully! Our team will review and contact you shortly.');
      reset();
      setSelectedFile(null);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const appError = error as { errors?: Record<string, string[]>; message?: string };
      const firstError = appError?.errors
        ? Object.values(appError.errors)[0]?.[0]
        : appError?.message;
      toast.error(firstError || 'Failed to submit booking request.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) { setSelectedFile(null); return; }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
      setFileError('Only JPG, PNG, or PDF files are allowed.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be under 5 MB.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const onSubmit = handleSubmit((values) => {
    if (!selectedFile) { setFileError('Passport copy is required.'); return; }
    if (!values.test_type) return;

    submitMutation.mutate({
      test_type:             values.test_type as TestType,
      student_name:          values.student_name,
      phone:                 values.phone,
      email:                 values.email,
      preferred_date:        values.preferred_date,
      preferred_time:        values.preferred_time || undefined,
      preferred_test_centre: values.preferred_test_centre,
      passport_name:         values.passport_name,
      passport_number:       values.passport_number,
      date_of_birth:         values.date_of_birth,
      passport_copy:         selectedFile,
      special_message:       values.special_message || undefined,
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-opsh-primary p-5 text-white">
        <h2 className="text-lg font-bold">IELTS and PTE Exam Booking Support</h2>
        <p className="mt-1 text-sm text-white/80">
          Submit your preferred test type, date, location, and passport details. Our admin team will
          review and guide you through the next step.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
            <FaPhoneAlt className="text-white/70" />
            <span>Office: 8:00 AM – 5:00 PM (Sun–Fri)</span>
          </div>
          <a
            href="https://wa.me/9779747469800"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
          >
            <FaWhatsapp className="text-green-300" />
            <span>+977 9747469800</span>
          </a>
        </div>
      </div>

      {/* Status workflow */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Admin Status Workflow
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['New Request', 'Document Pending', 'Payment Pending', 'Booking in Process', 'Booked'].map(
            (s, i, arr) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="rounded-full bg-opsh-primary/10 px-2.5 py-1 font-medium text-opsh-primary">
                  {s}
                </span>
                {i < arr.length - 1 && <span className="text-gray-400">→</span>}
              </span>
            )
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* ── Section: Basic Info ── */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-wide text-opsh-secondary">
            Student Information
          </legend>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Test type */}
            <div>
              <label className={labelClass}>
                Test type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('test_type', { required: 'Test type is required.' })}
                className={inputClass}
              >
                <option value="">Select test type</option>
                <option value="IELTS">IELTS</option>
                <option value="PTE">PTE</option>
              </select>
              {errors.test_type && <p className={errorClass}>{errors.test_type.message}</p>}
            </div>

            {/* Student name */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-xs text-opsh-primary" />
                  Student name <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Your full name"
                {...register('student_name', { required: 'Student name is required.' })}
                className={inputClass}
              />
              {errors.student_name && <p className={errorClass}>{errors.student_name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaPhoneAlt className="text-xs text-opsh-primary" />
                  Phone number <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="tel"
                placeholder="+977 98XXXXXXXX"
                {...register('phone', { required: 'Phone number is required.' })}
                className={inputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
                })}
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* ── Section: Test Preferences ── */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-wide text-opsh-secondary">
            Test Preferences
          </legend>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Preferred date */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-xs text-opsh-primary" />
                  Preferred test date <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                min={today}
                {...register('preferred_date', { required: 'Preferred date is required.' })}
                className={inputClass}
              />
              {errors.preferred_date && <p className={errorClass}>{errors.preferred_date.message}</p>}
            </div>

            {/* Preferred time */}
            <div>
              <label className={labelClass}>
                Preferred test time <span className="text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="time"
                {...register('preferred_time')}
                className={inputClass}
              />
            </div>

            {/* Preferred test centre */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-xs text-opsh-primary" />
                  Preferred test centre <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kathmandu — British Council, IDP"
                {...register('preferred_test_centre', { required: 'Test centre is required.' })}
                className={inputClass}
              />
              {errors.preferred_test_centre && (
                <p className={errorClass}>{errors.preferred_test_centre.message}</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* ── Section: Passport / Identity ── */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-wide text-opsh-secondary">
            Passport &amp; Identity
          </legend>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Passport name */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaPassport className="text-xs text-opsh-primary" />
                  Name as on passport <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Full name as printed on passport"
                {...register('passport_name', { required: 'Passport name is required.' })}
                className={inputClass}
              />
              {errors.passport_name && <p className={errorClass}>{errors.passport_name.message}</p>}
            </div>

            {/* Passport number */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FaIdCard className="text-xs text-opsh-primary" />
                  Passport number <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. AB1234567"
                {...register('passport_number', { required: 'Passport number is required.' })}
                className={inputClass}
              />
              {errors.passport_number && <p className={errorClass}>{errors.passport_number.message}</p>}
            </div>

            {/* Date of birth */}
            <div>
              <label className={labelClass}>
                Date of birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={yesterday}
                {...register('date_of_birth', { required: 'Date of birth is required.' })}
                className={inputClass}
              />
              {errors.date_of_birth && <p className={errorClass}>{errors.date_of_birth.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* ── Passport copy upload ── */}
        <div>
          <label className={labelClass}>
            Passport copy <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-400">(JPG, PNG, PDF — max 5 MB)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-opsh-primary hover:bg-opsh-primary/5"
            >
              <FaFileUpload className="text-2xl text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Click to upload your passport copy</span>
              <span className="text-xs text-gray-400">JPG, PNG or PDF, up to 5 MB</span>
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {fileError && <p className={errorClass}>{fileError}</p>}
        </div>

        {/* Special message */}
        <div>
          <label className={labelClass}>
            Special message or request{' '}
            <span className="text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Date flexibility, urgency, or anything else the admin should know."
            {...register('special_message')}
            className={inputClass + ' resize-none'}
          />
        </div>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-opsh-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-opsh-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitMutation.isPending ? (
            <>
              <FaSpinner className="animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <FaCheckCircle />
              Submit Booking Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
