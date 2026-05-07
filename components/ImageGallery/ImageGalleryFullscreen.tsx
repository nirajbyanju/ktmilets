'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard, Thumbs } from 'swiper/modules';
import { IoClose } from 'react-icons/io5';
import type { Swiper as SwiperType } from 'swiper';

interface ImageGalleryFullscreenProps {
  images: string[];
  title: string;
  isOpen: boolean;
  activeIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function ImageGalleryFullscreen({
  images,
  title,
  isOpen,
  activeIndex,
  onClose,
  onIndexChange,
}: ImageGalleryFullscreenProps) {
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle body scroll lock for modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate closing when opening
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleImageError = useCallback((imageUrl: string) => {
    setErrorImages(prev => new Set(prev).add(imageUrl));
  }, []);

  const hasError = useCallback(
    (imageUrl: string) => errorImages.has(imageUrl),
    [errorImages]
  );

  // Stop propagation to prevent modal from closing when clicking inside
  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen || !images?.length) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal content - prevent clicks from closing */}
      <div
        ref={modalRef}
        className="relative w-full h-full flex flex-col"
        onClick={handleModalClick}
      >
        {/* Modal header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-[60]">
          <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
          <button
            onClick={onClose}
            className="text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close fullscreen"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Main Swiper */}
        <div className="flex-1 min-h-0 w-full">
          <Swiper
            modules={[Navigation, Pagination, Zoom, Keyboard, Thumbs]}
            navigation
            pagination={{ clickable: true }}
            zoom={true}
            keyboard={{ enabled: true }}
            thumbs={{ swiper: thumbsSwiper }}
            initialSlide={activeIndex}
            onSlideChange={swiper => onIndexChange(swiper.activeIndex)}
            className="w-full h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="swiper-zoom-container relative flex items-center justify-center h-full w-full">
                  {/* Blurred background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-30"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  {/* Main image */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    {hasError(image) ? (
                      <div className="text-white">Image failed to load</div>
                    ) : (
                      <img
                        src={image}
                        alt={`${title} ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={() => handleImageError(image)}
                      />
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnails strip in modal */}
        {images.length > 1 && (
          <div className="h-24 bg-black/80 border-t border-white/10 p-2 z-[60]">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={true}
              watchSlidesProgress={true}
              className="h-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index} style={{ width: 'auto' }}>
                  <button
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                      index === activeIndex ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => onIndexChange(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(image)}
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
}