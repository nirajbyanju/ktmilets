import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import TestimonialsSlider from "@/components/public/home/TestimonialsSlider";
import {
  ktmContact,
  pricingPlans,
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

const courses = [
  {
    title: "IELTS Online Class",
    text: "Computer-based IELTS preparation for Reading, Writing, Listening, and Speaking over 6 weeks.",
    href: "/ielts",
    cta: "View IELTS Class",
    img: "/student1.jpeg",
    alt: "Students studying together for IELTS preparation",
  },
  {
    title: "PTE Online Class",
    text: "PTE Academic preparation with speaking, writing, reading, listening, and Alfa mock practice.",
    href: "/pte",
    cta: "View PTE Class",
    img: "/student2.jpeg",
    alt: "Student with notes studying for PTE online class",
  },
  {
    title: "Alfa Mock Practice",
    text: "Buy IELTS or PTE mock test packages and receive access instructions after payment.",
    href: "/mock-tests",
    cta: "Buy Mock Tests",
    img: "/student3.jpeg",
    alt: "Student using computer for mock test practice",
  },
];

const features = [
  { icon: "💻", title: "Computer-Based Prep", text: "Focused on computer-based IELTS and PTE test interfaces, timing, and practice style." },
  { icon: "📡", title: "Live Online Classes", text: "Interactive Zoom sessions with teacher verification before students enter class." },
  { icon: "🎬", title: "Free Demo Class", text: "A 2-hour demo class helps students understand the teaching approach before enrolment." },
  { icon: "📝", title: "Alfa Mock Tests", text: "IELTS and PTE mock practice packages with access and result status tracked by admin." },
  { icon: "📅", title: "Exam Booking Support", text: "Submit passport details and preferred test date for IELTS/PTE booking follow-up." },
  { icon: "💬", title: "WhatsApp Support", text: "Support through WhatsApp, email, class notices, reminders, and CRM notes." },
];

const testimonials = [
  {
    name: "Aashish Karki",
    course: "IELTS Academic",
    text: "The online class felt organised and practical. The computer-based practice made the real test feel less stressful.",
    img: "/student-portrait-1.svg",
  },
  {
    name: "Prakriti Shrestha",
    course: "PTE Academic",
    text: "I liked the speaking practice and quick WhatsApp support. The mock test follow-up helped me understand my weak areas.",
    img: "/student-portrait-2.svg",
  },
  {
    name: "Sagar Thapa",
    course: "IELTS Academic",
    text: "The registration and payment process was clear, and the admin team guided me for exam booking without confusion.",
    img: "/student-portrait-3.svg",
  },
];

export default function HomePage() {
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
    "Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes."
  )}`;

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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white" style={{ minHeight: 580 }}>
        {/* Full-width background photo */}
        <div className="absolute inset-0">
          <Image
            src="/main.jpeg"
            alt=""
            fill
            className="object-cover object-center"
            priority
            aria-hidden="true"
          />
          {/* White-to-transparent gradient so left text stays readable */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 38%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-[640px]">
            {/* Eyebrow badge */}
            <span className="inline-block rounded-full border border-opsh-primary/30 bg-opsh-primary/5 px-3 py-1 text-xs font-black uppercase tracking-wide text-opsh-primary">
              Nepal&apos;s online test-preparation centre
            </span>

            <h1 className="mt-4 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl lg:text-[3.6rem]">
              Computer-Based IELTS and PTE Online Classes
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Live Zoom classes, Alfa mock test practice, exam booking support, and CRM-managed
              follow-up for students in Nepal and abroad.
            </p>

            {/* Button row 1 */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/registration"
                className="rounded bg-opsh-secondary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
              >
                Enroll in Class Now
              </Link>
              <Link
                href="/demo"
                className="rounded bg-opsh-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Watch Demo Class
              </Link>
              <Link
                href="/exam-booking"
                className="rounded bg-opsh-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Book IELTS / PTE Exam
              </Link>
              <Link
                href="/mock-tests"
                className="rounded bg-opsh-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Buy Mock Practice
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-8 flex flex-wrap gap-4 hidden sm:flex">
              {[
                { dt: "6 weeks", dd: "30 teaching hours" },
                { dt: "1:1 to 30", dd: "Flexible batch options" },
                { dt: "80%", dd: "Certificate attendance target" },
              ].map((s) => (
                <div
                  key={s.dt}
                  className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 backdrop-blur-sm"
                >
                  <p className="text-xl font-black text-opsh-primary">{s.dt}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{s.dd}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 divide-x divide-blue-100 border-y border-blue-100 bg-blue-50 sm:grid-cols-4">
        {[
          { strong: "Live", span: "Online Zoom classes" },
          { strong: "Alfa", span: "IELTS/PTE mock practice" },
          { strong: "CRM", span: "Follow-up and attendance" },
          { strong: "NPR/USD", span: "Payment-ready workflow" },
        ].map((s) => (
          <div key={s.strong} className="flex flex-col items-center justify-center gap-1 px-4 py-5 text-center">
            <strong className="text-lg font-black text-opsh-primary">{s.strong}</strong>
            <span className="text-xs text-slate-500">{s.span}</span>
          </div>
        ))}
      </div>

      {/* ── Courses ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Courses</p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Choose IELTS, PTE, or mock practice
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Computer-based preparation classes with live sessions, real test-style practice, and
              admin support throughout your journey.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {courses.map((c) => (
              <article
                key={c.href}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-opsh-sm transition hover:-translate-y-1 hover:shadow-opsh-md"
              >
                <div className="h-56 overflow-hidden bg-slate-100">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-opsh-primary">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{c.text}</p>
                  <Link
                    href={c.href}
                    className="mt-5 inline-block rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                  >
                    {c.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-white py-14 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Pricing plans
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
          {/* <div className="mt-5 flex flex-wrap gap-3">
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
          </div> */}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 py-14 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Why choose KTM
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Everything students need in one simple online system
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-opsh-sm"
              >
                <span className="text-3xl" aria-hidden="true">{f.icon}</span>
                <h3 className="mt-3 text-lg font-black text-opsh-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Split — Nepal & overseas learners ── */}
      <section className="bg-white py-14 hidden sm:block">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Nepal and overseas learners
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Flexible support for students anywhere
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Classes are suitable for students in Nepal, students abroad, working students, evening
              learners, weekend learners, and one-to-one premium learners. Admin can tag students by
              course, batch, lead source, payment status, attendance status, and follow-up notes.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { label: "Launch Team Workflow", text: "Lead capture → payment verification → onboarding email → WhatsApp add → CRM class tag → teacher notified." },
                { label: "Class Operations", text: "Zoom delivery, attendance tracking, writing/speaking support, mock follow-up, and end-of-course reminders." },
                { label: "Growth Ready", text: "Built to support the 5-year scaling goal through repeatable CRM and batch systems." },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-opsh-primary">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded bg-opsh-primary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Register for a Batch
              </Link>
              <Link
                href="/contact"
                className="rounded border border-opsh-secondary px-5 py-3 text-sm font-black text-opsh-secondary transition hover:bg-opsh-secondary hover:text-white"
              >
                Ask About Timing
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-opsh-md">
            <Image
              src="/student5.jpg"
              alt="Student using computer-based IELTS and PTE practice"
              width={620}
              height={460}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-opsh-primary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Important update
            </p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              IELTS preparation should now be computer-based
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
              Paper-based IELTS is expected to be discontinued in Nepal around late June 2026. KTM
              Test Prep is built around computer-based IELTS and PTE readiness from day one.
            </p>
          </div>
          <div className="mt-6 flex flex-shrink-0 flex-wrap gap-3 lg:mt-0 lg:ml-8">
            <Link
              href="/registration"
              className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
            >
              Register Now
            </Link>
            <Link
              href="/exam-booking"
              className="rounded border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
            >
              Book Exam Support
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Student testimonials
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Trusted by IELTS and PTE learners
            </h2>
          </div>
          <TestimonialsSlider testimonials={testimonials} />
        </div>
      </section>

      {/* ── Enroll CTA ── */}
      <section className="bg-white py-16 text-center hidden sm:block">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
            Start today
          </p>
          <h2 className="mt-2 text-3xl font-black text-opsh-primary">
            Ready to improve your IELTS or PTE score?
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Join a live online batch, try the free demo class, or message us on WhatsApp to get
            started.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/registration"
              className="rounded bg-opsh-secondary px-6 py-3 text-sm font-black text-white shadow transition hover:bg-opsh-secondary-hover"
            >
              Enroll in Class Now
            </Link>
            <Link
              href="/demo"
              className="rounded border border-opsh-primary px-6 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
            >
              Watch Demo Class
            </Link>
            <Link
              href="/contact"
              className="rounded bg-opsh-primary px-6 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
