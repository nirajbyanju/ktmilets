import type { Metadata } from "next";
import Link from "next/link";

import StudentWorkflowForm from "@/components/public/ktm/StudentWorkflowForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { courseTypeOptions, ktmContact, pricePlanOptions } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Class Registration",
  description:
    "Register for IELTS Group Class, IELTS One-to-One Class, PTE Group Class, or PTE One-to-One Class at KTM Test Preparation Centre.",
  path: "/registration",
  keywords: ["IELTS registration Nepal", "PTE registration Nepal", "KTM Test Prep registration"],
});

const registrationVerificationMessage =
  "Hello KTM Test Prep, I have submitted class registration details and want to send my payment screenshot for verification.";
const registrationWhatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
  registrationVerificationMessage
)}`;

export default function RegistrationPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Registration", path: "/registration" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Class Registration",
            description: "Student registration form for IELTS and PTE online classes.",
            path: "/registration",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr,1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Registration
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Register for IELTS or PTE Online Class
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Submit your details for course selection, price plan, preferred class time,
              instruction type, payment method, and batch allocation.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Available course types</h2>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                {courseTypeOptions.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Price plans</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {pricePlanOptions.join(", ")}
              </p>
            </div>
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Payment screenshot verification</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-950">
                After registration, pay using the official payment QR or bank-transfer details provided by admin, then
                send the payment screenshot to WhatsApp for verification.
              </p>
              <a
                href={registrationWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex rounded bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Send screenshot on WhatsApp
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/payment"
                className="rounded border border-opsh-primary px-5 py-3 text-sm font-black text-opsh-primary transition hover:bg-opsh-primary hover:text-white"
              >
                Go to Payment
              </Link>
              <a
                href={`mailto:${ktmContact.email}`}
                className="rounded border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-opsh-secondary hover:text-opsh-secondary"
              >
                Email Admin
              </a>
            </div>
          </div>

          <StudentWorkflowForm kind="registration" submitLabel="Submit Registration" />
        </div>
      </section>
    </>
  );
}
