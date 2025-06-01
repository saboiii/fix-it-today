'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CiSearch } from 'react-icons/ci';
import SortDropdown from '@/components/SortDropdown';
import SmallCard from '@/components/SmallCard';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';
import { animate } from 'framer-motion';

interface ProductDisplayGridProps {
    initialProducts: Product[];
    loading: boolean;
    pageSize?: number;
    filterOptions: string[];
    showSearch?: boolean;
    showSortDropdown?: boolean;
    onProductEdit?: (product: Product) => void;
    isEditable?: boolean;
    MAX_TAGS: number;
    gridItemColSpan?: string;
    topScrollRef?: React.RefObject<HTMLDivElement | null>;
}

const DEFAULT_PAGE_SIZE = 9;

export default function ProductDisplayGrid({
    initialProducts,
    loading,
    pageSize = DEFAULT_PAGE_SIZE,
    filterOptions,
    showSearch = true,
    showSortDropdown = true,
    onProductEdit,
    isEditable = false,
    MAX_TAGS,
    gridItemColSpan = "col-span-full",
    topScrollRef
}: ProductDisplayGridProps) {
    const [search, setSearch] = useState("");
    const [openSort, setOpenSort] = useState<boolean>(false);
    const [currentFilterIndex, setCurrentFilterIndex] = useState<number>(0);
    const [page, setPage] = useState(0);

    const internalScrollRef = useRef<HTMLDivElement>(null);
    const scrollTargetRef = topScrollRef || internalScrollRef;

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    }, []);

    const getTagsFromAssets = (assets?: string[]) => {
        if (!assets) return [];
        return assets
            .map(url => {
                const match = url.match(/\.\w+$/);
                return match ? match[0] : null;
            })
            .filter(Boolean) as string[];
    };

    const searchedProducts = useMemo(() => {
        const s = search.toLowerCase();
        if (!s) return initialProducts;
        return initialProducts.filter((product) => {
            const tags = getTagsFromAssets(product.downloadableAssets);

            const nameMatch = product.name.toLowerCase().includes(s);
            const tagMatch = tags.some((tag) => typeof tag === "string" && tag.toLowerCase().includes(s));
            const creatorMatch = product.creatorFullName ? product.creatorFullName.toLowerCase().includes(s) : false;
            const descriptionMatch = product.description ? product.description.toLowerCase().includes(s) : false;

            return nameMatch || tagMatch || creatorMatch || descriptionMatch;
        });
    }, [search, initialProducts]);

    const sortedProducts = useMemo(() => {
        let productsToSort = [...searchedProducts];
        const filterType = filterOptions[currentFilterIndex];

        switch (filterType) {
            case "Sales":
                productsToSort.sort((a, b) => (b.numberSold || 0) - (a.numberSold || 0));
                break;
            case "Price: Low to High":
                productsToSort.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "Price: High to Low":
                productsToSort.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "Most Recent":
                productsToSort.sort((a, b) => new Date(b.dateReleased || 0).getTime() - new Date(a.dateReleased || 0).getTime());
                break;
            default:
                break;
        }
        return productsToSort;
    }, [searchedProducts, currentFilterIndex, filterOptions]);

    const totalPages = useMemo(() => Math.ceil(sortedProducts.length / pageSize), [sortedProducts.length, pageSize]);
    const paginatedProducts = useMemo(
        () => sortedProducts.slice(page * pageSize, (page + 1) * pageSize),
        [sortedProducts, page, pageSize]
    );

    useEffect(() => {
        if (scrollTargetRef.current && page !== 0) { // Avoid scroll on initial load if page is 0
            animate(window.scrollY, scrollTargetRef.current.offsetTop, {
                duration: 0.6,
                onUpdate: (v) => window.scrollTo(0, v),
                ease: [0.32, 0.72, 0.0, 1.0],
            });
        }
    }, [page, scrollTargetRef]);

    useEffect(() => {
        setPage(0); // Reset page when the underlying product list changes
    }, [initialProducts]);

    return (
        <div ref={internalScrollRef} className='mb-16'>
            {(showSearch || showSortDropdown) && (
                <div className="flex flex-col items-center gap-2 py-2 w-full"> {/* Reduced gap */}
                    <div className="flex flex-row items-center justify-between gap-2 w-full">
                        {showSearch && (
                            <div className="relative flex w-full">
                                <input
                                    className="flex w-full py-2 searchBar pr-10 truncate"
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    autoComplete="off"
                                    spellCheck={false}
                                    aria-label="Search products"
                                />
                                <span className="absolute hidden md:block right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none">
                                    <CiSearch />
                                </span>
                            </div>
                        )}
                        {showSortDropdown && (
                            <SortDropdown
                                openSort={openSort}
                                setOpenSort={setOpenSort}
                                filter={currentFilterIndex}
                                setFilter={setCurrentFilterIndex}
                                filterOptions={filterOptions}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-4">
                {loading ? (
                    <div className={`${gridItemColSpan} text-center text-xs uppercase py-12`}>
                        Loading products...
                    </div>
                ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((p) => (
                        <SmallCard
                            key={p._id}
                            product={p}
                            MAX_TAGS={MAX_TAGS}
                            editable={isEditable}
                            onEdit={onProductEdit ? () => onProductEdit(p) : undefined}
                        />
                    ))
                ) : (
                    <div className={`${gridItemColSpan} text-center text-xs uppercase py-12`}>
                        No results found.
                    </div>
                )}
            </div>

            {!loading && paginatedProducts.length > 0 && totalPages > 1 && (
                <div className="flex w-full justify-center items-center gap-4 mt-8 mb-12 min-h-[40px]">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="disabled:opacity-40"
                        aria-label="Previous page"
                    >
                        <GoChevronLeft size={24} />
                    </button>
                    <span className="text-sm">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="disabled:opacity-40"
                        aria-label="Next page"
                    >
                        <GoChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}