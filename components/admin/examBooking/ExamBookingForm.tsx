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
  FaWhatsapp,
} from 'react-icons/fa';

import { submitExamBooking } from '@/apis/examBooking.api';
import type { ExamBookingSubmitPayload, TestType } from '@/types/examBooking';

type FormValues = {
  test_type: TestType | '';
  preferred_date: string;
  test_location: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
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
      preferred_date: '',
      test_location: '',
      passport_name: '',
      passport_number: '',
      date_of_birth: '',
      contact_number: '',
      email: '',
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

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
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

  const onSubmit = handleSubmit((values) => {
    if (!selectedFile) {
      setFileError('Passport copy is required.');
      return;
    }

    if (!values.test_type) return;

    submitMutation.mutate({
      test_type: values.test_type as TestType,
      preferred_date: values.preferred_date,
      test_location: values.test_location,
      passport_name: values.passport_name,
      passport_number: values.passport_number,
      date_of_birth: values.date_of_birth,
      contact_number: values.contact_number,
      email: values.email,
      passport_copy: selectedFile,
      special_message: values.special_message || undefined,
    });
  });

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="rounded-2xl bg-gradient-to-r from-opsh-primary via-[#055853] to-opsh-fourth p-5 text-white">
        <h2 className="text-lg font-bold">IELTS and PTE Exam Booking Support</h2>
        <p className="mt-1 text-sm text-white/80">
          Submit your preferred test type, date, location, passport details, and passport copy so the admin team
          can review documents and guide the next step.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
            <FaPhoneAlt className="text-white/70" />
            <span>Office: 8:00 AM – 5:00 PM (Sun–Fri)</span>
          </div>
          <a
            href="https://wa.me/9779747469800"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 transition-colors"
          >
            <FaWhatsapp className="text-green-300" />
            <span>+977 9747469800</span>
          </a>
        </div>
      </div>

      {/* Status workflow reference */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Admin Status Workflow</p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['New Request', 'Document Pending', 'Payment Pending', 'Booking in Process', 'Booked'].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="rounded-full bg-opsh-primary/10 px-2.5 py-1 font-medium text-opsh-primary">{s}</span>
              {i < arr.length - 1 && <span className="text-gray-400">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Test type */}
          <div>
            <label className={labelClass}>
              Test type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('test_type', { required: 'Test type is required.' })}
              className={inputClass}
            >
              <option value="">Select an option</option>
              <option value="IELTS">IELTS</option>
              <option value="PTE">PTE</option>
            </select>
            {errors.test_type && <p className={errorClass}>{errors.test_type.message}</p>}
          </div>

          {/* Preferred date */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-opsh-primary text-xs" />
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

          {/* Location */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-opsh-primary text-xs" />
                Preferred test location / test centre <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kathmandu, British Council"
              {...register('test_location', { required: 'Test location is required.' })}
              className={inputClass}
            />
            {errors.test_location && <p className={errorClass}>{errors.test_location.message}</p>}
          </div>

          {/* Passport name */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <FaPassport className="text-opsh-primary text-xs" />
                Passport name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Full name as on passport"
              {...register('passport_name', { required: 'Passport name is required.' })}
              className={inputClass}
            />
            {errors.passport_name && <p className={errorClass}>{errors.passport_name.message}</p>}
          </div>

          {/* Passport number */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <FaIdCard className="text-opsh-primary text-xs" />
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
              max={today}
              {...register('date_of_birth', { required: 'Date of birth is required.' })}
              className={inputClass}
            />
            {errors.date_of_birth && <p className={errorClass}>{errors.date_of_birth.message}</p>}
          </div>

          {/* Contact number */}
          <div>
            <label className={labelClass}>
              Contact number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="+977 98XXXXXXXX"
              {...register('contact_number', { required: 'Contact number is required.' })}
              className={inputClass}
            />
            {errors.contact_number && <p className={errorClass}>{errors.contact_number.message}</p>}
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

        {/* Passport copy upload */}
        <div>
          <label className={labelClass}>
            Passport copy upload <span className="text-red-500">*</span>
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
          <label className={labelClass}>Special message or request</label>
          <textarea
            rows={4}
            placeholder="Share date flexibility, test centre preference, or urgent needs."
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
              Submitting...
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
