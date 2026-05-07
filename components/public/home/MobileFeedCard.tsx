'use client';

import dynamic from "next/dynamic";
import { type MouseEvent, useMemo, useState } from "react";
import Link from "next/link";
import { FiMap, FiMapPin } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";

import MobileFeedImageSlider from "@/components/public/home/MobileFeedImageSlider";
import MobileFeedSummary from "@/components/public/home/MobileFeedSummary";
import MobilePropertyShareMenu from "@/components/public/home/MobilePropertyShareMenu";
import { usePropertyLikeToggle } from "@/hooks/usePropertyLikes";
import { COMPANY_PHONE } from "@/helper/seo/site";
import { Properties } from "@/types/property/property";

const phoneNumber = COMPANY_PHONE.replace(/[^\d]/g, "");
const LoginModal = dynamic(() => import("@/components/loginComponent"), { ssr: false });

const formatPrice = (property: Properties) => {
  if (!property.advertise_price) {
    return "Price on request";
  }

  return `${property.currency || "NPR"} ${new Intl.NumberFormat("en-NP").format(property.advertise_price)}`;
};

const getGalleryImages = (property: Properties) => {
  const images = property.images ?? [];

  const featured = images.find((image) => image.is_featured);
  if (!featured) {
    return images;
  }

  return [featured, ...images.filter((image) => image.id !== featured.id)];
};

const toPlainText = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const ranges = [
    { limit: 60, divisor: 1, unit: "minute" as const },
    { limit: 24 * 60, divisor: 60, unit: "hour" as const },
    { limit: 7 * 24 * 60, divisor: 24 * 60, unit: "day" as const },
    { limit: 30 * 24 * 60, divisor: 7 * 24 * 60, unit: "week" as const },
    { limit: 365 * 24 * 60, divisor: 30 * 24 * 60, unit: "month" as const },
  ];

  for (const range of ranges) {
    if (Math.abs(diffMinutes) < range.limit) {
      return formatter.format(Math.round(diffMinutes / range.divisor), range.unit);
    }
  }

  return formatter.format(Math.round(diffMinutes / (365 * 24 * 60)), "year");
};

type MobileFeedCardProps = {
  property: Properties;
};

export default function MobileFeedCard({ property }: MobileFeedCardProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, isLiked, isPending, toggleLike } = usePropertyLikeToggle(property.id);

  const galleryImages = useMemo(() => getGalleryImages(property), [property]);
  const location =
    property.address?.full_address ||
    property.address?.area ||
    property.address?.municipality ||
    "Location unavailable";
  const shortLocation =
    property.address?.area ||
    property.address?.municipality ||
    property.address?.district ||
    "Nepal";
  const listingType = property.listing_type?.label || property.listing_type?.name || "Listing";
  const summary = property.description;
  const landAreaLabel = property.land_area
    ? `${property.land_area} ${property.land_unit?.label || "Unit"}`
    : null;
  const publishedAt = property.publishedat || property.created_at;
  const relativeTime = formatRelativeTime(publishedAt);
  const propertyLink = `/properties/${property.slug}`;
  const shareText = `${property.title} in ${shortLocation} - ${formatPrice(property)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
    `Hello, I am interested in ${property.title}. Please share more details.`
  )}`;

  const handleLikeClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (isPending) {
      return;
    }

    try {
      await toggleLike();
    } catch (error) {
      console.error("Mobile property like toggle failed:", error);
    }
  };

  return (
    <>
      <article className="rounded bg-opsh-white-pure py-2 px-3 shadow-[0_14px_34px_rgba(4,72,69,0.08)] transition-shadow hover:shadow-[0_20px_40px_rgba(4,72,69,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-opsh-muted">
              {listingType}
            </p>
            <Link href={propertyLink} className="mt-1 block">
              <h2 className="font-brand text-xl font-semibold leading-7 text-opsh-primary hover:underline">
                {property.title}
              </h2>
            </Link>
          </div>
          <span className="shrink-0 text-xs font-medium text-opsh-muted-dark">{relativeTime}</span>
        </div>


        <MobileFeedImageSlider
          images={galleryImages}
          propertyTitle={property.title}
          propertyLink={propertyLink}
        />

        <div className="mt-1 rounded-2xl bg-opsh-background-light p-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-opsh-muted">
                Price
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-opsh-muted">{formatPrice(property)}</p>

            </div>

            {landAreaLabel ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-opsh-primary">
                <FiMap className="shrink-0" />
                {landAreaLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className=" flex items-start gap-2 px-1 text-sm text-opsh-muted-dark">
          <FiMapPin className="mt-0.5 shrink-0 text-opsh-secondary" />
          <p className="line-clamp-2 leading-5">{location}</p>
        </div>

        {summary ? (
          <div className="mt-1">
            <MobileFeedSummary summary={summary} propertyLink={propertyLink} />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-1.5 border-t border-opsh-grey ">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-opsh-muted-dark">
            {property.property_code ? (
              <p className="text-xs font-medium text-opsh-muted-dark">
                Property ID: {property.property_code}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isPending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              aria-label={isLiked ? "Unlike property" : "Like property"}
            >
              <FaBookmark className={isLiked ? "text-base text-red-500" : "text-xl"} />
            </button>
            <MobilePropertyShareMenu
              propertyTitle={property.title}
              propertyPath={propertyLink}
              shareText={shareText}
            />
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Ask about ${property.title} on WhatsApp`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/12 text-[#25D366] transition-all hover:scale-110 hover:bg-[#25D366] hover:text-white"
            >
              <FaWhatsapp className="text-base" />
            </a>
          </div>
        </div>
      </article>

      {isLoginModalOpen ? (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={async () => {
            try {
              await toggleLike();
            } catch (error) {
              console.error("Mobile property like after login failed:", error);
            }
          }}
        />
      ) : null}
    </>
  );
}
