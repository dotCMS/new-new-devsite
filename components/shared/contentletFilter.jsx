'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
// import Image from 'next/image';
import useCollection from '@/hooks/useCollection';

import { ArrowDownIcon, SearchIcon } from './icons';
import ListingContentlets from './listingContentlets';
import CategoryButton from './categoryButton';

export default function ContentletFilter({
    Card,
    limit = 9,
    contentType,
    queryConfig,
    categories = [],
    initialCollection
}) {
    const { collection, setFilter, setPage, setSearch } = useCollection({
        limit,
        search: '',
        contentType,
        queryConfig,
        initialCollection
    });

    const loaderRef = useRef(null);

    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && collection.total > collection.contentlets.length) {
                setPage((prevPage) => prevPage + 1);
            }
        },
        [collection.contentlets.length, collection.total, setPage]
    );

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        };
        const observer = new IntersectionObserver(handleObserver, option);
        const currentLoaderRef = loaderRef.current;
        if (currentLoaderRef) observer.observe(currentLoaderRef);

        return () => {
            if (currentLoaderRef) observer.unobserve(currentLoaderRef);
        };
    }, [handleObserver]);

    return (
        <>
            <div className="flex min-h-12 w-full justify-between gap-x-4 py-6">
                <div className="hidden w-2/3 flex-wrap gap-2 gap-x-4 md:flex">
                    <CategoriesButtons categories={categories} setFilter={setFilter} />
                </div>
                <div className="relative flex h-12 w-full items-center justify-center text-white outline-none md:w-[382px]">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        onChange={(e) => setSearch(e.target.value)}
                        className="block size-full rounded-lg bg-blue-100 p-3 ps-11 text-sm text-blue-600 outline-none placeholder:text-blue-600"
                        placeholder="Search in Insights"
                    />
                </div>
            </div>

            <ListingContentlets Card={Card} contentlets={collection.contentlets} />

            {collection.total > collection.contentlets.length && (
                <div className="mt-16 flex items-center justify-center">
                    <div
                        ref={loaderRef}
                        className="px-6 py-4 text-base font-semibold text-blue-600">
                        {collection.total > collection.contentlets.length && (
                            <span className="text-blue-600">Loading more...</span>
                        )}
                    </div>
                    {/* <button
                        className="flex h-14 items-center gap-4 rounded-md bg-blue-700 px-6 py-4 text-base font-semibold text-white"
                        onClick={() => setPage((prevPage) => prevPage + 1)}>
                        <span>Load More</span>
                        <Image
                            src="/assets/icons/chevron-button-dark.svg"
                            width={24}
                            height={24}
                            alt="Arrow Right"
                        />
                    </button> */}
                </div>
            )}
        </>
    );
}

const CategoriesButtons = ({ categories, setFilter }) => {
    const [active, setActive] = useState('*');
    // Destructure the categories
    const { list = [], field } = categories;
    const allCategory = { key: '*', categoryName: 'All' };

    // Split the categories into main and more
    const mainCategories = [allCategory, ...list.slice(0, 3)];
    const moreCategories = list.slice(3);

    // Hook to manage the dropdown visibility
    const [showMore, setShowMore] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMore(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    // Function to set the category filter
    const setCategory = (value) => {
        setFilter((prev) => ({
            ...prev,
            category: {
                value,
                field
            }
        }));
        setActive(value);
    };

    return (
        <>
            {mainCategories.map(({ key, categoryName }) => (
                <CategoryButton key={key} active={active === key} onClick={() => setCategory(key)}>
                    {categoryName}
                </CategoryButton>
            ))}
            {!!moreCategories.length && (
                <div className="relative z-50 flex" ref={dropdownRef}>
                    <CategoryButton onClick={() => setShowMore((prev) => !prev)}>
                        More <ArrowDownIcon />
                    </CategoryButton>
                    <div
                        className={`absolute top-12 z-50 flex max-h-80 w-52 flex-col gap-5 overflow-y-auto bg-white px-5 py-4 shadow-2xl ${
                            !showMore && 'hidden'
                        }`}>
                        {moreCategories.map(({ key, categoryName }) => (
                            <CategoryButton
                                key={key}
                                active={active === key}
                                onClick={() => setCategory(key)}>
                                {categoryName}
                            </CategoryButton>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
