"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Complete from "@/public/images/about3.png";
import Slide1 from "@/public/images/about4.png";
import { registration as registerAccount } from "@/apis/auth/auth.api";
import useAuthStore from "@/stores/auth/AuthStore";
import AdminLoader from "@/components/loader/Loader";

const registrationSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegistrationInput = z.infer<typeof registrationSchema>;

type ApiValidationErrors = Record<string, string[]>;

type RegisterApiError = {
  message?: string;
  error?: {
    message?: string;
    validationErrors?: ApiValidationErrors;
    error?: {
      validationErrors?: ApiValidationErrors;
    };
  };
};

const getValidationErrors = (error: unknown): ApiValidationErrors => {
  if (!error || typeof error !== "object") {
    return {};
  }

  const candidate = error as RegisterApiError;
  return (
    candidate.error?.validationErrors ??
    candidate.error?.error?.validationErrors ??
    {}
  );
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return "Registration failed";
  }

  const candidate = error as RegisterApiError;
  return (
    candidate.message ??
    candidate.error?.message ??
    Object.values(getValidationErrors(error))[0]?.[0] ??
    "Registration failed"
  );
};

const buildRegistrationPayload = (data: RegistrationInput) => {
  const trimmedName = data.name.trim();
  const nameParts = trimmedName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? trimmedName;
  const lastName = nameParts.slice(1).join(" ");

  return {
    name: trimmedName,
    full_name: trimmedName,
    first_name: firstName,
    last_name: lastName,
    email: data.email.trim(),
    phone: data.phone.trim(),
    password: data.password,
    password_confirmation: data.confirmPassword,
  };
};

export default function RegisterPage() {
  const { initializeAuth } = useAuthStore();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");

  const sliderData = useMemo(
    () => [
      { image: Complete, url: "/" },
      { image: Slide1, url: "/" },
    ],
    []
  );

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      await initializeAuth();

      if (!isMounted) {
        return;
      }

      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        router.replace("/admin/courses");
        return;
      }

      setAuthChecking(false);
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, router]);

  const onSubmit = async (data: RegistrationInput) => {
    setError("");
    setLoading(true);

    try {
      const response = await registerAccount(buildRegistrationPayload(data));

      if (!response.success) {
        throw response;
      }

      toast.success("Registration successful. Please login to continue.");
      router.replace("/login");
    } catch (submitError: unknown) {
      const validationErrors = getValidationErrors(submitError);

      if (validationErrors.name?.[0]) {
        setFieldError("name", { type: "server", message: validationErrors.name[0] });
      }
      if (validationErrors.email?.[0]) {
        setFieldError("email", { type: "server", message: validationErrors.email[0] });
      }
      if (validationErrors.phone?.[0]) {
        setFieldError("phone", { type: "server", message: validationErrors.phone[0] });
      }
      if (validationErrors.password?.[0]) {
        setFieldError("password", { type: "server", message: validationErrors.password[0] });
      }
      if (validationErrors.password_confirmation?.[0]) {
        setFieldError("confirmPassword", {
          type: "server",
          message: validationErrors.password_confirmation[0],
        });
      }

      const errorMessage = getErrorMessage(submitError);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <AdminLoader
        title="Checking Session"
        message="Verifying whether you already have an active session."
        hint="You will be redirected automatically if you are already signed in."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div
        className="relative hidden w-1/3 flex-col items-center justify-center bg-[#E1E6F2] p-10 md:flex"
      >
        <div className="relative w-full max-w-xs text-center">
          <Carousel
            className="relative flex w-full flex-row justify-center"
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
                <div className="group relative overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={`Slide ${idx + 1}`}
                    className="block h-full w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-125"
                    priority={idx === 0}
                  />
                </div>
              </Link>
            ))}
          </Carousel>

          <h1 className="mt-20 mb-4 text-4xl font-black text-opsh-primary">
            Join Us
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Create your account to manage course registration, invoices, and class enrollment.
          </p>
        </div>

      </div>

      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 md:w-2/3">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-black text-opsh-primary">
              Create your account
            </h2>
            <p className="text-gray-400">
              Register with your email and password to continue.
            </p>
          </div>

          <div className="relative mb-6 flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <span className="relative z-10 bg-white px-3 text-sm text-gray-400">
              registration form
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="relative mb-4">
              <input
                type="text"
                id="reg-name"
                {...register("name")}
                className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-4 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
                placeholder=" "
              />
              <label
                htmlFor="reg-name"
                className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-opsh-primary"
              >
                Full Name
              </label>
              {errors.name && (
                <div className="mt-1 text-sm text-red-500">{errors.name.message}</div>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type="email"
                id="reg-email"
                {...register("email")}
                className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-4 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
                placeholder=" "
              />
              <label
                htmlFor="reg-email"
                className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-opsh-primary"
              >
                Email
              </label>
              {errors.email && (
                <div className="mt-1 text-sm text-red-500">{errors.email.message}</div>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type="tel"
                id="reg-phone"
                {...register("phone")}
                className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-4 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                  errors.phone ? "border-red-500" : "border-gray-200"
                }`}
                placeholder=" "
              />
              <label
                htmlFor="reg-phone"
                className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-opsh-primary"
              >
                Phone Number
              </label>
              {errors.phone && (
                <div className="mt-1 text-sm text-red-500">{errors.phone.message}</div>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                id="reg-password"
                {...register("password")}
                className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                placeholder=" "
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <label
                htmlFor="reg-password"
                className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-500 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-opsh-primary"
              >
                Password
              </label>
              {errors.password && (
                <div className="mt-1 text-sm text-red-500">{errors.password.message}</div>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="reg-confirm-password"
                {...register("confirmPassword")}
                className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-200"
                }`}
                placeholder=" "
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <label
                htmlFor="reg-confirm-password"
                className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-500 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-opsh-primary"
              >
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <div className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              className="mt-3 w-full rounded-lg bg-opsh-secondary py-3 text-white hover:bg-opsh-primary disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-opsh-primary hover:text-opsh-primary/80 hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-center text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
