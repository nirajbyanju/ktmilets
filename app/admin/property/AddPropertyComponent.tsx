// components/property/AddPropertyComponent.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
    InputField,
    SelectField,
    CheckboxField,
} from '@/components/inputField/InputField';
import CkEditorSmall from '@/components/ckEditors/CKEditorSmall';
import UploadImageField from "@/components/inputField/Upload";
import { toast } from "react-toastify";
import usePropertyStore from "@/stores/property/PropertyStore";
import useOptionStore from '@/stores/common/OptionStore';
import TagsInput from '@/components/Tags/Tags';
import MultipleSelectWithReorder from "@/components/select/multiple";
import PopupModal from "@/components/modal/PopupModal";
import { PropertyFormData } from "@/types/property/property";

interface AddPropertyProps {
    onSuccess: () => void;
    onClose: () => void;
    onOpen?: boolean;
    type?: string | null;
    id?: number | null;
}

interface FloorDetail {
    floor: number;
    rooms: {
        name: string;
        count: number;
        size: number | null;
        size_unit: string;
        features: string[];
    }[];
    area: number;
    description: string | null;
    [key: string]: any;
}

const initialFormData: PropertyFormData = {
    title: '',
    description: '',
    tags: '',

    property_type_id: null,
    listing_type_id: null,
    property_status_id: null,
    property_face_id: null,
    property_category_id: null,
    status: 1,

    land_area: null,
    land_unit_id: null,
    length: null,
    height: null,
    measure_unit_id: null,
    province_id: null,
    district_id: null,
    municipality_id: null,
    ward_id: null,
    area: '',
    postal_code: '',
    full_address: '',
    latitude: '',
    longitude: '',

    is_road_accessible: false,
    road_type_id: null,
    road_condition_id: null,
    road_width: null,

    base_price: null,
    advertise_price: null,
    currency: 'NPR',
    is_negotiable: true,

    water_source_id: null,
    sewage_type_id: null,
    has_electricity: false,
    banking_available: false,

    furnishing_id: null,
    house_type_id: null,
    built_area: null,
    built_area_unit_id: null,
    total_floors: null,
    floor_details: [],
    year_built: null,
    year_renovated: null,
    construction_status: null,
    construction_status_details: null,
    roof_type_id: null,
    reserved_tank: false,
    tank_area: null,
    parking_cars: null,
    parking_bikes: null,
    parking_type_id: null,
    parking_area: null,
    parking_area_unit_id: null,
    amenities: [],
    building_face_id: null,

    features: [],
    nearby_places: [],

    images: [],
    image_types: [],
    featured_image_index: 0,

    video_url: '',
    seo_title: '',
    seo_description: '',
};

const createDefaultRoom = () => ({
    name: '',
    count: 1,
    size: null,
    size_unit: '',
    features: []
});

const mapOptions = (items: any[]) => {
    if (!items || items.length === 0) return [];
    return items.map(item => {
        const value = item.id?.toString() || '';
        const label = item.label || item.name || item.title || '';
        return { value, label };
    }).filter(option => option.value && option.label);
};

const AddPropertyComponent: React.FC<AddPropertyProps> = ({
    onSuccess,
    onClose,
    onOpen = false,
    type = null,
    id = null
}) => {
    const [isOpenModel, setIsOpenModel] = useState(onOpen);
    const [currentStep, setCurrentStep] = useState(1);
    const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isHouseType, setIsHouseType] = useState(false);

    const prevPropertyTypeRef = useRef<number | null>(null);
    const prevProvinceIdRef = useRef<string | null>(null);
    const prevDistrictIdRef = useRef<string | null>(null);
    const prevMunicipalityIdRef = useRef<string | null>(null);

    const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
    const [filteredMunicipalities, setFilteredMunicipalities] = useState<any[]>([]);
    const [filteredWards, setFilteredWards] = useState<any[]>([]);

    const { createProperty, getProperty, updateProperty } = usePropertyStore();
    const optionStore = useOptionStore();
    const { getOptions } = optionStore;

    const fetchOptions = (optionStore as any).fetchOptions ||
        (optionStore as any).loadOptions ||
        (optionStore as any).fetchAllOptions ||
        (optionStore as any).getOptionsFromApi;

    const isViewMode = type === 'view';
    const isUpdateMode = type === 'update';

    // Get all options from store
    const propertyTypes = getOptions('propertytype') || [];
    const listingTypes = getOptions('listingtype') || [];
    const propertyStatuses = getOptions('propertystatus') || [];
    const propertyFaces = getOptions('propertyface') || [];
    const landUnits = getOptions('unit') || [];
    const measureUnits = getOptions('measureUnit') || [];
    const roadTypes = getOptions('roadtype') || [];
    const roadConditions = getOptions('roadcondition') || [];
    const waterSources = getOptions('watersource') || [];
    const sewageTypes = getOptions('sewagetype') || [];
    const furnishingTypes = getOptions('furnishing') || [];
    const houseTypes = getOptions('housetype') || [];
    const roofTypes = getOptions('rooftype') || [];
    const buildingFaces = getOptions('propertyface') || [];
    const allFeatures = getOptions('amenities') || [];
    const provinces = getOptions('province') || [];
    const propertyCategory = getOptions('propertyCategory') || [];
    const constructionStatus = getOptions('constructionStatus') || [];
    const parkingType = getOptions('parkingType') || [];

    const districts = getOptions('district') || [];
    const municipalities = getOptions('municipality') || [];
    const wards = getOptions('ward') || [];

    const currencies = [
        { id: 1, name: 'NPR', label: 'NPR' },
        { id: 2, name: 'USD', label: 'USD' }
    ];

    useEffect(() => {
        console.log('Component mounted/updated with props:', {
            type,
            id,
            onOpen,
            isViewMode,
            isUpdateMode,
            isOpenModel
        });
    }, [type, id, onOpen, isViewMode, isUpdateMode, isOpenModel]);

    useEffect(() => {
        const fetchRequiredOptions = async () => {
            const types = ['propertytype', 'listingtype', 'propertystatus', 'propertyface', 'unit', 'measureUnit', 'amenities'];

            for (const optionType of types) {
                try {
                    const options = getOptions(optionType);
                    if ((!options || options.length === 0) && fetchOptions) {
                        console.log(`Fetching ${optionType}...`);
                        await fetchOptions(optionType);
                    }
                } catch (error) {
                    console.error(`Error fetching ${optionType}:`, error);
                }
            }
        };

        if (!isViewMode) {
            fetchRequiredOptions();
        }
    }, [isViewMode, getOptions, fetchOptions]);

    useEffect(() => {
        const houseTypeId = 1;
        const isHouse = formData.property_type_id === houseTypeId;

        if (isHouseType !== isHouse) {
            console.log('Property Type ID:', formData.property_type_id);
            console.log('Is House Type:', isHouse);
            setIsHouseType(isHouse);
        }

        if (prevPropertyTypeRef.current !== formData.property_type_id &&
            prevPropertyTypeRef.current !== null) {
            console.log('Property type changed, resetting steps');
            setCurrentStep(1);
            setVisitedSteps([1]);
        }

        prevPropertyTypeRef.current = formData.property_type_id;
    }, [formData.property_type_id, isHouseType]);

    useEffect(() => {
        const loadPropertyData = async () => {
            if (isOpenModel && id && (isUpdateMode || isViewMode)) {
                console.log('Modal opened with ID:', id, 'Type:', type);
                setIsLoading(true);

                try {
                    const response = await getProperty(Number(id));
                    console.log('Fetched property data:', response);

                    if (!response) {
                        toast.error("Property not found");
                        return;
                    }

                    const data = response as any;

                    // Safe extraction helper
                    const safeExtract = (obj: any, field: string, defaultValue: any = null) => {
                        // Check multiple possible paths
                        const paths = [
                            obj[field],
                            obj.house_details?.[field],
                            obj.houseDetails?.[field],
                            obj.details?.[field],
                            obj.attributes?.[field],
                            obj.data?.[field],
                            obj.data?.house_details?.[field],
                            obj.data?.houseDetails?.[field]
                        ];

                        for (const path of paths) {
                            if (path !== undefined && path !== null) {
                                return path;
                            }
                        }
                        return defaultValue;
                    };

                    const address = data.address || {};

                    // Safely parse JSON fields
                    let parsedFloorDetails = safeExtract(data, 'floor_details', []);
                    if (typeof parsedFloorDetails === "string") {
                        try {
                            parsedFloorDetails = JSON.parse(parsedFloorDetails);
                        } catch (error) {
                            console.error("Invalid JSON in floor_details", error);
                            parsedFloorDetails = [];
                        }
                    }

                    // Parse amenities - CRITICAL FOR AMENITIES
                    let parsedAmenities = safeExtract(data, 'amenities', []);
                    if (typeof parsedAmenities === 'string') {
                        try {
                            parsedAmenities = JSON.parse(parsedAmenities);
                        } catch (error) {
                            console.error("Invalid JSON in amenities", error);
                            parsedAmenities = [];
                        }
                    }

                    // If amenities is array of objects, extract IDs
                    if (Array.isArray(parsedAmenities) && parsedAmenities.length > 0) {
                        if (typeof parsedAmenities[0] === 'object' && parsedAmenities[0] !== null) {
                            parsedAmenities = parsedAmenities.map((a: any) => a.id?.toString() || a);
                        } else {
                            parsedAmenities = parsedAmenities.map((a: any) => a.toString());
                        }
                    }

                    console.log('Parsed amenities:', parsedAmenities);

                    const newFormData = {
                        title: data.title || safeExtract(data, 'title', ''),
                        description: data.description || safeExtract(data, 'description', ''),
                        tags: data.tags || safeExtract(data, 'tags', ''),

                        property_type_id: data.property_type_id ? Number(data.property_type_id) : safeExtract(data, 'property_type_id', null),
                        listing_type_id: data.listing_type_id ? Number(data.listing_type_id) : safeExtract(data, 'listing_type_id', null),
                        property_status_id: data.property_status_id ? Number(data.property_status_id) : safeExtract(data, 'property_status_id', null),
                        property_face_id: data.property_face_id ? Number(data.property_face_id) : safeExtract(data, 'property_face_id', null),
                        property_category_id: data.property_category_id ? Number(data.property_category_id) : safeExtract(data, 'property_category_id', null),
                        status: data.status ?? safeExtract(data, 'status', 1),

                        land_area: data.land_area ? Number(data.land_area) : safeExtract(data, 'land_area', null),
                        land_unit_id: data.land_unit_id ? Number(data.land_unit_id) : safeExtract(data, 'land_unit_id', null),
                        length: data.length ? Number(data.length) : safeExtract(data, 'length', null),
                        height: data.height ? Number(data.height) : safeExtract(data, 'height', null),
                        measure_unit_id: data.measure_unit_id ? Number(data.measure_unit_id) : safeExtract(data, 'measure_unit_id', null),

                        province_id: address.province_id ? String(address.province_id) : safeExtract(data, 'province_id', null),
                        district_id: address.district_id ? String(address.district_id) : safeExtract(data, 'district_id', null),
                        municipality_id: address.municipality_id ? String(address.municipality_id) : safeExtract(data, 'municipality_id', null),
                        ward_id: address.ward_id ? String(address.ward_id) : safeExtract(data, 'ward_id', null),
                        area: address.area || safeExtract(data, 'area', ''),
                        postal_code: address.postal_code || safeExtract(data, 'postal_code', ''),
                        full_address: address.full_address || safeExtract(data, 'full_address', ''),
                        latitude: address.latitude || safeExtract(data, 'latitude', ''),
                        longitude: address.longitude || safeExtract(data, 'longitude', ''),

                        is_road_accessible: data.is_road_accessible || safeExtract(data, 'is_road_accessible', false),
                        road_type_id: data.road_type_id ? Number(data.road_type_id) : safeExtract(data, 'road_type_id', null),
                        road_condition_id: data.road_condition_id ? Number(data.road_condition_id) : safeExtract(data, 'road_condition_id', null),
                        road_width: data.road_width ? Number(data.road_width) : safeExtract(data, 'road_width', null),

                        base_price: data.base_price ? Number(data.base_price) : safeExtract(data, 'base_price', null),
                        advertise_price: data.advertise_price ? Number(data.advertise_price) : safeExtract(data, 'advertise_price', null),
                        currency: data.currency || safeExtract(data, 'currency', 'NPR'),
                        is_negotiable: data.is_negotiable ?? safeExtract(data, 'is_negotiable', true),

                        water_source_id: data.water_source_id ? Number(data.water_source_id) : safeExtract(data, 'water_source_id', null),
                        sewage_type_id: data.sewage_type_id ? Number(data.sewage_type_id) : safeExtract(data, 'sewage_type_id', null),
                        has_electricity: data.has_electricity || safeExtract(data, 'has_electricity', false),
                        banking_available: data.banking_available || safeExtract(data, 'banking_available', false),

                        // House details
                        furnishing_id: data.furnishing_id ? Number(data.furnishing_id) : safeExtract(data, 'furnishing_id', null),
                        house_type_id: data.house_type_id ? Number(data.house_type_id) : safeExtract(data, 'house_type_id', null),
                        built_area: data.built_area ? Number(data.built_area) : safeExtract(data, 'built_area', null),
                        built_area_unit_id: data.built_area_unit_id ? Number(data.built_area_unit_id) : safeExtract(data, 'built_area_unit_id', null),
                        total_floors: data.total_floors ? Number(data.total_floors) : safeExtract(data, 'total_floors', null),
                        floor_details: parsedFloorDetails,
                        year_built: data.year_built ? Number(data.year_built) : safeExtract(data, 'year_built', null),
                        year_renovated: data.year_renovated ? Number(data.year_renovated) : safeExtract(data, 'year_renovated', null),
                        construction_status: data.construction_status || safeExtract(data, 'construction_status', null),
                        construction_status_details: data.construction_status_details || safeExtract(data, 'construction_status_details', null),
                        roof_type_id: data.roof_type_id ? Number(data.roof_type_id) : safeExtract(data, 'roof_type_id', null),
                        reserved_tank: data.reserved_tank || safeExtract(data, 'reserved_tank', false),
                        tank_area: data.tank_area ? Number(data.tank_area) : safeExtract(data, 'tank_area', null),
                        parking_cars: data.parking_cars ? Number(data.parking_cars) : safeExtract(data, 'parking_cars', null),
                        parking_bikes: data.parking_bikes ? Number(data.parking_bikes) : safeExtract(data, 'parking_bikes', null),
                        parking_type_id: data.parking_type_id || safeExtract(data, 'parking_type_id', null),
                        parking_area: data.parking_area ? Number(data.parking_area) : safeExtract(data, 'parking_area', null),
                        parking_area_unit_id: data.parking_area_unit_id ? Number(data.parking_area_unit_id) : safeExtract(data, 'parking_area_unit_id', null),

                        // AMENITIES - this is critical
                        amenities: parsedAmenities,

                        building_face_id: data.building_face_id ? Number(data.building_face_id) : safeExtract(data, 'building_face_id', null),

                        features: data.features?.map((f: any) => f.id || f) || [],
                        nearby_places: data.nearby_places || [],
                        images: data.images?.map((img: any) => img.image_url || img.url || img) || [],
                        image_types: data.images?.map((img: any) => img.type || 'gallery') || [],
                        featured_image_index: data.featured_image_index || 0,

                        video_url: data.video_url || safeExtract(data, 'video_url', ''),
                        seo_title: data.seo_title || safeExtract(data, 'seo_title', ''),
                        seo_description: data.seo_description || safeExtract(data, 'seo_description', ''),
                    };

                    console.log('Setting form data:', newFormData);
                    setFormData(newFormData);

                } catch (error) {
                    console.error('Fetch property error:', error);
                    toast.error("Failed to fetch property");
                } finally {
                    setIsLoading(false);
                }
            } else if (isOpenModel && !id) {
                console.log('Opening create mode, resetting form');
                setFormData(initialFormData);
                setIsLoading(false);
            }
        };

        loadPropertyData();
    }, [isOpenModel, id, isUpdateMode, isViewMode, getProperty, type]);

    useEffect(() => {
        setIsOpenModel(onOpen);
    }, [onOpen]);

    const handleSelectChange = (e: { target: { name: string; value: string | null } }) => {
        const { name, value } = e.target;

        let processedValue: string | number | null = value;

        if (value === '' || value === null) {
            processedValue = null;
        } else {
            const idFields = [
                'property_type_id', 'listing_type_id', 'property_status_id',
                'property_face_id', 'property_category_id', 'land_unit_id',
                'measure_unit_id', 'road_type_id', 'road_condition_id',
                'water_source_id', 'sewage_type_id', 'furnishing_id',
                'house_type_id', 'built_area_unit_id', 'roof_type_id',
                'building_face_id', 'parking_area_unit_id'
            ];

            if (idFields.includes(name)) {
                processedValue = parseInt(value, 10);
                if (isNaN(processedValue)) {
                    processedValue = null;
                }
            }
        }

        if (name === 'province_id') {
            const newValue = processedValue?.toString() || null;
            if (formData.province_id !== newValue) {
                setFormData(prev => ({
                    ...prev,
                    province_id: newValue,
                    district_id: null,
                    municipality_id: null,
                    ward_id: null
                }));
            }
        } else if (name === 'district_id') {
            const newValue = processedValue?.toString() || null;
            if (formData.district_id !== newValue) {
                setFormData(prev => ({
                    ...prev,
                    district_id: newValue,
                    municipality_id: null,
                    ward_id: null
                }));
            }
        } else if (name === 'municipality_id') {
            const newValue = processedValue?.toString() || null;
            if (formData.municipality_id !== newValue) {
                setFormData(prev => ({
                    ...prev,
                    municipality_id: newValue,
                    ward_id: null
                }));
            }
        } else {
            if (formData[name as keyof PropertyFormData] !== processedValue) {
                setFormData(prev => ({ ...prev, [name]: processedValue }));
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    useEffect(() => {
        if (prevProvinceIdRef.current === formData.province_id) return;

        if (!formData.province_id) {
            setFilteredDistricts([]);
            setFilteredMunicipalities([]);
            setFilteredWards([]);
            prevProvinceIdRef.current = formData.province_id;
            return;
        }

        const filtered = districts.filter(
            d => String((d as any).data_province_id) === String(formData.province_id)
        );
        setFilteredDistricts(filtered);
        prevProvinceIdRef.current = formData.province_id;
    }, [formData.province_id, districts]);

    useEffect(() => {
        if (prevDistrictIdRef.current === formData.district_id) return;

        if (!formData.district_id) {
            setFilteredMunicipalities([]);
            setFilteredWards([]);
            prevDistrictIdRef.current = formData.district_id;
            return;
        }

        const filtered = municipalities.filter(
            m => String((m as Record<string, any>).data_district_id) === String(formData.district_id)
        );
        setFilteredMunicipalities(filtered);
        prevDistrictIdRef.current = formData.district_id;
    }, [formData.district_id, municipalities]);

    useEffect(() => {
        if (prevMunicipalityIdRef.current === formData.municipality_id) return;

        if (!formData.municipality_id) {
            setFilteredWards([]);
            prevMunicipalityIdRef.current = formData.municipality_id;
            return;
        }

        const filtered = wards.filter(
            w => String((w as Record<string, any>).data_municipality_id) === String(formData.municipality_id)
        );
        setFilteredWards(filtered);
        prevMunicipalityIdRef.current = formData.municipality_id;
    }, [formData.municipality_id, wards]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, type, value } = e.target;
        let finalValue: any = value;

        if (type === 'number') {
            finalValue = value === '' ? null : Number(value);
        } else if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        }

        if (formData[name as keyof PropertyFormData] !== finalValue) {
            setFormData(prev => ({ ...prev, [name]: finalValue }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (formData.description !== value) {
            setFormData(prev => ({ ...prev, description: value }));
        }

        if (errors.description) {
            setErrors(prev => ({ ...prev, description: '' }));
        }
    };

    const handleTagsChange = (newTags: string[]) => {
        if (isViewMode) return;
        const tagsString = newTags.join(',');
        if (formData.tags !== tagsString) {
            setFormData(prev => ({
                ...prev,
                tags: tagsString
            }));
        }
    };

    // CRITICAL: Handle amenities change properly
    const handleAmenitiesChange = (selectedIds: string) => {
        if (isViewMode) return;

        // Split the comma-separated string into array
        const amenityIds = selectedIds.split(',').filter(id => id !== '');

        console.log('Amenities changed:', {
            raw: selectedIds,
            parsed: amenityIds,
            current: formData.amenities
        });

        // Only update if changed
        if (JSON.stringify(formData.amenities) !== JSON.stringify(amenityIds)) {
            setFormData(prev => ({
                ...prev,
                amenities: amenityIds
            }));
        }
    };

    const handleImageChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewMode) return;

        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
                image_types: [...prev.image_types, ...Array(files.length).fill('gallery')]
            }));
        }
    };

    const handleImageTypeChange = (index: number, type: string) => {
        if (isViewMode) return;
        setFormData(prev => {
            const newTypes = [...prev.image_types];
            if (newTypes[index] !== type) {
                newTypes[index] = type;
                return { ...prev, image_types: newTypes };
            }
            return prev;
        });
    };

    const handleSetFeatured = (index: number) => {
        if (isViewMode) return;
        if (formData.featured_image_index !== index) {
            setFormData(prev => ({ ...prev, featured_image_index: index }));
        }
    };

    const handleRemoveImage = (index: number) => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            image_types: prev.image_types.filter((_, i) => i !== index)
        }));
    };

    const handleFloorDetailChange = (
        floorIndex: number,
        field: string,
        value: any
    ) => {
        if (isViewMode) return;
        setFormData(prev => {
            const newFloorDetails = [...prev.floor_details];
            if (!newFloorDetails[floorIndex]) {
                newFloorDetails[floorIndex] = {
                    floor: floorIndex + 1,
                    rooms: [createDefaultRoom()],
                    area: 0,
                    description: null
                } as FloorDetail;
            }

            const floorDetail = newFloorDetails[floorIndex];
            const currentValue = (floorDetail as any)[field];
            if (currentValue !== value) {
                (newFloorDetails[floorIndex] as any)[field] = value;
                return { ...prev, floor_details: newFloorDetails };
            }
            return prev;
        });
    };

    const handleRoomChange = (
        floorIndex: number,
        roomIndex: number,
        field: string,
        value: any
    ) => {
        if (isViewMode) return;
        setFormData(prev => {
            const newFloorDetails = [...prev.floor_details];
            if (!newFloorDetails[floorIndex]) {
                newFloorDetails[floorIndex] = {
                    floor: floorIndex + 1,
                    rooms: [createDefaultRoom()],
                    area: 0,
                    description: null
                } as FloorDetail;
            }

            const floorDetail = newFloorDetails[floorIndex];
            const newRooms = [...floorDetail.rooms];
            if (!newRooms[roomIndex]) {
                newRooms[roomIndex] = createDefaultRoom();
            }

            newRooms[roomIndex] = {
                ...newRooms[roomIndex],
                [field]: value
            };

            newFloorDetails[floorIndex] = {
                ...floorDetail,
                rooms: newRooms
            };

            return { ...prev, floor_details: newFloorDetails };
        });
    };

    const handleAddFloor = () => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            floor_details: [
                ...prev.floor_details,
                {
                    floor: prev.floor_details.length + 1,
                    rooms: [createDefaultRoom()],
                    area: 0,
                    description: null
                }
            ]
        }));
    };

    const handleRemoveFloor = (index: number) => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            floor_details: prev.floor_details.filter((_, i) => i !== index)
        }));
    };

    const handleAddNearbyPlace = () => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            nearby_places: [
                ...prev.nearby_places,
                { name: '', type: '', distance: 0, distance_unit: 'km', description: '' }
            ]
        }));
    };

    type NearbyPlaceField = 'name' | 'type' | 'distance' | 'distance_unit' | 'description';

    const handleNearbyPlaceChange = (
        index: number,
        field: NearbyPlaceField,
        value: string | number
    ) => {
        if (isViewMode) return;
        setFormData(prev => {
            const newPlaces = [...prev.nearby_places];

            let processedValue: string | number = value;
            if (field === 'distance') {
                processedValue = typeof value === 'string' ? (value === '' ? 0 : parseFloat(value)) : value;
            }

            if (newPlaces[index][field] !== processedValue) {
                newPlaces[index] = {
                    ...newPlaces[index],
                    [field]: processedValue
                };
                return { ...prev, nearby_places: newPlaces };
            }
            return prev;
        });
    };

    const handleRemoveNearbyPlace = (index: number) => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            nearby_places: prev.nearby_places.filter((_, i) => i !== index)
        }));
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            const nextStep = currentStep + 1;
            if (!visitedSteps.includes(nextStep)) {
                setVisitedSteps(prev => [...prev, nextStep]);
            }
            setCurrentStep(nextStep);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleStepClick = (step: number) => {
        if (visitedSteps.includes(step)) {
            setCurrentStep(step);
        }
    };

    // CRITICAL: Handle form submission with proper amenities payload
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isViewMode) return;

        setIsLoading(true);

        try {
            const submitData = new FormData();

            // Basic Info
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);

            if (formData.tags) {
                submitData.append('tags', formData.tags);
            }

            // IDs
            if (formData.property_type_id) submitData.append('property_type_id', String(formData.property_type_id));
            if (formData.listing_type_id) submitData.append('listing_type_id', String(formData.listing_type_id));
            if (formData.property_status_id) submitData.append('property_status_id', String(formData.property_status_id));
            if (formData.property_face_id) submitData.append('property_face_id', String(formData.property_face_id));
            if (formData.property_category_id) submitData.append('property_category_id', String(formData.property_category_id));
            submitData.append('status', String(formData.status));

            // Land details
            if (formData.land_area) submitData.append('land_area', String(formData.land_area));
            if (formData.land_unit_id) submitData.append('land_unit_id', String(formData.land_unit_id));
            if (formData.length) submitData.append('length', String(formData.length));
            if (formData.height) submitData.append('height', String(formData.height));
            if (formData.measure_unit_id) submitData.append('measure_unit_id', String(formData.measure_unit_id));

            // Location
            if (formData.province_id) submitData.append('province_id', String(formData.province_id));
            if (formData.district_id) submitData.append('district_id', String(formData.district_id));
            if (formData.municipality_id) submitData.append('municipality_id', String(formData.municipality_id));
            if (formData.ward_id) submitData.append('ward_id', String(formData.ward_id));
            submitData.append('area', formData.area);
            submitData.append('postal_code', formData.postal_code);
            submitData.append('full_address', formData.full_address);
            submitData.append('latitude', formData.latitude);
            submitData.append('longitude', formData.longitude);

            // Road details
            submitData.append('is_road_accessible', formData.is_road_accessible ? '1' : '0');
            if (formData.road_type_id) submitData.append('road_type_id', String(formData.road_type_id));
            if (formData.road_condition_id) submitData.append('road_condition_id', String(formData.road_condition_id));
            if (formData.road_width) submitData.append('road_width', String(formData.road_width));

            // Price
            if (formData.base_price) submitData.append('base_price', String(formData.base_price));
            if (formData.advertise_price) submitData.append('advertise_price', String(formData.advertise_price));
            submitData.append('currency', formData.currency);
            submitData.append('is_negotiable', formData.is_negotiable ? '1' : '0');

            // Utilities
            if (formData.water_source_id) submitData.append('water_source_id', String(formData.water_source_id));
            if (formData.sewage_type_id) submitData.append('sewage_type_id', String(formData.sewage_type_id));
            submitData.append('has_electricity', formData.has_electricity ? '1' : '0');
            submitData.append('banking_available', formData.banking_available ? '1' : '0');

            // House details
            if (isHouseType) {
                if (formData.furnishing_id) submitData.append('furnishing_id', String(formData.furnishing_id));
                if (formData.house_type_id) submitData.append('house_type_id', String(formData.house_type_id));
                if (formData.built_area) submitData.append('built_area', String(formData.built_area));
                if (formData.built_area_unit_id) submitData.append('built_area_unit_id', String(formData.built_area_unit_id));
                if (formData.total_floors) submitData.append('total_floors', String(formData.total_floors));

                if (formData.floor_details.length > 0) {
                    submitData.append('floor_details', JSON.stringify(formData.floor_details));
                }

                if (formData.year_built) submitData.append('year_built', String(formData.year_built));
                if (formData.year_renovated) submitData.append('year_renovated', String(formData.year_renovated));
                if (formData.construction_status) submitData.append('construction_status', formData.construction_status);

                if (formData.construction_status_details) {
                    submitData.append('construction_status_details', JSON.stringify(formData.construction_status_details));
                }

                if (formData.roof_type_id) submitData.append('roof_type_id', String(formData.roof_type_id));
                submitData.append('reserved_tank', formData.reserved_tank ? '1' : '0');
                if (formData.tank_area) submitData.append('tank_area', String(formData.tank_area));
                if (formData.parking_cars) submitData.append('parking_cars', String(formData.parking_cars));
                if (formData.parking_bikes) submitData.append('parking_bikes', String(formData.parking_bikes));
                if (formData.parking_type_id) submitData.append('parking_type_id', formData.parking_type_id);
                if (formData.parking_area) submitData.append('parking_area', String(formData.parking_area));
                if (formData.parking_area_unit_id) submitData.append('parking_area_unit_id', String(formData.parking_area_unit_id));

                // CRITICAL: Handle amenities for house type
                if (formData.amenities && formData.amenities.length > 0) {
                    // Send as JSON string
                    const amenitiesJson = JSON.stringify(formData.amenities);
                    submitData.append('amenities', amenitiesJson);
                    console.log('Appending amenities (house):', amenitiesJson);
                } else {
                    // Send empty array if no amenities
                    submitData.append('amenities', JSON.stringify([]));
                }

                if (formData.building_face_id) submitData.append('building_face_id', String(formData.building_face_id));
            }

            // CRITICAL: Handle amenities for non-house type (if amenities exist at root level)
            if (!isHouseType && formData.amenities && formData.amenities.length > 0) {
                const amenitiesJson = JSON.stringify(formData.amenities);
                submitData.append('amenities', amenitiesJson);
                console.log('Appending amenities (non-house):', amenitiesJson);
            }

            // Features
            if (formData.features.length > 0) {
                submitData.append('features', formData.features.join(','));
            }

            // Nearby places
            if (formData.nearby_places.length > 0) {
                formData.nearby_places.forEach((place, index) => {
                    submitData.append(`nearby_places[${index}][name]`, place.name);
                    submitData.append(`nearby_places[${index}][type]`, place.type);
                    submitData.append(`nearby_places[${index}][distance]`, String(place.distance));
                    submitData.append(`nearby_places[${index}][distance_unit]`, place.distance_unit);
                    if (place.description) {
                        submitData.append(`nearby_places[${index}][description]`, place.description);
                    }
                });
            }

            // Images
            formData.images.forEach((image, index) => {
                if (image instanceof File) {
                    submitData.append(`images[${index}]`, image);
                    submitData.append(`image_types[${index}]`, formData.image_types[index] || 'gallery');
                }
            });
            submitData.append('featured_image_index', String(formData.featured_image_index));

            // Video & SEO
            submitData.append('video_url', formData.video_url);
            submitData.append('seo_title', formData.seo_title);
            submitData.append('seo_description', formData.seo_description);

            // Log the final FormData for debugging
            console.log('Submitting FormData:');
            for (let pair of (submitData as any).entries()) {
                if (pair[0].includes('amenities')) {
                    console.log(pair[0], pair[1]);
                }
            }

            if (isUpdateMode && id) {
                await updateProperty(Number(id), submitData);
                console.log('data', submitData);
                toast.success('Property updated successfully!');
            } else {
                await createProperty(submitData);
                toast.success('Property created successfully!');
            }

            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Submit error:', error);

            if (error && typeof error === 'object') {
                const validationErrors: Record<string, string> = {};
                Object.entries(error).forEach(([key, value]) => {
                    validationErrors[key] = Array.isArray(value) ? value[0] : String(value);
                });
                setErrors(validationErrors);
                toast.error('Please check the form for errors');
            } else {
                toast.error(error?.message || 'Failed to save property');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpenModel(false);
        setFormData(initialFormData);
        setErrors({});
        setCurrentStep(1);
        setVisitedSteps([1]);
        setFilteredDistricts([]);
        setFilteredMunicipalities([]);
        setFilteredWards([]);
        prevPropertyTypeRef.current = null;
        prevProvinceIdRef.current = null;
        prevDistrictIdRef.current = null;
        prevMunicipalityIdRef.current = null;
        setIsHouseType(false);
        onClose();
    };

    const baseStepTitles = ['Basic Info', 'Location', 'Price & Utilities'];
    const houseStepTitles = ['House Details'];
    const remainingStepTitles = ['Features & Places', 'Details', 'Media & SEO'];

    const stepTitles = isHouseType
        ? [...baseStepTitles, ...houseStepTitles, ...remainingStepTitles]
        : [...baseStepTitles, ...remainingStepTitles];

    const totalSteps = stepTitles.length;

    const renderSelectedItems = (selectedIds: string[], allItems: any[]) => {
        const selectedLabels = allItems
            .filter(item => selectedIds.includes(item.id.toString()))
            .map(item => item.label || item.name)
            .filter(Boolean);

        if (selectedLabels.length === 0) {
            return <p className="text-gray-500 italic">None selected</p>;
        }

        return (
            <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {label}
                    </span>
                ))}
            </div>
        );
    };

    const renderTags = (tagsString: string) => {
        if (!tagsString) {
            return <p className="text-gray-500 italic">No tags added</p>;
        }

        const tags = tagsString.split(',').filter(tag => tag.trim() !== '');

        return (
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {tag.trim()}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <PopupModal
            isOpen={isOpenModel}
            onClose={handleClose}
            title={isViewMode ? "View Property" : (isUpdateMode ? "Update Property" : "Add Property")}
            size="exlg"
        >
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col justify-between min-h-[75vh] max-h-[75vh]">
                    <div className="property-form overflow-y-auto px-2">
                        {/* Step Indicator */}
                        <div className="flex mb-6 border-b sticky top-0 bg-white z-10">
                            {stepTitles.map((title, index) => {
                                const stepNum = index + 1;
                                const isVisited = visitedSteps.includes(stepNum);
                                const isCurrent = currentStep === stepNum;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => isVisited && handleStepClick(stepNum)}
                                        className={`flex-1 py-2 px-1 text-center transition-colors ${isCurrent
                                            ? 'bg-opsh-primary text-white'
                                            : isVisited
                                                ? 'text-opsh-primary hover:bg-opsh-primary/10'
                                                : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                        disabled={!isVisited}
                                    >
                                        {stepNum}. {title}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputField
                                        className='md:col-span-3'
                                        label="Property Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        error={errors.title}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Property Type"
                                        name="property_type_id"
                                        value={formData.property_type_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(propertyTypes)}
                                        required
                                        error={errors.property_type_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Property Category"
                                        name="property_category_id"
                                        value={formData.property_category_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(propertyCategory)}
                                        required
                                        error={errors.property_category_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Listing Type"
                                        name="listing_type_id"
                                        value={formData.listing_type_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(listingTypes)}
                                        required
                                        error={errors.listing_type_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Property Status"
                                        name="property_status_id"
                                        value={formData.property_status_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(propertyStatuses)}
                                        required
                                        error={errors.property_status_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Property Face"
                                        name="property_face_id"
                                        value={formData.property_face_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(propertyFaces)}
                                        disabled={isViewMode}
                                    />
                                </div>

                                {/* Land Details Section */}
                                <div className="border-t pt-2">
                                    <h3 className="font-medium mb-3">Land Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <InputField
                                            label="Land Area"
                                            name="land_area"
                                            type="text"
                                            value={formData.land_area?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        <SelectField
                                            label="Land Area Unit"
                                            name="land_unit_id"
                                            value={formData.land_unit_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(landUnits)}
                                            disabled={isViewMode}
                                        />

                                        <InputField
                                            label="Land Length"
                                            name="length"
                                            type="number"
                                            value={formData.length?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        <InputField
                                            label="Land Height"
                                            name="height"
                                            type="number"
                                            value={formData.height?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                        <SelectField
                                            label="Measurement Unit"
                                            name="measure_unit_id"
                                            value={formData.measure_unit_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(measureUnits)}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-2">
                                    <h3 className="font-medium mb-3">Road Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <CheckboxField
                                            label="Road Accessible"
                                            name="is_road_accessible"
                                            checked={formData.is_road_accessible}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        {formData.is_road_accessible && (
                                            <>
                                                <SelectField
                                                    label="Road Type"
                                                    name="road_type_id"
                                                    value={formData.road_type_id?.toString() || ''}
                                                    onChange={handleSelectChange}
                                                    options={mapOptions(roadTypes)}
                                                    disabled={isViewMode}
                                                />

                                                <SelectField
                                                    label="Road Condition"
                                                    name="road_condition_id"
                                                    value={formData.road_condition_id?.toString() || ''}
                                                    onChange={handleSelectChange}
                                                    options={mapOptions(roadConditions)}
                                                    disabled={isViewMode}
                                                />

                                                <InputField
                                                    label="Road Width"
                                                    name="road_width"
                                                    type="number"
                                                    value={formData.road_width?.toString() || ''}
                                                    onChange={handleChange}
                                                    disabled={isViewMode}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <SelectField
                                        label="Province"
                                        name="province_id"
                                        value={formData.province_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(provinces)}
                                        required
                                        error={errors.province_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="District"
                                        name="district_id"
                                        value={formData.district_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={filteredDistricts.map(d => ({
                                            value: d.id.toString(),
                                            label: d.name || d.label || ''
                                        }))}
                                        required
                                        error={errors.district_id}
                                        disabled={isViewMode || !formData.province_id}
                                    />

                                    <SelectField
                                        label="Municipality"
                                        name="municipality_id"
                                        value={formData.municipality_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={filteredMunicipalities.map(m => ({
                                            value: m.id.toString(),
                                            label: m.name || m.label || ''
                                        }))}
                                        required
                                        error={errors.municipality_id}
                                        disabled={isViewMode || !formData.district_id}
                                    />

                                    <SelectField
                                        label="Ward"
                                        name="ward_id"
                                        value={formData.ward_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={filteredWards.map(w => ({
                                            value: w.id.toString(),
                                            label: w.name || w.label || ''
                                        }))}
                                        required
                                        error={errors.ward_id}
                                        disabled={isViewMode || !formData.municipality_id}
                                    />

                                    <InputField
                                        label="Area/Locality"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Postal Code"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Full Address"
                                        name="full_address"
                                        value={formData.full_address}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Latitude"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Longitude"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Price & Utilities */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="font-medium mb-1">Price</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputField
                                        label="Base Price"
                                        name="base_price"
                                        type="number"
                                        value={formData.base_price?.toString() || ''}
                                        onChange={handleChange}
                                        required
                                        error={errors.base_price}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Advertise Price"
                                        name="advertise_price"
                                        type="number"
                                        value={formData.advertise_price?.toString() || ''}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                    <SelectField
                                        label="Currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleSelectChange}
                                        options={currencies.map(c => ({ value: c.name, label: c.name }))}
                                        disabled={isViewMode}
                                    />

                                    <div className="flex items-center gap-4">
                                        <CheckboxField
                                            label="Negotiable"
                                            name="is_negotiable"
                                            checked={formData.is_negotiable}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                        <CheckboxField
                                            label="Banking Available"
                                            name="banking_available"
                                            checked={formData.banking_available}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-3">Utilities</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <SelectField
                                            label="Water Source"
                                            name="water_source_id"
                                            value={formData.water_source_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(waterSources)}
                                            disabled={isViewMode}
                                        />

                                        <SelectField
                                            label="Sewage Type"
                                            name="sewage_type_id"
                                            value={formData.sewage_type_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(sewageTypes)}
                                            disabled={isViewMode}
                                        />

                                        <CheckboxField
                                            label="Has Electricity"
                                            name="has_electricity"
                                            checked={formData.has_electricity}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: House Details (only if house type) */}
                        {currentStep === 4 && isHouseType && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <SelectField
                                        label="House Type"
                                        name="house_type_id"
                                        value={formData.house_type_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(houseTypes)}
                                        required
                                        error={errors.house_type_id}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Furnishing"
                                        name="furnishing_id"
                                        value={formData.furnishing_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(furnishingTypes)}
                                        required
                                        error={errors.furnishing_id}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Built Area"
                                        name="built_area"
                                        type="number"
                                        value={formData.built_area?.toString() || ''}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Area Unit"
                                        name="built_area_unit_id"
                                        value={formData.built_area_unit_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(landUnits)}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Total Floors"
                                        name="total_floors"
                                        type="number"
                                        value={formData.total_floors?.toString() || ''}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Year Built"
                                        name="year_built"
                                        type="number"
                                        value={formData.year_built?.toString() || ''}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <InputField
                                        label="Year Renovated"
                                        name="year_renovated"
                                        type="number"
                                        value={formData.year_renovated?.toString() || ''}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Construction Status"
                                        name="construction_status"
                                        value={formData.construction_status?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(constructionStatus)}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Roof Type"
                                        name="roof_type_id"
                                        value={formData.roof_type_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(roofTypes)}
                                        disabled={isViewMode}
                                    />

                                    <SelectField
                                        label="Building Face"
                                        name="building_face_id"
                                        value={formData.building_face_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        options={mapOptions(buildingFaces)}
                                        disabled={isViewMode}
                                    />

                                    <div className="flex items-center">
                                        <CheckboxField
                                            label="Reserved Tank"
                                            name="reserved_tank"
                                            checked={formData.reserved_tank}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    {formData.reserved_tank && (
                                        <InputField
                                            label="Tank Area"
                                            name="tank_area"
                                            type="text"
                                            value={formData.tank_area?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                    )}
                                </div>

                                {/* Parking Details */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Parking Details</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <InputField
                                            label="Car Parking"
                                            name="parking_cars"
                                            type="number"
                                            value={formData.parking_cars?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        <InputField
                                            label="Bike Parking"
                                            name="parking_bikes"
                                            type="number"
                                            value={formData.parking_bikes?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        <SelectField
                                            label="Parking Type"
                                            name="parking_type_id"
                                            value={formData.parking_type_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(parkingType)}
                                            disabled={isViewMode}
                                        />

                                        <InputField
                                            label="Parking Area"
                                            name="parking_area"
                                            type="number"
                                            value={formData.parking_area?.toString() || ''}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />

                                        <SelectField
                                            label="Area Unit"
                                            name="parking_area_unit_id"
                                            value={formData.parking_area_unit_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            options={mapOptions(landUnits)}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                {/* Floor Details */}
                                <div className="border rounded p-4">
                                    <h4 className="font-medium mb-3">Floor Details</h4>

                                    {formData.floor_details.length === 0 ? (
                                        <p className="text-gray-500 italic">No floor details added</p>
                                    ) : (
                                        formData.floor_details.map((floor, floorIndex) => (
                                            <div key={floorIndex} className="border-b pb-4 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="font-medium">Floor {floor.floor}</h5>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFloor(floorIndex)}
                                                            className="text-red-600 text-sm hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <InputField
                                                        label="Floor Area"
                                                        name={`floor_${floorIndex}_area`}
                                                        type="number"
                                                        value={floor.area?.toString() || ''}
                                                        onChange={(e) => handleFloorDetailChange(floorIndex, 'area', parseFloat(e.target.value))}
                                                        disabled={isViewMode}
                                                    />
                                                </div>

                                                {/* Rooms for this floor */}
                                                <div className="ml-4">
                                                    <h6 className="font-medium text-sm mb-2">Rooms</h6>
                                                    {floor.rooms && floor.rooms.length > 0 ? (
                                                        floor.rooms.map((room, roomIndex) => (
                                                            <div key={roomIndex} className="border-l-2 border-gray-200 pl-4 mb-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                                                    <InputField
                                                                        label="Room Name"
                                                                        name={`room_${floorIndex}_${roomIndex}_name`}
                                                                        value={room.name}
                                                                        onChange={(e) => handleRoomChange(floorIndex, roomIndex, 'name', e.target.value)}
                                                                        disabled={isViewMode}
                                                                        required
                                                                    />
                                                                    <InputField
                                                                        label="Count"
                                                                        name={`room_${floorIndex}_${roomIndex}_count`}
                                                                        type="number"
                                                                        value={room.count.toString()}
                                                                        onChange={(e) => handleRoomChange(floorIndex, roomIndex, 'count', parseInt(e.target.value))}
                                                                        disabled={isViewMode}
                                                                    />
                                                                    <InputField
                                                                        label="Size"
                                                                        name={`room_${floorIndex}_${roomIndex}_size`}
                                                                        type="number"
                                                                        value={room.size?.toString() || ''}
                                                                        onChange={(e) => handleRoomChange(floorIndex, roomIndex, 'size', e.target.value ? parseFloat(e.target.value) : null)}
                                                                        disabled={isViewMode}
                                                                    />
                                                                    <InputField
                                                                        label="Size Unit"
                                                                        name={`room_${floorIndex}_${roomIndex}_size_unit`}
                                                                        value={room.size_unit}
                                                                        onChange={(e) => handleRoomChange(floorIndex, roomIndex, 'size_unit', e.target.value)}
                                                                        disabled={isViewMode}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 italic text-sm">No rooms added</p>
                                                    )}
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newRooms = [...(floor.rooms || [])];
                                                                newRooms.push(createDefaultRoom());
                                                                handleFloorDetailChange(floorIndex, 'rooms', newRooms);
                                                            }}
                                                            className="text-blue-600 text-sm hover:text-blue-800 mt-2"
                                                        >
                                                            + Add Room
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={handleAddFloor}
                                            className="text-blue-600 text-sm hover:text-blue-800"
                                        >
                                            + Add Floor
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step for non-house type when house step is skipped */}
                        {currentStep === 4 && !isHouseType && (
                            <div className="space-y-4">
                                {/* Amenities */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Amenities</h4>
                                    {isViewMode ? (
                                        renderSelectedItems(formData.amenities, allFeatures)
                                    ) : (
                                        <MultipleSelectWithReorder
                                            data={allFeatures.map(f => ({ value: f.id.toString(), label: f.label || f.name || '' }))}
                                            onChange={handleAmenitiesChange}
                                            selected={formData.amenities.join(',')}
                                        />
                                    )}
                                </div>

                                {/* Nearby Places */}
                                <div className="border rounded p-4">
                                    <h4 className="font-medium mb-3">Nearby Places</h4>

                                    {formData.nearby_places.length === 0 ? (
                                        <p className="text-gray-500 italic">No nearby places added</p>
                                    ) : (
                                        formData.nearby_places.map((place, index) => (
                                            <div key={index} className="border-b pb-4 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="font-medium">Place {index + 1}</h5>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNearbyPlace(index)}
                                                            className="text-red-600 text-sm hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <InputField
                                                        label="Name"
                                                        name={`nearby_places_${index}_name`}
                                                        value={place.name}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'name', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <InputField
                                                        label="Type"
                                                        name={`nearby_places_${index}_type`}
                                                        value={place.type}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'type', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <InputField
                                                        label="Distance"
                                                        name={`nearby_places_${index}_distance`}
                                                        type="number"
                                                        value={place.distance.toString()}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'distance', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <SelectField
                                                        label="Unit"
                                                        name={`nearby_places_${index}_distance_unit`}
                                                        value={place.distance_unit}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'distance_unit', e.target.value ?? 'km')}
                                                        options={[
                                                            { value: 'km', label: 'KM' },
                                                            { value: 'm', label: 'Meters' }
                                                        ]}
                                                        disabled={isViewMode}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={handleAddNearbyPlace}
                                            className="text-blue-600 text-sm hover:text-blue-800"
                                        >
                                            + Add Nearby Place
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 5 (or 4 if not house): Features & Nearby Places */}
                        {currentStep === 5 && isHouseType && (
                            <div className="space-y-4">
                                {/* Amenities */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Amenities</h4>
                                    {isViewMode ? (
                                        renderSelectedItems(formData.amenities, allFeatures)
                                    ) : (
                                        <MultipleSelectWithReorder
                                            data={allFeatures.map(f => ({ value: f.id.toString(), label: f.label || f.name || '' }))}
                                            onChange={handleAmenitiesChange}
                                            selected={formData.amenities.join(',')}
                                        />
                                    )}
                                </div>

                                {/* Nearby Places */}
                                <div className="border rounded p-4">
                                    <h4 className="font-medium mb-3">Nearby Places</h4>

                                    {formData.nearby_places.length === 0 ? (
                                        <p className="text-gray-500 italic">No nearby places added</p>
                                    ) : (
                                        formData.nearby_places.map((place, index) => (
                                            <div key={index} className="border-b pb-4 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="font-medium">Place {index + 1}</h5>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNearbyPlace(index)}
                                                            className="text-red-600 text-sm hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <InputField
                                                        label="Name"
                                                        name={`nearby_places_${index}_name`}
                                                        value={place.name}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'name', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <InputField
                                                        label="Type"
                                                        name={`nearby_places_${index}_type`}
                                                        value={place.type}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'type', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <InputField
                                                        label="Distance"
                                                        name={`nearby_places_${index}_distance`}
                                                        type="number"
                                                        value={place.distance.toString()}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'distance', e.target.value)}
                                                        disabled={isViewMode}
                                                    />

                                                    <SelectField
                                                        label="Unit"
                                                        name={`nearby_places_${index}_distance_unit`}
                                                        value={place.distance_unit}
                                                        onChange={(e) => handleNearbyPlaceChange(index, 'distance_unit', e.target.value ?? 'km')}
                                                        options={[
                                                            { value: 'km', label: 'KM' },
                                                            { value: 'm', label: 'Meters' }
                                                        ]}
                                                        disabled={isViewMode}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={handleAddNearbyPlace}
                                            className="text-blue-600 text-sm hover:text-blue-800"
                                        >
                                            + Add Nearby Place
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 6 (or 5 if not house): Details (Description & Tags) */}
                        {currentStep === (isHouseType ? 6 : 5) && (
                            <div className="space-y-4">
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-3">Description</h3>
                                    <CkEditorSmall
                                        label=""
                                        name="description"
                                        value={formData.description}
                                        onChange={(content: string) => {
                                            if (formData.description !== content) {
                                                setFormData(prev => ({ ...prev, description: content }));
                                            }
                                            if (errors.description) {
                                                setErrors(prev => ({ ...prev, description: '' }));
                                            }
                                        }}
                                        error={errors.description}
                                        required
                                        placeholder="Enter detailed property description..."
                                        wordCount
                                        maxLength={8000}
                                        height={500}
                                        scrollableHeight={500}
                                        disabled={isViewMode}
                                    />
                                </div>

                                {/* Tags */}
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-3">Tags</h3>
                                    {isViewMode ? (
                                        renderTags(formData.tags)
                                    ) : (
                                        <TagsInput
                                            tags={formData.tags ? formData.tags.split(',').filter(tag => tag.trim() !== '') : []}
                                            setTags={handleTagsChange}
                                        />
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add keywords separated by commas (e.g., &quot;furnished, pool, garden&quot;)
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 7 (or 6 if not house): Media & SEO */}
                        {currentStep === (isHouseType ? 7 : 6) && (
                            <div className="space-y-4">
                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Property Images</label>

                                    {!isViewMode && (
                                        <UploadImageField
                                            name="images"
                                            label="Property Images"
                                            onChange={handleImageChange('images')}
                                            value={formData.images}
                                            multiple={true}
                                        />
                                    )}

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            {formData.images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image instanceof File ? URL.createObjectURL(image) : image}
                                                        alt={`Property ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded"
                                                    />

                                                    {!isViewMode && (
                                                        <>
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(index)}
                                                                    className="text-white bg-red-600 p-1 rounded hover:bg-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>

                                                            <select
                                                                value={formData.image_types[index]}
                                                                onChange={(e) => handleImageTypeChange(index, e.target.value)}
                                                                className="absolute bottom-0 left-0 right-0 text-xs p-1 rounded"
                                                            >
                                                                <option value="gallery">Gallery</option>
                                                                <option value="featured">Featured</option>
                                                                <option value="floor_plan">Floor Plan</option>
                                                                <option value="document">Document</option>
                                                            </select>

                                                            {formData.featured_image_index === index && (
                                                                <span className="absolute top-0 left-0 bg-opsh-primary text-white text-xs px-1 rounded">
                                                                    Featured
                                                                </span>
                                                            )}

                                                            {formData.featured_image_index !== index && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetFeatured(index)}
                                                                    className="absolute top-0 right-0 bg-green-600 text-white text-xs p-1 rounded hover:bg-green-700"
                                                                >
                                                                    Set Featured
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    {isViewMode && formData.featured_image_index === index && (
                                                        <span className="absolute top-0 left-0 bg-opsh-primary text-white text-xs px-1 rounded">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* SEO */}
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-3">Video</h3>

                                    <div className="space-y-4">
                                        <InputField
                                            label="video_url"
                                            name="video_url"
                                            value={formData.video_url}
                                            onChange={handleChange}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    {/* <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                            <button type="button" onClick={handleBack} className="w-32 py-2 text-white bg-gray-600 cursor-pointer flex items-center justify-center rounded hover:bg-gray-700">
                                Back
                            </button>
                        )}
                        {currentStep <  ? (
                            <button type="button" onClick={handleNext} className="w-32 py-2 text-white bg-opsh-primary cursor-pointer flex items-center justify-center rounded hover:bg-blue-700 ml-auto">
                                Next
                            </button>
                        ) : (
                            (!isViewMode && (
                                <button
                                    type="submit"
                                    className="w-32 py-2 text-white bg-green-600 rounded hover:bg-green-700 ml-auto flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            Submitting
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </>
                                    ) : 'Submit'}
                                </button>
                            ))
                        )}
                    </div> */}
                    <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                            <a type="button" onClick={handleBack} className="w-32 py-2 text-white bg-opsh-muted cursor-pointer flex items-center justify-center rounded hover:bg-opsh-darkgrey">Back</a>
                        )}
                        {currentStep < totalSteps ? (
                            <a type="button" onClick={handleNext} className="w-32 py-2 text-white bg-opsh-primary cursor-pointer flex items-center justify-center rounded hover:bg-opsh-primary-hover ml-auto">Next</a>
                        ) : (
                            (!isViewMode && (
                                <button
                                    type="submit"
                                    className="w-32 py-2 text-white bg-opsh-success rounded hover:bg-opsh-success-hover ml-auto flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            Submiting
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </>
                                    ) : 'Submit'}
                                </button>
                            ))
                        )}
                    </div>
                </form>
            )}
        </PopupModal>
    );
};

export default AddPropertyComponent;
