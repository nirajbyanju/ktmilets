import Image from "next/image";

import { aboutLeaders } from "@/components/public/about/about.data";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

export default function AboutLeadership() {
  return (
    <section className="bg-white px-6 py-10 md:py-20 md:px-12 lg:py-24">
      <div className="container mx-auto max-w-[1440px]">
        <PublicSectionHeading
          eyebrow="Team"
          title="People shaping the direction of Samriddhi Real Estate"
          description="We are building a more dependable property experience through service-led leadership, clearer communication, and responsible execution."
          align="between"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {aboutLeaders.map((leader) => (
            <article
              key={leader.name}
              className="overflow-hidden rounded border border-opsh-grey bg-opsh-background shadow-opsh-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-opsh-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-[0.9fr,1.1fr]">
                <div className="relative min-h-[340px]">
                  <Image
                    src={leader.image}
                    alt={`${leader.name}, ${leader.role} at Samriddhi Real Estate`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>

                <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-opsh-secondary">
                      {leader.role}
                    </p>
                    <h3 className="font-brand mt-3 text-3xl text-opsh-primary">{leader.name}</h3>
                  </div>

                  <p className="text-sm leading-7 text-opsh-darkgrey">{leader.bio}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
