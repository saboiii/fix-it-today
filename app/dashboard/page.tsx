'use client';

import React, { useState } from "react";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import SortDropdown from "@/components/SortDropdown";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import SmallCard from "@/components/SmallCard";
import { animate } from "framer-motion";
import Image from "next/image";

import { useUser } from "@clerk/nextjs";
import CreatorCard from "@/components/CreatorCard";
import { FaPlus } from "react-icons/fa";
import CreateProductWindow from "@/components/CreateProductWindow";

const products = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    name: `Product ${i + 1}`,
    tags: [".obj", ".glb", ".gltf", ".stl", ".blend"],
}));

const MAX_TAGS = 2;


export default function Dashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editProduct, setEditProduct] = useState<any | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch("/api/product")
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { user, isLoaded } = useUser();

    const [openSort, setOpenSort] = useState<boolean>(false);
    const [filter, setFilter] = useState<number>(0);

    const topRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(0);
    const pageSize = 9;

    const filterOptions = useMemo(() => [
        "Sales",
        "Price: Low to High",
        "Price: High to Low"
    ], []);

    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {
        const s = search.toLowerCase();
        interface Product {
            _id?: string;
            creatorFullName?: string;
            name: string;
            downloadableAssets?: string[];
            tags?: string[];
            [key: string]: any;
        }
        const getTagsFromAssets = (assets?: string[]) => {
            if (!assets) return [];
            return assets
                .map(url => {
                    const match = url.match(/\.\w+$/);
                    return match ? match[0] : null;
                })
                .filter(Boolean);
        };

        return products.filter((product: Product) => {
            const tags = product.tags && product.tags.length > 0
                ? product.tags
                : getTagsFromAssets(product.downloadableAssets);

            return (
                !s ||
                product.name.toLowerCase().includes(s) ||
                tags.some((tag) => typeof tag === "string" && tag.toLowerCase().includes(s))
            );
        });
    }, [search, products]);


    const totalPages = useMemo(() => Math.ceil(filteredProducts.length / pageSize), [filteredProducts.length, pageSize]);

    const paginatedProducts = useMemo(
        () => filteredProducts.slice(page * pageSize, (page + 1) * pageSize),
        [filteredProducts, page, pageSize]
    );



    useEffect(() => {
        if (topRef.current) {
            animate(window.scrollY, topRef.current.offsetTop, {
                duration: 0.6,
                onUpdate: (v) => window.scrollTo(0, v),
                ease: [0.32, 0.72, 0.0, 1.0],
            });
        }
    }, [page]);

    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);
    const [showCreateProduct, setShowCreateProduct] = useState(false);

    return (
        <div ref={topRef} className="flex flex-col w-screen px-6 md:px-12">
            <div className="flex relative w-full mt-24 aspect-[1920/500]">
                <Image
                    src="/creator-placeholder.jpg"
                    alt="Creator Banner"
                    fill
                    className="object-cover w-full h-full object-center z-0 transition-[object-position] duration-500 ease-in-out"
                    priority
                    sizes="100vw"
                />
            </div>
            <div className="grid grid-cols-3 mt-4 gap-4">

                <div className="flex flex-col col-span-3 md:col-span-1 p-4 gap-4">
                    <button
                        className="button-secondary flex items-center justify-between"
                        onClick={() => setShowCreateProduct(true)}
                    >
                        Create Product <FaPlus className="inline ml-1" size={10} />
                    </button>
                    <CreatorCard />
                    {showCreateProduct && (
                        <CreateProductWindow onClose={() => setShowCreateProduct(false)} />
                    )}
                    {editProduct && (
                        <CreateProductWindow
                            onClose={() => setEditProduct(null)}
                            product={editProduct}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-4 col-span-3 md:col-span-2 bg-background p-4 rounded-lg">
                    <div className="flex flex-col items-center gap-4 py-2 w-full">
                        <div className="flex flex-row items-center justify-between gap-2 w-full">
                            <div className="relative flex w-full">
                                <input
                                    className="flex w-full py-2 searchBar pr-10 truncate"
                                    type="text"
                                    placeholder="Search for prints, categories, or tags..."
                                    value={search}
                                    onChange={handleSearch}
                                    autoComplete="off"
                                    spellCheck={false}
                                    aria-label="Search prints"
                                />
                                <span className="absolute hidden md:block right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none">
                                    <CiSearch />
                                </span>
                            </div>
                            <SortDropdown
                                openSort={openSort}
                                setOpenSort={setOpenSort}
                                filter={filter}
                                setFilter={setFilter}
                                filterOptions={filterOptions}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                        {loading ? (
                            <div className="col-span-3 text-center text-xs uppercase py-12">
                                Loading products...
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product, i) => (
                                <SmallCard
                                    key={product._id}
                                    i={product._id}
                                    name={product.name}
                                    description={product.description}
                                    tags={product.tags && product.tags.length > 0
                                        ? product.tags
                                        : (product.downloadableAssets || []).map((url: string) => {
                                            const match = url.match(/\.\w+$/);
                                            return match ? match[0] : null;
                                        }).filter(Boolean)
                                    }
                                    creatorFullName={product.creatorFullName}
                                    imageUrl={product.images && product.images.length > 0 ? product.images[0] : undefined}
                                    MAX_TAGS={MAX_TAGS}
                                    editable={true}
                                    onEdit={setEditProduct}
                                    product={product}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-xs uppercase py-12">
                                No results found.
                            </div>
                        )}
                    </div>

                    <div className="flex w-full justify-center items-center gap-4 mt-8 mb-12 min-h-[40px]">
                        <button
                            onClick={() => setPage(page - 1)}
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
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <GoChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}