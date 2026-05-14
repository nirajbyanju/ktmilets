"use client";

import React, { useEffect, useState } from "react";
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
import useAuthStore from "@/stores/auth/AuthStore";
import AdminLoader from "@/components/loader/Loader";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;

const defaultLoginRedirect = "/admin/courses";

const getRedirectTarget = () => {
  if (typeof window === "undefined") {
    return defaultLoginRedirect;
  }

  const redirect = new URLSearchParams(window.location.search).get("redirect");

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.includes("://")) {
    return defaultLoginRedirect;
  }

  return redirect;
};

export default function LoginPage() {
  const { login, initializeAuth } = useAuthStore();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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
        router.replace(getRedirectTarget());
        return;
      }

      setAuthChecking(false);
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, router]);

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setLoading(true);

    try {
      await login(data.email, data.password);
      toast.success("Login successful!");
      router.replace(getRedirectTarget());
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

  const sliderData = [
    { image: Complete, url: "/" },
    { image: Slide1, url: "/" },
  ];

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
    <div className="flex h-screen">
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
            Welcome
          </h1>
          <p className="text-sm font-medium text-gray-600">
            We welcome you to our interactive learning and training platform.
          </p>
        </div>

        <p className="absolute bottom-10 right-10 mt-2 text-sm font-medium text-gray-600">
          Version 0.1.00
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-10 md:w-2/3">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-bold text-opsh-primary">
              Welcome back!
            </h2>
            <p className="text-gray-400">
              Strive for Greatness, Treasure every part of the Journey!
            </p>
          </div>

          <button className="mb-4 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-opsh-background p-3 hover:bg-gray-50">
            <span>Sign in with Google</span>
          </button>

          <div className="relative mb-2 flex w-full items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <span className="relative z-10 bg-white px-3 text-sm text-gray-400">
              or login with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="relative mb-5">
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`block w-full appearance-none rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-0 text-sm text-gray-900 focus:bg-white focus:outline-none peer ${
                  errors.email ? "border-red-500" : "border-opsh-darkgrey"
                }`}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="absolute left-6 top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform bg-white text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75"
              >
                Email
              </label>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="relative mb-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  className={`block w-full appearance-none rounded-lg border-2 bg-transparent py-3.5 ps-6 pe-10 text-sm text-gray-900 focus:bg-white focus:outline-none peer ${
                    errors.password ? "border-red-500" : "border-opsh-darkgrey"
                  }`}
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className="absolute left-6 top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform bg-white text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-semibold text-opsh-primary">
                  Remember Me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-opsh-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-opsh-secondary py-3 text-white transition-colors duration-200 hover:bg-opsh-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent border-t-white" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-center text-sm text-red-600">{error}</p>
              </div>
            )}

            <p className="mt-5 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
