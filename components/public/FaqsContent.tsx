import { contactFaqs } from "@/data/contactFaqs";
import FaqAccordion from "@/components/public/shared/FaqAccordion";
import PublicPageHero from "@/components/public/shared/PublicPageHero";

export default function FaqsContent() {
  return (
    <main className="flex-grow bg-opsh-background-light">
      <PublicPageHero
        eyebrow="FAQs"
        title="Answers that help you move with more confidence"
        description="Find quick guidance on buying, selling, renting, tours, and the support Samriddhi Real Estate provides across the transaction journey."
      />
      <FaqAccordion
        items={contactFaqs}
        title="Frequently Asked Questions"
        subtitle="Have any questions? We are here to help you."
      />
    </main>
  );
}
