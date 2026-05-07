import type { Metadata } from "next";
import Link from "next/link";

import StudentWorkflowForm from "@/components/public/ktm/StudentWorkflowForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { mockStatuses } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Alfa Mock Test Practice",
  description:
    "Buy Alfa IELTS and Alfa PTE mock-test practice packages from KTM Test Preparation Centre.",
  path: "/mock-tests",
  keywords: ["Alfa IELTS mock test", "Alfa PTE mock test", "IELTS mock practice Nepal"],
});

const packages = [
  {
    name: "Single Mock Test",
    text: "One IELTS or PTE mock test for quick exam-style practice.",
  },
  {
    name: "Weekly Mock Package",
    text: "Repeated practice across a short weekly preparation cycle.",
  },
  {
    name: "Monthly Practice Package",
    text: "Structured practice across a longer study period.",
  },
  {
    name: "Full Preparation Package",
    text: "Class-aligned mock support for complete IELTS or PTE readiness.",
  },
];

export default function MockTestsPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Mock Tests", path: "/mock-tests" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Alfa Mock Test Practice",
            description: "Alfa IELTS and Alfa PTE mock-test purchase workflow.",
            path: "/mock-tests",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Mock test practice
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Alfa IELTS and Alfa PTE Mock-Test Practice
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Buy mock-test practice only, or add it to IELTS and PTE class preparation.
              After payment, students receive access instructions and follow-up support.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((item) => (
              <article key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-opsh-primary">{item.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr,1.15fr]">
            <div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-opsh-primary">Mock status workflow</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {mockStatuses.map((status) => (
                    <div key={status} className="rounded border border-slate-200 bg-white px-3 py-2">
                      <p className="text-sm font-bold text-slate-700">{status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-black text-opsh-primary">Need classes too?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  IELTS and PTE class registration can include mock-test support and exam
                  booking guidance.
                </p>
                <Link
                  href="/registration"
                  className="mt-4 inline-flex rounded bg-opsh-primary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                >
                  Register for Class
                </Link>
              </div>
            </div>

            <StudentWorkflowForm kind="mock" submitLabel="Buy Mock Test Practice" />
          </div>
        </div>
      </section>
    </>
  );
}
