import Image from "next/image";
import PublicPageHero from "@/components/public/shared/PublicPageHero";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

import Icon1 from "@/public/icon/Icon-5.webp";
import Icon2 from "@/public/icon/Icon-6.webp";
import Icon3 from "@/public/icon/Icon-7.webp";
import Icon4 from "@/public/icon/Icon-10.webp";
import Icon5 from "@/public/icon/Icon-9.webp";

const services = [
  {
    number: "01",
    icon: Icon1,
    title: "Property Listings",
    description:
      "We help property owners present homes, land, and commercial spaces with stronger positioning, clearer details, and the exposure needed to reach serious buyers or tenants.",
    deliverables: "Listing strategy, platform publishing, buyer-ready presentation",
    value: "Higher visibility with more qualified inquiries",
  },
  {
    number: "02",
    icon: Icon2,
    title: "Paperwork and Documentation",
    description:
      "Our team handles the document-heavy side of transactions with practical coordination so legal and administrative requirements stay organized from start to finish.",
    deliverables: "Document checklist, filing support, transaction paperwork guidance",
    value: "Cleaner process with fewer avoidable delays",
  },
  {
    number: "03",
    icon: Icon3,
    title: "Property Tours",
    description:
      "We arrange and manage site visits in a way that helps clients evaluate location, access, layout, and long-term suitability with more confidence.",
    deliverables: "Visit scheduling, guided walkthroughs, property briefing",
    value: "Better decision-making before commitment",
  },
  {
    number: "04",
    icon: Icon4,
    title: "Property Valuation",
    description:
      "Using local market context, property condition, and comparable activity, we help determine a realistic pricing position for sale, purchase, or negotiation.",
    deliverables: "Market comparison, pricing guidance, valuation perspective",
    value: "Stronger pricing clarity for both sides of the deal",
  },
  {
    number: "05",
    icon: Icon5,
    title: "Property Management",
    description:
      "We support the full property lifecycle with practical coordination for listing, occupancy, follow-up, and ongoing oversight where needed.",
    deliverables: "Lifecycle support, coordination, transaction follow-through",
    value: "Less friction across the ownership journey",
  },
  {
    number: "06",
    icon: Icon5,
    title: "Negotiation Support",
    description:
      "We represent client interests during discussions on pricing, terms, and expectations so decisions are made with structure and professional balance.",
    deliverables: "Negotiation guidance, offer support, expectation alignment",
    value: "More favorable outcomes with clearer communication",
  },
] as const;

const supportPoints = [
  "Trusted guidance for buying, selling, and renting in Nepal.",
  "Clear communication around process, documents, and next steps.",
  "Professional support focused on long-term value, not rushed transactions.",
];

export default function OurServicesContent() {
  return (
    <main className="flex-grow bg-opsh-background-light">
      <PublicPageHero
        title="Test Preparation Support for Smart Decisions"
        description="KTM Test Preparation Centre offers disciplined, student-focused services designed to make each IELTS, PTE, exam booking, and mock-test step clearer, safer, and easier to act on."
      />

      <section className="bg-white px-6 py-20 md:px-12 lg:py-24">
        <div className="container mx-auto max-w-[1440px]">
          <PublicSectionHeading
            eyebrow="Service Portfolio"
            title="Six core services that support the full property journey"
            description="Each service is designed to reduce uncertainty, improve transparency, and help clients move with more confidence at every stage."
            align="between"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {services.map((service) => (
              <article
                key={service.number}
                className="group flex h-full flex-col gap-6 border-l border-opsh-grey bg-opsh-background-muted/25 p-8 transition-all duration-300 hover:border-opsh-secondary hover:bg-white shadow-opsh-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-brand text-5xl leading-none text-opsh-grey-dark transition-colors duration-300 group-hover:text-opsh-secondary">
                    {service.number}
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-opsh-primary/10 transition-colors duration-300 group-hover:bg-opsh-secondary/10">
                    <Image src={service.icon} alt={service.title} width={34} height={34} className="h-9 w-9 object-contain" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-brand text-2xl text-opsh-primary">{service.title}</h3>
                  <p className="text-sm leading-7 text-opsh-darkgrey">{service.description}</p>
                </div>

                <div className="mt-auto space-y-4 border-t border-opsh-grey pt-6">
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-muted">
                      Key Deliverables
                    </h4>
                    <p className="text-xs font-medium leading-6 text-opsh-black">{service.deliverables}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-muted">
                      Client Value
                    </h4>
                    <p className="text-xs font-medium leading-6 text-opsh-black">{service.value}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-opsh-grey bg-opsh-background px-6 py-20 md:px-12 lg:py-24">
        <div className="container mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-opsh-grey bg-white shadow-opsh-sm transition-shadow duration-300 hover:shadow-opsh-md">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-8 p-8 md:p-12 lg:p-16">
                <PublicSectionHeading
                  eyebrow="What You Can Expect"
                  title="Service shaped by clarity, responsiveness, and long-term trust"
                  description="We do not treat test preparation as a one-step transaction. Our work is built around preparation, transparency, and practical follow-through so students can act with confidence."
                />

                <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-opsh-darkgrey marker:text-opsh-secondary">
                  {supportPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-opsh-grey bg-opsh-primary px-8 py-10 text-opsh-text lg:border-l lg:border-t-0 lg:px-12 lg:py-16">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-opsh-secondary">
                  Our Approach
                </p>
                <h3 className="font-brand mt-4 text-2xl leading-tight md:text-3xl">
                  We prioritize sound decisions over rushed deals.
                </h3>
                <p className="mt-5 text-sm leading-7 text-opsh-text">
                  That means realistic advice, document awareness, responsible negotiation, and continued support when a transaction moves into its final stages.
                </p>

                <div className="mt-8 space-y-4 border-t border-white/15 pt-6">
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-secondary">
                      Best For
                    </h4>
                    <p className="text-sm font-medium leading-6 text-opsh-text">
                      Buyers, sellers, landlords, tenants, and investors who want a more disciplined property process.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-secondary">
                      Core Outcome
                    </h4>
                    <p className="text-sm font-medium leading-6 text-opsh-text">
                      A smoother, better-informed property journey with stronger confidence at every step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
