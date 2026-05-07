'use client';

import { useState } from "react";
import Link from "next/link";

type MobileFeedSummaryProps = {
  summary: string;
  propertyLink: string;
};

const EXPAND_THRESHOLD = 150;
const DETAIL_LINK_THRESHOLD = 320;

export default function MobileFeedSummary({
  summary,
  propertyLink,
}: MobileFeedSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedSummary = summary.trim();
  const hasMoreThanTwoLines = normalizedSummary.length > EXPAND_THRESHOLD;
  const hasMoreThanFiveLines = normalizedSummary.length > DETAIL_LINK_THRESHOLD;

  return (
    <div className="relative px-1">
      <p
        className={`text-sm leading-6 text-opsh-darkgrey ${isExpanded ? "line-clamp-5" : "line-clamp-2"
          }`}
        dangerouslySetInnerHTML={{ __html: normalizedSummary }}
      />
      {hasMoreThanTwoLines ? (
        <div className="mt-1.5 flex items-center gap-3">
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex text-xs font-semibold text-opsh-secondary hover:underline"
            >
              View More
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex text-xs font-semibold text-opsh-muted-dark hover:underline"
            >
              Show Less
            </button>
          )}

          {isExpanded && hasMoreThanFiveLines ? (
            <Link
              href={propertyLink}
              className="inline-flex text-xs font-semibold text-opsh-primary hover:underline"
            >
              Detail
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
