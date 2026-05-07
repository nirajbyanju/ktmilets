'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePropertiesList } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard/PropertyCard";
import { FiX, FiChevronDown, FiChevronUp, FiFilter, FiSearch, FiMapPin, FiDollarSign, FiRefreshCw, FiHome } from 'react-icons/fi';
import { GiSettingsKnobs } from "react-icons/gi";
import { motion, AnimatePresence } from 'framer-motion';
import useOptionStore from '@/stores/common/OptionStore';
import { Properties } from "@/types/property/property";
import type { PublicPropertyListResponse } from "@/types/property/publicList";

interface Filters {
  title: string;
  property_code: string;
  property_face_id: number[];
  property_type_id: number[];
  property_category_id: number[];
  listing_type_id: number[];
  property_status_id: number[];
  is_featured: boolean;
  is_negotiable: boolean;
  banking_available: boolean;
  has_electricity: boolean;
  is_road_accessible: boolean;
  is_verified: boolean;
  min_price: string;
  max_price: string;
  min_land_area: string;
  max_land_area: string;
  min_road_width: string;
  max_road_width: string;
  bedrooms: string;
  bathrooms: string;
  kitchens: string;
  floors: string;
  parking: boolean;
  furnished: boolean;
  city: string;
  state: string;
  has_images: boolean;
}

type PropertyListPageClientProps = {
  initialData?: PublicPropertyListResponse | null;
  initialPage?: number;
};

export default function PropertyListPageClient({
  initialData,
  initialPage = 1,
}: PropertyListPageClientProps) {
  const optionStore = useOptionStore();
  const { getOptions } = optionStore;

  const propertyTypes = useMemo(() => getOptions('propertytype') || [], [getOptions]);
  const propertyCategories = useMemo(() => getOptions('propertyCategory') || [], [getOptions]);
  const listingTypes = useMemo(() => getOptions('listingtype') || [], [getOptions]);
  const propertyStatuses = useMemo(() => getOptions('propertystatus') || [], [getOptions]);
  const propertyFaces = useMemo(() => getOptions('propertyface') || [], [getOptions]);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState('latest');
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    title: '',
    property_code: '',
    property_face_id: [],
    property_type_id: [],
    property_category_id: [],
    listing_type_id: [],
    property_status_id: [],
    is_featured: false,
    is_negotiable: false,
    banking_available: false,
    has_electricity: false,
    is_road_accessible: false,
    is_verified: false,
    min_price: '',
    max_price: '',
    min_land_area: '',
    max_land_area: '',
    min_road_width: '',
    max_road_width: '',
    bedrooms: '',
    bathrooms: '',
    kitchens: '',
    floors: '',
    parking: false,
    furnished: false,
    city: '',
    state: '',
    has_images: true,
  });

  const [tempFilters, setTempFilters] = useState<Filters>(appliedFilters);

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    propertyType: true,
    listingType: true,
    propertyFace: false,
    propertyStatus: false,
    location: true,
    details: true,
    features: true,
    area: false,
    roadWidth: false,
  });

  const [expandedAdvancedSections, setExpandedAdvancedSections] = useState({
    classification: true,
    location: true,
    rooms: true,
    lotArea: true,
    roadWidth: true,
    amenity: true,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [isOptionsLoaded, setIsOptionsLoaded] = useState(false);

  useEffect(() => {
    if (listingTypes.length > 0 && propertyTypes.length > 0) {
      setIsOptionsLoaded(true);
    }
  }, [listingTypes, propertyTypes]);

  const normalizeLookup = useCallback((value: unknown) => {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
  }, []);

  const findOptionId = useCallback(
    (options: Array<{ id: number; label?: string; name?: string; slug?: string }>, value: string) => {
      const normalizedValue = normalizeLookup(value);

      return options.find((option) =>
        [option.slug, option.label, option.name]
          .map((entry) => normalizeLookup(entry))
          .includes(normalizedValue)
      )?.id;
    },
    [normalizeLookup]
  );

  // Fix: Only run this effect once on initial load to read URL params
  useEffect(() => {
    if (!isOptionsLoaded) return;

    // Only run this once on initial load
    if (initialLoadRef.current) {
      initialLoadRef.current = false;

      const params = new URLSearchParams(window.location.search);
      const urlFilters: Partial<Filters> = {};
      let hasUrlFilters = false;

      if (params.has('title') || params.has('keywords')) {
        urlFilters.title = params.get('title') || params.get('keywords') || '';
        hasUrlFilters = true;
      }

      if (params.has('listing_type_slug') || params.has('purpose')) {
        const listingTypeValue = params.get('listing_type_slug') || params.get('purpose') || '';
        const listingTypeId = findOptionId(listingTypes, listingTypeValue);
        if (listingTypeId) {
          urlFilters.listing_type_id = [listingTypeId];
          hasUrlFilters = true;
        }
      }

      if (params.has('property_type_slug') || params.has('propertyType')) {
        const propertyTypeValue = params.get('property_type_slug') || params.get('propertyType') || '';
        const propertyTypeId = findOptionId(propertyTypes, propertyTypeValue);
        if (propertyTypeId) {
          urlFilters.property_type_id = [propertyTypeId];
          hasUrlFilters = true;
        }
      }

      if (params.has('property_category_slug')) {
        const propertyCategoryId = findOptionId(propertyCategories, params.get('property_category_slug') || '');
        if (propertyCategoryId) {
          urlFilters.property_category_id = [propertyCategoryId];
          hasUrlFilters = true;
        }
      }

      if (params.has('city') || params.has('location')) {
        urlFilters.city = params.get('city') || params.get('location') || '';
        hasUrlFilters = true;
      }

      if (params.has('page')) {
        setCurrentPage(parseInt(params.get('page') || '1'));
      }

      if (hasUrlFilters) {
        const mergedFilters = { ...appliedFilters, ...urlFilters };
        setTempFilters(mergedFilters);
        setAppliedFilters(mergedFilters);
      }
    }
  }, [appliedFilters, findOptionId, isOptionsLoaded, listingTypes, propertyCategories, propertyTypes]);

  useEffect(() => {
    let count = 0;
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'boolean' && value === true && key !== 'has_images') count++;
      else if (typeof value === 'string' && value !== '' && key !== 'status') count++;
    });
    setActiveFilterCount(count);
  }, [appliedFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAdvancedModal(false);
      }
    }

    if (showAdvancedModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showAdvancedModal]);

  const cleanFilters = useCallback((filters: Filters) => {
    const cleaned: Partial<Filters> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) return;
      if (typeof value === 'string' && value === '') return;
      if (typeof value === 'boolean' && value === false && key !== 'has_images') return;
      if (key === 'has_images' && value === true) {
        cleaned[key as keyof Filters] = value;
        return;
      }
      cleaned[key as keyof Filters] = value;
    });

    return cleaned;
  }, []);

  const {
    data: apiResponse,
    isLoading,
  } = usePropertiesList(
    currentPage,
    { ...cleanFilters(appliedFilters), sort: sortBy },
    {
      initialData: currentPage === initialPage ? initialData ?? undefined : undefined,
    }
  ) as { data: PublicPropertyListResponse | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const properties = Array.isArray(apiResponse?.data) ? apiResponse.data : [];

  const pagination = {
    current_page: apiResponse?.current_page || 1,
    last_page: apiResponse?.last_page || 1,
    per_page: apiResponse?.per_page || 12,
    total: apiResponse?.total || 0,
    from: apiResponse?.from || 0,
    to: apiResponse?.to || 0
  };

  const handleTempFilterChange = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTempArrayFilterChange = (key: keyof Filters, value: number) => {
    setTempFilters(prev => {
      const current = prev[key] as number[];
      const updated = current.includes(value)
        ? current.filter(id => id !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const syncUrl = useCallback((filters: Filters, page = 1) => {
    const params = new URLSearchParams();

    if (filters.title) params.set('title', filters.title);
    if (filters.city) params.set('city', filters.city);

    if (filters.listing_type_id.length > 0) {
      const listingType = listingTypes.find((type) => type.id === filters.listing_type_id[0]);
      const listingSlug = listingType?.slug || listingType?.label || listingType?.name;
      if (listingSlug) {
        params.set('listing_type_slug', String(listingSlug).toLowerCase());
      }
    }

    if (filters.property_type_id.length > 0) {
      const propertyType = propertyTypes.find((type) => type.id === filters.property_type_id[0]);
      const propertyTypeSlug = propertyType?.slug || propertyType?.label || propertyType?.name;
      if (propertyTypeSlug) {
        params.set('property_type_slug', String(propertyTypeSlug).toLowerCase());
      }
    }

    if (filters.property_category_id.length > 0) {
      const propertyCategory = propertyCategories.find((type) => type.id === filters.property_category_id[0]);
      const propertyCategorySlug = propertyCategory?.slug || propertyCategory?.label || propertyCategory?.name;
      if (propertyCategorySlug) {
        params.set('property_category_slug', String(propertyCategorySlug).toLowerCase());
      }
    }

    if (page > 1) {
      params.set('page', String(page));
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [listingTypes, propertyCategories, propertyTypes]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
    setShowMobileFilters(false);
    setShowAdvancedModal(false);
    syncUrl(tempFilters, 1);
  }, [syncUrl, tempFilters]);

  const clearFilters = useCallback(() => {
    const emptyFilters: Filters = {
      title: '',
      property_code: '',
      property_face_id: [],
      property_type_id: [],
      property_category_id: [],
      listing_type_id: [],
      property_status_id: [],
      is_featured: false,
      is_negotiable: false,
      banking_available: false,
      has_electricity: false,
      is_road_accessible: false,
      is_verified: false,
      min_price: '',
      max_price: '',
      min_land_area: '',
      max_land_area: '',
      min_road_width: '',
      max_road_width: '',
      bedrooms: '',
      bathrooms: '',
      kitchens: '',
      floors: '',
      parking: false,
      furnished: false,
      city: '',
      state: '',
      has_images: true,
    };

    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncUrl(appliedFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const removeAppliedFilter = (key: keyof Filters, valueToRemove?: number) => {
    const nextFilters = { ...tempFilters } as Filters;

    if (Array.isArray(nextFilters[key])) {
      nextFilters[key] = (nextFilters[key] as number[]).filter((id) => id !== valueToRemove) as never;
    } else if (typeof nextFilters[key] === 'boolean') {
      nextFilters[key] = false as never;
    } else {
      nextFilters[key] = '' as never;
    }

    setTempFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
    syncUrl(nextFilters, 1);
  };

  const removeAppliedFilters = (keys: Array<keyof Filters>) => {
    const nextFilters = { ...tempFilters } as Filters;

    keys.forEach((key) => {
      if (Array.isArray(nextFilters[key])) {
        nextFilters[key] = [] as never;
      } else if (typeof nextFilters[key] === 'boolean') {
        nextFilters[key] = false as never;
      } else {
        nextFilters[key] = '' as never;
      }
    });

    setTempFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
    syncUrl(nextFilters, 1);
  };

  const getOptionLabel = (
    options: Array<{ id: number; label?: string; name?: string }>,
    id: number
  ) => options.find((option) => option.id === id)?.label || options.find((option) => option.id === id)?.name || `#${id}`;

  const activeFilterChips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  if (appliedFilters.title) {
    activeFilterChips.push({
      id: 'title',
      label: `Keyword: ${appliedFilters.title}`,
      onRemove: () => removeAppliedFilter('title'),
    });
  }

  if (appliedFilters.city) {
    activeFilterChips.push({
      id: 'city',
      label: `City: ${appliedFilters.city}`,
      onRemove: () => removeAppliedFilter('city'),
    });
  }

  if (appliedFilters.min_price || appliedFilters.max_price) {
    activeFilterChips.push({
      id: 'price',
      label: `Price: ${appliedFilters.min_price || '0'} - ${appliedFilters.max_price || 'Any'}`,
      onRemove: () => removeAppliedFilters(['min_price', 'max_price']),
    });
  }

  appliedFilters.listing_type_id.forEach((id) => {
    activeFilterChips.push({
      id: `listing-${id}`,
      label: getOptionLabel(listingTypes, id),
      onRemove: () => removeAppliedFilter('listing_type_id', id),
    });
  });

  appliedFilters.property_type_id.forEach((id) => {
    activeFilterChips.push({
      id: `property-type-${id}`,
      label: getOptionLabel(propertyTypes, id),
      onRemove: () => removeAppliedFilter('property_type_id', id),
    });
  });

  appliedFilters.property_category_id.forEach((id) => {
    activeFilterChips.push({
      id: `property-category-${id}`,
      label: getOptionLabel(propertyCategories, id),
      onRemove: () => removeAppliedFilter('property_category_id', id),
    });
  });

  appliedFilters.property_status_id.forEach((id) => {
    activeFilterChips.push({
      id: `property-status-${id}`,
      label: getOptionLabel(propertyStatuses, id),
      onRemove: () => removeAppliedFilter('property_status_id', id),
    });
  });

  appliedFilters.property_face_id.forEach((id) => {
    activeFilterChips.push({
      id: `property-face-${id}`,
      label: getOptionLabel(propertyFaces, id),
      onRemove: () => removeAppliedFilter('property_face_id', id),
    });
  });

  if (appliedFilters.bedrooms) {
    activeFilterChips.push({
      id: 'bedrooms',
      label: `${appliedFilters.bedrooms}+ Beds`,
      onRemove: () => removeAppliedFilter('bedrooms'),
    });
  }

  if (appliedFilters.bathrooms) {
    activeFilterChips.push({
      id: 'bathrooms',
      label: `${appliedFilters.bathrooms}+ Baths`,
      onRemove: () => removeAppliedFilter('bathrooms'),
    });
  }

  if (appliedFilters.parking) {
    activeFilterChips.push({
      id: 'parking',
      label: 'Parking',
      onRemove: () => removeAppliedFilter('parking'),
    });
  }

  if (appliedFilters.furnished) {
    activeFilterChips.push({
      id: 'furnished',
      label: 'Furnished',
      onRemove: () => removeAppliedFilter('furnished'),
    });
  }

  if (appliedFilters.banking_available) {
    activeFilterChips.push({
      id: 'banking_available',
      label: 'Banking Available',
      onRemove: () => removeAppliedFilter('banking_available'),
    });
  }

  if (appliedFilters.has_electricity) {
    activeFilterChips.push({
      id: 'has_electricity',
      label: 'Electricity',
      onRemove: () => removeAppliedFilter('has_electricity'),
    });
  }

  if (appliedFilters.is_road_accessible) {
    activeFilterChips.push({
      id: 'is_road_accessible',
      label: 'Road Access',
      onRemove: () => removeAppliedFilter('is_road_accessible'),
    });
  }

  if (appliedFilters.is_verified) {
    activeFilterChips.push({
      id: 'is_verified',
      label: 'Verified',
      onRemove: () => removeAppliedFilter('is_verified'),
    });
  }

  if (appliedFilters.is_negotiable) {
    activeFilterChips.push({
      id: 'is_negotiable',
      label: 'Negotiable',
      onRemove: () => removeAppliedFilter('is_negotiable'),
    });
  }

  if (appliedFilters.is_featured) {
    activeFilterChips.push({
      id: 'is_featured',
      label: 'Featured',
      onRemove: () => removeAppliedFilter('is_featured'),
    });
  }

  const baseInputClass = "w-full rounded border border-opsh-grey-border bg-opsh-white-pure px-3.5 py-3 text-sm text-opsh-black shadow-sm transition-all duration-200 placeholder:text-opsh-text-light focus:border-opsh-secondary focus:outline-none focus:ring-2 focus:ring-opsh-secondary";
  const baseSelectClass = `${baseInputClass} appearance-none pr-10`;
  const checkboxClass = "h-4 w-4 rounded border-opsh-grey-border text-opsh-secondary focus:ring-opsh-secondary";
  const helperLabelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-opsh-muted";

  const featureToggles: Array<{ key: keyof Filters; label: string }> = [
    { key: 'parking', label: 'Parking' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'banking_available', label: 'Bank Loan' },
    { key: 'has_electricity', label: 'Electricity' },
    { key: 'is_road_accessible', label: 'Road Access' },
    { key: 'is_verified', label: 'Verified' },
    { key: 'is_negotiable', label: 'Negotiable' },
    { key: 'is_featured', label: 'Featured' },
  ];

  const LoadingSkeleton = () => (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded border border-opsh-grey-border bg-opsh-white-pure shadow-opsh-sm"
        >
          <div className="h-56 animate-pulse bg-opsh-grey-light" />
          <div className="space-y-4 p-5">
            <div className="h-6 w-2/3 animate-pulse rounded bg-opsh-grey-light" />
            <div className="h-4 w-full animate-pulse rounded bg-opsh-grey-light" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-opsh-grey-light" />
            <div className="grid grid-cols-4 gap-3 pt-2">
              {Array.from({ length: 4 }).map((__, itemIndex) => (
                <div key={itemIndex} className="h-14 animate-pulse rounded bg-opsh-background-dark" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAdvancedSection = (section: keyof typeof expandedAdvancedSections) => {
    setExpandedAdvancedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterCheckbox = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-opsh-md border border-opsh-grey-border bg-opsh-white-pure px-3 py-2.5 transition-all duration-200 hover:border-opsh-secondary hover:bg-opsh-background-light">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={checkboxClass}
      />
      <span className="text-sm font-medium text-opsh-darkgrey">{label}</span>
    </label>
  );

  const FilterSection = ({ title, sectionKey, children }: {
    title: string;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="overflow-hidden rounded border border-opsh-grey-border bg-opsh-background-light shadow-sm">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-opsh-grey-light"
        aria-expanded={expandedSections[sectionKey]}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-opsh-muted">Filter</p>
          <h3 className="mt-1 text-base font-semibold text-opsh-primary">{title}</h3>
        </div>
        {expandedSections[sectionKey] ?
          <FiChevronUp className="text-opsh-muted" /> :
          <FiChevronDown className="text-opsh-muted" />
        }
      </button>
      {expandedSections[sectionKey] && <div className="space-y-4 border-t border-opsh-grey-border px-4 py-4">{children}</div>}
    </div>
  );

  const AdvancedFilterSection = ({ title, sectionKey, children }: {
    title: string;
    sectionKey: keyof typeof expandedAdvancedSections;
    children: React.ReactNode;
  }) => (
    <div className="overflow-hidden rounded-[24px] border border-opsh-grey-border bg-opsh-background-light shadow-sm">
      <button
        onClick={() => toggleAdvancedSection(sectionKey)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-opsh-grey-light"
        aria-expanded={expandedAdvancedSections[sectionKey]}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-opsh-muted">Advanced</p>
          <h3 className="mt-1 text-base font-semibold text-opsh-primary">{title}</h3>
        </div>
        {expandedAdvancedSections[sectionKey] ?
          <FiChevronUp className="text-opsh-muted" /> :
          <FiChevronDown className="text-opsh-muted" />
        }
      </button>
      {expandedAdvancedSections[sectionKey] && <div className="space-y-4 border-t border-opsh-grey-border px-5 py-5">{children}</div>}
    </div>
  );

  const FilterSidebar = () => (
    <div className="space-y-4">
      <FilterSection title="Search" sectionKey="search">
        <div className="space-y-4">
          <div>
            <label htmlFor="sidebar-keyword" className={helperLabelClass}>Keyword</label>
            <input
              id="sidebar-keyword"
              type="text"
              value={tempFilters.title}
              onChange={(e) => handleTempFilterChange('title', e.target.value)}
              placeholder="House, land, apartment..."
              className={baseInputClass}
            />
          </div>
          <div>
            <label htmlFor="sidebar-code" className={helperLabelClass}>Property ID</label>
            <input
              id="sidebar-code"
              type="text"
              value={tempFilters.property_code}
              onChange={(e) => handleTempFilterChange('property_code', e.target.value)}
              placeholder="Search by property code"
              className={baseInputClass}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Location" sectionKey="location">
        <div className="space-y-4">
          <div>
            <label htmlFor="sidebar-city" className={helperLabelClass}>City / Area</label>
            <input
              id="sidebar-city"
              type="text"
              value={tempFilters.city}
              onChange={(e) => handleTempFilterChange('city', e.target.value)}
              placeholder="Kathmandu, Bhaktapur..."
              className={baseInputClass}
            />
          </div>
          <div>
            <label htmlFor="sidebar-state" className={helperLabelClass}>State / Province</label>
            <input
              id="sidebar-state"
              type="text"
              value={tempFilters.state}
              onChange={(e) => handleTempFilterChange('state', e.target.value)}
              placeholder="Bagmati Province"
              className={baseInputClass}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Price Range (NPR)" sectionKey="price">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="min-price" className={helperLabelClass}>Min</label>
              <input
                id="min-price"
                type="number"
                min="0"
                value={tempFilters.min_price}
                onChange={(e) => handleTempFilterChange('min_price', e.target.value)}
                placeholder="Minimum"
                className={baseInputClass}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="max-price" className={helperLabelClass}>Max</label>
              <input
                id="max-price"
                type="number"
                min="0"
                value={tempFilters.max_price}
                onChange={(e) => handleTempFilterChange('max_price', e.target.value)}
                placeholder="Maximum"
                className={baseInputClass}
              />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Property Type" sectionKey="propertyType">
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {propertyTypes.map((type) => (
            <FilterCheckbox
              key={type.id}
              label={type.label || `Type #${type.id}`}
              checked={tempFilters.property_type_id.includes(type.id)}
              onChange={() => handleTempArrayFilterChange('property_type_id', type.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Listing Type" sectionKey="listingType">
        <div className="space-y-2">
          {listingTypes.map((type) => (
            <FilterCheckbox
              key={type.id}
              label={type.label || `Listing #${type.id}`}
              checked={tempFilters.listing_type_id.includes(type.id)}
              onChange={() => handleTempArrayFilterChange('listing_type_id', type.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Property Face" sectionKey="propertyFace">
        <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {propertyFaces.map((face) => (
            <FilterCheckbox
              key={face.id}
              label={face.label || `Face #${face.id}`}
              checked={tempFilters.property_face_id.includes(face.id)}
              onChange={() => handleTempArrayFilterChange('property_face_id', face.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Property Status" sectionKey="propertyStatus">
        <div className="space-y-2">
          {propertyStatuses.map((status) => (
            <FilterCheckbox
              key={status.id}
              label={status.label || `Status #${status.id}`}
              checked={tempFilters.property_status_id.includes(status.id)}
              onChange={() => handleTempArrayFilterChange('property_status_id', status.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Property Details" sectionKey="details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sidebar-beds" className={helperLabelClass}>Bedrooms</label>
            <select
              id="sidebar-beds"
              className={baseSelectClass}
              value={tempFilters.bedrooms}
              onChange={(e) => handleTempFilterChange('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>
          <div>
            <label htmlFor="sidebar-baths" className={helperLabelClass}>Bathrooms</label>
            <select
              id="sidebar-baths"
              className={baseSelectClass}
              value={tempFilters.bathrooms}
              onChange={(e) => handleTempFilterChange('bathrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+ Baths</option>
              <option value="2">2+ Baths</option>
              <option value="3">3+ Baths</option>
              <option value="4">4+ Baths</option>
            </select>
          </div>
          <div>
            <label htmlFor="sidebar-kitchens" className={helperLabelClass}>Kitchens</label>
            <input
              id="sidebar-kitchens"
              type="number"
              min="0"
              value={tempFilters.kitchens}
              onChange={(e) => handleTempFilterChange('kitchens', e.target.value)}
              placeholder="Any"
              className={baseInputClass}
            />
          </div>
          <div>
            <label htmlFor="sidebar-floors" className={helperLabelClass}>Floors</label>
            <input
              id="sidebar-floors"
              type="number"
              min="0"
              value={tempFilters.floors}
              onChange={(e) => handleTempFilterChange('floors', e.target.value)}
              placeholder="Any"
              className={baseInputClass}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Features & Utilities" sectionKey="features">
        <div className="grid grid-cols-2 gap-2">
          {featureToggles.map((feature) => (
            <button
              key={feature.key}
              type="button"
              onClick={() => handleTempFilterChange(feature.key, !tempFilters[feature.key])}
              className={`rounded-opsh-md border px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${tempFilters[feature.key]
                ? 'border-opsh-secondary bg-opsh-secondary text-opsh-white-pure shadow-opsh-secondary'
                : 'border-opsh-grey-border bg-opsh-white-pure text-opsh-darkgrey hover:border-opsh-primary hover:bg-opsh-background-light'
                }`}
            >
              {feature.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Land Area (sq. ft.)" sectionKey="area">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="min-area" className={helperLabelClass}>Min</label>
              <input
                id="min-area"
                type="number"
                min="0"
                value={tempFilters.min_land_area}
                onChange={(e) => handleTempFilterChange('min_land_area', e.target.value)}
                placeholder="Minimum"
                className={baseInputClass}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="max-area" className={helperLabelClass}>Max</label>
              <input
                id="max-area"
                type="number"
                min="0"
                value={tempFilters.max_land_area}
                onChange={(e) => handleTempFilterChange('max_land_area', e.target.value)}
                placeholder="Maximum"
                className={baseInputClass}
              />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Road Width (ft.)" sectionKey="roadWidth">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="min-road" className={helperLabelClass}>Min</label>
              <input
                id="min-road"
                type="number"
                min="0"
                value={tempFilters.min_road_width}
                onChange={(e) => handleTempFilterChange('min_road_width', e.target.value)}
                placeholder="Minimum"
                className={baseInputClass}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="max-road" className={helperLabelClass}>Max</label>
              <input
                id="max-road"
                type="number"
                min="0"
                value={tempFilters.max_road_width}
                onChange={(e) => handleTempFilterChange('max_road_width', e.target.value)}
                placeholder="Maximum"
                className={baseInputClass}
              />
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  const AdvancedSearchModal = () => (
    <AnimatePresence>
      {showAdvancedModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowAdvancedModal(false)}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded border border-opsh-grey-border bg-opsh-white-pure shadow-2xl md:inset-10"
          >
            <div className="bg-opsh-primary px-6 py-3 text-opsh-white-pure shadow-sm">
              <div className="flex items-center justify-between">

                {/* Title */}
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest text-white/70">
                    Advanced Search
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">

                  {/* Active Filters Badge */}
                  <div className="rounded border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {activeFilterCount} Active
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowAdvancedModal(false)}
                    className="flex items-center justify-center rounded-full p-2 bg-white/10 hover:bg-white/20 transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="text-white" />
                  </button>
                </div>

              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdvancedFilterSection title="Location" sectionKey="location">
                  <div className="space-y-4">
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted" />
                      <input
                        type="text"
                        value={tempFilters.city}
                        onChange={(e) => handleTempFilterChange('city', e.target.value)}
                        placeholder="Enter city, area, or municipality"
                        className={`${baseInputClass} pl-10`}
                      />
                    </div>
                    <div>
                      <label htmlFor="advanced-state" className={helperLabelClass}>Province / State</label>
                      <input
                        id="advanced-state"
                        type="text"
                        value={tempFilters.state}
                        onChange={(e) => handleTempFilterChange('state', e.target.value)}
                        placeholder="Bagmati Province"
                        className={baseInputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="advanced-keyword" className={helperLabelClass}>Keyword</label>
                      <input
                        id="advanced-keyword"
                        type="text"
                        value={tempFilters.title}
                        onChange={(e) => handleTempFilterChange('title', e.target.value)}
                        placeholder="Villa, office, residential land..."
                        className={baseInputClass}
                      />
                    </div>
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Rooms & Layout" sectionKey="rooms">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="advanced-baths" className={helperLabelClass}>Bathrooms</label>
                      <select
                        id="advanced-baths"
                        className={baseSelectClass}
                        value={tempFilters.bathrooms}
                        onChange={(e) => handleTempFilterChange('bathrooms', e.target.value)}
                      >
                        <option value="">Any</option>
                        <option value="1">1+ Baths</option>
                        <option value="2">2+ Baths</option>
                        <option value="3">3+ Baths</option>
                        <option value="4">4+ Baths</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="advanced-kitchens" className={helperLabelClass}>Kitchens</label>
                      <input
                        id="advanced-kitchens"
                        type="number"
                        min="0"
                        value={tempFilters.kitchens}
                        onChange={(e) => handleTempFilterChange('kitchens', e.target.value)}
                        placeholder="Any"
                        className={baseInputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="advanced-floors" className={helperLabelClass}>Floors</label>
                      <input
                        id="advanced-floors"
                        type="number"
                        min="0"
                        value={tempFilters.floors}
                        onChange={(e) => handleTempFilterChange('floors', e.target.value)}
                        placeholder="Any"
                        className={baseInputClass}
                      />
                    </div>
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Road Width" sectionKey="roadWidth">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Minimum ft"
                      value={tempFilters.min_road_width}
                      onChange={(e) => handleTempFilterChange('min_road_width', e.target.value)}
                      className={baseInputClass}
                    />
                    <span className="text-opsh-muted">to</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Maximum ft"
                      value={tempFilters.max_road_width}
                      onChange={(e) => handleTempFilterChange('max_road_width', e.target.value)}
                      className={baseInputClass}
                    />
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Amenities & Flags" sectionKey="amenity">
                  <div className="grid grid-cols-2 gap-2 [&>span]:hidden">
                    <span className="text-opsh-muted">to</span>
                    {featureToggles.map((feature) => (
                      <button
                        key={feature.key}
                        type="button"
                        onClick={() => handleTempFilterChange(feature.key, !tempFilters[feature.key])}
                        className={`rounded-opsh-md border px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${tempFilters[feature.key]
                          ? 'border-opsh-secondary bg-opsh-secondary text-opsh-white-pure shadow-opsh-secondary'
                          : 'border-opsh-grey-border bg-opsh-white-pure text-opsh-darkgrey hover:border-opsh-primary hover:bg-opsh-background-light'
                          }`}
                      >
                        {feature.label}
                      </button>
                    ))}
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Property Faces" sectionKey="classification">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {propertyFaces.map((face) => (
                      <FilterCheckbox
                        key={face.id}
                        label={face.label || `Face #${face.id}`}
                        checked={tempFilters.property_face_id.includes(face.id)}
                        onChange={() => handleTempArrayFilterChange('property_face_id', face.id)}
                      />
                    ))}
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Lot Area" sectionKey="lotArea">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Minimum sqft"
                      value={tempFilters.min_land_area}
                      onChange={(e) => handleTempFilterChange('min_land_area', e.target.value)}
                      className={baseInputClass}
                    />
                    <span className="text-opsh-muted">to</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Maximum sqft"
                      value={tempFilters.max_land_area}
                      onChange={(e) => handleTempFilterChange('max_land_area', e.target.value)}
                      className={baseInputClass}
                    />
                  </div>
                </AdvancedFilterSection>

                <AdvancedFilterSection title="Listing Options" sectionKey="classification">
                  <div className="space-y-5">
                    <div>
                      <label className={helperLabelClass}>Listing Type</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {listingTypes.map((type) => (
                          <FilterCheckbox
                            key={type.id}
                            label={type.label || `Listing #${type.id}`}
                            checked={tempFilters.listing_type_id.includes(type.id)}
                            onChange={() => handleTempArrayFilterChange('listing_type_id', type.id)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={helperLabelClass}>Property Type</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {propertyTypes.map((type) => (
                          <FilterCheckbox
                            key={type.id}
                            label={type.label || `Type #${type.id}`}
                            checked={tempFilters.property_type_id.includes(type.id)}
                            onChange={() => handleTempArrayFilterChange('property_type_id', type.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </AdvancedFilterSection>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-opsh-grey-border bg-opsh-background-light p-6">
              <button
                onClick={clearFilters}
                className="rounded-opsh-md border border-opsh-grey-border bg-opsh-white-pure px-4 py-2.5 text-sm font-semibold text-opsh-muted-dark transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="btn-gradient-secondary rounded-opsh-md px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-opsh-white-pure"
              >
                Show {pagination?.total || 0} Properties
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-opsh-background">
      <AdvancedSearchModal />

      <div className="relative overflow-hidden border-b border-opsh-grey-border bg-opsh-primary">
        <div className="absolute -left-16 top-6 h-40 w-40 rounded bg-white/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-32w-48 rounded bg-opsh-secondary/30 blur-3xl" />
        <div className="relative mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-8 lg:py-10">

        </div>
      </div>

      <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 rounded border border-opsh-grey-border bg-opsh-primary px-6 py-3 text-opsh-white-pure shadow-opsh-primary transition-all hover:bg-opsh-primary-hover"
          aria-label="Open filters"
        >
          <FiFilter />
          <span>Filter Properties</span>
          {activeFilterCount > 0 && (
            <span className="rounded bg-opsh-white-pure px-2 py-0.5 text-xs font-semibold text-opsh-secondary">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-opsh-white-pure">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-opsh-grey-border bg-opsh-white-pure p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-opsh-muted">Mobile Filters</p>
                <h2 className="mt-1 text-xl font-semibold text-opsh-primary">Refine results</h2>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded p-2 transition-colors hover:bg-opsh-grey-light"
                aria-label="Close filters"
              >
                <FiX size={24} className="text-opsh-primary" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
              <div className="sticky bottom-0 mt-4 space-y-3 border-t border-opsh-grey-border bg-opsh-white-pure pt-4">
                <button
                  onClick={applyFilters}
                  className="btn-gradient-secondary w-full rounded-opsh-md py-3 text-sm font-semibold uppercase tracking-[0.18em] text-opsh-white-pure"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full rounded-opsh-md border border-opsh-grey-border py-3 text-sm font-semibold text-opsh-muted-dark transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto -mt-10 max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="grid w-full grid-cols-1 gap-3 rounded border border-opsh-grey-border bg-opsh-white-pure p-4 shadow-opsh-lg md:grid-cols-11 lg:p-5">
            <div className="relative md:col-span-3 lg:col-span-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted" size={18} />
              <input
                type="text"
                placeholder="Keyword, project, or property title"
                value={tempFilters.title}
                onChange={(e) => handleTempFilterChange('title', e.target.value)}
                className={`${baseInputClass} pl-10`}
              />
            </div>

            <div className="relative md:col-span-3 lg:col-span-2">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted" size={18} />
              <input
                type="text"
                placeholder="City, area, municipality"
                value={tempFilters.city}
                onChange={(e) => handleTempFilterChange('city', e.target.value)}
                className={`${baseInputClass} pl-10`}
              />
            </div>

            <div className="relative md:col-span-2 lg:col-span-2">
              <select
                className={baseSelectClass}
                value={tempFilters.listing_type_id[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleTempFilterChange('listing_type_id', value ? [parseInt(value)] : []);
                }}
              >
                <option value="">Listing Type</option>
                {listingTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-opsh-muted" size={18} />
            </div>

            <div className="relative md:col-span-4 lg:col-span-2">
              <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Min"
                    value={tempFilters.min_price}
                    onChange={(e) => handleTempFilterChange('min_price', e.target.value)}
                    className={`${baseInputClass} pl-8`}
                  />
                </div>
                <span className="text-sm font-medium text-opsh-muted">to</span>
                <input
                  type="text"
                  placeholder="Max"
                  value={tempFilters.max_price}
                  onChange={(e) => handleTempFilterChange('max_price', e.target.value)}
                  className={baseInputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-start md:col-span-3 lg:col-span-1 md:justify-center">
              <button
                className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-opsh-primary transition-colors group hover:text-opsh-secondary"
                onClick={() => setShowAdvancedModal(true)}
              >
                <GiSettingsKnobs className="text-lg group-hover:rotate-180 transition-transform duration-300" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>

            <div className="md:col-span-4 lg:col-span-1">
              <button
                onClick={applyFilters}
                className="btn-gradient-secondary flex w-full items-center justify-center gap-2 rounded-opsh-md px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-opsh-white-pure"
              >
                <FiSearch size={18} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-5 rounded border border-opsh-grey-border bg-opsh-white-pure p-4 shadow-opsh-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-opsh-muted">Applied Filters</p>
                <h2 className="mt-1 text-lg font-semibold text-opsh-primary">Current search refinements</h2>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-opsh-md border border-opsh-grey-border px-4 py-2 text-sm font-semibold text-opsh-muted-dark transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
              >
                <FiRefreshCw />
                Clear all
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-2 rounded border border-opsh-grey-border bg-opsh-background-light px-3 py-2 text-sm font-medium text-opsh-darkgrey transition-all hover:border-opsh-secondary hover:text-opsh-secondary"
                >
                  <span>{chip.label}</span>
                  <FiX className="text-xs" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <div className="hidden w-80 xl:w-[340px] lg:block">
            <div className="sticky top-4 rounded border border-opsh-grey-border bg-opsh-white-pure p-5 shadow-opsh-md">
              <FilterSidebar />
              <div className="mt-5 grid gap-3">
                <button
                  onClick={applyFilters}
                  className="btn-gradient-secondary w-full rounded-opsh-md py-3 text-sm font-semibold uppercase tracking-[0.18em] text-opsh-white-pure"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full rounded-opsh-md border border-opsh-grey-border py-3 text-sm font-semibold text-opsh-muted-dark transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="rounded border border-opsh-grey-border bg-opsh-white-pure p-3 shadow-opsh-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className='flex items-center gap-2'>
                  <p className="mt-1 text-lg font-semibold text-opsh-primary">
                    {pagination?.total ? (
                      <>Showing {pagination.from} - {pagination.to} of {pagination.total} properties</>
                    ) : (
                      <>Showing 0 properties</>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-opsh-muted-dark">
                    Page {currentPage} of {pagination.last_page}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded bg-opsh-background-dark px-3 py-2 text-sm font-medium text-opsh-primary">
                    {activeFilterCount} active filters
                  </div>
                  <div className="relative min-w-[220px]">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className={baseSelectClass}
                      aria-label="Sort properties"
                    >
                      <option value="latest">Sort by: Latest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-opsh-muted" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : properties.length === 0 ? (
              <div className="rounded border border-dashed border-opsh-grey-border bg-opsh-white-pure px-6 py-14 text-center shadow-opsh-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded bg-opsh-background-dark text-opsh-secondary">
                  <FiHome className="text-2xl" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-opsh-primary">No matching properties found</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-opsh-muted-dark">
                  Try widening the price range, changing the location, or removing one or two filters to see more listings.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-opsh-md border border-opsh-grey-border px-5 py-3 text-sm font-semibold text-opsh-muted-dark transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
                  >
                    <FiRefreshCw />
                    Clear filters
                  </button>
                  <button
                    onClick={() => setShowAdvancedModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-opsh-md border border-opsh-primary px-5 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-primary hover:text-opsh-white-pure"
                  >
                    <GiSettingsKnobs />
                    Adjust search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {properties.map((property: Properties) => (
                    <PropertyCard key={property.id} property={property as Properties} />
                  ))}
                </div>

                {pagination && pagination.last_page > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 rounded border border-opsh-grey-border bg-opsh-white-pure p-4 shadow-opsh-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`rounded px-4 py-2 text-sm font-semibold transition-all ${currentPage === 1
                        ? 'cursor-not-allowed border border-opsh-grey-border bg-opsh-background-dark text-opsh-text-muted'
                        : 'border border-opsh-grey-border bg-opsh-white-pure text-opsh-darkgrey hover:border-opsh-primary hover:text-opsh-primary'
                        }`}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, index) => {
                      let pageNum: number;
                      if (pagination.last_page <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`rounded px-4 py-2 text-sm font-semibold transition-all ${currentPage === pageNum
                            ? "bg-opsh-secondary text-opsh-white-pure shadow-opsh-secondary"
                            : "border border-opsh-grey-border bg-opsh-white-pure text-opsh-darkgrey hover:border-opsh-primary hover:text-opsh-primary"
                            }`}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className={`rounded px-4 py-2 text-sm font-semibold transition-all ${currentPage === pagination.last_page
                        ? 'cursor-not-allowed border border-opsh-grey-border bg-opsh-background-dark text-opsh-text-muted'
                        : 'border border-opsh-grey-border bg-opsh-white-pure text-opsh-darkgrey hover:border-opsh-primary hover:text-opsh-primary'
                        }`}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
