"use client";

import { useMemo, useState } from "react";
import { MdAdd, MdRemove } from "react-icons/md";

type FaqItem = {
  id: string | number;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  initialVisibleCount?: number;
  className?: string;
};

export default function FaqAccordion({
  items,
  title = "FAQs",
  subtitle = "Have any questions? We are here to help you.",
  initialVisibleCount,
  className = "py-16 px-4 md:px-8 lg:px-16",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = useMemo(() => {
    if (!initialVisibleCount || showAll) {
      return items;
    }

    return items.slice(0, initialVisibleCount);
  }, [initialVisibleCount, items, showAll]);

  const canToggleMore = Boolean(initialVisibleCount && items.length > initialVisibleCount);

  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full text-xl font-medium text-opsh-secondary">
            {title}
          </span>
          <h2 className="mt-2 text-xl text-opsh-primary">{subtitle}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {visibleItems.map((faq, index) => (
            <div key={faq.id}>
              <div className="overflow-hidden rounded-xl border-2 border-gray-300 px-5 py-4 transition-all duration-200">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  aria-expanded={openIndex === index}
                >
                  <h3 className="pr-8 font-semibold text-opsh-primary">{faq.question}</h3>
                  <span className="flex-shrink-0 text-gray-500">
                    {openIndex === index ? (
                      <MdRemove className="h-5 w-5 hover:text-opsh-secondary" />
                    ) : (
                      <MdAdd className="h-5 w-5 hover:text-opsh-secondary" />
                    )}
                  </span>
                </button>

                {openIndex === index ? (
                  <div className="pt-2">
                    <p className="text-sm leading-relaxed text-opsh-darkgrey">{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {canToggleMore ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg bg-opsh-primary px-6 py-3 font-medium text-opsh-text transition-colors hover:bg-opsh-primary-hover"
            >
              {showAll ? "Show Less" : "View More ->"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
