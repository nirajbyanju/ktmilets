"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaTimes, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

import { ktmBrand, ktmContact, publicNavItems } from "@/data/ktm";
import Logo from "@/public/ktm-logo.jpg";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import useAuthStore from "@/stores/auth/AuthStore";

const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
  "Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes."
)}`;

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const toText = (value: unknown): string => (typeof value === "string" ? value : "");
const toRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void initializeAuth({ preloadMenu: false });
  }, [initializeAuth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userDetail = toRecord(user?.userdetail) ?? toRecord(user?.userDetail) ?? toRecord(user?.user_detail);
  const firstName = toText(user?.first_name) || toText(user?.firstName) || toText(user?.name).split(" ")[0] || "Student";
  const lastName = toText(user?.last_name) || toText(user?.lastName);
  const profilePicture =
    toText(userDetail?.profilePicture) ||
    toText(userDetail?.profile_picture_url) ||
    toText(userDetail?.profilePictureUrl) ||
    toText(user?.profile_picture_url) ||
    toText(user?.profilePictureUrl);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      toast.success("Logged out successfully.");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.info("Session ended.");
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      setProfileOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3"
          aria-label={`${ktmBrand.officialName} home`}
        >
          <Image
            src={Logo}
            alt={`${ktmBrand.officialName} logo`}
            className="h-10 w-auto sm:h-11"
            priority
          />
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-black uppercase tracking-wide text-opsh-primary">
              {ktmBrand.shortName}
            </p>
            <p className="hidden truncate text-xs font-semibold text-slate-600 2xl:block">
              {ktmBrand.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Primary navigation">
          {publicNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-bold transition ${isActive
                    ? "bg-opsh-primary text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-opsh-primary"
                  }`}
              >
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/registration"
            className="rounded bg-opsh-secondary px-4 py-2 text-sm font-black text-white shadow-opsh-secondary transition hover:bg-opsh-secondary-hover"
          >
            Register
          </Link>
          {token ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1.5 text-sm font-black text-opsh-primary transition hover:bg-slate-100"
                aria-expanded={profileOpen}
              >
                <span>Hi, {firstName}</span>
                <span className="h-8 w-8 overflow-hidden rounded-full border border-opsh-primary/30">
                  <ProfileAvatar
                    firstName={firstName}
                    lastName={lastName}
                    imageUrl={profilePicture || null}
                    size="sm"
                    className="h-full w-full text-xs"
                  />
                </span>
                <FaChevronDown className={`text-xs transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-opsh-primary"
                  >
                    <FaTachometerAlt />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-opsh-danger transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <FaSignOutAlt />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded border border-slate-200 px-4 py-2 text-sm font-black text-opsh-primary transition hover:bg-slate-100"
            >
              Log In
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded border border-slate-200 text-opsh-primary xl:hidden"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4" aria-label="Mobile navigation">
            {publicNavItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded px-3 py-3 text-sm font-bold ${isActive
                      ? "bg-opsh-primary text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-opsh-primary"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-700"
              >
                <FaWhatsapp aria-hidden="true" />
                WhatsApp
              </a>
              <Link
                href="/registration"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded bg-opsh-secondary px-3 py-3 text-center text-sm font-black text-white"
              >
                Register Now
              </Link>
            </div>
            {token ? (
              <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-opsh-primary/30">
                    <ProfileAvatar
                      firstName={firstName}
                      lastName={lastName}
                      imageUrl={profilePicture || null}
                      size="sm"
                      className="h-full w-full text-xs"
                    />
                  </div>
                  <p className="text-sm font-black text-opsh-primary">Hi, {firstName}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-opsh-primary px-3 py-3 text-center text-sm font-black text-white"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="rounded border border-red-200 bg-white px-3 py-3 text-sm font-black text-opsh-danger disabled:opacity-60"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
