import { aboutCommitments } from "@/components/public/about/about.data";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

export default function AboutCommitment() {
  return (
    <section className="border-t border-opsh-grey bg-opsh-background px-6 py-20 md:px-12 lg:py-24">
      <div className="container mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-opsh-grey bg-white shadow-opsh-sm transition-shadow duration-300 hover:shadow-opsh-md">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-8 p-8 md:p-12 lg:p-16">
              <PublicSectionHeading
                eyebrow="What We Stand For"
                title="We aim to make online test preparation clear, supportive, and easier to trust"
                description="That means practical support before enrollment, honest communication during the course, and dependable follow-through until students complete their preparation."
              />

              <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-opsh-darkgrey marker:text-opsh-secondary">
                {aboutCommitments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-opsh-grey bg-opsh-primary px-8 py-10 text-opsh-text lg:border-l lg:border-t-0 lg:px-12 lg:py-16">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-opsh-secondary">
                Our Promise
              </p>
              <h3 className="font-brand mt-4 text-2xl leading-tight md:text-3xl">
                We do not chase enrollments at the cost of trust.
              </h3>
              <p className="mt-5 text-sm leading-7 text-opsh-text">
                We would rather guide students with realistic advice, patient support, and clear class information than push rushed decisions. That is how we plan to earn lasting confidence.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/15 pt-6">
                <div>
                  <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-secondary">
                    Best Fit
                  </h4>
                  <p className="text-sm font-medium leading-6 text-opsh-text">
                    IELTS and PTE students who want structured online classes, clear payment verification, and dependable support.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-secondary">
                    Core Outcome
                  </h4>
                  <p className="text-sm font-medium leading-6 text-opsh-text">
                    Better preparation, smoother onboarding, and a stronger sense of confidence throughout the course journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
