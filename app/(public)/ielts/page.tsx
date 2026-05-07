import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { courseFacts, ktmContact, pricingPlans } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "IELTS Online Class",
  description:
    "Computer-based IELTS online class in Nepal: 6 weeks, 30 hours, live Zoom lessons, four skills practice, Alfa IELTS mock support, and exam booking help.",
  path: "/ielts",
  keywords: [
    "IELTS online class Nepal",
    "computer based IELTS preparation",
    "IELTS Academic Nepal",
    "IELTS General Training Nepal",
  ],
});

const ieltsSkills = [
  {
    title: "Reading",
    text: "Skimming, scanning, question types, timing, and computer-based navigation.",
  },
  {
    title: "Writing",
    text: "Task 1 and Task 2 planning, structure, grammar, and teacher feedback.",
  },
  {
    title: "Listening",
    text: "Computer-based listening practice, note completion, maps, and section timing.",
  },
  {
    title: "Speaking",
    text: "Part 1, 2, and 3 simulation with Zoom-based feedback and voice tasks.",
  },
  {
    title: "Mock Support",
    text: "Alfa IELTS mock-test practice can be added for exam-style rehearsal and follow-up.",
  },
  {
    title: "Exam Booking Help",
    text: "Admin support is available for IELTS Academic or IELTS General Training booking requests.",
  },
];

export default function IeltsPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "IELTS Online Class", path: "/ielts" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "IELTS Online Class",
            description:
              "Computer-based IELTS preparation with live online classes, Alfa mock support, and booking guidance.",
            path: "/ielts",
          }),
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr,0.9fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              IELTS online class
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Computer-Based IELTS Preparation
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Live online IELTS coaching for Academic and General Training students, focused
              on the real computer-based test environment for learners in Nepal and abroad.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
              >
                Enroll for IELTS Class
              </Link>
              <Link
                href="/mock-tests"
                className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                Buy Alfa IELTS Mock
              </Link>
            </div>
          </div>
          <Image
            src="/students-study.svg"
            alt="Student preparing for computer-based IELTS online"
            width={720}
            height={520}
            className="mx-auto h-auto w-full max-w-xl"
            priority
          />
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            <strong>Important:</strong> This class is focused on computer-based IELTS preparation
            because paper-based IELTS is expected to be discontinued in Nepal around late June 2026.
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Course overview
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              6 weeks, 30 total hours, all four IELTS skills
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              IELTS batches support 20-30 students for the main volume model while still
              offering smaller premium groups and one-to-one options for learners who need
              higher interaction or special timing.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {courseFacts.map((fact) => (
                <div key={fact.label} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-sm font-black text-opsh-primary">{fact.value}</p>
                </div>
              ))}
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Schedule
                </p>
                <p className="mt-1 text-sm font-black text-opsh-primary">
                  Start date, end date, and class time confirmed during batch allocation
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Support
                </p>
                <p className="mt-1 text-sm font-black text-opsh-primary">
                  WhatsApp {ktmContact.whatsapp} and email {ktmContact.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ieltsSkills.map((skill) => (
              <article key={skill.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
                <h3 className="text-lg font-black text-opsh-primary">{skill.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{skill.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              IELTS pricing
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Choose a plan by interaction level, schedule, and batch size
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
                <h3 className="text-lg font-black text-opsh-primary">{plan.name}</h3>
                <p className="mt-2 text-sm font-bold text-slate-600">Batch size: {plan.size}</p>
                <p className="mt-4 text-2xl font-black text-opsh-secondary">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{plan.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
