import { contactFaqs } from "@/data/contactFaqs";
import FaqAccordion from "@/components/public/shared/FaqAccordion";
import PublicPageHero from "@/components/public/shared/PublicPageHero";

export default function FaqsContent() {
  return (
    <main className="flex-grow bg-opsh-background-light">
      <PublicPageHero
        eyebrow="FAQs"
        title="Answers that help students enroll with confidence"
        description="Find quick guidance on IELTS and PTE classes, payment verification, exam booking support, mock-test practice, and student support."
      />
      <FaqAccordion
        items={contactFaqs}
        title="Frequently Asked Questions"
        subtitle="Have any questions? We are here to help you."
      />
    </main>
  );
}
