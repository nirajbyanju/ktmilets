'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SlSizeFullscreen } from 'react-icons/sl';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// Import the ImageGalleryFullscreen component
import ImageGalleryFullscreen from './ImageGalleryFullscreen'; // Adjust the import path as needed

interface PropertyImageGalleryProps {
  featuredImage: string | null;
  galleryImages: string[];
  propertyTitle: string;
}

export default function PropertyImageGallery({
  featuredImage,
  galleryImages,
  propertyTitle,
}: PropertyImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Combine images once and drop duplicate URLs while keeping featured first.
  const allImages = useMemo(() => {
    const seen = new Set<string>();

    return [featuredImage, ...(galleryImages ?? [])].reduce<string[]>(
      (images, image) => {
        const normalizedImage = image?.trim();

        if (!normalizedImage || seen.has(normalizedImage)) {
          return images;
        }

        seen.add(normalizedImage);
        images.push(normalizedImage);
        return images;
      },
      []
    );
  }, [featuredImage, galleryImages]);

  // Handle body scroll lock for modal
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    setErrorImages(prev => new Set(prev).add(imageUrl));
  }, []);

  const isLoaded = useCallback(
    (imageUrl: string) => loadedImages.has(imageUrl),
    [loadedImages]
  );

  const hasError = useCallback(
    (imageUrl: string) => errorImages.has(imageUrl),
    [errorImages]
  );

  const openSlider = useCallback((index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  }, []);

  const nextImage = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (!allImages.length) {
    return (
      <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  // --- Main image with skeleton ---
  const renderMainImage = (imageUrl: string, index: number, className = '') => {
    if (hasError(imageUrl)) {
      return (
        <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
          Failed to load
        </div>
      );
    }
    return (
      <>
        {!isLoaded(imageUrl) && (
          <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
        )}
        <img
          src={imageUrl}
          alt={`${propertyTitle} - ${index + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded(imageUrl) ? 'opacity-100' : 'opacity-0'
            } ${className}`}
          onLoad={() => handleImageLoad(imageUrl)}
          onError={() => handleImageError(imageUrl)}
        />
      </>
    );
  };

  return (
    <div className="w-full">
      {/* Main gallery area with proper grid */}
      <div className="relative group grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main image container - spans 8 columns on desktop */}
        <div className="lg:col-span-8">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] w-full overflow-hidden rounded bg-gray-100">
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={() => openSlider(activeIndex)}
            >
              {renderMainImage(allImages[activeIndex], activeIndex)}
            </div>

            {/* Image counter badge */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm z-10">
              {activeIndex + 1} / {allImages.length}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={() => openSlider(activeIndex)}
              className="absolute top-4 right-4 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition backdrop-blur-sm z-10"
              aria-label="View fullscreen"
            >
              <SlSizeFullscreen size={18} />
            </button>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition opacity-0 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm z-10"
                  aria-label="Previous image"
                >
                  <IoChevronBack size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition opacity-0 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm z-10"
                  aria-label="Next image"
                >
                  <IoChevronForward size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnails container - spans 4 columns on desktop */}
        <div className="lg:col-span-4">
          {allImages.length > 1 && (
            <div className="h-full">
              {/* Mobile: horizontal scroll */}
              <div className="lg:hidden overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2">
                  {allImages.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition ${
                        idx === activeIndex
                          ? 'border-blue-600 shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="relative w-full h-full bg-gray-100">
                        {hasError(image) ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            Error
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => handleImageError(image)}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: vertical grid - 2 columns, multiple rows */}
              <div className="hidden lg:grid grid-cols-3 gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {allImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                      idx === activeIndex
                        ? 'border-blue-600 shadow-md'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-full bg-gray-100">
                      {hasError(image) ? (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          Error
                        </div>
                      ) : (
                        <img
                          src={image}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => handleImageError(image)}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reuse the fullscreen modal from ImageGallery */}
      <ImageGalleryFullscreen
        images={allImages}
        title={propertyTitle}
        isOpen={isOpen}
        activeIndex={activeIndex}
        onClose={() => setIsOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
