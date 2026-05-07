import PublicPageHero from "@/components/public/shared/PublicPageHero";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

const processSteps = [
  {
    number: "01",
    title: "Requirement Assessment",
    description:
      "We begin by understanding your specific needs, financial goals, and risk tolerance. This stage defines the scope of our advisory.",
    documents: "Personal ID, Financial Statements (optional), Requirement Brief",
    timeline: "1-2 Days",
  },
  {
    number: "02",
    title: "Property Shortlisting",
    description:
      "Our team identifies properties that match your criteria. We prioritize quality and long-term value over volume.",
    documents: "Property Portfolios, Market Comparison Reports",
    timeline: "3-7 Days",
  },
  {
    number: "03",
    title: "Document Verification",
    description:
      "A meticulous review of ownership records, land titles, and regulatory approvals to ensure the property is legally sound.",
    documents: "Lalpurja, Blueprints, Tax Clearance, Trace Maps",
    timeline: "5-10 Days",
  },
  {
    number: "04",
    title: "Legal Review & Negotiation",
    description:
      "Our legal experts review all agreements. We represent your interests during price and term negotiations.",
    documents: "Sales Agreements, Power of Attorney (if applicable)",
    timeline: "3-5 Days",
  },
  {
    number: "05",
    title: "Transfer & Settlement",
    description:
      "We facilitate the official transfer process at the Land Revenue Office (Malpot) and ensure all paperwork is completed accurately.",
    documents: "Registered Deeds, Payment Receipts",
    timeline: "1-2 Days",
  },
  {
    number: "06",
    title: "Post-Deal Support",
    description:
      "Ensuring utilities are transferred and final documents are in your possession. We remain your advisor even after the keys are handed over.",
    documents: "Utility Records, Final Verification Certificates",
    timeline: "Ongoing",
  },
] as const;

const commitments = [
  "Full disclosure of any discovered legal risks or encumbrances.",
  "No hidden commissions from third parties.",
  "Accountability for every document handled by our team.",
];

export default function HowItWorksContent() {
  return (
    <main className="flex-grow bg-opsh-background-light">
      <PublicPageHero
        title="Structured Process. Clear Outcomes."
        description="Real estate should not be a game of chance. Our advisory approach is built on a disciplined, 6-step process that ensures every transaction is handled with legal precision and professional oversight."
      />

      <section className="bg-white px-6 py-20 md:px-12 lg:py-24">
        <div className="container mx-auto max-w-[1440px]">
          <PublicSectionHeading
            eyebrow="Advisory Roadmap"
            title="Six practical steps from inquiry to final handover"
            description="Every stage has clear deliverables, a realistic timeline, and document visibility so clients always know what is happening next."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {processSteps.map((step) => (
              <article
                key={step.number}
                className="group flex h-full flex-col gap-6 border-l-2 border-opsh-primary bg-opsh-background-muted/25 p-8 transition-all duration-300 hover:border-opsh-secondary hover:bg-white hover:shadow-opsh-sm hover:cursor-pointer"
              >
                <div className="font-brand text-5xl leading-none text-opsh-primary transition-colors duration-300 group-hover:text-opsh-secondary">
                  {step.number}
                </div>

                <div className="space-y-4">
                  <h3 className="font-brand text-2xl text-opsh-secondary">{step.title}</h3>
                  <p className="text-sm leading-7 text-opsh-darkgrey">{step.description}</p>
                </div>

                <div className="mt-auto space-y-4 border-t border-opsh-grey pt-6">
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-muted">
                      Documents Involved
                    </h4>
                    <p className="text-xs font-medium leading-6 text-opsh-black">{step.documents}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-muted">
                      Expected Timeline
                    </h4>
                    <p className="text-xs font-medium leading-6 text-opsh-black">{step.timeline}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-opsh-grey bg-opsh-background px-6 py-20 md:px-12 lg:py-24">
        <div className="container mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-opsh-grey bg-white shadow-opsh-sm transition-shadow duration-300 hover:shadow-opsh-md md:p-14 lg:p-20">
            <div className="space-y-8 p-6 md:space-y-10 md:p-0">
              <PublicSectionHeading
                eyebrow="Transparency Statement"
                title="A process built on clarity, not shortcuts"
              />

              <div className="grid grid-cols-1 gap-8 text-sm leading-7 text-opsh-darkgrey md:grid-cols-2 md:gap-12 lg:gap-16">
                <div className="space-y-4">
                  <h3 className="font-brand text-xl font-semibold text-opsh-black md:text-2xl">
                    Our Commitments
                  </h3>
                  <ul className="list-disc space-y-3 pl-5 marker:text-opsh-secondary">
                    {commitments.map((commitment) => (
                      <li key={commitment} className="pl-1">
                        {commitment}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-brand text-xl font-semibold text-opsh-black md:text-2xl">
                    When We Decline Services
                  </h3>
                  <div className="prose prose-sm max-w-none text-opsh-darkgrey">
                    <p className="leading-relaxed">
                      To maintain our integrity, we may decline services for properties with unresolved disputes,
                      unclear ownership chains, or those that do not meet our ethical standards.
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
