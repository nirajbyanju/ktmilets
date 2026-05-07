'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';

import MobileFeedCard from '@/components/public/home/MobileFeedCard';
import MobileFeedSkeleton from '@/components/public/home/MobileFeedSkeleton';
import { MOBILE_FEED_SEARCH_EVENT } from '@/helper/home/mobileFeed';
import { MOBILE_HOME_PAGE_SIZE } from '@/helper/public/home';
import { useInfiniteMobileProperties } from '@/hooks/useProperties';
import { Properties } from '@/types/property/property';

const MOBILE_PROPERTY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'land', label: 'Land' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'flat', label: 'Flat' },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractPropertyList = (payload: unknown): Properties[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const source = payload as Record<string, unknown>;

  if (Array.isArray(source.data)) {
    return source.data as Properties[];
  }

  if (isRecord(source.data)) {
    if (Array.isArray(source.data.data)) {
      return source.data.data as Properties[];
    }

    if (Array.isArray(source.data.items)) {
      return source.data.items as Properties[];
    }
  }

  if (Array.isArray(source.items)) {
    return source.items as Properties[];
  }

  return [];
};

function MobileFilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? 'bg-opsh-primary text-opsh-text shadow-opsh-primary'
          : 'border border-opsh-grey-border bg-white text-opsh-muted-dark'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function MobileFilterSheet({
  isOpen,
  city,
  onCityChange,
  maxPrice,
  onMaxPriceChange,
  propertyType,
  onPropertyTypeChange,
  onClose,
  onClear,
  onApply,
}: {
  isOpen: boolean;
  city: string;
  onCityChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  propertyType: string;
  onPropertyTypeChange: (value: string) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close search panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div className="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 shadow-[0_-18px_40px_rgba(3,51,49,0.18)]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-opsh-grey-dark" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-opsh-muted">
              Refine Feed
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-opsh-black">Find what fits fast</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full border border-opsh-grey-border p-2 text-opsh-muted"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">
              City or Area
            </label>
            <input
              type="text"
              value={city}
              onChange={(event) => onCityChange(event.target.value)}
              placeholder="Kathmandu, Bhaktapur, Lalitpur..."
              className="w-full rounded-2xl border border-opsh-grey-border bg-opsh-white-pure px-4 py-3 text-sm text-opsh-black outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {MOBILE_PROPERTY_TYPE_OPTIONS.map((option) => (
                <MobileFilterChip
                  key={option.value}
                  label={option.label}
                  active={propertyType === option.value}
                  onClick={() => onPropertyTypeChange(option.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">
              Maximum Budget
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Example: 5000000"
              className="w-full rounded-2xl border border-opsh-grey-border bg-opsh-white-pure px-4 py-3 text-sm text-opsh-black outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl border border-opsh-grey-border px-4 py-3 text-sm font-semibold text-opsh-muted-dark"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-opsh-primary px-4 py-3 text-sm font-semibold text-opsh-text shadow-opsh-primary"
          >
            Show Feed
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileHomeFeed({
  properties,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  searchInputValue,
  onSearchInputChange,
  onSearchSubmit,
  onClearFilters,
  activeFilterCount,
  appliedSearchTerm,
  listingType,
  propertyType,
  city,
  maxPrice,
  loadMoreRef,
}: {
  properties: Properties[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  searchInputValue: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  appliedSearchTerm: string;
  listingType: string;
  propertyType: string;
  city: string;
  maxPrice: string;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}) {
  const hasActiveFilters = activeFilterCount > 0;

  if (isLoading) {
    return <MobileFeedSkeleton />;
  }

  return (
    <section
      id="mobile-feed"
      className="min-h-screen bg-[linear-gradient(180deg,#f5f7f8_0%,#eef3f6_100%)] px-3 py-3 pb-28 md:hidden"
    >
      <div className="mx-auto mb-3 max-w-md">
        <p className="text-xxs text-opsh-muted">
          Mobile Feed
        </p>
        <h1 className="mt-1 text-xl font-semibold text-opsh-primary">Find your next place</h1>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="sticky top-2 z-20 rounded border border-black/5 bg-white/95 p-3 shadow-[0_18px_45px_rgba(4,72,69,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInputValue}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onSearchSubmit();
                  }
                }}
                placeholder="Search by title or keyword..."
                className="w-full rounded border border-opsh-grey-border bg-opsh-background-light px-4 py-3 text-sm text-opsh-black outline-none transition-all duration-200 focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/20"
              />
            </div>

            <button
              type="button"
              onClick={onSearchSubmit}
              className="relative flex h-[44px] w-[44px] items-center justify-center rounded border border-opsh-grey-border bg-white text-opsh-primary transition hover:bg-opsh-background-light focus:outline-none focus:ring-2 focus:ring-opsh-primary/20"
              aria-label="Search feed"
            >
              <FiSearch className="text-lg" />
            </button>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="rounded-[26px] border border-black/5 bg-white px-4 py-3 shadow-[0_14px_28px_rgba(4,72,69,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">
                  Active filters
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {appliedSearchTerm ? (
                    <span className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-primary">
                      {appliedSearchTerm}
                    </span>
                  ) : null}
                  {listingType !== 'all' ? (
                    <span className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-primary">
                      {listingType}
                    </span>
                  ) : null}
                  {propertyType !== 'all' ? (
                    <span className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-primary">
                      {propertyType}
                    </span>
                  ) : null}
                  {city ? (
                    <span className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-primary">
                      {city}
                    </span>
                  ) : null}
                  {maxPrice ? (
                    <span className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-primary">
                      Under NPR {new Intl.NumberFormat('en-NP').format(Number(maxPrice) || 0)}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-2 rounded-full border border-opsh-grey-border px-3 py-2 text-xs font-semibold text-opsh-muted-dark"
              >
                <FiRefreshCw />
                Reset
              </button>
            </div>
          </div>
        ) : null}

        {properties.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-opsh-grey-border bg-white px-6 py-12 text-center shadow-opsh-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-opsh-background text-opsh-primary">
              <FiTrendingUp className="text-xl" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-opsh-black">No properties matched</h2>
            <p className="mt-3 text-sm leading-7 text-opsh-muted-dark">
              Try widening the location, clearing the budget, or switching between Buy and Rent.
            </p>
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-5 rounded-2xl bg-opsh-primary px-5 py-3 text-sm font-semibold text-opsh-text shadow-opsh-primary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {properties.map((property) => (
              <MobileFeedCard key={property.id} property={property} />
            ))}

            <div ref={loadMoreRef} className="flex items-center justify-center">
              {isFetchingNextPage ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-opsh-primary shadow-opsh-sm">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-opsh-primary border-r-transparent" />
                  Loading more properties
                </div>
              ) : hasNextPage ? (
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-opsh-muted">
                  Scroll to load more
                </p>
              ) : (
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-opsh-muted">
                  You reached the end
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function MobileHomePageClient({
  initialPageData = null,
}: {
  initialPageData?: unknown | null;
}) {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [listingType, setListingType] = useState('all');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftPropertyType, setDraftPropertyType] = useState('all');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filterStateRef = useRef({
    city: '',
    propertyType: 'all',
    maxPrice: '',
  });

  const mobileFilters = useMemo(
    () => ({
      limit: MOBILE_HOME_PAGE_SIZE,
      title: appliedSearchTerm || undefined,
      city: city || undefined,
      listing_type_slug: listingType !== 'all' ? listingType : undefined,
      property_type_slug: propertyType !== 'all' ? propertyType : undefined,
      max_price: maxPrice || undefined,
    }),
    [appliedSearchTerm, city, listingType, maxPrice, propertyType]
  );

  const canUseInitialPage =
    Boolean(initialPageData) &&
    !appliedSearchTerm &&
    listingType === 'all' &&
    !city &&
    propertyType === 'all' &&
    !maxPrice;

  const initialInfiniteData = useMemo(
    () =>
      canUseInitialPage && initialPageData
        ? {
            pages: [initialPageData],
            pageParams: [1],
          }
        : undefined,
    [canUseInitialPage, initialPageData]
  );

  const mobileQuery = useInfiniteMobileProperties(mobileFilters, true, initialInfiniteData);
  const mobilePages = useMemo(() => mobileQuery.data?.pages ?? [], [mobileQuery.data?.pages]);
  const mobileProperties = useMemo(
    () => mobilePages.flatMap((pageData) => extractPropertyList(pageData)),
    [mobilePages]
  );

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMobileLoading,
    isFetching: isMobileFetching,
  } = mobileQuery;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedSearchTerm.trim()) count += 1;
    if (listingType !== 'all') count += 1;
    if (propertyType !== 'all') count += 1;
    if (city.trim()) count += 1;
    if (maxPrice.trim()) count += 1;
    return count;
  }, [appliedSearchTerm, city, listingType, maxPrice, propertyType]);

  useEffect(() => {
    filterStateRef.current = {
      city,
      propertyType,
      maxPrice,
    };
  }, [city, maxPrice, propertyType]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: '320px 0px',
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const applySearch = () => {
    setAppliedSearchTerm(searchInputValue.trim());
  };

  const openFilterSheet = useCallback(() => {
    const currentFilters = filterStateRef.current;

    setDraftCity(currentFilters.city);
    setDraftPropertyType(currentFilters.propertyType);
    setDraftMaxPrice(currentFilters.maxPrice);
    setShowFilters(true);
  }, []);

  const applyFilterSheet = () => {
    setCity(draftCity.trim());
    setPropertyType(draftPropertyType);
    setMaxPrice(draftMaxPrice.trim());
    setShowFilters(false);
  };

  const clearMobileFilters = () => {
    setSearchInputValue('');
    setAppliedSearchTerm('');
    setListingType('all');
    setCity('');
    setPropertyType('all');
    setMaxPrice('');
    setDraftCity('');
    setDraftPropertyType('all');
    setDraftMaxPrice('');
    setShowFilters(false);
  };

  useEffect(() => {
    const handleOpenSearchPanel = () => {
      window.setTimeout(() => {
        document.getElementById('mobile-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        openFilterSheet();
      }, 80);
    };

    window.addEventListener(MOBILE_FEED_SEARCH_EVENT, handleOpenSearchPanel);
    return () => {
      window.removeEventListener(MOBILE_FEED_SEARCH_EVENT, handleOpenSearchPanel);
    };
  }, [openFilterSheet]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mobileFeedSearch') !== '1') {
      return;
    }

    const scrollAndOpen = window.setTimeout(() => {
      document.getElementById('mobile-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      openFilterSheet();

      params.delete('mobileFeedSearch');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash || ''}`;
      window.history.replaceState({}, '', nextUrl);
    }, 180);

    return () => window.clearTimeout(scrollAndOpen);
  }, [openFilterSheet]);

  return (
    <>
      <MobileHomeFeed
        properties={mobileProperties}
        isLoading={isMobileLoading || isMobileFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        searchInputValue={searchInputValue}
        onSearchInputChange={setSearchInputValue}
        onSearchSubmit={applySearch}
        onClearFilters={clearMobileFilters}
        activeFilterCount={activeFilterCount}
        appliedSearchTerm={appliedSearchTerm}
        listingType={listingType}
        propertyType={propertyType}
        city={city}
        maxPrice={maxPrice}
        loadMoreRef={loadMoreRef}
      />

      <MobileFilterSheet
        isOpen={showFilters}
        city={draftCity}
        onCityChange={setDraftCity}
        maxPrice={draftMaxPrice}
        onMaxPriceChange={setDraftMaxPrice}
        propertyType={draftPropertyType}
        onPropertyTypeChange={setDraftPropertyType}
        onClose={() => setShowFilters(false)}
        onClear={clearMobileFilters}
        onApply={applyFilterSheet}
      />
    </>
  );
}
