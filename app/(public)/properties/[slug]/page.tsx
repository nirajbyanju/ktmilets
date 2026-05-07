'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDetailedProperty } from '@/hooks/useProperties';
import type { IconType } from 'react-icons';

import { RiShareForwardFill } from "react-icons/ri";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { TfiPrinter } from "react-icons/tfi";
import { MdOutlineAddRoad } from "react-icons/md";
import PropertyImageGallery from '@/components/ImageGallery/PropertyImageGallery';
import ContactEnquiry from './ContactEnquiry';
import TourSchedule from '@/components/TourSchedule';
import { TbParking } from "react-icons/tb";
import { MdDone } from "react-icons/md";
import { MdContentCopy, MdEmail } from "react-icons/md";
import { FaBed, FaBath, FaVectorSquare, FaWater, FaBolt, FaBuilding, FaHome, FaCalendarAlt, FaRulerCombined } from 'react-icons/fa';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { GiWaterTank } from 'react-icons/gi';
import { BiWater } from 'react-icons/bi';
import { RiParkingBoxLine, RiBuildingLine, RiTwitterXFill } from 'react-icons/ri';
import { FiCalendar, FiFileText, FiGrid, FiImage, FiMapPin, FiSliders } from "react-icons/fi";
import ImageGallery from '@/components/ImageGallery/ImageGallery';
import PrintPropertyDetail from '@/components/PrintPropertyDetail';
import LoginModal from '@/components/loginComponent';
import { usePropertyLikeToggle } from '@/hooks/usePropertyLikes';
import MobilePropertyShareMenu from '@/components/public/home/MobilePropertyShareMenu';

type TabId = "details" | "features" | "location" | "media" | "tour" | "facilities"

const PROPERTY_DETAIL_TABS: Array<{
    key: TabId;
    label: string;
    icon: IconType;
}> = [
        { key: "details", label: "Details", icon: FiFileText },
        { key: "features", label: "Features", icon: FiGrid },
        { key: "location", label: "Location", icon: FiMapPin },
        { key: "media", label: "Media", icon: FiImage },
        { key: "tour", label: "Tour", icon: FiCalendar },
        { key: "facilities", label: "Facilities", icon: FiSliders },
    ];

// Types
interface PropertyFace {
    id: number;
    label: string;
    slug: string;
}

interface ListingType {
    id: number;
    label: string;
    slug: string;
}

interface PropertyCategory {
    id: number;
    label: string;
    slug: string;
}

interface PropertyStatus {
    id: number;
    label: string;
    slug: string;
}

interface PropertyImage {
    id: number;
    property_id: number;
    image_url: string;
    image_type: string;
    is_featured: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface PropertyAddress {
    id: number;
    property_id: number;
    province_id: string;
    district_id: string;
    municipality_id: string;
    ward_id: string;
    area: string;
    postal_code: string;
    full_address: string;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface HouseDetails {
    id: number;
    property_id: number;
    furnishing_id: number;
    house_type_id: number;
    built_area: string;
    built_area_unit_id: number;
    total_floors: number;
    floor_details: string;
    year_built: number;
    year_renovated: number;
    construction_status: {
        id: number;
        label: string;
        slug: string;
    };
    construction_status_details: string | null;
    roof_type_id: number;
    roof_type: {
        id: number;
        label: string;
        slug: string;
    };
    reserved_tank: string;
    tank_area: string;
    parking_cars: number;
    parking_bikes: number;
    parking_type_id: number | null;
    parking_type: any;
    parking_area: string;
    parking_area_unit_id: number;
    parking_area_unit: {
        id: number;
        label: string;
        slug: string;
    };
    amenities: string;
    building_face_id: number;
    building_face: {
        id: number;
        label: string;
        slug: string;
    };
    furnishing: {
        id: number;
        label: string;
        slug: string;
    };
    house_type: {
        id: number;
        label: string;
        slug: string;
    };
    built_area_unit: {
        id: number;
        label: string;
        slug: string;
    };
}

export interface PropertyDetail {
    id: number;
    property_code: string;
    title: string;
    slug: string;
    tags: string;
    description: string;
    land_area: string;
    land_unit_id: number;
    property_face_id: number;
    property_type_id: number;
    listing_type_id: number;
    property_category_id: number;
    video_url: string | null;
    nearby_places: string | null;
    length: string;
    height: string;
    measure_unit_id: number;
    is_road_accessible: boolean;
    road_type_id: number;
    road_condition_id: number;
    road_width: string;
    base_price: string;
    advertise_price: string;
    currency: string;
    is_featured: boolean;
    is_negotiable: boolean;
    banking_available: boolean;
    has_electricity: boolean;
    water_source_id: number;
    sewage_type_id: number;
    views_count: number;
    likes_count: number;
    seo_title: string | null;
    seo_description: string | null;
    property_status_id: number;
    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;
    is_status: number;
    status: number;
    publishedat: string | null;
    verified_by: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    property_face: PropertyFace;
    listing_type: ListingType;
    property_status: PropertyStatus;
    images: PropertyImage[];
    address: PropertyAddress;
    house_details: HouseDetails;
    property_type: {
        id: number;
        label: string;
        slug: string;
    };
    road_type: {
        id: number;
        label: string;
        slug: string;
    };
    road_condition: {
        id: number;
        label: string;
        slug: string;
    };
    water_source: {
        id: number;
        label: string;
        slug: string;
    };
    sewage_type: {
        id: number;
        label: string;
        slug: string;
    };
    land_unit: {
        id: number;
        label: string;
        slug: string;
    };
    measure_unit: {
        id: number;
        label: string;
        slug: string;
    };
    property_category: PropertyCategory;
}

// Mapped Property Type
export interface MappedPropertyDetail {
    id: number;
    property_code: string;
    title: string;
    slug: string;
    description: string;
    property_type: {
        id: number;
        label: string;
    };
    land: {
        area: number;
        unit: string;
        unitObject: {
            id: number;
            label: string;
        };
        length: number;
        height: number;
        measurementUnit: {
            id: number;
            label: string;
        };
    };
    road: {
        width: number;
        type: {
            id: number;
            label: string;
        };
        condition: {
            id: number;
            label: string;
        };
        isAccessible: boolean;
    };
    price: {
        base: number;
        advertise: number;
        currency: string;
        isNegotiable: boolean;
        formattedBase: string;
        formattedAdvertise: string;
    };
    location: {
        fullAddress: string;
        area: string;
        province: {
            id: string;
            name?: string;
        };
        district: {
            id: string;
            name?: string;
        };
        municipality: {
            id: string;
            name?: string;
        };
        ward: {
            id: string;
            number?: string;
        };
        postalCode: string;
        coordinates: {
            lat: string;
            lng: string;
        };
    };
    features: {
        facing: PropertyFace;
        listingType: ListingType;
        status: PropertyStatus;
        propertyCategory: PropertyCategory;
        waterSource: {
            id: number;
            label: string;
        };
        sewageType: {
            id: number;
            label: string;
        };
        hasElectricity: boolean;
        bankingAvailable: boolean;
    };
    houseDetails: {
        furnishing: {
            id: number;
            label: string;
        };
        houseType: {
            id: number;
            label: string;
        };
        builtArea: {
            value: number;
            unit: {
                id: number;
                label: string;
            };
        };
        totalFloors: number;
        floorDetails: any;
        yearBuilt: number;
        yearRenovated: number;
        constructionStatus: {
            id: number;
            label: string;
        };
        roofType: {
            id: number;
            label: string;
        };
        waterTank: {
            reserved: string;
            area: string;
        };
        parking: {
            cars: number;
            bikes: number;
            area: {
                value: number;
                unit: {
                    id: number;
                    label: string;
                };
            };
        };
        buildingFace: {
            id: number;
            label: string;
        };
        amenities: any[];
    };
    images: {
        featured: string | null;
        gallery: string[];
    };
    stats: {
        views: number;
        likes: number;
    };
    metadata: {
        createdAt: string;
        updatedAt: string;
        propertyCode: string;
        tags: string;
        isFeatured: boolean;
        videoUrl: string | null;
        nearbyPlaces: any;
    };
    seo: {
        title: string | null;
        description: string | null;
    };
}

// Mapper Function
function mapPropertyDetail(apiData: PropertyDetail): MappedPropertyDetail {
    const featuredImage = apiData.images.find(img => img.is_featured === 1);
    const galleryImages = apiData.images
        .filter(img => img.image_type === 'gallery')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.image_url);

    // Format price
    const formatPrice = (price: string) => {
        const num = parseFloat(price);
        if (num >= 10000000) {
            return `NPR ${(num / 10000000).toFixed(2)} Crore`;
        } else if (num >= 100000) {
            return `NPR ${(num / 100000).toFixed(2)} Lakh`;
        }
        return `NPR ${num.toLocaleString()}`;
    };

    // Parse floor details if exists
    let floorDetails = null;
    if (apiData.house_details?.floor_details) {
        try {
            floorDetails = JSON.parse(apiData.house_details.floor_details);
        } catch (e) {
            console.error('Failed to parse floor details:', e);
        }
    }

    // Parse amenities if exists
    let amenities = [];
    if (apiData.house_details?.amenities) {
        try {
            amenities = JSON.parse(apiData.house_details.amenities);
        } catch (e) {
            console.error('Failed to parse amenities:', e);
        }
    }

    // Parse nearby places if exists
    let nearbyPlaces = null;
    if (apiData.nearby_places) {
        try {
            nearbyPlaces = JSON.parse(apiData.nearby_places);
        } catch (e) {
            console.error('Failed to parse nearby places:', e);
        }
    }

    return {
        id: apiData?.id,
        property_code: apiData?.property_code,
        title: apiData?.title,
        slug: apiData?.slug,
        description: apiData?.description,
        property_type: {
            id: apiData?.property_type.id,
            label: apiData?.property_type.label
        },
        land: {
            area: parseFloat(apiData?.land_area),
            unit: apiData.land_unit?.label,
            unitObject: {
                id: apiData?.land_unit?.id,
                label: apiData?.land_unit?.label
            },
            length: parseFloat(apiData?.length || '0'),
            height: parseFloat(apiData?.height || '0'),
            measurementUnit: {
                id: apiData?.measure_unit?.id,
                label: apiData.measure_unit?.label
            }
        },
        road: {
            width: parseFloat(apiData.road_width || '0'),
            type: {
                id: apiData.road_type.id,
                label: apiData.road_type.label
            },
            condition: {
                id: apiData.road_condition.id,
                label: apiData.road_condition.label
            },
            isAccessible: apiData.is_road_accessible
        },
        price: {
            base: parseFloat(apiData.base_price),
            advertise: parseFloat(apiData.advertise_price),
            currency: apiData.currency,
            isNegotiable: apiData.is_negotiable,
            formattedBase: formatPrice(apiData.base_price),
            formattedAdvertise: formatPrice(apiData.advertise_price),
        },
        location: {
            fullAddress: apiData.address.full_address,
            area: apiData.address.area,
            province: {
                id: apiData.address.province_id,
            },
            district: {
                id: apiData.address.district_id,
            },
            municipality: {
                id: apiData.address.municipality_id,
            },
            ward: {
                id: apiData.address.ward_id,
            },
            postalCode: apiData.address.postal_code,
            coordinates: {
                lat: apiData.address.latitude,
                lng: apiData.address.longitude,
            },
        },
        features: {
            facing: apiData.property_face,
            listingType: apiData.listing_type,
            status: apiData.property_status,
            propertyCategory: apiData.property_category,
            waterSource: apiData.water_source,
            sewageType: apiData.sewage_type,
            hasElectricity: apiData.has_electricity,
            bankingAvailable: apiData.banking_available,
        },
        houseDetails: {
            furnishing: apiData.house_details?.furnishing || { id: 0, label: 'N/A' },
            houseType: apiData.house_details?.house_type || { id: 0, label: 'N/A' },
            builtArea: {
                value: parseFloat(apiData.house_details?.built_area || '0'),
                unit: apiData.house_details?.built_area_unit || { id: 0, label: 'N/A' }
            },
            totalFloors: apiData.house_details?.total_floors || 0,
            floorDetails: floorDetails,
            yearBuilt: apiData.house_details?.year_built || 0,
            yearRenovated: apiData.house_details?.year_renovated || 0,
            constructionStatus: apiData.house_details?.construction_status || { id: 0, label: 'N/A' },
            roofType: apiData.house_details?.roof_type || { id: 0, label: 'N/A' },
            waterTank: {
                reserved: apiData.house_details?.reserved_tank || '0',
                area: apiData.house_details?.tank_area || '0'
            },
            parking: {
                cars: apiData.house_details?.parking_cars || 0,
                bikes: apiData.house_details?.parking_bikes || 0,
                area: {
                    value: parseFloat(apiData.house_details?.parking_area || '0'),
                    unit: apiData.house_details?.parking_area_unit || { id: 0, label: 'N/A' }
                }
            },
            buildingFace: apiData.house_details?.building_face || { id: 0, label: 'N/A' },
            amenities: amenities
        },
        images: {
            featured: featuredImage ? featuredImage.image_url : null,
            gallery: galleryImages,
        },
        stats: {
            views: apiData.views_count,
            likes: apiData.likes_count,
        },
        metadata: {
            createdAt: apiData.created_at,
            updatedAt: apiData.updated_at,
            propertyCode: apiData.property_code,
            tags: apiData.tags,
            isFeatured: apiData.is_featured,
            videoUrl: apiData.video_url,
            nearbyPlaces: nearbyPlaces
        },
        seo: {
            title: apiData.seo_title,
            description: apiData.seo_description,
        },
    };
}

// Main Component
export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;


    const {
        data: apiResponse,
        isLoading,
        isError,
        error,
        refetch
    } = useDetailedProperty(slug);

    // Map the API data to our component format
    const property = apiResponse?.data
        ? mapPropertyDetail(apiResponse.data as unknown as PropertyDetail)
        : undefined;

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-600">Error loading property</h2>
                <p className="text-gray-600 mt-2">
                    {error instanceof Error ? error.message : 'Please try again later'}
                </p>
                <div className="flex gap-4 justify-center mt-4">
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Not found state
    if (!property) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
                <p className="text-gray-600 mt-2">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return <PropertyDetailContent property={property} />;
}

// Property Detail Content Component
function PropertyDetailContent({ property }: { property: MappedPropertyDetail }) {
    const [activeTab, setActiveTab] = useState<TabId>("details");
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingLoginAction, setPendingLoginAction] = useState<"like" | "location" | null>(null);
    const { isAuthenticated, isLiked, isPending: isLikePending, toggleLike } = usePropertyLikeToggle(property.id);

    // Calculate total rooms from floor details
    const getTotalRooms = () => {
        if (!property.houseDetails?.floorDetails) return null;
        const total = { bedrooms: 0, bathrooms: 0, kitchen: 0, living: 0 };
        try {
            property.houseDetails.floorDetails.forEach((floor: any) => {
                floor.rooms?.forEach((room: any) => {
                    if (room.name === 'bedroom') total.bedrooms += room.count || 1;
                    if (room.name === 'bathroom') total.bathrooms += room.count || 1;
                    if (room.name === 'kitchen') total.kitchen += room.count || 1;
                    if (room.name === 'living') total.living += room.count || 1;
                });
            });
        } catch (e) {
            console.error('Error calculating rooms:', e);
        }
        return total;
    };

    const rooms = getTotalRooms();
    const [showPrintModal, setShowPrintModal] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [shareFeedback, setShareFeedback] = useState('');
    const currentTab: TabId = !isAuthenticated && activeTab === "location" ? "details" : activeTab;
    const shareText = `${property.title} in ${property.location.area || property.location.fullAddress} - ${property.price.formattedAdvertise}`;
    const propertyPath = `/properties/${property.slug}`;
    const shareTitle = `${property.title} | ${property.price.formattedAdvertise}`;

    useEffect(() => {
        if (!showShareMenu) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showShareMenu]);

    const getShareUrl = () => {
        if (typeof window === 'undefined') return '';
        return window.location.href;
    };

    const openShareWindow = (url: string) => {
        if (typeof window === 'undefined') return;
        window.open(url, '_blank', 'noopener,noreferrer,width=680,height=720');
        setShowShareMenu(false);
    };

    const handleCopyLink = async () => {
        const shareUrl = getShareUrl();
        if (!shareUrl) return;

        try {
            if (navigator?.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            setShareFeedback('Link copied');
        } catch {
            setShareFeedback('Copy failed');
        }

        setShowShareMenu(false);

        window.setTimeout(() => {
            setShareFeedback('');
        }, 2200);
    };

    const shareOptions = [
        {
            key: 'facebook',
            label: 'Facebook',
            icon: <FaFacebookF size={16} />,
            className: 'bg-[#1877F2] text-white',
            onClick: () => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`),
        },
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            icon: <FaWhatsapp size={16} />,
            className: 'bg-[#25D366] text-white',
            onClick: () => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${getShareUrl()}`)}`),
        },
        {
            key: 'x',
            label: 'X',
            icon: <RiTwitterXFill size={16} />,
            className: 'bg-black text-white',
            onClick: () => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`),
        },
        {
            key: 'linkedin',
            label: 'LinkedIn',
            icon: <FaLinkedinIn size={16} />,
            className: 'bg-[#0A66C2] text-white',
            onClick: () => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`),
        },
        {
            key: 'telegram',
            label: 'Telegram',
            icon: <FaTelegramPlane size={16} />,
            className: 'bg-[#229ED9] text-white',
            onClick: () => openShareWindow(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`),
        },
        {
            key: 'email',
            label: 'Email',
            icon: <MdEmail size={16} />,
            className: 'bg-opsh-primary text-white',
            onClick: () => {
                if (typeof window === 'undefined') return;
                window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${getShareUrl()}`)}`;
                setShowShareMenu(false);
            },
        },
        {
            key: 'copy',
            label: 'Copy Link',
            icon: <MdContentCopy size={16} />,
            className: 'bg-opsh-background-dark text-opsh-primary',
            onClick: handleCopyLink,
        },
    ];

    const handlePropertyLike = async () => {
        if (!isAuthenticated) {
            setPendingLoginAction("like");
            setIsLoginModalOpen(true);
            return;
        }

        if (isLikePending) {
            return;
        }

        try {
            await toggleLike();
        } catch (error) {
            console.error('Property like toggle failed:', error);
        }
    };

    const handleTabChange = (tabKey: TabId) => {
        if (tabKey === "location" && !isAuthenticated) {
            setPendingLoginAction("location");
            setIsLoginModalOpen(true);
            return;
        }

        setActiveTab(tabKey);
    };

    const propertyActionItems = [
        {
            key: 'save',
            icon: isLiked ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />,
            label: isLiked ? 'Saved' : 'Save',
            onClick: handlePropertyLike,
            isActive: isLiked,
            disabled: isLikePending,
        },
        {
            key: 'print',
            icon: <TfiPrinter size={18} />,
            label: 'Print',
            onClick: () => setShowPrintModal(true),
            isActive: false,
            disabled: false,
        },
    ];

    return (
        <section className="bg-gray-50">
            <div className="mx-auto max-w-[1450px] px-3 pt-4 pb-12 sm:px-4 sm:pt-6 sm:pb-16">
                <div className=''>
                    {/* Header Section */}
                    <div className="">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                            {/* LEFT SIDE */}
                            <div className="flex-1">
                                <h1 className="text-lg font-bold leading-tight text-green-900 md:text-2xl">
                                    {property.title}
                                </h1>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-600">
                                    <p className="flex items-center gap-1 text-xs sm:text-sm">
                                        {property.location.fullAddress}, {property.location.area}
                                    </p>

                                    {property.metadata.isFeatured && (
                                        <span className="rounded bg-green-700 px-2.5 py-1 text-[11px] font-medium text-white hover:cursor-pointer">
                                            FEATURED
                                        </span>
                                    )}

                                    <span className="rounded bg-opsh-primary px-2.5 py-1 text-[11px] font-medium text-white hover:cursor-pointer">
                                        {property.features.listingType.label}
                                    </span>

                                    <span className="rounded bg-opsh-secondary px-2.5 py-1 text-[11px] font-medium text-white hover:cursor-pointer">
                                        {property.property_type.label}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT SIDE - Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 md:gap-4  hidden md:flex">
                                <div className="md:hidden">
                                    <MobilePropertyShareMenu
                                        propertyTitle={property.title}
                                        propertyPath={propertyPath}
                                        shareText={shareText}
                                        buttonClassName="h-10 w-10 bg-gray-100 text-opsh-muted-dark shadow-sm hover:bg-green-900 hover:text-white"
                                        iconClassName="text-[18px]"
                                    />
                                </div>

                                <div ref={shareMenuRef} className="relative hidden md:block">
                                    <button
                                        onClick={() => setShowShareMenu((prev) => !prev)}
                                        className="flex flex-col items-center text-sm group"
                                    >
                                        <span className="rounded-full bg-gray-100 p-3 shadow-sm transition-all duration-300 group-hover:bg-green-900 group-hover:text-white">
                                            <RiShareForwardFill size={18} />
                                        </span>
                                        <span className="mt-1 text-xs text-gray-600 transition group-hover:text-green-900">
                                            Share
                                        </span>
                                    </button>

                                    {showShareMenu && (
                                        <div className="absolute right-0 top-full z-30 mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">Share Property</p>
                                                    <h3 className="mt-1 text-sm font-semibold text-green-900">Send this listing anywhere</h3>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowShareMenu(false)}
                                                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                                    aria-label="Close share menu"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {shareOptions.map((option) => (
                                                    <button
                                                        key={option.key}
                                                        type="button"
                                                        onClick={option.onClick}
                                                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:border-green-900 hover:bg-green-50"
                                                    >
                                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${option.className}`}>
                                                            {option.icon}
                                                        </span>
                                                        <span>{option.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                                {property.title}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {propertyActionItems.map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={item.onClick}
                                        disabled={item.disabled}
                                        className="group flex items-center justify-center text-sm md:flex-col"
                                        aria-label={item.label}
                                    >
                                        <span className={`rounded-full p-2.5 shadow-sm transition-all duration-300 md:p-3 ${item.isActive
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 group-hover:bg-red-500 group-hover:text-white'
                                            } ${item.disabled ? 'cursor-not-allowed opacity-70' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`sr-only md:not-sr-only md:mt-1 md:text-xs transition ${item.isActive
                                                ? 'text-red-500'
                                                : 'text-gray-600 group-hover:text-red-500'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {shareFeedback && (
                            <div className="mt-3 hidden items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-900 md:inline-flex">
                                <MdDone className="text-base" />
                                <span>{shareFeedback}</span>
                            </div>
                        )}

                        {/* Render PrintPropertyDetail conditionally */}
                        {showPrintModal && (
                            <PrintPropertyDetail
                                property={property}
                                onClose={() => setShowPrintModal(false)}
                            />
                        )}

                        {isLoginModalOpen && (
                            <LoginModal
                                isOpen={isLoginModalOpen}
                                onClose={() => {
                                    setIsLoginModalOpen(false);
                                    setPendingLoginAction(null);
                                }}
                                onLoginSuccess={async () => {
                                    if (pendingLoginAction === "like") {
                                        try {
                                            await toggleLike();
                                        } catch (error) {
                                            console.error('Property like after login failed:', error);
                                        }
                                    }

                                    if (pendingLoginAction === "location") {
                                        setActiveTab("location");
                                    }

                                    setPendingLoginAction(null);
                                }}
                            />
                        )}

                        {/* Property Features and Price */}
                        <div className="mt-3 flex flex-col gap-4 md:mt-4 md:flex-row md:items-center md:justify-between md:gap-6">
                            {/* Property Features Icons */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                                <div className="flex items-center gap-2   px-3  text-gray-500">
                                    <FaVectorSquare className="text-xl" />
                                    <div className="min-w-0">
                                        <span className="block text-sm font-semibold text-opsh-primary">
                                            {property.land.area} {property.land.unit}
                                        </span>
                                    </div>
                                </div>

                                {rooms && rooms.bedrooms > 0 && (
                                    <div className="flex items-center gap-2 px-3 text-gray-500 ">
                                        <FaBed className="text-xl" />
                                        <div className='min-w-0'>
                                            <span className="block text-sm font-semibold text-opsh-primary">{rooms.bedrooms}</span>

                                        </div>
                                    </div>
                                )}

                                {rooms && rooms.bathrooms > 0 && (
                                    <div className="flex items-center gap-2  px-3  text-gray-500 ">
                                        <FaBath className="text-xl" />
                                        <div className='min-w-0'>
                                            <span className="block text-sm font-semibold text-opsh-primary">{rooms.bathrooms}</span>
                                        </div>
                                    </div>
                                )}

                                {property.houseDetails?.totalFloors > 0 && (
                                    <div className="flex items-center gap-2  px-3 text-gray-500 ">
                                        <FaBuilding className="text-xl" />
                                        <div className='min-w-0'>
                                            <span className="block text-sm font-semibold text-opsh-primary">{property.houseDetails.totalFloors}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2  px-3  text-gray-500">
                                    <MdOutlineAddRoad className="text-xl" />
                                    <div className='min-w-0'>
                                        <span className="block text-sm font-semibold text-opsh-primary">{property.road.width || 'N/A'} ft</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-center gap-3 text-left md:text-right">
                                <div>
                                    <p className="text-xl font-bold text-opsh-primary">
                                        {property.price.formattedAdvertise}
                                    </p>
                                    {property.price.base !== property.price.advertise && (
                                        <p className="text-lg text-gray-400 line-through">
                                            {property.price.formattedBase}
                                        </p>
                                    )}
                                    {property.price.isNegotiable && (
                                        <p className="text-sm text-gray-500">(Negotiable)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-3'>
                        <PropertyImageGallery
                            featuredImage={property.images.featured}
                            galleryImages={property.images.gallery}
                            propertyTitle={property.title}
                        />
                    </div>

                    {/* Tabs Section */}
                    <div className='mt-4 grid gap-4 lg:grid-cols-12'>
                        <div className="lg:col-span-9 border bg-white">
                            {/* Tab Navigation */}
                            <div className="overflow-x-auto border-b border-opsh-grey">
                                <nav
                                    className="flex min-w-max gap-2 bg-[#E6E9EC] px-2 py-2"
                                    aria-label="Property features tabs"
                                >
                                    {PROPERTY_DETAIL_TABS.map((tab) => {
                                        const isActive = currentTab === tab.key;
                                        const TabIcon = tab.icon;

                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => handleTabChange(tab.key)}
                                                aria-label={tab.label}
                                                className={`relative z-10 inline-flex min-w-[52px] items-center justify-center gap-2 rounded px-3 py-2.5 text-sm font-medium transition-all duration-300 sm:min-w-fit sm:px-4
                                                    ${isActive
                                                        ? "bg-opsh-text text-opsh-primary shadow-sm"
                                                        : "bg-opsh-primary text-opsh-text"
                                                    }`}
                                            >
                                                <TabIcon className="text-base sm:text-sm" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-3 md:p-5 lg:p-8">
                                {currentTab === "details" && (
                                    <div className="space-y-6">


                                        {/* Quick info card */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Information</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Property ID</p>
                                                    <p className="font-medium text-gray-800">{property.property_code}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Property Type</p>
                                                    <p className="font-medium text-gray-800">{property.property_type.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Category</p>
                                                    <p className="font-medium text-gray-800">{property.features?.propertyCategory?.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Status</p>
                                                    <p className="font-medium text-gray-800">{property.features.status.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Listing Type</p>
                                                    <p className="font-medium text-gray-800">{property.features.listingType.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Facing</p>
                                                    <p className="font-medium text-gray-800">{property.features.facing.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Land Area</p>
                                                    <p className="font-medium text-gray-800">{property.land.area} {property.land.unit}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Dimensions (L x H)</p>
                                                    <p className="font-medium text-gray-800">{property.land.length} x {property.land.height} {property.land.measurementUnit.label}</p>
                                                </div>

                                                {property.houseDetails?.builtArea.value > 0 && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Built Area</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.builtArea.value} {property.houseDetails.builtArea.unit.label}</p>
                                                    </div>
                                                )}

                                                {property.houseDetails?.totalFloors > 0 && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Total Floors</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.totalFloors}</p>
                                                    </div>
                                                )}

                                                {property.houseDetails?.yearBuilt > 0 && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Year Built</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.yearBuilt}</p>
                                                    </div>
                                                )}

                                                {property.houseDetails?.constructionStatus.label !== 'N/A' && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Construction Status</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.constructionStatus.label}</p>
                                                    </div>
                                                )}

                                                {property.houseDetails?.furnishing.label !== 'N/A' && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Furnishing</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.furnishing.label}</p>
                                                    </div>
                                                )}

                                                {property.houseDetails?.roofType.label !== 'N/A' && (
                                                    <div className='flex flex-col'>
                                                        <p className="text-gray-500 text-xs">Roof Type</p>
                                                        <p className="font-medium text-gray-800">{property.houseDetails.roofType.label}</p>
                                                    </div>
                                                )}

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Road Access</p>
                                                    <p className="font-medium text-gray-800">{property.road.isAccessible ? 'Yes' : 'No'}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Road Type</p>
                                                    <p className="font-medium text-gray-800">{property.road.type.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Road Condition</p>
                                                    <p className="font-medium text-gray-800">{property.road.condition.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Water Source</p>
                                                    <p className="font-medium text-gray-800">{property.features.waterSource.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Sewage Type</p>
                                                    <p className="font-medium text-gray-800">{property.features.sewageType.label}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Electricity</p>
                                                    <p className="font-medium text-gray-800">{property.features.hasElectricity ? 'Available' : 'Not Available'}</p>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <p className="text-gray-500 text-xs">Banking Available</p>
                                                    <p className="font-medium text-gray-800">{property.features.bankingAvailable ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room Details if available */}
                                        {property.houseDetails?.floorDetails && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Room Details</h3>
                                                <div className="space-y-4">
                                                    {property.houseDetails.floorDetails.map((floor: any, index: number) => (
                                                        <div key={index} className="border-l-4 border-green-700 pl-4">
                                                            <h4 className="font-medium text-gray-800 mb-2">Floor {floor.floor}</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {floor.rooms?.map((room: any, roomIndex: number) => (
                                                                    <div key={roomIndex} className="bg-white p-2 rounded">
                                                                        <p className="text-sm capitalize">{room.name}</p>
                                                                        <p className="font-medium">Count: {room.count || 1}</p>
                                                                        {room.size && <p className="text-xs text-gray-500">Size: {room.size} {room.size_unit === '1' ? 'Sq.ft' : ''}</p>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h2 className="text-xl font-serif font-semibold mb-2 text-opsh-primary">Property Description</h2>
                                            <div className="text-gray-700 leading-relaxed text-sm"
                                                dangerouslySetInnerHTML={{ __html: property.description }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {currentTab === "features" && (
                                    <div className="space-y-8">
                                        {/* Parking Information */}
                                        {property.houseDetails?.parking && (
                                            <div>
                                                <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Parking</h2>
                                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                                    {property.houseDetails.parking.cars > 0 && (
                                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><TbParking /></span>
                                                            <div>
                                                                <p className='font-medium'>Cars: {property.houseDetails.parking.cars}</p>
                                                                {property.houseDetails.parking.bikes > 0 && (
                                                                    <p className='text-sm text-gray-600'>Bikes: {property.houseDetails.parking.bikes}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {property.houseDetails.parking.area.value > 0 && (
                                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><RiParkingBoxLine /></span>
                                                            <div>
                                                                <p className='font-medium'>Parking Area</p>
                                                                <p className='text-sm text-gray-600'>{property.houseDetails.parking.area.value} {property.houseDetails.parking.area.unit.label}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Water Tank Information */}
                                        {property.houseDetails?.waterTank && (parseFloat(property.houseDetails.waterTank.reserved) > 0 || parseFloat(property.houseDetails.waterTank.area) > 0) && (
                                            <div>
                                                <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Water Tank</h2>
                                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                                    {parseFloat(property.houseDetails.waterTank.reserved) > 0 && (
                                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><GiWaterTank /></span>
                                                            <div>
                                                                <p className='font-medium'>Reserved Tank</p>
                                                                <p className='text-sm text-gray-600'>{property.houseDetails.waterTank.reserved} units</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {parseFloat(property.houseDetails.waterTank.area) > 0 && (
                                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><FaRulerCombined /></span>
                                                            <div>
                                                                <p className='font-medium'>Tank Area</p>
                                                                <p className='text-sm text-gray-600'>{property.houseDetails.waterTank.area} {property.land.measurementUnit.label}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Construction Details */}
                                        <div>
                                            <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Construction Details</h2>
                                            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                                {property.houseDetails?.constructionStatus.label !== 'N/A' && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><FaHome /></span>
                                                        <div>
                                                            <p className='font-medium'>Construction Status</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.constructionStatus.label}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.houseDetails?.roofType.label !== 'N/A' && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'></span>
                                                        <div>
                                                            <p className='font-medium'>Roof Type</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.roofType.label}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.houseDetails?.buildingFace.label !== 'N/A' && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><RiBuildingLine /></span>
                                                        <div>
                                                            <p className='font-medium'>Building Face</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.buildingFace.label}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.houseDetails?.furnishing.label !== 'N/A' && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><FaHome /></span>
                                                        <div>
                                                            <p className='font-medium'>Furnishing</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.furnishing.label}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.houseDetails?.yearBuilt > 0 && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><FaCalendarAlt /></span>
                                                        <div>
                                                            <p className='font-medium'>Year Built</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.yearBuilt}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.houseDetails?.yearRenovated > 0 && (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                        <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><FaCalendarAlt /></span>
                                                        <div>
                                                            <p className='font-medium'>Year Renovated</p>
                                                            <p className='text-sm text-gray-600'>{property.houseDetails.yearRenovated}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Amenities if available */}
                                        {property.houseDetails?.amenities && property.houseDetails.amenities.length > 0 && (
                                            <div>
                                                <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Amenities</h2>
                                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                                    {property.houseDetails.amenities.map((amenity: string, index: number) => (
                                                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            <span className='bg-green-100 p-2 rounded-full text-opsh-primary text-lg'><MdDone /></span>
                                                            <span className='text-gray-700 capitalize'>{amenity.replace(/_/g, ' ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentTab === "location" && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-serif font-semibold mb-2 text-opsh-primary">Location Details</h2>
                                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Full Address</p>
                                                        <p className="font-medium">{property.location.fullAddress}, {property.location.area}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Postal Code</p>
                                                        <p className="font-medium">{property.location.postalCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Province ID</p>
                                                        <p className="font-medium">{property.location.province.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-sm">District ID</p>
                                                        <p className="font-medium">{property.location.district.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Municipality ID</p>
                                                        <p className="font-medium">{property.location.municipality.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Ward ID</p>
                                                        <p className="font-medium">{property.location.ward.id}</p>
                                                    </div>
                                                    {property.location.coordinates.lat !== '22' && (
                                                        <>
                                                            <div>
                                                                <p className="text-gray-500 text-sm">Latitude</p>
                                                                <p className="font-medium">{property.location.coordinates.lat}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 text-sm">Longitude</p>
                                                                <p className="font-medium">{property.location.coordinates.lng}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <section>
                                                <div className="relative overflow-hidden h-96 w-full rounded-lg mb-10">
                                                    <iframe
                                                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${property.location.coordinates.lat},${property.location.coordinates.lng}`}
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        style={{ border: 0 }}
                                                        allowFullScreen
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title={`Map location of ${property.title}`}
                                                    ></iframe>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {currentTab === "media" && (
                                    <div className="space-y-8">
                                        {property.images.gallery && property.images.gallery.length > 0 && (
                                            <>
                                                <div>
                                                    <h2 className="text-xl font-serif font-semibold mb-2 text-opsh-primary">
                                                        Gallery ({property.images.gallery.length} photos)
                                                    </h2>
                                                </div>
                                                <div>
                                                    <ImageGallery
                                                        images={property.images.gallery}
                                                        title={property.title}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {property.metadata.videoUrl && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h2 className="text-xl font-serif font-semibold text-opsh-primary">
                                                        Video Tour
                                                    </h2>
                                                </div>
                                                <div className="relative w-full pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={property.metadata.videoUrl.replace('watch?v=', 'embed/')}
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        title="Property video tour"
                                                        loading="lazy"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentTab === "tour" && (
                                    <TourSchedule
                                        property_id={property.id}
                                    />
                                )}

                                {currentTab === "facilities" && (
                                    <div>
                                        <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Nearby Places</h2>

                                        {property.metadata.nearbyPlaces ? (
                                            Array.isArray(property.metadata.nearbyPlaces) && property.metadata.nearbyPlaces.length > 0 ? (
                                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                                    {property.metadata.nearbyPlaces.map((place: any, index: number) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                                            <span className='font-medium text-gray-800'>{place.name}</span>
                                                            <span className='text-opsh-primary font-semibold'>{place.distance}km</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No nearby places information available</p>
                                            )
                                        ) : (
                                            <p className="text-gray-500">No nearby places information available</p>
                                        )}

                                        {/* Road Information */}
                                        <div className="mt-8">
                                            <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Road Information</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-gray-500 text-sm">Road Width</p>
                                                    <p className="font-medium text-lg">{property.road.width} ft</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-gray-500 text-sm">Road Type</p>
                                                    <p className="font-medium">{property.road.type.label}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-gray-500 text-sm">Road Condition</p>
                                                    <p className="font-medium">{property.road.condition.label}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Utilities */}
                                        <div className="mt-8">
                                            <h2 className="text-xl font-serif font-semibold mb-4 text-opsh-primary">Utilities</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                                    <FaWater className="text-blue-500 text-xl" />
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Water Source</p>
                                                        <p className="font-medium">{property.features.waterSource.label}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                                    <BiWater className="text-green-500 text-xl" />
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Sewage Type</p>
                                                        <p className="font-medium">{property.features.sewageType.label}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                                    <FaBolt className="text-yellow-500 text-xl" />
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Electricity</p>
                                                        <p className="font-medium">{property.features.hasElectricity ? 'Available' : 'Not Available'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                                    <FaBuilding className="text-purple-500 text-xl" />
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Banking</p>
                                                        <p className="font-medium">{property.features.bankingAvailable ? 'Available' : 'Not Available'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:block lg:col-span-3 md:block">
                            <ContactEnquiry property_id={property.id} property_type_id={property.property_type.id} />
                        </div>


                    </div>
                </div>
            </div>



        </section>
    );
}
