import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import {
  crmWorkflows,
  ktmBrand,
  ktmContact,
  pricingPlans,
  valuePoints,
} from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Computer-Based IELTS and PTE Online Classes",
  description:
    "KTM Test Preparation Centre offers live online computer-based IELTS and PTE classes, recorded demo class access, Alfa mock tests, exam booking support, and student follow-up.",
  path: "/",
  keywords: [
    "IELTS online class Nepal",
    "PTE online class Nepal",
    "computer based IELTS Nepal",
    "KTM Test Prep",
    "Alfa mock test Nepal",
  ],
});

const quickLinks = [
  {
    title: "IELTS Online Class",
    text: "6-week computer-based IELTS preparation with all four skills, Alfa IELTS mock support, and booking guidance.",
    href: "/ielts",
  },
  {
    title: "PTE Online Class",
    text: "Live computer-based PTE Academic preparation with speaking, writing, reading, listening, and mock practice.",
    href: "/pte",
  },
  {
    title: "Exam Booking",
    text: "Request IELTS Academic, IELTS General Training, or PTE Academic booking support from the admin team.",
    href: "/exam-booking",
  },
  {
    title: "Mock Test Practice",
    text: "Buy Alfa IELTS or Alfa PTE mock-test practice packages with access and follow-up workflow.",
    href: "/mock-tests",
  },
];

const classSystem = [
  "Live Zoom delivery with teacher verification before class access",
  "6 weeks / 30 total hours for IELTS and PTE preparation",
  "Group batches, premium focus groups, one-to-one classes, evening, weekend, and global flex options",
  "Writing and speaking practice through Zoom, WhatsApp simulation, and guided feedback",
];

export default function HomePage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[{ name: "Home", path: "/" }]}
        schemas={[
          buildWebPageSchema({
            title: "Computer-Based IELTS and PTE Online Classes",
            description:
              "Live online IELTS and PTE classes, demo access, exam booking support, Alfa mock tests, and CRM-managed student follow-up.",
            path: "/",
          }),
        ]}
      />

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              {ktmBrand.tagline}
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-opsh-primary sm:text-5xl lg:text-6xl">
              Computer-Based IELTS and PTE Online Classes
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              {ktmBrand.officialName} supports students in Nepal and abroad with live
              online preparation, a recorded 2-hour demo class, Alfa mock-test practice,
              exam booking support, and structured student follow-up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white shadow-opsh-secondary transition hover:bg-opsh-secondary-hover"
              >
                Register Now
              </Link>
              <Link
                href="/demo"
                className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                Watch Demo Class
              </Link>
              <a
                href={`https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="rounded border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/students-hero.svg"
              alt="Student attending an online IELTS and PTE preparation class"
              width={760}
              height={560}
              className="mx-auto h-auto w-full max-w-xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {valuePoints.map((point) => (
              <div key={point} className="rounded border border-slate-200 bg-white p-4 shadow-opsh-sm">
                <p className="text-sm font-black text-opsh-primary">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Pricing preview
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Flexible plans for private, group, weekend, evening, and overseas learners
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.slice(0, 4).map((plan) => (
              <article
                key={plan.name}
                className={`rounded-lg border p-5 shadow-opsh-sm ${
                  plan.featured
                    ? "border-opsh-secondary bg-red-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-black text-opsh-primary">{plan.name}</h3>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                    {plan.size}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-opsh-secondary">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{plan.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/registration"
              className="rounded bg-opsh-primary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
            >
              Choose a Plan
            </Link>
            <Link
              href="/payment"
              className="rounded border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-opsh-primary hover:text-opsh-primary"
            >
              Payment / Checkout
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Class system
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Built for launch now and multi-batch growth later
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              The public website presents a clear student journey while the operational model
              supports CRM tagging, batch allocation, payment follow-up, attendance tracking,
              and admin notes.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {classSystem.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm transition hover:-translate-y-1 hover:border-opsh-primary hover:shadow-opsh-md"
              >
                <h3 className="text-lg font-black text-opsh-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                <span className="mt-4 inline-flex text-sm font-black text-opsh-secondary">
                  Open page
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr,1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              CRM and automation
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Every enquiry should become a trackable student workflow
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Registration, payment, booking, mock-test purchase, attendance, follow-up notes,
              WhatsApp communication, and export needs are represented throughout the site.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {crmWorkflows.map((item) => (
              <div key={item} className="rounded border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
          <Image
            src="/students-computer.svg"
            alt="Student using computer-based IELTS and PTE practice"
            width={620}
            height={460}
            className="mx-auto h-auto w-full max-w-lg"
          />
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Nepal and overseas learners
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Clear online support for students in Kathmandu, across Nepal, and abroad
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Students can register, request payment guidance, ask for IELTS or PTE exam booking
              help, buy mock-test practice, and contact the team through WhatsApp, email, phone,
              or the website.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/exam-booking"
                className="rounded bg-opsh-primary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Book IELTS / PTE Exam
              </Link>
              <Link
                href="/mock-tests"
                className="rounded border border-opsh-secondary px-5 py-3 text-sm font-black text-opsh-secondary transition hover:bg-opsh-secondary hover:text-white"
              >
                Buy Mock Test Practice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
