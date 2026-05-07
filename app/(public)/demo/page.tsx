import type { Metadata } from "next";
import Link from "next/link";

import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmBrand, ktmContact } from "@/data/ktm";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Demo Class",
  description:
    "Watch the recorded 2-hour IELTS and PTE demo class from KTM Test Preparation Centre and register for online classes.",
  path: "/demo",
  keywords: ["IELTS demo class Nepal", "PTE demo class Nepal", "KTM Test Prep demo"],
});

export default function DemoPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Demo Class", path: "/demo" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Demo Class",
            description: "Recorded 2-hour demo class preview and registration path.",
            path: "/demo",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Demo class
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              2-Hour Recorded IELTS and PTE Demo Class
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Preview the online class style, computer-based preparation approach, teacher
              explanation, and support model before registration.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-opsh-lg">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed?listType=user_uploads&list=ktmeducationalconsultancy"
                title={`${ktmBrand.shortName} recorded demo class`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

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
              Contact for Questions
            </Link>
            <a
              href={`https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
