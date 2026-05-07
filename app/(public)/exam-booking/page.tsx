import type { Metadata } from "next";

import StudentWorkflowForm from "@/components/public/ktm/StudentWorkflowForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { bookingStatuses, ktmContact } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "IELTS / PTE Exam Booking Support",
  description:
    "Request IELTS Academic, IELTS General Training, or PTE Academic exam booking support from KTM Test Preparation Centre.",
  path: "/exam-booking",
  keywords: ["IELTS exam booking Nepal", "PTE exam booking Nepal", "KTM Test Prep booking"],
});

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
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr,1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Exam booking
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              IELTS and PTE Exam Booking Support
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Submit your preferred test type, date, location, passport details, and passport
              copy so the admin team can review documents and guide the next step.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Admin status workflow</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {bookingStatuses.map((status) => (
                  <div key={status} className="rounded border border-slate-200 bg-white px-3 py-2">
                    <p className="text-sm font-bold text-slate-700">{status}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Office support is available from {ktmContact.hours}. Urgent booking questions
              can be sent to WhatsApp {ktmContact.whatsapp}.
            </p>
          </div>

          <StudentWorkflowForm kind="exam" submitLabel="Submit Booking Request" />
        </div>
      </section>
    </>
  );
}
