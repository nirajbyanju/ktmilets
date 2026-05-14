'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa';

import { submitContactMessage } from '@/apis/contactMessage.api';
import type { ContactMessageSubmitPayload, ContactMessageSubmitResult } from '@/types/contactMessage';

type FormValues = ContactMessageSubmitPayload;

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
const errorClass = 'mt-1.5 text-xs text-red-500';

function SuccessState({ result, onReset }: { result: ContactMessageSubmitResult; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <FaCheckCircle className="text-3xl text-emerald-500" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-gray-900">Message Sent!</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Thank you for reaching out. Our team will get back to you within one business day.
      </p>
      <div className="mt-5 rounded-xl border border-opsh-primary/20 bg-opsh-primary/5 px-6 py-3 text-sm">
        <p className="text-gray-500">Your reference number</p>
        <p className="mt-1 text-lg font-black tracking-wider text-opsh-primary">{result.reference}</p>
        <p className="mt-1 text-xs text-gray-400">Keep this for follow-up on WhatsApp or email.</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        Send another message
      </button>
    </div>
  );
}

export default function ContactForm() {
  const [successResult, setSuccessResult] = useState<ContactMessageSubmitResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => submitContactMessage(payload),
    onSuccess: (result) => {
      setSuccessResult(result);
      reset();
    },
    onError: (error: unknown) => {
      const appError = error as { errors?: Record<string, string[]>; message?: string };
      const first = appError?.errors ? Object.values(appError.errors)[0]?.[0] : appError?.message;
      alert(first || 'Failed to send message. Please try again.');
    },
  });

  if (successResult) {
    return <SuccessState result={successResult} onReset={() => setSuccessResult(null)} />;
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5" noValidate>
      {/* Full name */}
      <div>
        <label htmlFor="cf-name" className={labelClass}>
          <span className="flex items-center gap-1.5">
            <FaUser className="text-opsh-primary text-xs" />
            Full name <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="cf-name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          {...register('full_name', { required: 'Full name is required.' })}
          className={inputClass}
        />
        {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="cf-email" className={labelClass}>
          <span className="flex items-center gap-1.5">
            <FaEnvelope className="text-opsh-primary text-xs" />
            Email address <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="cf-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required.',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
          })}
          className={inputClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="cf-wa" className={labelClass}>
          <span className="flex items-center gap-1.5">
            <FaWhatsapp className="text-green-500 text-sm" />
            WhatsApp number <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="cf-wa"
          type="tel"
          placeholder="+977 98XXXXXXXX"
          autoComplete="tel"
          {...register('whatsapp_number', { required: 'WhatsApp number is required.' })}
          className={inputClass}
        />
        {errors.whatsapp_number && <p className={errorClass}>{errors.whatsapp_number.message}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="cf-subject" className={labelClass}>
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="cf-subject"
          type="text"
          placeholder="How can we help you?"
          {...register('subject', { required: 'Subject is required.' })}
          className={inputClass}
        />
        {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className={labelClass}>
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={5}
          placeholder="Write your question here."
          {...register('message', {
            required: 'Message is required.',
            minLength: { value: 10, message: 'Message must be at least 10 characters.' },
          })}
          className={inputClass + ' resize-none'}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {/* Office info */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <FaPhone className="text-opsh-primary" />
          Office hours: Sun–Fri, 8:00 AM–5:00 PM
        </span>
        <a
          href="https://wa.me/9779747469800"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-green-600 hover:underline"
        >
          <FaWhatsapp />
          +977 9747469800 (Urgent)
        </a>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-opsh-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-opsh-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {mutation.isPending ? (
          <>
            <FaSpinner className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <FaEnvelope />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
