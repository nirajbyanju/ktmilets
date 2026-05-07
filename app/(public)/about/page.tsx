import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmBrand, ktmContact } from "@/data/ktm";
import {
  buildAboutPageSchema,
  buildPageMetadata,
  buildWebPageSchema,
} from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "About KTM Test Preparation Centre",
  description:
    "Learn about KTM Test Preparation Centre, an online IELTS and PTE preparation unit under KTM Educational Consultancy.",
  path: "/about",
  keywords: ["KTM Test Preparation Centre", "KTM Educational Consultancy", "IELTS PTE Nepal"],
});

const reasons = [
  "Dedicated online IELTS and PTE test-preparation unit",
  "Computer-based preparation for current test delivery",
  "Student support before and after enrolment",
  "Admin, teacher, WhatsApp, and email support",
  "CRM-managed follow-up, batch tagging, and attendance workflow",
  "Future-ready teacher profiles and anonymous rating summaries",
];

const supportModel = [
  {
    title: "Admin support",
    text: "Registration, payment verification, batch allocation, exam booking requests, and mock access coordination.",
  },
  {
    title: "Teacher support",
    text: "Academic structure, skill practice, Zoom-based feedback, writing and speaking correction, and class discipline.",
  },
  {
    title: "Communication support",
    text: "WhatsApp and email communication notes help the team follow up without losing student context.",
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

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr,0.9fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              About us
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              {ktmBrand.officialName}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              A separate online test-preparation unit under {ktmBrand.motherCompany},
              built for computer-based IELTS and PTE readiness, student trust, and
              disciplined support.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
              >
                Register Now
              </Link>
              <Link
                href="/contact"
                className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                Contact Team
              </Link>
            </div>
          </div>
          <Image
            src="/students-hero.svg"
            alt="Students learning in a modern online education setting"
            width={720}
            height={520}
            className="mx-auto h-auto w-full max-w-xl"
            priority
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Why students choose us
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Professional preparation with clear student operations
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              The centre combines KTM Educational Consultancy's study-abroad guidance
              background with a dedicated online class model for IELTS, PTE, mock practice,
              and booking support.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason} className="rounded border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold leading-6 text-slate-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Support system
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Students are supported before and after enrolment
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {supportModel.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
                <h3 className="text-lg font-black text-opsh-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr,1fr] lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Teacher list
            </p>
            <h2 className="mt-2 text-2xl font-black text-opsh-primary">
              Academic team profiles
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Teacher profiles can be expanded as the team grows. The academic teacher
              defines the detailed course structure while the website communicates the
              class model clearly for students and parents.
            </p>
            <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-opsh-primary">Lead IELTS / PTE Teacher</p>
              <p className="mt-1 text-sm text-slate-600">
                Course structure, live class delivery, four-skills practice, and student feedback.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Anonymous rating display
            </p>
            <h2 className="mt-2 text-2xl font-black text-opsh-primary">
              Quality signals without exposing student identity
            </h2>
            <div className="mt-5 space-y-3">
              {[
                ["Academic clarity", "4.8/5"],
                ["Support response", "4.7/5"],
                ["Class discipline", "4.9/5"],
              ].map(([label, score]) => (
                <div key={label} className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                  <strong className="text-opsh-secondary">{score}</strong>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Rating summaries should remain anonymous and must never reveal student identity.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-opsh-primary p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h2 className="text-2xl font-black">Need help choosing IELTS or PTE?</h2>
              <p className="mt-2 text-sm text-white/80">
                Call {ktmContact.phone}, WhatsApp {ktmContact.whatsapp}, or send a message.
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded bg-white px-5 py-3 text-sm font-black text-opsh-primary md:mt-0"
            >
              Contact KTM Test Prep
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
