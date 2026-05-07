import { aboutPrinciples } from "@/components/public/about/about.data";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

export default function AboutPrinciples() {
  return (
    <section className="bg-opsh-background-light px-6 py-20 md:px-12 lg:py-24">
      <div className="container mx-auto max-w-[1440px]">
        <PublicSectionHeading
          eyebrow="Why Clients Choose Us"
          title="Four working principles behind every property decision we support"
          description="We bring a process that is practical, transparent, and easier to trust, especially when decisions carry legal, financial, and long-term consequences."
          align="between"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 justify-center">
          {aboutPrinciples.map((principle) => {
            const Icon = principle.icon;

            return (
              <article
                key={principle.number}
                className="group flex h-full flex-col gap-6 border-l-2 border-opsh-primary bg-white p-8 transition-all duration-300 hover:border-opsh-secondary shadow-opsh-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-brand text-5xl leading-none text-opsh-primary transition-colors duration-300 group-hover:text-opsh-secondary">
                    {principle.number}
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-opsh-primary/10 text-opsh-primary transition-colors duration-300 group-hover:bg-opsh-secondary/10 group-hover:text-opsh-secondary">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-brand text-2xl text-opsh-black">{principle.title}</h3>
                  <p className="text-sm leading-7 text-opsh-darkgrey">{principle.description}</p>
                </div>

                <div className="mt-auto border-t border-opsh-grey pt-6">
                  <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-opsh-muted">
                    Client Benefit
                  </h4>
                  <p className="text-xs font-medium leading-6 text-opsh-black">{principle.focus}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
