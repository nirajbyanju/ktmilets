'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEye, FaEyeSlash, FaTimes, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import useAuthStore from '@/stores/auth/AuthStore';
import { registration } from '@/apis/auth/auth.api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectOnSuccess?: string | null;
  onLoginSuccess?: (() => void | Promise<void>) | null;
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectOnSuccess = null,
  onLoginSuccess = null,
}: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      loginForm.reset();
      registerForm.reset();
      setError('');
      setTab('login');
      setShowPass(false);
      setShowConfirmPass(false);
    }
  }, [isOpen, loginForm, registerForm]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const switchTab = (next: 'login' | 'register') => {
    setTab(next);
    setError('');
    loginForm.reset();
    registerForm.reset();
    setShowPass(false);
    setShowConfirmPass(false);
  };

  const onLoginSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      onClose();
      if (onLoginSuccess) await onLoginSuccess();
      if (redirectOnSuccess) router.replace(redirectOnSuccess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterInput) => {
    setError('');
    setLoading(true);
    try {
      await registration({ name: data.name, email: data.email, phone: data.phone, password: data.password });
      toast.success('Account created! Please log in.');
      switchTab('login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-opsh-secondary text-white shadow transition hover:bg-opsh-secondary-hover"
          aria-label="Close"
        >
          <FaTimes size={14} />
        </button>

        {/* Header */}
        <div className="rounded-t-2xl bg-opsh-primary px-6 py-5 text-white">
          <h2 className="text-xl font-black">
            {tab === 'login' ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {tab === 'login'
              ? 'Log in to buy mock test practice packages.'
              : 'Sign up to access mock test practice packages.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-black transition ${
              tab === 'login'
                ? 'border-b-2 border-opsh-primary text-opsh-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FaSignInAlt />
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-black transition ${
              tab === 'register'
                ? 'border-b-2 border-opsh-primary text-opsh-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FaUserPlus />
            Register
          </button>
        </div>

        <div className="p-6">
            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate className="space-y-4">
                <Field
                  label="Email"
                  type="email"
                  id="login-email"
                  registration={loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                <PasswordField
                  label="Password"
                  id="login-password"
                  show={showPass}
                  onToggle={() => setShowPass((v) => !v)}
                  registration={loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />

                <div className="flex items-center justify-end">
                  <a
                    href="/forgot-password"
                    className="text-xs font-bold text-opsh-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-opsh-primary py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:opacity-60"
                >
                  {loading ? 'Logging in…' : 'Log In'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="font-black text-opsh-primary hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate className="space-y-4">
                <Field
                  label="Full Name"
                  type="text"
                  id="reg-name"
                  registration={registerForm.register('name')}
                  error={registerForm.formState.errors.name?.message}
                />
                <Field
                  label="Email"
                  type="email"
                  id="reg-email"
                  registration={registerForm.register('email')}
                  error={registerForm.formState.errors.email?.message}
                />
                <Field
                  label="Phone Number"
                  type="tel"
                  id="reg-phone"
                  registration={registerForm.register('phone')}
                  error={registerForm.formState.errors.phone?.message}
                />
                <PasswordField
                  label="Password"
                  id="reg-password"
                  show={showPass}
                  onToggle={() => setShowPass((v) => !v)}
                  registration={registerForm.register('password')}
                  error={registerForm.formState.errors.password?.message}
                />
                <PasswordField
                  label="Confirm Password"
                  id="reg-confirm"
                  show={showConfirmPass}
                  onToggle={() => setShowConfirmPass((v) => !v)}
                  registration={registerForm.register('confirmPassword')}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-opsh-primary py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="font-black text-opsh-primary hover:underline"
                  >
                    Log in here
                  </button>
                </p>
              </form>
            )}
          </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  type: string;
  id: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

function Field({ label, type, id, registration, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-black text-slate-600">
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...registration}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-opsh-primary/30 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-opsh-primary'
        }`}
        placeholder={label}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

interface PasswordFieldProps extends Omit<FieldProps, 'type' | 'registration'> {
  registration: UseFormRegisterReturn;
  show: boolean;
  onToggle: () => void;
}

function PasswordField({ label, id, show, onToggle, registration, error }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-black text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          {...registration}
          className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-opsh-primary/30 ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-opsh-primary'
          }`}
          placeholder={label}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
