"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Complete from "@/public/images/about3.png";
import Slide1 from "@/public/images/about4.png";
import { resetPassword, validateResetPassword } from "@/apis/auth/auth.api";
import AdminLoader from "@/components/loader/Loader";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

type ApiValidationErrors = Record<string, string[]>;

type PasswordApiError = {
  message?: string;
  errors?: ApiValidationErrors;
  error?: {
    message?: string;
    validationErrors?: ApiValidationErrors;
  };
};

const getValidationErrors = (error: unknown): ApiValidationErrors => {
  if (!error || typeof error !== "object") {
    return {};
  }

  const candidate = error as PasswordApiError;
  return candidate.errors ?? candidate.error?.validationErrors ?? {};
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return "Unable to reset password.";
  }

  const candidate = error as PasswordApiError;
  return (
    candidate.message ??
    candidate.error?.message ??
    Object.values(getValidationErrors(error))[0]?.[0] ??
    "Unable to reset password."
  );
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [validating, setValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [pageError, setPageError] = useState("");
  const [resetComplete, setResetComplete] = useState(false);

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
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const nextEmail = searchParams.get("email") || "";
    const nextToken = searchParams.get("token") || "";

    setEmail(nextEmail);
    setToken(nextToken);

    if (!nextEmail || !nextToken) {
      setPageError("This password reset link is incomplete or invalid.");
      setIsValidLink(false);
      setValidating(false);
      return;
    }

    let isMounted = true;

    const validateLink = async () => {
      setValidating(true);
      setPageError("");

      try {
        const response = await validateResetPassword({
          email: nextEmail,
          token: nextToken,
        });

        if (!response.success) {
          throw response;
        }

        if (!isMounted) {
          return;
        }

        setIsValidLink(true);
      } catch (validationError: unknown) {
        if (!isMounted) {
          return;
        }

        setIsValidLink(false);
        setPageError(getErrorMessage(validationError));
      } finally {
        if (isMounted) {
          setValidating(false);
        }
      }
    };

    void validateLink();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setSubmitting(true);
    setPageError("");

    try {
      const response = await resetPassword({
        email,
        token,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      if (!response.success) {
        throw response;
      }

      setResetComplete(true);
      toast.success("Password reset successful. You can now login.");
    } catch (submitError: unknown) {
      const validationErrors = getValidationErrors(submitError);

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
      setPageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <AdminLoader
        title="Validating Reset Link"
        message="Checking whether your password reset link is still valid."
        hint="This usually takes just a moment."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div
        style={{ backgroundColor: "#E1E6F2" }}
        className="relative hidden w-1/3 flex-col items-center justify-center p-10 md:flex"
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

          <h1 className="mt-20 mb-4 text-4xl font-semibold text-opsh-primary">
            Reset Password
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Choose a new password for your account and continue securely.
          </p>
        </div>

        <p className="absolute bottom-10 right-10 mt-2 text-sm font-medium text-gray-600">
          Version 0.1.00
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 md:w-2/3">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-bold text-opsh-primary">
              Create a new password
            </h2>
            <p className="text-gray-400">
              Use a strong password you have not used before.
            </p>
          </div>

          {!isValidLink ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-lg font-semibold text-red-600">Invalid reset link</h3>
              <p className="mt-3 text-sm leading-6 text-red-500">
                {pageError || "This password reset link is no longer valid."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/forgot-password"
                  className="rounded-lg bg-opsh-secondary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-opsh-primary"
                >
                  Request a New Link
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-opsh-grey px-4 py-3 text-center text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-background"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : resetComplete ? (
            <div className="rounded-xl border border-opsh-success/30 bg-opsh-success/10 p-6">
              <h3 className="text-lg font-semibold text-opsh-primary">Password updated</h3>
              <p className="mt-3 text-sm leading-6 text-opsh-text">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="w-full rounded-lg bg-opsh-secondary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-opsh-primary"
                >
                  Go to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6 flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <span className="relative z-10 bg-white px-3 text-sm text-gray-400">
                  secure password reset
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="relative mb-4">
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    disabled
                    className="block w-full cursor-not-allowed rounded-lg border-2 border-gray-200 bg-gray-50 py-3.5 ps-6 pe-4 text-sm text-gray-500"
                  />
                  <label
                    htmlFor="reset-email"
                    className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400"
                  >
                    Account Email
                  </label>
                </div>

                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reset-password"
                    {...register("password")}
                    className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                      errors.password ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder=" "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <label
                    htmlFor="reset-password"
                    className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-blue-600"
                  >
                    New Password
                  </label>
                  {errors.password && (
                    <div className="mt-1 text-sm text-red-500">{errors.password.message}</div>
                  )}
                </div>

                <div className="relative mb-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="reset-confirm-password"
                    {...register("confirmPassword")}
                    className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder=" "
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <label
                    htmlFor="reset-confirm-password"
                    className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-blue-600"
                  >
                    Confirm Password
                  </label>
                  {errors.confirmPassword && (
                    <div className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-opsh-secondary py-3 text-white transition-colors duration-200 hover:bg-opsh-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent border-t-white" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {pageError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-center text-sm text-red-600">{pageError}</p>
                  </div>
                )}

                <p className="mt-5 text-center text-sm text-gray-600">
                  Need a new reset email?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Request another link
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AdminLoader
          title="Validating Reset Link"
          message="Checking whether your password reset link is still valid."
          hint="This usually takes just a moment."
        />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
