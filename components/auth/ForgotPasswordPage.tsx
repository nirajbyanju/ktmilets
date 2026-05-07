"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Complete from "@/public/images/about3.png";
import Slide1 from "@/public/images/about4.png";
import { forgotPassword } from "@/apis/auth/auth.api";
import AdminLoader from "@/components/loader/Loader";
import useAuthStore from "@/stores/auth/AuthStore";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

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
    return "Unable to send reset instructions.";
  }

  const candidate = error as PasswordApiError;
  return (
    candidate.message ??
    candidate.error?.message ??
    Object.values(getValidationErrors(error))[0]?.[0] ??
    "Unable to send reset instructions."
  );
};

export default function ForgotPasswordPage() {
  const { initializeAuth } = useAuthStore();
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

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
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
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
        router.replace("/admin/dashboard");
        return;
      }

      setAuthChecking(false);
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, router]);

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await forgotPassword({ email: data.email.trim() });

      if (!response.success) {
        throw response;
      }

      setSubmittedEmail(data.email.trim());
      toast.success("Password reset instructions sent successfully.");
    } catch (submitError: unknown) {
      const validationErrors = getValidationErrors(submitError);

      if (validationErrors.email?.[0]) {
        setFieldError("email", { type: "server", message: validationErrors.email[0] });
      }

      const errorMessage = getErrorMessage(submitError);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <AdminLoader
        title="Preparing Password Help"
        message="Checking your session before opening the reset request page."
        hint="You will be redirected automatically if you are already signed in."
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
            Password Help
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Enter your email and we will send password reset instructions for your account.
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
              Forgot your password?
            </h2>
            <p className="text-gray-400">
              We will send a secure reset link to the email address you use to log in.
            </p>
          </div>

          {submittedEmail ? (
            <div className="rounded-xl border border-opsh-success/30 bg-opsh-success/10 p-6">
              <h3 className="text-lg font-semibold text-opsh-primary">Check your inbox</h3>
              <p className="mt-3 text-sm leading-6 text-opsh-text">
                If an account exists for <span className="font-semibold text-opsh-black">{submittedEmail}</span>,
                password reset instructions have been sent.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedEmail("");
                    setError("");
                  }}
                  className="rounded-lg border border-opsh-grey px-4 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-background"
                >
                  Send Again
                </button>
                <Link
                  href="/login"
                  className="rounded-lg bg-opsh-secondary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-opsh-primary"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6 flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <span className="relative z-10 bg-white px-3 text-sm text-gray-400">
                  reset request form
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="relative mb-4">
                  <input
                    type="email"
                    id="forgot-email"
                    {...register("email")}
                    className={`block w-full rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-4 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none peer ${
                      errors.email ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="forgot-email"
                    className="absolute top-3 z-10 origin-[0] -translate-y-6 scale-75 bg-white text-md text-gray-400 duration-300 peer-placeholder-shown:start-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:translate-x-5 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:bg-white peer-focus:text-blue-600"
                  >
                    Email Address
                  </label>
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-500">{errors.email.message}</div>
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                {error && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-center text-sm text-red-600">{error}</p>
                  </div>
                )}

                <p className="mt-5 text-center text-sm text-gray-600">
                  Remembered your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Back to login
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
