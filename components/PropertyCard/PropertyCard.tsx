'use client';

import { type MouseEvent, useState } from 'react';
import { MdAddCircleOutline } from "react-icons/md";
import { AiOutlineFullscreen } from "react-icons/ai";
import { HiChevronLeft } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi";
import { FaRegHeart } from "react-icons/fa6";
import { GrLocation } from "react-icons/gr";
import { ImPlay2 } from "react-icons/im";
import { HiOutlineCamera } from "react-icons/hi";
import { TbMapCheck } from "react-icons/tb";
import { MdOutlineAddRoad } from "react-icons/md";
import { FaRegCompass } from "react-icons/fa";
import { TbRosetteDiscount } from "react-icons/tb";
import { MdOutlineRealEstateAgent } from "react-icons/md";
import { Properties } from '@/types/property/property';
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import {
  FaVectorSquare,
  FaBuilding,
  FaCarSide,
  FaHeart,
} from 'react-icons/fa';
import Link from 'next/link';
import LoginModal from '@/components/loginComponent';
import { usePropertyLikeToggle } from '@/hooks/usePropertyLikes';

const PropertyCard = ({ property }: { property: Properties }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video'>('image');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, isLiked, isPending, toggleLike } = usePropertyLikeToggle(property.id);
  const images = property.images || [];
  const totalImages = images.length;

  const videoURL = property.video_url;

  const nextImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const openImageModal = () => {
    setModalType('image');
    setIsModalOpen(true);
  };

  const openVideoModal = () => {
    setModalType('video');
    setIsModalOpen(true);
  };

  const propertyFace = property.property_face?.label || 'North-East';
  const listingType = property.listing_type?.label || 'For Sale';
  const propertyType = property.property_type?.label || 'Residential';
  const landUnit = property.land_unit?.label || 'AANA';
  const fullAddress = property?.address?.full_address || 'Location details coming soon';
  const priceLabel = property.advertise_price
    ? `NPR ${new Intl.NumberFormat('en-NP').format(property.advertise_price)}`
    : 'Price on request';
  const parkingLabel = property.houseDetails?.parking_cars
    ? `${property.houseDetails.parking_cars} Cars`
    : ' No';
  const floorsLabel = property.houseDetails?.total_floors
    ? `${property.houseDetails.total_floors}`
    : ' No';
  const roadWidthLabel = property.road_width
    ? `${property.road_width} ft`
    : ' No';
  const landAreaLabel = property.land_area
    ? `${property.land_area} ${landUnit}`
    : ' No';
  const hasVideo = Boolean(videoURL);

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
      console.error('Property like toggle failed:', error);
    }
  };

  return (
    <>
      <div className="group overflow-hidden rounded border border-opsh-grey-border bg-opsh-white-pure shadow-opsh-sm transition-all duration-300">
        {/* IMAGE AREA */}
        <div className="relative h-56 overflow-hidden bg-opsh-background-dark">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]?.full_url}
              alt={property.title}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-opsh-background-dark">
              <span className="text-sm font-medium text-opsh-muted">No image available</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* PROPERTY ID */}
          <div className="absolute left-4 top-4 z-10 rounded bg-opsh-secondary px-3 py-1 text-xxs font-bold text-opsh-white-pure">
            Property ID: {property.property_code}
          </div>

          {/* SLIDER BUTTONS */}
          {totalImages > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Show previous property image"
                className="
                  absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20
                  bg-black/35 p-2 text-white opacity-0 -translate-x-3
                  transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100
                "
              >
                <HiChevronLeft size={22} />
              </button>

              <button
                onClick={nextImage}
                aria-label="Show next property image"
                className="
                  absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20
                  bg-black/35 p-2 text-white opacity-0 translate-x-3
                  transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100
                "
              >
                <HiChevronRight size={22} />
              </button>
            </>
          )}

          {/* TOP RIGHT ICONS (ON HOVER) */}
          <div className="absolute right-3 top-4 z-10 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span
              onClick={openImageModal}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2.5 py-1.5 text-sm text-white transition-colors duration-200 hover:bg-white/20"
            >
              <HiOutlineCamera className='text-lg' />
              <span className='text-sm font-semibold'>{totalImages}</span>
            </span>
            <span
              onClick={() => {
                if (hasVideo) openVideoModal();
              }}
              className={`flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1.5 text-sm text-white transition-colors duration-200 ${hasVideo
                ? 'cursor-pointer bg-black/35 hover:bg-white/20'
                : 'cursor-not-allowed bg-black/20 opacity-60'
                }`}
            >
              <ImPlay2 className='text-lg' />
              <span className='text-sm font-semibold'>{hasVideo ? 1 : 0}</span>
            </span>
          </div>

          {/* BOTTOM RIGHT ICONS (ON HOVER) */}
          <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3 text-white transition-all duration-300">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">{listingType}</p>
              <h3 className="mt-2 text font-bold text-opsh-white-pure">
                {priceLabel}
              </h3>
            </div>
            <span className="flex gap-1">
              <AiOutlineFullscreen className="cursor-pointer rounded-full border border-white/20 bg-black/35 p-1.5 text-[1.4rem] transition-colors duration-200 hover:border-opsh-secondary hover:text-opsh-secondary" />

              <button
                type="button"
                onClick={handleLikeClick}
                disabled={isPending}
                className={`rounded-full border p-1.5 transition-colors duration-200 ${
                  isLiked
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-white/20 bg-black/35 hover:border-red-500'
                } ${
                  isPending ? 'cursor-not-allowed opacity-70' : ''
                }`}
                aria-label={isLiked ? 'Unlike property' : 'Like property'}
              >
                {isLiked ? (
                  <FaHeart className="text-sm text-white" />
                ) : (
                  <FaRegHeart className="text-sm text-white transition-colors duration-200 hover:text-red-500" />
                )}
              </button>

              <MdAddCircleOutline className="cursor-pointer rounded-full border border-white/20 bg-black/35 p-1.5 text-[1.4rem] transition-colors duration-200 hover:border-opsh-secondary hover:text-opsh-secondary" />
            </span>
          </div>
        </div>

        {/* CARD CONTENT */}
        <div className="px-3 py-2 transition-all duration-300">
          <Link href={`/properties/${property.slug}`} className="block space-y-1.5">
            <div className="space-y-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold leading-5 text-opsh-primary">
                  {property.title}
                </h3>
                <p className="text-xs text-opsh-muted-dark">{propertyType}</p>
              </div>

              <div className="flex items-start gap-1.5 rounded-[14px] bg-opsh-background-light text-opsh-muted-dark">
                <GrLocation className="mt-0.5 shrink-0 text-sm text-opsh-secondary overflow-hidden" />
                <p className="text-xs leading-5 whitespace-nowrap">
                  {fullAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-opsh-muted-dark">
              <div className="flex items-center gap-1.5">
                <FaRegCompass className="text-base text-opsh-primary" />
                <span className="font-medium">{propertyFace}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <TbRosetteDiscount className="text-base text-opsh-secondary" />
                <span className="font-medium">
                  {property.is_negotiable ? 'Negotiable' : 'Fixed'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <TbMapCheck className="text-base text-opsh-primary" />
                <span className="font-medium">{propertyType}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MdOutlineRealEstateAgent className="text-base text-opsh-secondary" />
                <span className="font-medium">{listingType}</span>
              </div>
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-[14px] bg-opsh-background-light px-2 py-2 text-center">
                <FaVectorSquare className="mx-auto mb-1 text-base text-opsh-primary" />
                <span className="block text-[10px] font-semibold text-opsh-darkgrey">
                  {landAreaLabel}
                </span>
              </div>

              <div className="rounded-[14px] bg-opsh-background-light px-2 py-2 text-center">
                <FaBuilding className="mx-auto mb-1 text-base text-opsh-primary" />
                <span className="block text-[10px] font-semibold text-opsh-darkgrey">
                  {floorsLabel}
                </span>
              </div>

              <div className="rounded-[14px] bg-opsh-background-light px-2 py-2 text-center">
                <FaCarSide className="mx-auto mb-1 text-base text-opsh-secondary" />
                <span className="block text-[10px] font-semibold text-opsh-darkgrey">
                  {parkingLabel}
                </span>
              </div>

              <div className="rounded-[14px] bg-opsh-background-light px-2 py-2 text-center">
                <MdOutlineAddRoad className="mx-auto mb-1 text-base text-opsh-secondary" />
                <span className="block text-[10px] font-semibold text-opsh-darkgrey">
                  {roadWidthLabel}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        images={images}
        videoUrl={videoURL}
        initialIndex={currentImageIndex}
      />

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={async () => {
            try {
              await toggleLike();
            } catch (error) {
              console.error('Property like after login failed:', error);
            }
          }}
        />
      )}
    </>
  );
};

const MediaModal = ({
  isOpen,
  onClose,
  type,
  images,
  videoUrl,
  initialIndex = 0
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  images: { full_url: string }[];
  videoUrl?: string;
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Backdrop with fade transition */}
      <div
        className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />

      {/* Modal content with scale and fade transition */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
        <div
          className="relative max-w-6xl w-full max-h-[90vh] bg-black rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition-colors duration-200"
          >
            <IoClose size={32} />
          </button>

          {type === 'image' ? (
            // Image gallery
            <div className="relative h-full flex items-center justify-center">
              <img
                src={images[currentIndex]?.full_url}
                alt={`Gallery image ${currentIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          ) : (
            // Video player
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <iframe
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Add this export statement at the end
export default PropertyCard;
