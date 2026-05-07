"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";

import { ktmBrand, ktmContact, publicNavItems } from "@/data/ktm";
import Logo from "@/public/ktm-logo.jpg";

const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
  "Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes."
)}`;

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${ktmBrand.officialName} home`}
        >
          <Image
            src={Logo}
            alt={`${ktmBrand.officialName} logo`}
            className="h-11 w-auto"
            priority
          />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-black uppercase tracking-wide text-opsh-primary">
              {ktmBrand.shortName}
            </p>
            <p className="truncate text-xs font-semibold text-slate-600">{ktmBrand.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
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
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          
          <Link
            href="/login"
            className="rounded bg-opsh-secondary px-4 py-2 text-sm font-black text-white shadow-opsh-secondary transition hover:bg-opsh-secondary-hover"
          >
            Log In
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded border border-slate-200 text-opsh-primary lg:hidden"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white lg:hidden">
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
          </nav>
        </div>
      ) : null}
    </header>
  );
}
