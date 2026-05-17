"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBook,
  FaClipboardList,
  FaEnvelope,
  FaFacebookF,
  FaHome,
  FaInstagram,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPhoneAlt,
  FaRegCalendarCheck,
  FaTiktok,
  FaUserPlus,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import { ktmBrand, ktmContact, ktmSocials, publicNavItems } from "@/data/ktm";
import Logo from "@/public/ktm-logo.jpg";

const socialIcons = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  YouTube: FaYoutube,
};

const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
  "Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes."
)}`;

const mobileNavItems = [
  { href: "/", label: "Home", Icon: FaHome },
  { href: "/demo", label: "Courses", Icon: FaBook },
  { href: "/exam-booking", label: "Exam", Icon: FaClipboardList },
  { href: "/mock-tests", label: "Practice", Icon: FaPencilAlt },
  { href: "/registration", label: "Register", Icon: FaUserPlus },
];

export default function Footer() {
  const pathname = usePathname();
  return (
    <>
      <footer className="mt-16 bg-opsh-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr,0.9fr,1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-white p-2">
                  <Image
                    src={Logo}
                    alt={`${ktmBrand.officialName} logo`}
                    className="h-12 w-auto"
                  />
                </span>
                <div>
                  <p className="text-lg font-black">{ktmBrand.officialName}</p>
                  <p className="text-sm text-white/75">{ktmBrand.tagline}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/80">
                Online computer-based IELTS and PTE preparation with demo class access,
                exam booking support, Alfa mock-test practice, and CRM-managed student
                follow-up.
              </p>
              <p className="mt-4 text-xs text-white/70">
                Mother company:{" "}
                <a
                  href={ktmBrand.motherCompanyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:underline"
                >
                  {ktmBrand.motherCompany}
                </a>
              </p>
            </div>

            <div className="hidden sm:block">
              <h2 className="text-sm font-black uppercase tracking-wide text-white/80">
                Main Pages
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {publicNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden sm:block">
              <h2 className="text-sm font-black uppercase tracking-wide text-white/80">
                Student Actions
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li>
                  <Link href="/registration" className="transition hover:text-white">
                    Register for Class
                  </Link>
                </li>
                <li>
                  <Link href="/payment" className="transition hover:text-white">
                    Payment / Checkout
                  </Link>
                </li>
                <li>
                  <Link href="/exam-booking" className="transition hover:text-white">
                    IELTS / PTE Exam Booking
                  </Link>
                </li>
                <li>
                  <Link href="/mock-tests" className="transition hover:text-white">
                    Buy Alfa Mock Practice
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="transition hover:text-white">
                    Terms and Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-white/80">
                Contact
              </h2>
              <div className="mt-4 space-y-4 text-sm text-white/80">
                <a href={`tel:${ktmContact.phone}`} className="flex gap-3 hover:text-white">
                  <FaPhoneAlt className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{ktmContact.phone}</span>
                </a>
                <a href={whatsappUrl} className="flex gap-3 hover:text-white">
                  <FaWhatsapp className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{ktmContact.whatsapp}</span>
                </a>
                <a href={`mailto:${ktmContact.email}`} className="flex gap-3 hover:text-white">
                  <FaEnvelope className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{ktmContact.email}</span>
                </a>
                <a
                  href={ktmContact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 hover:text-white"
                >
                  <FaMapMarkerAlt className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{ktmContact.address}</span>
                </a>
                <div className="flex gap-3">
                  <FaRegCalendarCheck className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{ktmContact.hours}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {ktmSocials.map((social) => {
                  const Icon = socialIcons[social.label as keyof typeof socialIcons];

                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={social.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/15 bg-white/10 transition hover:bg-white/20"
                    >
                      {Icon ? <Icon aria-hidden="true" /> : social.label.slice(0, 1)}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile-only quick links */}
          

          <div className="mt-10 border-t border-white/15 pt-6 text-sm text-white/70 md:flex md:items-center md:justify-between">
            <p>{ktmBrand.officialName} &copy; 2026 All Rights Reserved</p>
            <p className="mt-2 md:mt-0">Putalisadak, Kathmandu, Nepal</p>
          </div>
        </div>
      </footer>

      
    </>
  );
}
