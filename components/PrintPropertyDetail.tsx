// components/PrintPropertyDetail.tsx
import { MappedPropertyDetail } from '@/app/(public)/properties/[slug]/page';
import { useRef, useEffect } from 'react';
import {
    FaBed, FaBath, FaVectorSquare, FaWater, FaBolt, FaRoad,
    FaBuilding, FaHome, FaCalendarAlt, FaRulerCombined, FaMapMarkerAlt,
    FaTag, FaHashtag, FaEye, FaHeart, FaUser, FaCheck, FaTimes, FaTree,
    FaShieldAlt, FaSun, FaWind, FaPhone, FaEnvelope, FaGlobe
} from 'react-icons/fa';
import { MdOutlineAddRoad, MdOutlineHouse, MdOutlineLocationOn, MdOutlineSecurity } from 'react-icons/md';
import { TbParking, TbRulerMeasure, TbArmchair, TbTools } from 'react-icons/tb';
import { GiWaterTank, GiElectric, GiSolarPower, GiGasStove } from 'react-icons/gi';
import { BiWater, BiWifi, BiGasPump } from 'react-icons/bi';
import { IoMdWater, IoMdRestaurant } from 'react-icons/io';
import { RiRoadMapLine, RiParkingBoxLine, RiBuildingLine, RiShoppingBagLine, RiHospitalLine } from 'react-icons/ri';
import { TfiPrinter } from "react-icons/tfi";
import { FaPeopleRoof, FaSchool, FaBus, FaMosque, FaChurch } from "react-icons/fa6";

interface PrintPropertyDetailProps {
    property: MappedPropertyDetail;
    onClose: () => void;
}

export default function PrintPropertyDetail({ property, onClose }: PrintPropertyDetailProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const hasAttemptedPrint = useRef(false);

    const cleanupIframe = (iframe: HTMLIFrameElement) => {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        hasAttemptedPrint.current = false;
    };

    const handlePrint = () => {
        if (hasAttemptedPrint.current) return;

        const printContent = printRef.current;
        if (!printContent) return;

        hasAttemptedPrint.current = true;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const printDocument = iframe.contentWindow?.document;
        if (!printDocument) {
            cleanupIframe(iframe);
            return;
        }

        const styles = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    const rules = styleSheet.cssRules || styleSheet.rules;
                    if (!rules) return '';
                    return Array.from(rules)
                        .map((rule) => rule.cssText)
                        .join('');
                } catch (e) {
                    return '';
                }
            })
            .join('');

        printDocument.open();
        printDocument.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${property.title} - Property Details</title>
                    <style>
                        ${styles}
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        body {
                            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
                            line-height: 1.4;
                            color: #1f2937;
                            background: white;
                            font-size: 12px;
                        }
                        .print-container {
                            max-width: 100%;
                        }
                        /* Header */
                        .print-header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 2px solid #059669;
                            position: relative;
                        }
                        .print-header h1 {
                            color: #059669;
                            font-size: 22px;
                            margin-bottom: 5px;
                            font-weight: 600;
                        }
                        .property-code-badge {
                            display: inline-block;
                            background: #f3f4f6;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 11px;
                            color: #4b5563;
                            font-family: monospace;
                            margin-top: 5px;
                        }
                        /* Price Card */
                        .price-card {
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: white;
                            padding: 15px;
                            border-radius: 12px;
                            text-align: center;
                            margin-bottom: 20px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .main-price {
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: -0.5px;
                        }
                        .original-price {
                            text-decoration: line-through;
                            opacity: 0.8;
                            font-size: 16px;
                            margin-left: 10px;
                        }
                        .negotiable-badge {
                            background: rgba(255,255,255,0.2);
                            display: inline-block;
                            padding: 2px 12px;
                            border-radius: 20px;
                            font-size: 11px;
                            margin-top: 8px;
                        }
                        /* Section Styles */
                        .section {
                            margin-bottom: 20px;
                            page-break-inside: avoid;
                        }
                        .section-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #059669;
                            margin-bottom: 12px;
                            padding-bottom: 6px;
                            border-bottom: 2px solid #e5e7eb;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .section-title svg {
                            font-size: 14px;
                        }
                        /* Grid Systems */
                        .grid-2 {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                        }
                        .grid-3 {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 10px;
                        }
                        .grid-4 {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 10px;
                        }
                        .grid-5 {
                            display: grid;
                            grid-template-columns: repeat(5, 1fr);
                            gap: 10px;
                        }
                        /* Info Items */
                        .info-card {
                            background: #f9fafb;
                            border-radius: 8px;
                            padding: 8px 10px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            transition: all 0.2s;
                            border: 1px solid #e5e7eb;
                        }
                        .info-icon {
                            color: #059669;
                            font-size: 16px;
                            min-width: 24px;
                            text-align: center;
                        }
                        .info-content {
                            flex: 1;
                        }
                        .info-label {
                            font-size: 10px;
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.3px;
                            font-weight: 500;
                        }
                        .info-value {
                            font-weight: 600;
                            color: #111827;
                            font-size: 13px;
                            margin-top: 2px;
                        }
                        /* Feature Badges */
                        .feature-badge-group {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;
                            margin-top: 5px;
                        }
                        .feature-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 5px;
                            padding: 3px 10px;
                            background: #f0fdf4;
                            color: #059669;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 500;
                            border: 1px solid #bbf7d0;
                        }
                        /* Amenities */
                        .amenities-grid {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;
                        }
                        .amenity-pill {
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            padding: 4px 12px;
                            background: #f3f4f6;
                            border-radius: 20px;
                            font-size: 11px;
                            color: #374151;
                            border: 1px solid #e5e7eb;
                        }
                        .amenity-pill svg {
                            color: #059669;
                            font-size: 10px;
                        }
                        /* Table */
                        .floor-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 11px;
                        }
                        .floor-table th {
                            background: #f3f4f6;
                            padding: 8px;
                            text-align: left;
                            font-weight: 600;
                            color: #374151;
                            border: 1px solid #e5e7eb;
                        }
                        .floor-table td {
                            padding: 6px 8px;
                            border: 1px solid #e5e7eb;
                        }
                        /* Images */
                        .images-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 8px;
                            margin-top: 10px;
                        }
                        .images-grid img {
                            width: 100%;
                            height: 100px;
                            object-fit: cover;
                            border-radius: 6px;
                            border: 1px solid #e5e7eb;
                        }
                        /* Footer */
                        .print-footer {
                            margin-top: 25px;
                            padding-top: 15px;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            font-size: 10px;
                            color: #9ca3af;
                        }
                        /* Two Column Layout for large sections */
                        .two-column-layout {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                        }
                        /* Utilities Row */
                        .utilities-row {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 10px;
                        }
                        .utility-item {
                            flex: 1;
                            min-width: 120px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .info-card {
                                break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${printContent.innerHTML}
                        <div class="print-footer">
                            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Property Code: ${property.property_code}</p>
                            <p>Views: ${property.stats.views} | Likes: ${property.stats.likes}</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printDocument.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            onClose();

            const printListener = () => {
                cleanupIframe(iframe);
            };

            iframe.contentWindow?.addEventListener('afterprint', printListener, { once: true });
        }, 1000);
    };

    const getTotalRooms = () => {
        if (!property.houseDetails?.floorDetails) return null;

        let total = { bedrooms: 0, bathrooms: 0, kitchen: 0, living: 0 };
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

    useEffect(() => {
        handlePrint();
    }, []);

    return (
        <>
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    {/* Header */}
                    <div className="print-header">
                        <h1>{property.title}</h1>
                        <div className="property-code-badge">
                            <FaHashtag style={{ display: 'inline', marginRight: '4px' }} /> {property.property_code}
                        </div>
                        <div className="feature-badge-group" style={{ justifyContent: 'center', marginTop: '10px' }}>
                            {property.metadata.isFeatured && <span className="feature-badge">⭐ FEATURED</span>}
                            <span className="feature-badge">{property.features.listingType.label}</span>
                            <span className="feature-badge">{property.property_type.label}</span>
                            <span className="feature-badge">{property.features?.propertyCategory?.label}</span>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="price-card">
                        <div className="main-price">{property.price.formattedAdvertise}</div>
                        {property.price.base !== property.price.advertise && (
                            <div className="original-price">{property.price.formattedBase}</div>
                        )}
                        {property.price.isNegotiable && <div className="negotiable-badge">💰 Negotiable</div>}
                    </div>

                    {/* Quick Stats - Compact Row */}
                    <div className="grid-5" style={{ marginBottom: '20px' }}>
                        <div className="info-card">
                            <div className="info-icon"><FaVectorSquare /></div>
                            <div className="info-content">
                                <div className="info-label">Land Area</div>
                                <div className="info-value">{property.land.area} {property.land.unit}</div>
                            </div>
                        </div>
                        {rooms && rooms.bedrooms > 0 && (
                            <div className="info-card">
                                <div className="info-icon"><FaBed /></div>
                                <div className="info-content">
                                    <div className="info-label">Bedrooms</div>
                                    <div className="info-value">{rooms.bedrooms}</div>
                                </div>
                            </div>
                        )}
                        {rooms && rooms.bathrooms > 0 && (
                            <div className="info-card">
                                <div className="info-icon"><FaBath /></div>
                                <div className="info-content">
                                    <div className="info-label">Bathrooms</div>
                                    <div className="info-value">{rooms.bathrooms}</div>
                                </div>
                            </div>
                        )}
                        <div className="info-card">
                            <div className="info-icon"><FaBuilding /></div>
                            <div className="info-content">
                                <div className="info-label">Status</div>
                                <div className="info-value">{property.features.status.label}</div>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon"><FaTag /></div>
                            <div className="info-content">
                                <div className="info-label">Category</div>
                                <div className="info-value">{property.features?.propertyCategory?.label}</div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout for main content */}
                    <div className="two-column-layout">
                        {/* Left Column */}
                        <div>
                            {/* Description */}
                            {property.description && (
                                <div className="section">
                                    <div className="section-title">
                                        📝 Description
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: property.description.substring(0, 300) + (property.description.length > 300 ? '...' : '') }} />
                                </div>
                            )}

                            {/* Location */}
                            <div className="section">
                                <div className="section-title">
                                    <MdOutlineLocationOn /> Location
                                </div>
                                <div className="info-card" style={{ marginBottom: '8px' }}>
                                    <div className="info-icon"><FaMapMarkerAlt /></div>
                                    <div className="info-content">
                                        <div className="info-label">Full Address</div>
                                        <div className="info-value">{property.location.fullAddress}, {property.location.area}</div>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="info-card">
                                        <div className="info-content">
                                            <div className="info-label">Province</div>
                                            <div className="info-value">{property.location.province.id}</div>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-content">
                                            <div className="info-label">District</div>
                                            <div className="info-value">{property.location.district.id}</div>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-content">
                                            <div className="info-label">Municipality</div>
                                            <div className="info-value">{property.location.municipality.id}</div>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-content">
                                            <div className="info-label">Ward</div>
                                            <div className="info-value">{property.location.ward.id}</div>
                                        </div>
                                    </div>
                                </div>
                                {property.location.postalCode && (
                                    <div className="info-card" style={{ marginTop: '8px' }}>
                                        <div className="info-content">
                                            <div className="info-label">Postal Code</div>
                                            <div className="info-value">{property.location.postalCode}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Road Information */}
                            <div className="section">
                                <div className="section-title">
                                    <FaRoad /> Road Details
                                </div>
                                <div className="grid-3">
                                    <div className="info-card">
                                        <div className="info-icon"><MdOutlineAddRoad /></div>
                                        <div className="info-content">
                                            <div className="info-label">Width</div>
                                            <div className="info-value">{property.road.width} ft</div>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><FaRoad /></div>
                                        <div className="info-content">
                                            <div className="info-label">Type</div>
                                            <div className="info-value">{property.road.type.label}</div>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><RiRoadMapLine /></div>
                                        <div className="info-content">
                                            <div className="info-label">Condition</div>
                                            <div className="info-value">{property.road.condition.label}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Building Details */}
                            {property.houseDetails && (
                                <div className="section">
                                    <div className="section-title">
                                        <FaBuilding /> Building Details
                                    </div>
                                    <div className="grid-2">
                                        {property.houseDetails.builtArea.value > 0 && (
                                            <div className="info-card">
                                                <div className="info-icon"><FaRulerCombined /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Built Area</div>
                                                    <div className="info-value">{property.houseDetails.builtArea.value} {property.houseDetails.builtArea.unit.label}</div>
                                                </div>
                                            </div>
                                        )}
                                        {property.houseDetails.totalFloors > 0 && (
                                            <div className="info-card">
                                                <div className="info-icon"><FaBuilding /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Total Floors</div>
                                                    <div className="info-value">{property.houseDetails.totalFloors}</div>
                                                </div>
                                            </div>
                                        )}
                                        {property.houseDetails.yearBuilt > 0 && (
                                            <div className="info-card">
                                                <div className="info-icon"><FaCalendarAlt /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Year Built</div>
                                                    <div className="info-value">{property.houseDetails.yearBuilt}</div>
                                                </div>
                                            </div>
                                        )}
                                        {property.houseDetails.furnishing.label !== 'N/A' && (
                                            <div className="info-card">
                                                <div className="info-icon"><TbArmchair /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Furnishing</div>
                                                    <div className="info-value">{property.houseDetails.furnishing.label}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Utilities */}
                            <div className="section">
                                <div className="section-title">
                                    ⚡ Utilities
                                </div>
                                <div className="utilities-row">
                                    <div className="info-card utility-item">
                                        <div className="info-icon"><FaWater /></div>
                                        <div className="info-content">
                                            <div className="info-label">Water Source</div>
                                            <div className="info-value">{property.features.waterSource.label}</div>
                                        </div>
                                    </div>
                                    <div className="info-card utility-item">
                                        <div className="info-icon"><BiWater /></div>
                                        <div className="info-content">
                                            <div className="info-label">Sewage</div>
                                            <div className="info-value">{property.features.sewageType.label}</div>
                                        </div>
                                    </div>
                                    <div className="info-card utility-item">
                                        <div className="info-icon"><GiElectric /></div>
                                        <div className="info-content">
                                            <div className="info-label">Electricity</div>
                                            <div className="info-value">{property.features.hasElectricity ? '✓ Available' : '✗ Not Available'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parking */}
                            {property.houseDetails?.parking && (property.houseDetails.parking.cars > 0 || property.houseDetails.parking.bikes > 0) && (
                                <div className="section">
                                    <div className="section-title">
                                        <TbParking /> Parking
                                    </div>
                                    <div className="grid-2">
                                        {property.houseDetails.parking.cars > 0 && (
                                            <div className="info-card">
                                                <div className="info-icon"><TbParking /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Car Parking</div>
                                                    <div className="info-value">{property.houseDetails.parking.cars} cars</div>
                                                </div>
                                            </div>
                                        )}
                                        {property.houseDetails.parking.bikes > 0 && (
                                            <div className="info-card">
                                                <div className="info-icon"><TbParking /></div>
                                                <div className="info-content">
                                                    <div className="info-label">Bike Parking</div>
                                                    <div className="info-value">{property.houseDetails.parking.bikes} bikes</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floor Plan Table - Full Width */}
                    {property.houseDetails?.floorDetails && property.houseDetails.floorDetails.length > 0 && (
                        <div className="section">
                            <div className="section-title">
                                📐 Floor Plan
                            </div>
                            <table className="floor-table">
                                <thead>
                                    <tr>
                                        <th>Floor</th>
                                        <th>Room Type</th>
                                        <th>Count</th>
                                        <th>Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {property.houseDetails.floorDetails.map((floor: any, floorIndex: number) => (
                                        floor.rooms?.map((room: any, roomIndex: number) => (
                                            <tr key={`${floorIndex}-${roomIndex}`}>
                                                <td>Floor {floor.floor}</td>
                                                <td className="capitalize">{room.name}</td>
                                                <td>{room.count || 1}</td>
                                                <td>{room.size} {room.size_unit === '1' ? 'Sq.ft' : ''}</td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Amenities */}
                    {property.houseDetails?.amenities && property.houseDetails.amenities.length > 0 && (
                        <div className="section">
                            <div className="section-title">
                                ✨ Amenities
                            </div>
                            <div className="amenities-grid">
                                {property.houseDetails.amenities.slice(0, 12).map((amenity: string, index: number) => (
                                    <span key={index} className="amenity-pill">
                                        <FaCheck />
                                        {amenity.replace(/_/g, ' ')}
                                    </span>
                                ))}
                                {property.houseDetails.amenities.length > 12 && (
                                    <span className="amenity-pill">+{property.houseDetails.amenities.length - 12} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Images Gallery */}
                    {property.images.gallery.length > 0 && (
                        <div className="section">
                            <div className="section-title">
                                🖼️ Property Images
                            </div>
                            <div className="images-grid">
                                {property.images.gallery.slice(0, 4).map((img, index) => (
                                    <img key={index} src={img} alt={`Property view ${index + 1}`} />
                                ))}
                            </div>
                            {property.images.gallery.length > 4 && (
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                                    +{property.images.gallery.length - 4} more images available
                                </div>
                            )}
                        </div>
                    )}

                    {/* Nearby Places */}
                    {property.metadata.nearbyPlaces && Array.isArray(property.metadata.nearbyPlaces) && property.metadata.nearbyPlaces.length > 0 && (
                        <div className="section">
                            <div className="section-title">
                                📍 Nearby Places
                            </div>
                            <div className="grid-3">
                                {property.metadata.nearbyPlaces.slice(0, 6).map((place: any, index: number) => (
                                    <div key={index} className="info-card">
                                        <div className="info-icon">
                                            {place.type === 'school' && <FaSchool />}
                                            {place.type === 'hospital' && <RiHospitalLine />}
                                            {place.type === 'restaurant' && <IoMdRestaurant />}
                                            {place.type === 'market' && <RiShoppingBagLine />}
                                            {!place.type && <FaMapMarkerAlt />}
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">{place.name}</div>
                                            <div className="info-value">{place.distance} km</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}