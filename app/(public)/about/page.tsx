import type { Metadata } from "next";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmBrand, ktmContact } from "@/data/ktm";
import {
  buildAboutPageSchema,
  buildPageMetadata,
  buildWebPageSchema,
} from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "About KTM Test Preparation Centre — IELTS & PTE Training in Nepal",
  description:
    "About KTM Test Preparation Centre — IELTS & PTE classes for Nepalese students in Nepal and abroad. Backed by 10+ years of education experience. Contact us in Putalisadak, Kathmandu.",
  path: "/about",
  keywords: ["KTM Test Preparation Centre", "KTM Educational Consultancy", "IELTS PTE Nepal"],
});

const offerings = [
  "IELTS Academic preparation (online and physical)",
  "PTE Academic preparation (online and physical)",
  "Computer-based mock test practice",
  "IELTS and PTE exam booking support",
  "Basic study-abroad guidance through KTM Educational Consultancy",
];

const consultancyServices = [
  "Study abroad counselling",
  "University selection",
  "Scholarship guidance",
  "Visa documentation",
  "Admission support",
  "Pre-departure guidance",
];

const contactItems = [
  {
    icon: "📞",
    label: "Phone",
    value: ktmContact.phone,
    href: `tel:${ktmContact.phone.replace(/\s/g, "")}`,
  },
  {
    icon: "💬",
    label: "WhatsApp",
    value: ktmContact.whatsapp,
    href: `https://wa.me/${ktmContact.whatsappDigits}`,
  },
  {
    icon: "✉️",
    label: "Email",
    value: ktmContact.email,
    href: `mailto:${ktmContact.email}`,
  },
  {
    icon: "📍",
    label: "Address",
    value: ktmContact.address,
    href: null,
  },
  {
    icon: "🕒",
    label: "Office Hours",
    value: "8:00 AM – 5:00 PM\nSunday to Friday",
    href: null,
  },
  {
    icon: "🌐",
    label: "Parent Consultancy",
    value: "www.ktmeducational.edu.np",
    href: ktmBrand.motherCompanyWebsite,
  },
];

export default function AboutPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        schemas={[
          buildAboutPageSchema(
            "KTM Test Preparation Centre is a dedicated online IELTS and PTE preparation unit under KTM Educational Consultancy."
          ),
          buildWebPageSchema({
            title: "About KTM Test Preparation Centre",
            description:
              "Institute profile, support model, teacher quality system, and student follow-up approach.",
            path: "/about",
          }),
        ]}
      />

      {/* Hero */}
      <section className="bg-opsh-primary py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>›</span>
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            About {ktmBrand.officialName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            A focused IELTS and PTE training arm of {ktmBrand.motherCompany} — built to give
            Nepalese students the computer-based preparation they actually need.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded bg-white px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-slate-100"
            >
              Contact Us →
            </a>
            <Link
              href="/demo"
              className="rounded border border-white px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              Book a Free Demo
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white py-14" id="about">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-8 text-slate-700">
              For more than 10 years, <strong>{ktmBrand.motherCompany}</strong> has helped
              Nepalese students achieve their study-abroad dreams.{" "}
              <strong>{ktmBrand.officialName}</strong> is our dedicated IELTS and PTE training
              arm — built to give students the focused, computer-based preparation they need to
              succeed.
            </p>
            <p className="mt-4 leading-8 text-slate-700">
              We offer both online and physical classes, with a strong focus on computer-based
              IELTS and PTE preparation. Our classes are designed for two groups: students in
              Nepal and Nepalese students living abroad who want simple teaching, regular
              practice, and honest guidance.
            </p>
          </div>

          {/* Our Promise */}
          <div className="mt-8 rounded-lg border border-opsh-primary/20 bg-opsh-primary/5 p-6">
            <h3 className="text-lg font-black text-opsh-primary">Our Promise</h3>
            <p className="mt-2 leading-7 text-slate-700">
              Honest teaching, regular practice, and real exam-style preparation — at a fee
              every Nepalese student can afford.
            </p>
          </div>

          {/* What We Offer */}
          <div className="mt-10">
            <h2 className="text-2xl font-black text-opsh-primary">What We Offer</h2>
            <ul className="mt-4 space-y-2">
              {offerings.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-1 shrink-0 text-opsh-secondary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 10+ Years */}
          <div className="mt-10">
            <h2 className="text-2xl font-black text-opsh-primary">
              Backed by 10+ Years of Education Experience
            </h2>
            <p className="mt-4 leading-8 text-slate-700">
              {ktmBrand.officialName} operates under{" "}
              <strong>{ktmBrand.motherCompany}</strong>, an education consultancy based in
              Putalisadak, Kathmandu, with more than 10 years of experience in student
              counselling and education support.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              Through our parent consultancy, students can also get help with:
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {consultancyServices.map((service) => (
                <li key={service} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-1 shrink-0 text-opsh-secondary">✓</span>
                  {service}
                </li>
              ))}
            </ul>
            <p className="mt-5 leading-7 text-slate-700">
              We support students planning to study in the UK, Australia, Canada, Japan, Korea,
              Malta, the Netherlands, and other popular destinations.
            </p>
            <p className="mt-3">
              <strong>Learn more: </strong>
              <a
                href={ktmBrand.motherCompanyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-opsh-secondary hover:underline"
              >
                {ktmBrand.motherCompanyWebsite.replace("https://", "")}
              </a>
            </p>
          </div>

          {/* Why We Built */}
          <div className="mt-10">
            <h2 className="text-2xl font-black text-opsh-primary">
              Why We Built {ktmBrand.officialName}
            </h2>
            <p className="mt-4 leading-8 text-slate-700">
              Over the years we noticed two things.{" "}
              <strong>First</strong>, many Nepalese students were paying high fees for IELTS and
              PTE classes but not getting the computer-based practice that matches the real test.{" "}
              <strong>Second</strong>, Nepalese students who had already moved abroad were
              struggling to find IELTS/PTE classes that worked in their time zone.
            </p>
            <p className="mt-4 leading-8 text-slate-700">
              So we built this — a focused IELTS and PTE centre that solves both problems. Live
              online teaching. Real computer-based practice. Time-zone-friendly batches. And fees
              that don&apos;t break the bank.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-50 py-14" id="contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-opsh-primary">Need Help? Contact Support</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
              For class enrolment, mock test subscriptions, and exam booking, please use your{" "}
              <Link href="/login" className="font-semibold text-opsh-secondary hover:underline">
                student dashboard
              </Link>{" "}
              — it&apos;s faster and gives you live status updates. Contact us here for technical
              issues, payment problems, or anything that isn&apos;t working as expected.
            </p>
          </div>

          {/* Contact card */}
          <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm">
            <h3 className="text-xl font-black text-opsh-primary">Reach Us</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mt-0.5 text-sm font-semibold text-opsh-secondary hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-line text-sm text-slate-700">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <a
                href={`https://wa.me/${ktmContact.whatsappDigits}?text=Hi%20KTM%20Test%20Prep%2C%20I%20have%20a%20question.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#25D366] px-6 py-3 text-sm font-black text-white transition hover:bg-[#1ebe5d]"
              >
                💬 Chat with Us on WhatsApp
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="mt-10">
            <h2 className="mb-4 text-center text-2xl font-black text-opsh-primary">
              Find Us on the Map
            </h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-opsh-sm">
              <iframe
                src={ktmContact.mapEmbedUrl}
                width="100%"
                height="400"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KTM Test Preparation Centre — Putalisadak, Kathmandu"
                className="block w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-opsh-primary p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h2 className="text-2xl font-black">
                Prefer to See How Our Class Works First?
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Watch our free demo class or book a 30-minute live session with a teacher.
              </p>
            </div>
            <Link
              href="/demo"
              className="mt-5 inline-flex shrink-0 rounded bg-white px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-slate-100 md:mt-0"
            >
              Book a Free Demo Class →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
