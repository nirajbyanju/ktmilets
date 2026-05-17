import type { Metadata } from "next";
import Link from "next/link";

import FaqAccordion from "@/components/public/shared/FaqAccordion";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmBrand, ktmContact } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Help & Support — KTM Test Preparation Centre",
  description:
    "Get help with registration, payment, class access, exam booking, and more. Contact KTM Test Prep via phone, WhatsApp, or email.",
  path: "/help-support",
  keywords: [
    "KTM Test Prep support",
    "IELTS help Nepal",
    "PTE support Kathmandu",
    "registration help",
    "class access support",
  ],
});

const channels = [
  {
    icon: "📞",
    label: "Phone",
    value: ktmContact.phone,
    note: ktmContact.hours,
    href: `tel:${ktmContact.phone.replace(/\s/g, "")}`,
    cta: "Call Now",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    value: ktmContact.whatsapp,
    note: "Send a message any time",
    href: `https://wa.me/${ktmContact.whatsappDigits}`,
    cta: "Message on WhatsApp",
  },
  {
    icon: "✉️",
    label: "Email",
    value: ktmContact.email,
    note: "We reply within one business day",
    href: `mailto:${ktmContact.email}`,
    cta: "Send Email",
  },
];

const topics = [
  {
    title: "Registration & Enrollment",
    items: [
      "How to register for a course",
      "Choosing the right batch size",
      "Enrollment confirmation steps",
      "Adding your details to CRM",
    ],
  },
  {
    title: "Payment",
    items: [
      "Scanning the Siddhartha Bank QR",
      "Bank transfer instructions",
      "Sending your payment screenshot",
      "Payment verification timeline",
    ],
  },
  {
    title: "Class Access",
    items: [
      "Receiving your Zoom class link",
      "Joining the WhatsApp Community",
      "Accessing recorded materials",
      "Class schedule and timing",
    ],
  },
  {
    title: "Exam Booking",
    items: [
      "Submitting your booking request",
      "Passport copy upload",
      "Booking status tracking",
      "Date and centre selection",
    ],
  },
  {
    title: "Mock Tests",
    items: [
      "Requesting mock test access",
      "Alfa IELTS and PTE platform",
      "Result sharing and follow-up",
      "Completing the mock workflow",
    ],
  },
  {
    title: "Technical Issues",
    items: [
      "Zoom connection problems",
      "Login or account issues",
      "Unable to access class link",
      "Device and browser recommendations",
    ],
  },
];

const steps = [
  {
    step: "01",
    title: "Identify your issue",
    desc: "Check the common topics below or the FAQ section to see if your question is already answered.",
  },
  {
    step: "02",
    title: "Contact via WhatsApp",
    desc: `Send a message to ${ktmContact.whatsapp} with your full name, course, and a brief description of the issue.`,
  },
  {
    step: "03",
    title: "Admin review",
    desc: "Our admin team will review your request, verify details if needed, and respond within one business day.",
  },
  {
    step: "04",
    title: "Resolution",
    desc: "Once resolved, your CRM record and access details will be updated and confirmed back to you.",
  },
];

const faqs = [
  {
    id: 1,
    question: "How do I confirm my enrollment after payment?",
    answer:
      "After paying, send your payment screenshot or bank receipt to the official admin WhatsApp with your full name, selected course, and preferred batch time. Admin will verify and send you a confirmation email.",
  },
  {
    id: 2,
    question: "When will I receive my Zoom class link?",
    answer:
      "Your Zoom class link is sent via email and WhatsApp after payment is verified and your batch is assigned. If you have not received it 24 hours before your class, contact admin.",
  },
  {
    id: 3,
    question: "Can I change my batch after enrolling?",
    answer:
      "Batch changes are subject to availability. Contact admin on WhatsApp or email with your reason and preferred batch time. Changes are confirmed only after admin approval.",
  },
  {
    id: 4,
    question: "What is the refund or cancellation policy?",
    answer:
      "Please contact admin directly for refund or cancellation queries. Each case is reviewed individually based on the circumstances and stage of enrollment.",
  },
  {
    id: 5,
    question: "How do I get access to mock tests?",
    answer:
      "Mock test access is part of the course package. Once enrolled, notify admin to initiate the mock access workflow. You will receive your Alfa IELTS or PTE platform credentials.",
  },
  {
    id: 6,
    question: "Who do I contact if I have a technical issue during class?",
    answer:
      "For live class issues, message admin on WhatsApp immediately. For recurring technical problems, email the team with your device details, browser version, and a description of the issue.",
  },
  {
    id: 7,
    question: "How do I submit a passport for exam booking?",
    answer:
      "Submit your exam booking request through the online form on the Exam Booking page. You can upload your passport copy directly in the form. Admin will follow up on status.",
  },
  {
    id: 8,
    question: "Is there support available outside office hours?",
    answer:
      `Office hours are ${ktmContact.hours}. Outside those hours you can send a WhatsApp message and the team will respond on the next working day.`,
  },
];

export default function HelpSupportPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help & Support", path: "/help-support" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Help & Support — KTM Test Preparation Centre",
            description:
              "Get help with registration, payment, class access, exam booking, and more.",
            path: "/help-support",
          }),
        ]}
      />

      {/* ── Hero ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
            Help &amp; Support
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Find answers about registration, payment, class access, exam booking, and
            more — or reach the {ktmBrand.shortName} team directly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${ktmContact.whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover"
            >
              WhatsApp Support
            </a>
            <Link
              href="/contact"
              className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact channels ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
            Reach us directly
          </p>
          <h2 className="mt-2 text-3xl font-black text-opsh-primary">
            Contact channels
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Choose the channel that works best for you. WhatsApp is the fastest for
            urgent queries.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {channels.map((ch) => (
              <article
                key={ch.label}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm"
              >
                <div className="text-3xl">{ch.icon}</div>
                <h3 className="mt-4 text-lg font-black text-opsh-primary">{ch.label}</h3>
                <p className="mt-1 text-sm font-bold text-slate-800">{ch.value}</p>
                <p className="mt-1 text-xs text-slate-500">{ch.note}</p>
                <a
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex rounded bg-opsh-primary px-4 py-2 text-xs font-black text-white transition hover:bg-opsh-primary-hover"
                >
                  {ch.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to get support ── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Support process
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              How to get help — step by step
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm"
              >
                <span className="text-3xl font-black text-opsh-secondary/30">
                  {s.step}
                </span>
                <h3 className="mt-3 text-base font-black text-opsh-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Common topics ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Common topics
            </p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Browse support topics
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Click the relevant topic and contact support quoting the issue for faster
              resolution.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <article
                key={topic.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm"
              >
                <h3 className="text-base font-black text-opsh-primary">{topic.title}</h3>
                <ul className="mt-3 space-y-2">
                  {topic.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-opsh-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Office info ── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm">
              <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
                Office location
              </p>
              <h2 className="mt-2 text-2xl font-black text-opsh-primary">Visit us</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                {ktmContact.address}
              </p>
              <div className="mt-4 space-y-2">
                {[
                  ["Office hours", ktmContact.hours],
                  ["Phone", ktmContact.phone],
                  ["Email", ktmContact.email],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-opsh-primary">{val}</span>
                  </div>
                ))}
              </div>
              <a
                href={ktmContact.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded border border-opsh-primary px-4 py-2 text-xs font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                View on Google Maps
              </a>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-opsh-sm">
              <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
                Response time
              </p>
              <h2 className="mt-2 text-2xl font-black text-opsh-primary">
                What to expect
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  ["WhatsApp", "Usually within a few hours during office hours"],
                  ["Phone", "Immediate — call during office hours"],
                  ["Email", "Within one business day"],
                  ["Enrollment confirmation", "Within 24 hours of payment verification"],
                  ["Exam booking update", "Within 1–2 business days"],
                ].map(([channel, time]) => (
                  <div
                    key={channel}
                    className="flex items-start justify-between gap-4 rounded border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-bold text-slate-700">{channel}</span>
                    <span className="text-right text-xs text-slate-500">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqAccordion
        items={faqs}
        title="Frequently Asked Questions"
        subtitle="Common questions about support, payment, class access, and enrollment."
        initialVisibleCount={6}
        className="bg-slate-50 py-14 px-4 sm:px-6 lg:px-8"
      />

      {/* ── CTA ── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-opsh-primary p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h2 className="text-2xl font-black">Still need help?</h2>
              <p className="mt-2 text-sm text-white/80">
                Call {ktmContact.phone}, WhatsApp {ktmContact.whatsapp}, or send an
                email to {ktmContact.email}.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:flex-shrink-0">
              <a
                href={`https://wa.me/${ktmContact.whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded bg-white px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-slate-100"
              >
                WhatsApp Us
              </a>
              <Link
                href="/contact"
                className="inline-flex rounded border border-white/40 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
