'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard, Thumbs } from 'swiper/modules';
import { IoClose } from 'react-icons/io5';
import type { Swiper as SwiperType } from 'swiper';


interface ImageGalleryProps {
    images: string[];  // Changed to match the usage
    title: string;      // Changed to match the usage
}

export default function ImageGallery({
    images,
    title,
}: ImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Move closeModal definition BEFORE the useEffect hooks that use it
    const closeModal = useCallback(() => {
        setIsOpen(false);
        // Reset thumbs swiper to prevent issues when reopening
        setThumbsSwiper(null);
    }, []);

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

    // Escape key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeModal]); // Add closeModal to dependencies

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                closeModal();
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
    }, [isOpen, closeModal]); // Add closeModal to dependencies

    const handleImageLoad = useCallback((imageUrl: string) => {
        setLoadedImages(prev => new Set(prev).add(imageUrl));
    }, []);

    const handleImageError = useCallback((imageUrl: string) => {
        setErrorImages(prev => new Set(prev).add(imageUrl));
    }, []);

    const hasError = useCallback(
        (imageUrl: string) => errorImages.has(imageUrl),
        [errorImages]
    );

    const openSlider = useCallback((index: number) => {
        setActiveIndex(index);
        setIsOpen(true);
    }, []);

    // Stop propagation to prevent modal from closing when clicking inside
    const handleModalClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!images?.length) {
        return (
            <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                No images available
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Thumbnail Grid/List - Always visible */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => openSlider(index)}
                        className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity group focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {/* Image with loading state */}
                        <div className="relative w-full h-full bg-gray-100">
                            {!loadedImages.has(image) && !hasError(image) && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                            )}
                            <img
                                src={image}
                                alt={`${title} - ${index + 1}`}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(image) ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onLoad={() => handleImageLoad(image)}
                                onError={() => handleImageError(image)}
                                loading="lazy"
                            />
                            {hasError(image) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                                    Failed to load
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* FULLSCREEN MODAL with Swiper and thumbnails */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
                    onClick={closeModal}
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
                                onClick={closeModal}
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
                                onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
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
                                                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition ${index === activeIndex ? 'border-blue-500' : 'border-transparent'
                                                    }`}
                                                onClick={() => setActiveIndex(index)}
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
            )}
        </div>
    );
}