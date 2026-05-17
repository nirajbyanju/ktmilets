import type { Metadata } from "next";
import { FaCalendarAlt, FaFileAlt, FaPassport, FaWhatsapp } from "react-icons/fa";

import ExamBookingForm from "@/components/admin/examBooking/ExamBookingForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmContact } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "IELTS / PTE Exam Booking Support",
  description:
    "Request IELTS Academic, IELTS General Training, or PTE Academic exam booking support from KTM Test Preparation Centre.",
  path: "/exam-booking",
  keywords: ["IELTS exam booking Nepal", "PTE exam booking Nepal", "KTM Test Prep booking"],
});

const steps = [
  {
    icon: FaFileAlt,
    title: "1. Submit the form",
    text: "Fill in your test type, preferred date and centre, passport details, and upload your passport copy.",
  },
  {
    icon: FaCalendarAlt,
    title: "2. Admin reviews",
    text: "Our team checks documents, verifies payment, and confirms available slots at your chosen centre.",
  },
  {
    icon: FaPassport,
    title: "3. Booking confirmed",
    text: "You receive confirmation once the exam seat is secured. Status updates are shown in your dashboard.",
  },
];

const statuses = [
  { label: "New Request",        color: "bg-blue-100 text-blue-700" },
  { label: "Document Pending",   color: "bg-amber-100 text-amber-700" },
  { label: "Payment Pending",    color: "bg-orange-100 text-orange-700" },
  { label: "Booking in Process", color: "bg-purple-100 text-purple-700" },
  { label: "Booked",             color: "bg-emerald-100 text-emerald-700" },
];

export default function ExamBookingPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Exam Booking", path: "/exam-booking" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "IELTS / PTE Exam Booking Support",
            description: "Exam booking support request form and admin status workflow.",
            path: "/exam-booking",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr,1.15fr] lg:px-8">
          {/* ── Left info panel ── */}
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Exam Booking
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              IELTS and PTE Exam Booking Support
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Submit your passport details, preferred date, and test centre. Our admin team will
              handle the booking process and keep you updated at every step.
            </p>

            {/* Steps */}
            <div className="mt-7 space-y-4">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-opsh-primary/10 text-opsh-primary">
                    <s.icon className="text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-opsh-primary">{s.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status workflow */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Booking Status Workflow
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {statuses.map((s, i) => (
                  <span key={s.label} className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.color}`}>
                      {s.label}
                    </span>
                    {i < statuses.length - 1 && (
                      <span className="text-slate-400 text-xs">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-slate-600">
                Office hours: <strong>{ktmContact.hours}</strong>
              </p>
              <a
                href={`https://wa.me/${ktmContact.whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                <FaWhatsapp />
                WhatsApp: {ktmContact.whatsapp}
              </a>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <ExamBookingForm />
          </div>
        </div>
      </section>
    </>
  );
}
