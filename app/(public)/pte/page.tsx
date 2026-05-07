import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { courseFacts, ktmContact, pricingPlans } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "PTE Online Class",
  description:
    "Computer-based PTE Academic online class with live Zoom lessons, Alfa PTE mock practice, flexible timing, and exam booking support.",
  path: "/pte",
  keywords: ["PTE online class Nepal", "PTE Academic preparation", "Alfa PTE mock test"],
});

const pteModules = [
  {
    title: "Speaking & Writing",
    text: "Read Aloud, Repeat Sentence, Describe Image, Summarise Written Text, and Write Essay.",
  },
  {
    title: "Reading",
    text: "Fill in the blanks, reorder paragraphs, multiple-choice, and timed strategy practice.",
  },
  {
    title: "Listening",
    text: "Summarise spoken text, highlight correct summary, fill blanks, and select missing word.",
  },
  {
    title: "Mock Practice",
    text: "Alfa PTE mock-test practice helps students rehearse task timing and score feedback.",
  },
];

export default function PtePage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "PTE Online Class", path: "/pte" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "PTE Online Class",
            description:
              "Computer-based PTE Academic preparation with live classes, Alfa mock practice, and booking support.",
            path: "/pte",
          }),
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr,0.9fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              PTE online class
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Computer-Based PTE Academic Preparation
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Practice speaking, writing, reading, and listening with live teacher support,
              Alfa PTE mock tests, flexible class options, and admin follow-up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
              >
                Enroll for PTE Class
              </Link>
              <Link
                href="/mock-tests"
                className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                Buy Alfa PTE Mock
              </Link>
            </div>
          </div>
          <Image
            src="/students-computer.svg"
            alt="Student preparing for PTE Academic online"
            width={720}
            height={520}
            className="mx-auto h-auto w-full max-w-xl"
            priority
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Course overview
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              6 weeks of focused PTE Academic preparation
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              PTE students can join group classes, one-to-one sessions, Smart Batch,
              Premium Focus, Evening, Weekend, or Global Flex options. Start dates,
              end dates, and class schedules are confirmed during batch allocation.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {courseFacts.map((fact) => (
                <div key={fact.label} className="rounded border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-sm font-black text-opsh-primary">{fact.value}</p>
                </div>
              ))}
              <div className="rounded border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Contact support
                </p>
                <p className="mt-1 text-sm font-black text-opsh-primary">
                  {ktmContact.whatsapp} / {ktmContact.email}
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Exam help
                </p>
                <p className="mt-1 text-sm font-black text-opsh-primary">
                  PTE Academic booking support request workflow
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pteModules.map((module) => (
              <article key={module.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
                <h3 className="text-lg font-black text-opsh-primary">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              PTE pricing
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Group, private, weekend, evening, and global-flex options
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
