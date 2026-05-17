'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { setPassword as setPasswordApi } from '@/apis/auth/auth.api';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormInput = z.infer<typeof schema>;

interface SetPasswordModalProps {
  onSuccess: () => void;
}

export default function SetPasswordModal({ onSuccess }: SetPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormInput) => {
    setLoading(true);
    try {
      await setPasswordApi({
        password:              data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success('Password set successfully!');
      onSuccess();
    } catch {
      toast.error('Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-opsh-primary/10">
            <FaLock className="text-2xl text-opsh-primary" />
          </div>
          <h1 className="text-2xl font-black text-opsh-primary">Set Your Password</h1>
          <p className="mt-1 text-sm text-gray-500">
            You signed in with Google. Please set a password to continue — you can use it to log in
            with your email next time.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder=" "
              className={`block w-full appearance-none rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 peer focus:bg-white focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 ${
                errors.password ? 'border-red-500' : 'border-gray-200 focus:border-opsh-primary'
              }`}
            />
            <label className="absolute left-6 top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform bg-white text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75">
              New password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('password_confirmation')}
              placeholder=" "
              className={`block w-full appearance-none rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 peer focus:bg-white focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-200 focus:border-opsh-primary'
              }`}
            />
            <label className="absolute left-6 top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform bg-white text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75">
              Confirm password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password_confirmation && (
              <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-opsh-primary py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent border-t-white" />
            )}
            {loading ? 'Setting password…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
