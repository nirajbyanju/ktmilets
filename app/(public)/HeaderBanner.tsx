'use client';

import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

import mainImg from '@/public/images/mainImg.png';

const propertyTypes = [
    { label: 'Apartment', slug: 'apartment' },
    { label: 'House', slug: 'house' },
    { label: 'Townhouse', slug: 'townhouse' },
    { label: 'Villa', slug: 'villa' },
];
const locations = ['Bhaktapur', 'Kathmandu', 'Pokhara', 'Lalitpur'];
const rotatingTaglines = [
    {
        text: 'आजको लगानी, भोलिको समृद्धि',
        className: 'text-xl sm:text-xl lg:text-2xl',
    },
    {
        text: 'Invest today, grow tomorrow',
        className: 'text-sm uppercase tracking-[0.28em] text-opsh-text/80 sm:text-2xl',
    },
] as const;

const inputShellClass =
    'w-full rounded border border-white/40 bg-white/80 px-4 py-3.5 text-sm text-opsh-black outline-none transition-colors placeholder:text-opsh-muted focus:border-opsh-primary focus:bg-white';

const selectShellClass = `${inputShellClass} cursor-pointer appearance-none pr-11`;

const StaticHeaderBanner = () => {
    const router = useRouter();

    const [searchParams, setSearchParams] = useState({
        property_type_slug: '',
        city: '',
        title: '',
        listing_type_slug: 'sale',
    });
    const [activeTaglineIndex, setActiveTaglineIndex] = useState(0);
    const [typedTagline, setTypedTagline] = useState('');
    const [isDeletingTagline, setIsDeletingTagline] = useState(false);

    const activeTagline = rotatingTaglines[activeTaglineIndex];

    useEffect(() => {
        const fullText = activeTagline.text;
        const isComplete = typedTagline === fullText;
        const isEmpty = typedTagline.length === 0;

        let delay = isDeletingTagline ? 45 : 85;

        if (!isDeletingTagline && isComplete) {
            delay = 1800;
        } else if (isDeletingTagline && isEmpty) {
            delay = 250;
        }

        const timeoutId = window.setTimeout(() => {
            if (!isDeletingTagline && isComplete) {
                setIsDeletingTagline(true);
                return;
            }

            if (isDeletingTagline && isEmpty) {
                setIsDeletingTagline(false);
                setActiveTaglineIndex((prev) => (prev + 1) % rotatingTaglines.length);
                return;
            }

            setTypedTagline((prev) =>
                isDeletingTagline
                    ? prev.slice(0, -1)
                    : fullText.slice(0, prev.length + 1)
            );
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [activeTagline, isDeletingTagline, typedTagline]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = () => {
        const query = new URLSearchParams();

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value.trim()) {
                query.set(key, value);
            }
        });

        router.push(`/properties-list?${query.toString()}`);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src={mainImg}
                    alt="Samriddhi real estate hero banner"
                    fill
                    priority
                    sizes="100vw"
                    quality={80}
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-opsh-black-dark/85 via-opsh-primary/65 to-opsh-black-dark/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_30%)]" />
            </div>

            <div className="relative mx-auto flex min-h-[680px] max-w-opsh flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
                <div className="max-w-3xl text-center lg:text-left">
                    <div className="inline-flex items-center rounded border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-opsh-text/80 backdrop-blur-sm">
                        Smart Property Discovery
                    </div>
                    <div className="mt-5 min-h-[2rem] sm:min-h-[5rem] lg:min-h-[1.75rem]">
                        <p
                            className={`font-medium text-opsh-text transition-all duration-300 ${activeTagline.className}`}
                            aria-live="polite"
                        >
                            <span>{typedTagline}</span>
                            <span className="ml-1 inline-block w-[1ch] animate-pulse text-opsh-secondary">
                                |
                            </span>
                        </p>
                    </div>
                    <h1 className="font-brand mt-4 text-4xl font-semibold leading-tight text-opsh-text sm:text-5xl lg:text-6xl">
                        Your Dream Land, Our Mission.
                    </h1>

                </div>

                <div className='flex justify-center'>
                    <div className="mt-10 max-w-6xl">
                        <div className="inline-flex w-full max-w-[200px] rounded border border-white/15 bg-white/10 p-1 backdrop-blur-md">
                            {[
                                { key: 'Buy', label: 'For Buy' },
                                { key: 'rent', label: 'For Rent' },
                            ].map((option) => {
                                const isActive = searchParams.listing_type_slug === option.key;

                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() =>
                                            setSearchParams((prev) => ({
                                                ...prev,
                                                listing_type_slug: option.key,
                                            }))
                                        }
                                        className={`flex-1 rounded py-2 text-sm font-semibold transition-colors ${isActive
                                            ? 'bg-white text-opsh-primary shadow-opsh-md'
                                            : 'text-opsh-text/85 hover:bg-white/10'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border border-white/10 bg-white/95 p-4 shadow-opsh-xl backdrop-blur-md sm:p-5 lg:p-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr,1.5fr,2fr,auto,auto] xl:items-end">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-primary">
                                        Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="property_type_slug"
                                            value={searchParams.property_type_slug}
                                            onChange={handleSelectChange}
                                            className={selectShellClass}
                                        >
                                            <option value="">Property Type</option>
                                            {propertyTypes.map((propertyType) => (
                                                <option key={propertyType.slug} value={propertyType.slug}>
                                                    {propertyType.label}
                                                </option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-opsh-primary" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-primary">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="city"
                                            value={searchParams.city}
                                            onChange={handleSelectChange}
                                            className={selectShellClass}
                                        >
                                            <option value="">All Cities</option>
                                            {locations.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-opsh-muted" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="title"
                                            value={searchParams.title}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Enter keywords, area, or landmark"
                                            className={`${inputShellClass} pr-11`}
                                        />
                                        <FaSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-opsh-muted" />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded border border-opsh-grey bg-opsh-background px-5 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-grey-light xl:min-w-[150px]"
                                    onClick={() => router.push('/properties-list')}
                                    aria-label="Open advanced search options"
                                >
                                    <GiSettingsKnobs className="rotate-90 text-base" />
                                    <span>Advanced Search</span>
                                </button>

                                <button
                                    type="button"
                                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded bg-opsh-secondary px-6 py-3 text-sm font-semibold text-opsh-text transition-colors hover:bg-opsh-primary-hover xl:min-w-[150px]"
                                    onClick={handleSearch}
                                    aria-label="Perform property search"
                                >
                                    <FaSearch className="h-4 w-4" />
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-opsh-text/80 sm:text-base lg:mx-0">
                            Search by property type, city, or keyword and move from first browse to serious shortlist without the clutter.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default StaticHeaderBanner;
