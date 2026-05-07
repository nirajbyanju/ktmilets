'use client';

import Image from "next/image";
import { useMemo, useState, type TouchEvent } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { shouldBypassNextImageOptimization } from "@/helper/public/image";
import { PropertyImage } from "@/types/property/property";

type MobileFeedImageSliderProps = {
  images: PropertyImage[];
  propertyTitle: string;
  propertyLink: string;
};

const SWIPE_THRESHOLD = 36;

export default function MobileFeedImageSlider({
  images,
  propertyTitle,
  propertyLink,
}: MobileFeedImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const safeImages = useMemo(() => images.filter((image) => Boolean(image.full_url)), [images]);

  const totalSlides = safeImages.length;
  const hasSlides = totalSlides > 0;
  const hasMultipleSlides = totalSlides > 1;

  const goToPrevious = () => {
    if (!hasMultipleSlides) {
      return;
    }

    setActiveIndex((current) => (current - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    if (!hasMultipleSlides) {
      return;
    }

    setActiveIndex((current) => (current + 1) % totalSlides);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchStartX - endX;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStartX(null);
  };

  if (!hasSlides) {
    return (
      <Link
        href={propertyLink}
        className="mt-3 block overflow-hidden rounded-2xl bg-opsh-background"
      >
        <div className="flex aspect-[5/4] items-center justify-center text-sm font-medium text-opsh-muted">
          No image available
        </div>
      </Link>
    );
  }

  return (
    <div
      className="relative mt-3 overflow-hidden rounded bg-opsh-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {safeImages.map((image, index) => (
          <Link
            key={image.id}
            href={propertyLink}
            className="relative block min-w-full aspect-[5/4]"
          >
            <Image
              src={image.full_url}
              alt={`${propertyTitle} image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={shouldBypassNextImageOptimization(image.full_url)}
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {hasMultipleSlides ? (
        <>
          {/* <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-opsh-text backdrop-blur-sm"
            aria-label="Previous image"
          >
            <FiChevronLeft className="text-lg" />
          </button> */}

          {/* <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-opsh-text backdrop-blur-sm"
            aria-label="Next image"
          >
            <FiChevronRight className="text-lg" />
          </button> */}
        </>
      ) : null}

      {/* <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-opsh-text backdrop-blur-sm">
        {activeIndex + 1}/{totalSlides}
      </div> */}

      {hasMultipleSlides ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {safeImages.map((image, index) => (
            <span
              key={image.id}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-5 bg-opsh-text" : "w-1.5 bg-white/55"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
