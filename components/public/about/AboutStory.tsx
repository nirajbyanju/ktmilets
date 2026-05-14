import Image from "next/image";
import Link from "next/link";

import {
  aboutLogo,
  aboutNarrative,
  aboutStoryPoints,
} from "@/components/public/about/about.data";
import PublicSectionHeading from "@/components/public/shared/PublicSectionHeading";

export default function AboutStory() {
  return (
    <section className="bg-white px-6 py-10 md:py-20 md:px-12 lg:py-24">
      <div className="container mx-auto grid max-w-[1440px] grid-cols-1 gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-center lg:gap-14">
        <div className="">
          <div className="flex md:min-h-[420px] items-center justify-center rounded-[22px] bg-white p-8">
            <Image
              src={aboutLogo}
              alt="KTM Test Preparation Centre logo"
              className="h-auto w-full max-w-[420px] object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-8">
          <PublicSectionHeading
            eyebrow="Who We Are"
            title="An online test-preparation team focused on clarity, service, and long-term student success"
            description={aboutNarrative}
          />

          <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-opsh-darkgrey marker:text-opsh-secondary">
            {aboutStoryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/ielts"
              className="rounded-lg bg-opsh-primary px-5 py-3 text-sm font-medium text-opsh-text transition hover:bg-opsh-primary-hover"
            >
              IELTS Online Class
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-opsh-primary px-5 py-3 text-sm font-medium text-opsh-primary transition hover:bg-opsh-primary hover:text-opsh-text"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
