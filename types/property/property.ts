// types/property/property.ts
export interface Property {
    status: boolean;
    message: string
    applicationMode: string;
    data: Properties[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  
  }

export interface Properties {
    id: number;
    property_code: string;
    publishedat: string;
    title: string;
    slug: string;
    tags: string | string[];
    description: string;
    land_area: number | null;
    land_unit_id: number | null;
    property_face_id: number | null;
    property_type_id: number | null;
    listing_type_id: number | null;
    listing_type: ListingType;
    length: number | null;
    height: number | null;
    measure_unit_id: number | null;
    latitude: number | null;
    longitude: number | null;
    is_road_accessible: boolean;
    road_type_id: number | null;
    road_condition_id: number | null;
    road_width: number | null;
    video_url: string;
    base_price: number | null;
    advertise_price: number | null;
    currency: string;
    is_featured: boolean;
    is_negotiable: boolean;
    banking_available: boolean;
    has_electricity: boolean;
    water_source_id: number | null;
    sewage_type_id: number | null;
    views_count: number;
    likes_count: number;
    seo_title: string | null;
    seo_description: string | null;
    property_status_id: number | null;
    status: number | null;
    created_at: string;
    updated_at: string;
    province_id: number | null;
    district_id: number | null;
    municipality_id: number | null;
    ward_id: number | null;
    isStatus: number | null;
    is_status?: number | null;
    property_face: PropertyFace;
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
    
    // Relationships
    address?: PropertyAddress;
    images?: PropertyImage[];
    features?: PropertyFeature[];
    nearbyPlaces?: NearbyPlace[];
    houseDetails?: HouseDetail;
    property_type?: PropertyType;
    property_status?: {
        id?: number;
        label?: string;
        name?: string;
    };
    land_unit?: LandUnit;
}
export interface PropertyType {
    id: number;
    name: string;
}
export interface ListingType {
    id: number;
    name: string;
}

export interface PropertyAddress {
    id: number;
    property_id: number;
    province: string | null;
    district: string | null;
    municipality: string | null;
    ward: string | null;
    area: string | null;
    postal_code: string | null;
    full_address: string | null;
}

export interface PropertyImage {
    id: number;
    property_id: number;
    image_url: string;
    image_type: 'featured' | 'gallery' | 'floor_plan' | 'document';
    is_featured: boolean;
    sort_order: number;
    full_url: string;
}

export interface PropertyFeature {
    id: number;
    name: string;
    icon: string | null;
}

export interface NearbyPlace {
    id: number;
    property_id: number;
    name: string;
    type: string;
    distance: number;
    distance_unit: string;
    description: string | null;
}

export interface HouseDetail {
    id: number;
    property_id: number;
    furnishing_id: number | null;
    house_type_id: number | null;
    built_area: number | null;
    built_area_unit_id: number | null;
    total_floors: number | null;
    floor_details: string | null; // JSON string
    year_built: number | null;
    year_renovated: number | null;
    construction_status: string | null;
    construction_status_details: string | null; // JSON string
    roof_type_id: number | null;
    reserved_tank: boolean;
    parking_cars: number | null;
    parking_bikes: number | null;
    parking_type_id: string | null;
    parking_area: number | null;
    parking_area_unit_id: number | null;
    amenities: string | null; // JSON string
    building_face_id: number | null;
}

export interface FloorDetail {
    floor: number;
    rooms: Array<{
        name: string;
        count: number;
        size: number | null;
        size_unit: string;
        features: string[];
    }>;
    area: number;
    description: string | null;
}

export interface PropertyFormData {
    // Basic Information
    property_code?: string;
    title: string;
    slug?: string;
    description: string;
    tags: string;
    
    // Property Details
    property_type_id: number | null;
    listing_type_id: number | null;
    property_status_id: number | null;
    property_face_id: number | null;
    status: number | null;

    
    // Land Details
    land_area: number | null;
    land_unit_id: number | null;
    length: number | null;
    height: number | null;
    measure_unit_id: number | null;
    video_url: string;
    
    // Location
    province_id: string | null;
    district_id: string | null;
    municipality_id: string | null;
    ward_id: string | null;
    area: string;
    postal_code: string;
    full_address: string;
    latitude: string;
    longitude: string;
    property_category_id: number | null;
    
    // Road Details
    is_road_accessible: boolean;
    road_type_id: number | null;
    road_condition_id: number | null;
    road_width: number | null;
    
    // Price Details
    base_price: number | null;
    advertise_price: number | null;
    currency: string;
    is_negotiable: boolean;
    
    // Utilities
    water_source_id: number | null;
    sewage_type_id: number | null;
    has_electricity: boolean;
    banking_available: boolean;
    
    // House Details (if property type is house)
    furnishing_id: number | null;
    house_type_id: number | null;
    built_area: number | null;
    built_area_unit_id: number | null;
    total_floors: number | null;
    floor_details: FloorDetail[];
    year_built: number | null;
    year_renovated: number | null;
    construction_status: string | null;
    construction_status_details: Record<string, unknown> | null;
    roof_type_id: number | null;
    reserved_tank: boolean;
    tank_area: number | null;
    parking_cars: number | null;
    parking_bikes: number | null;
    parking_type_id: string | null;
    parking_area: number | null;
    parking_area_unit_id: number | null;
    amenities: string[];
    building_face_id: number | null;
    
    // Features
    features: number[];
    
    // Nearby Places
    nearby_places: NearbyPlaceForm[];
    
    // Images
    images: (File | string)[];
    image_types: string[];
    featured_image_index: number;
    
    // SEO
    seo_title: string;
    seo_description: string;
}

export interface NearbyPlaceForm {
    name: string;
    type: string;
    distance: number;
    distance_unit: string;
    description?: string;
}

export interface FloorDetailForm {
    floor: number;
    rooms: string[];}

export interface PropertyFace {
    id: number;
    label: string;
    slug: string;
}

export interface ListingType {
    id: number;
    label: string;
    slug: string;
}
export interface PropertyType {
    id: number;
    name: string;
    label: string;
}

export interface LandUnit {
    id: number;
    name: string;
    label: string;
}
