import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PlanPurchaseButton from "@/components/public/ktm/PlanPurchaseButton";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { courseFacts, ktmContact, pricingPlans } from "@/data/ktm";
import { getPublicCourseCatalog } from "@/helper/public/courseCatalog";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";
import type { Batch, CourseCatalogPayload } from "@/types/courseCatalog";

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

const pteSupportServices = [
  {
    title: "Alfa PTE Mock Support",
    text: "Computer-based PTE mock-test practice for timing, scoring feedback, and task confidence.",
  },
  {
    title: "PTE Booking Help",
    text: "Admin guidance for PTE Academic booking requests, payment verification, and follow-up.",
  },
];

const formatBatchSize = (batch: Batch) => {
  if (batch.min_size && batch.max_size) {
    return batch.min_size === batch.max_size
      ? String(batch.min_size)
      : `${batch.min_size}-${batch.max_size}`;
  }

  return "Variable";
};

const formatBatchPrice = (batch: Batch) => {
  if (batch.is_price_variable || batch.price_npr === null || batch.price_npr === undefined) {
    return "Contact";
  }

  return `NPR ${Number(batch.price_npr).toLocaleString("en-NP", {
    maximumFractionDigits: 2,
  })}`;
};

const getSupportValue = (catalog: CourseCatalogPayload | null, type: string, fallback: string) =>
  catalog?.support_channels.find(
    (channel) => channel.channel_type.toLowerCase() === type.toLowerCase()
  )?.contact_value ?? fallback;

const calculateDiscount = (batch: Batch) => {
  const price = Number(batch.price_npr ?? 0);
  const discountValue = Number(batch.discount_value ?? 0);

  if (!batch.offer_label || !batch.discount_type || price <= 0 || discountValue <= 0) {
    return null;
  }

  const discount =
    batch.discount_type === "percent"
      ? Math.min(price, (price * Math.min(discountValue, 100)) / 100)
      : Math.min(price, discountValue);

  return {
    label: batch.offer_label,
    total: price - discount,
  };
};

export default async function PtePage() {
  const catalog = await getPublicCourseCatalog("pte");
  const course = catalog?.courses[0] ?? null;
  const whatsapp = getSupportValue(catalog, "WhatsApp", ktmContact.whatsapp);
  const email = getSupportValue(catalog, "Email", ktmContact.email);
  const supportSummary = catalog?.support_channels.length
    ? catalog.support_channels.map((channel) => channel.channel_type).join(", ")
    : "WhatsApp, email, admin, and teacher follow-up";
  const displayedCourseFacts = course
    ? [
        {
          label: "Duration",
          value: `${course.duration_weeks} weeks / ${course.total_hours} total hours`,
        },
        { label: "Delivery", value: course.delivery_mode },
        { label: "Support", value: supportSummary },
        { label: "Instruction", value: course.instruction_lang },
      ]
    : courseFacts;
  const displayedModules = [...pteModules, ...pteSupportServices];
  const displayedPricing = catalog?.batches.length
    ? catalog.batches.map((batch) => ({
        id: batch.id,
        name: batch.batch_type,
        size: formatBatchSize(batch),
        price: formatBatchPrice(batch),
        offer: calculateDiscount(batch),
        note: batch.schedule_notes ?? "Start date, end date, and class time are confirmed during allocation.",
        actionHref: `/payment?batch_id=${batch.id}`,
        actionLabel: "Buy this plan",
      }))
    : pricingPlans.map((plan) => ({
        ...plan,
        actionHref: "/registration",
        actionLabel: "Register interest",
      }));

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
            src="/student3.jpeg"
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
              {displayedCourseFacts.map((fact) => (
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
                  {whatsapp} / {email}
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
            {displayedModules.map((module) => (
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
            {displayedPricing.map((plan) => (
              <article key={plan.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
                <h3 className="text-lg font-black text-opsh-primary">{plan.name}</h3>
                <p className="mt-2 text-sm font-bold text-slate-600">Batch size: {plan.size}</p>
                <p className="mt-4 text-2xl font-black text-opsh-secondary">{plan.price}</p>
                {"offer" in plan && plan.offer ? (
                  <p className="mt-2 text-sm font-black text-emerald-700">
                    {plan.offer.label}: NPR {plan.offer.total.toLocaleString("en-NP")}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-slate-600">{plan.note}</p>
                {"id" in plan && typeof plan.id === "number" ? (
                  <PlanPurchaseButton batchId={plan.id} label={plan.actionLabel} />
                ) : plan.actionHref ? (
                  <Link
                    href={plan.actionHref}
                    className="mt-4 inline-flex w-full justify-center rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                  >
                    {plan.actionLabel}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
