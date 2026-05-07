import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

import FooterLogo from "@/public/Logowhite.png";
import {
  footerBrowseLinks,
  footerCompanyLinks,
  footerContactItems,
} from "@/components/layout/footer/footer.data";

const contactIcons = {
  address: FaMapMarkerAlt,
  phone: FaPhoneAlt,
  email: FaEnvelope,
} as const;

export default function DesktopFooter() {
  return (
    <footer className="mt-16 hidden overflow-hidden bg-gradient-to-br from-opsh-primary-dark via-[#033331] to-opsh-primary text-opsh-text lg:block">
      <div className="mx-auto max-w-7xl py-12">
        <div className="grid gap-10 xl:grid-cols-[1.2fr,0.8fr,0.8fr,1fr]">
          <div className="max-w-xl">
            <div className="mb-6 flex flex-col items-end gap-4 sm:flex-row">
              <Image
                src={FooterLogo}
                alt="Samriddhi Real Estate footer logo"
                className="h-16 w-auto"
              />
              <div className="text-center">
                <div className="space-y-[-2px]">
                  <span className="block font-brand text-2xl tracking-tight text-opsh-text md:text-3xl">
                    SAMRIDDHI
                  </span>
                  <span className="block font-brand text-sm tracking-wider text-opsh-text/80 md:text-base">
                    REAL ESTATE
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-7 text-opsh-text">
              Trusted real estate patterns for buying, selling, and property verification delivered with transparency and genuine care.
            </p>

            <div className="mt-6 space-y-3 text-sm text-opsh-text">
              {footerContactItems.map((item) => {
                const Icon = contactIcons[item.type];

                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="rounded border border-white/10 bg-white/10 p-2">
                      <Icon className="text-sm text-opsh-text" />
                    </div>
                    <div>
                      {item.href ? (
                        <a href={item.href} className="hover:text-opsh-text">
                          {item.label}
                        </a>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-brand text-lg font-semibold">Company</h2>
            <ul className="space-y-3 text-sm text-opsh-text/75">
              {footerCompanyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="inline-flex transition-all duration-200 hover:translate-x-1 hover:text-opsh-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-brand text-lg font-semibold">Browse Properties</h2>
            <ul className="space-y-3 text-sm text-opsh-text/75">
              {footerBrowseLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="inline-flex transition-all duration-200 hover:translate-x-1 hover:text-opsh-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-opsh-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="font-brand text-lg font-semibold">Stay Connected</h2>
            <p className="mt-3 text-sm leading-7 text-opsh-text/75">
              Browse curated property categories, compare locations, and reach out when you are ready to shortlist your next move.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/properties-list"
                className="rounded border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-opsh-text transition-colors hover:bg-white/20"
              >
                Explore Listings
              </Link>
              <Link
                href="/contact-us"
                className="rounded bg-opsh-text px-4 py-2 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-white-off"
              >
                Contact Team
              </Link>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-white/15" />

        <div className="flex flex-col gap-4 text-sm text-opsh-text/70 md:flex-row md:items-center md:justify-between">
          <div>Samriddhi Real Estate &copy; 2026 All Rights Reserved</div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/terms-and-conditions" className="hover:text-opsh-text">
              Terms of Service
            </Link>
            <span className="text-opsh-text/30">|</span>
            <Link href="/privacy-policy" className="hover:text-opsh-text">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
