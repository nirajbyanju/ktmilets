'use client';

import { useMemo, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { RiShareForwardFill } from "react-icons/ri";

import { absoluteUrl } from "@/helper/seo/site";

type MobilePropertyShareMenuProps = {
  propertyTitle: string;
  propertyPath: string;
  shareText: string;
  buttonClassName?: string;
  panelClassName?: string;
  iconClassName?: string;
  showLabel?: boolean;
};

export default function MobilePropertyShareMenu({
  propertyTitle,
  propertyPath,
  shareText,
  buttonClassName = "",
  panelClassName = "",
  iconClassName = "",
  showLabel = false,
}: MobilePropertyShareMenuProps) {
  const [feedback, setFeedback] = useState("");

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return absoluteUrl(propertyPath);
    }

    return new URL(propertyPath, window.location.origin).toString();
  }, [propertyPath]);

  const shareTitle = `${propertyTitle} | Samriddhi Real Estate`;

  const handleShareTrigger = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setFeedback("");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await handleCopyLink();
  };

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setFeedback("Link copied");
    } catch {
      setFeedback("Copy failed");
    }

    window.setTimeout(() => {
      setFeedback("");
    }, 2200);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShareTrigger}
        className={`inline-flex items-center justify-center gap-1.5 pt-2 rounded-full text-sm font-semibold text-opsh-muted-dark transition hover:border-opsh-primary hover:bg-opsh-background-light hover:text-opsh-primary ${buttonClassName}`.trim()}
        aria-label="Share or copy property link"
        title="Share or copy property link"
      >
        <RiShareForwardFill className={`text-2xl ${iconClassName}`.trim()} />
        {showLabel ? <span className="hidden md:inline">Share</span> : null}
      </button>

      {feedback ? (
        <div className={`absolute right-0 top-full z-20 mt-3 inline-flex items-center gap-1.5 rounded-full bg-opsh-primary px-3 py-2 text-xs font-semibold text-opsh-text shadow-opsh-primary ${panelClassName}`.trim()}>
          <MdContentCopy className="text-sm" />
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
