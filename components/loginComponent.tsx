"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import Home1 from "@/public/images/image1.jpg";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import useAuthStore from "@/stores/auth/AuthStore";
import { registration } from "@/apis/auth/auth.api"; // ✅ adjust path if needed

// Login Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration Schema
const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginInput = z.infer<typeof loginSchema>;
type RegistrationInput = z.infer<typeof registrationSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectOnSuccess?: string | null;
  onLoginSuccess?: (() => void | Promise<void>) | null;
}

type AuthMode = 'login' | 'registration';

export default function LoginModal({
  isOpen,
  onClose,
  redirectOnSuccess = null,
  onLoginSuccess = null,
}: LoginModalProps) {
  const { login, initializeAuth } = useAuthStore();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Registration form
  const registrationForm = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
  });

  // Check authentication status
  useEffect(() => {
    if (!isOpen) {
      setAuthChecking(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      setAuthChecking(true);
      await initializeAuth();

      if (!isMounted) {
        return;
      }

      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        if (redirectOnSuccess) {
          router.replace(redirectOnSuccess);
        }
        onClose();
        return;
      }

      setAuthChecking(false);
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, isOpen, onClose, router]);

  // Reset forms when modal closes
  useEffect(() => {
    if (!isOpen) {
      loginForm.reset();
      registrationForm.reset();
      setError("");
      setMode('login');
    }
  }, [isOpen, loginForm, registrationForm]);

  const toggleMode = () => {
    setDirection(mode === 'login' ? 1 : -1);
    setMode(mode === 'login' ? 'registration' : 'login');
    setError("");
    loginForm.reset();
    registrationForm.reset();
  };

  const onLoginSubmit = async (data: LoginInput) => {
    setError("");
    setLoading(true);

    try {
      await login(data.email, data.password);
      toast.success("Login successful!");

      if (onLoginSuccess) {
        await onLoginSuccess();
      }

      if (redirectOnSuccess) {
        router.replace(redirectOnSuccess);
      }

      onClose();
    } catch (err: unknown) {
      let errorMessage = "Login failed";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRegistrationSubmit = async (data: RegistrationInput) => {
    setError("");
    setLoading(true);

    try {
      // Map the data according to your backend requirements
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password, // Backend will hash it
      };

      await registration(registrationData);
      toast.success("Registration successful! Please login.");
      setMode('login');
      setDirection(-1);
      registrationForm.reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sliderData = [{ image: Home1, url: "/" }];

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Show loading spinner while checking auth
  if (authChecking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg">
          <span className="loader border-t-blue-500 border-r-transparent border-4 rounded-full w-10 h-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-3xl w-full rounded-bl-[60px] bg-[#ffffff] relative mx-4 "
      >

        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-opsh-secondary hover:bg-opsh-secondary-hover text-white rounded-full flex items-center justify-center w-10 h-10 cursor-pointer z-10"
        >
          <IoClose size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden">
          {/* Left side - Carousel (static) */}
          <div className="bg-[#E1E6F2] p-8 flex flex-col justify-center text-center rounded-tr-[60px] rounded-bl-[60px] hidden md:block">
            <Carousel
              className="relative w-full flex flex-row justify-center"
              infiniteLoop
              emulateTouch
              showArrows={false}
              interval={5000}
              showThumbs={false}
              showStatus={false}
              autoPlay
            >
              {sliderData.map((item, idx) => (
                <Link href={item.url} key={idx} className="w-full">
                  <div className="relative overflow-hidden rounded-lg group">
                    <Image
                      src={item.image}
                      alt={`Slide ${idx + 1}`}
                      className="block w-full h-full scale-110 object-cover transform transition-transform duration-500 group-hover:scale-125"
                      priority={idx === 0}
                    />
                  </div>
                </Link>
              ))}
            </Carousel>
          </div>

          {/* Right side - Forms with animation */}
          <div className="p-8 bg-white relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  custom={direction}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-md"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-3 text-opsh-primary">Welcome back!</h2>
                    <p className="text-gray-400 text-sm">Strive for Greatness, Treasure every part of the Journey!</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="relative">
                    <div className="relative flex items-center">
                      <div className="relative flex items-center justify-center w-full py-4">
                        <div className="absolute left-0 bg-gray-300 w-1/2 h-px transform -translate-y-1/2"></div>
                        <p className="relative z-10 text-gray-400 bg-white px-2">or login with email</p>
                        <div className="absolute right-0 bg-gray-300 w-1/2 h-px transform -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    {/* Email field */}
                    <div className="relative mb-4">
                      <input
                        type="email"
                        id="login-email"
                        {...loginForm.register('email')}
                        className={`w-full border-2 rounded-lg ${loginForm.formState.errors.email ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-0 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none dark:text-dark dark:focus:border-blue-500 focus:outline-none peer`}
                        placeholder=" "
                      />
                      <label
                        htmlFor="login-email"
                        className="absolute text-md bg-white text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Email
                      </label>
                      {loginForm.formState.errors.email && (
                        <div className="text-red-500 text-sm mt-1">
                          {loginForm.formState.errors.email.message}
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="relative mb-4">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        {...loginForm.register('password')}
                        className={`w-full border-2 rounded-lg ${loginForm.formState.errors.password ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-10 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none dark:text-dark dark:focus:border-blue-500 focus:outline-none peer`}
                        placeholder=" "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <label
                        htmlFor="login-password"
                        className="absolute text-md bg-white text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Password
                      </label>
                      {loginForm.formState.errors.password && (
                        <div className="text-red-500 text-sm mt-1">
                          {loginForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2">
                        <input type="checkbox" id="rememberMe" className="form-checkbox h-4 w-4 text-blue-600" />
                        <label htmlFor="rememberMe" className="text-sm font-semibold text-opsh-primary">Remember Me</label>
                      </div>
                      <div>
                        <Link href="/forgot-password" className="text-sm font-semibold text-opsh-primary hover:underline">
                          Forgot Password?
                        </Link>
                      </div>
                    </div>

                    <button
                      className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg bg-opsh-secondary hover:bg-opsh-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          onClick={toggleMode}
                          className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                          Register here
                        </button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="registration"
                  custom={direction}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-md"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-opsh-primary">Create Account</h2>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)}>
                    {/* Name field */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        id="reg-name"
                        {...registrationForm.register('name')}
                        className={`w-full border-2 rounded-lg ${registrationForm.formState.errors.name ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-0 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none focus:outline-none peer`}
                        placeholder=" "
                      />
                      <label
                        htmlFor="reg-name"
                        className="absolute text-md bg-white text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Full Name
                      </label>
                      {registrationForm.formState.errors.name && (
                        <div className="text-red-500 text-sm mt-1">
                          {registrationForm.formState.errors.name.message}
                        </div>
                      )}
                    </div>

                    {/* Email field */}
                    <div className="relative mb-4">
                      <input
                        type="email"
                        id="reg-email"
                        {...registrationForm.register('email')}
                        className={`w-full border-2 rounded-lg ${registrationForm.formState.errors.email ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-0 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none focus:outline-none peer`}
                        placeholder=" "
                      />
                      <label
                        htmlFor="reg-email"
                        className="absolute text-md bg-white text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Email
                      </label>
                      {registrationForm.formState.errors.email && (
                        <div className="text-red-500 text-sm mt-1">
                          {registrationForm.formState.errors.email.message}
                        </div>
                      )}
                    </div>

                    {/* Phone field */}
                    <div className="relative mb-4">
                      <input
                        type="tel"
                        id="reg-phone"
                        {...registrationForm.register('phone')}
                        className={`w-full border-2 rounded-lg ${registrationForm.formState.errors.phone ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-0 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none focus:outline-none peer`}
                        placeholder=" "
                      />
                      <label
                        htmlFor="reg-phone"
                        className="absolute text-md bg-white text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Phone Number
                      </label>
                      {registrationForm.formState.errors.phone && (
                        <div className="text-red-500 text-sm mt-1">
                          {registrationForm.formState.errors.phone.message}
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="relative mb-4">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="reg-password"
                        {...registrationForm.register('password')}
                        className={`w-full border-2 rounded-lg ${registrationForm.formState.errors.password ? 'border-red-500' : 'border-gray-400'} block py-3.5 ps-6 pe-10 text-sm text-gray-900 bg-transparent focus:bg-white appearance-none focus:outline-none peer`}
                        placeholder=" "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <label
                        htmlFor="reg-password"
                        className="absolute text-md bg-white text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:text-blue-600 peer-focus:bg-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        Password
                      </label>
                      {registrationForm.formState.errors.password && (
                        <div className="text-red-500 text-sm mt-1">
                          {registrationForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    

                    <button
                      className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg bg-opsh-secondary hover:bg-opsh-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Register'}
                    </button>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={toggleMode}
                          className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                          Login here
                        </button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
