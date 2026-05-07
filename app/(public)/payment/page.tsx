import type { Metadata } from "next";

import StudentWorkflowForm from "@/components/public/ktm/StudentWorkflowForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmContact, paymentMethodOptions } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment and Checkout",
  description:
    "Payment and checkout request page for KTM Test Preparation Centre classes and mock-test packages.",
  path: "/payment",
  keywords: ["KTM Test Prep payment", "IELTS class payment Nepal", "PTE class payment Nepal"],
});

const paymentWorkflow = [
  "Show selected course or package, fee, currency, and payment method",
  "Support NPR and USD display where gateway setup allows",
  "Send class schedule and joining process after successful verification",
  "Update CRM payment status, enrolment status, class tag, and attendance eligibility",
  "Notify admin after payment request or gateway confirmation",
];

export default function PaymentPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Payment", path: "/payment" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Payment and Checkout",
            description: "Payment request and gateway-ready checkout workflow.",
            path: "/payment",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr,1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Payment / checkout
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Secure Payment Workflow for Classes and Mock Tests
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              The production gateway should be connected to Siddhartha Bank or another
              Nepal-supported merchant gateway approved by the client. This checkout page
              captures the data needed for payment verification and student onboarding.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Payment methods</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {paymentMethodOptions.join(", ")}
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              {paymentWorkflow.map((item) => (
                <div key={item} className="rounded border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-bold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              For payment support, contact {ktmContact.phone} or WhatsApp {ktmContact.whatsapp}.
            </p>
          </div>

          <StudentWorkflowForm kind="payment" submitLabel="Submit Payment Details" />
        </div>
      </section>
    </>
  );
}
