'use client';

import React from "react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import SortDropdown from "@/components/SortDropdown";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import SmallCard from "@/components/SmallCard";
import { animate } from "framer-motion";
import Image from "next/image";
import { AiOutlineProduct } from "react-icons/ai";
import { BsPeople, BsPersonCheck, BsPlus } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";

const products = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    name: `Product ${i + 1}`,
    tags: [".obj", ".glb", ".gltf", ".stl", ".blend"],
}));

const MAX_TAGS = 2;

interface CreatorPageProps {
    params: Promise<{ creatorId: string }>
}

export default function CreatorPage({ params }: CreatorPageProps) {
    const { creatorId } = React.use(params);

    // Fetch creator config/decor from MongoDB using creatorId

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
        return products.filter(product =>
            !s ||
            product.name.toLowerCase().includes(s) ||
            product.tags.some(tag => tag.toLowerCase().includes(s))
        );
    }, [search]);

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

                <div className="flex flex-col col-span-3 md:col-span-1">
                    <div className="flex items-center gap-6 p-4">
                        <div className="flex flex-col gap-5">
                            <Image
                                src="/banner-placeholder.png"
                                alt="Creator Profile Photo"
                                width={100}
                                height={100}
                                className="rounded-full object-cover aspect-square"
                                loading="lazy"
                            />
                            <button className="button-primary flex items-center"><BsPlus className="inline mr-1" size={15}/> Follow</button>
                        </div>
                        <div className="flex gap-3 flex-col">
                            <h3 className="mb-2">Creator Name</h3>
                            <div className="creatorStat"><AiOutlineProduct className="inline" /> Products: <span className="text-accent">12</span></div>
                            <div className="creatorStat"><BsPeople className="inline" /> Followers: <span className="text-accent">2.7K</span></div>
                            <div className="creatorStat"><FaRegStar className="inline" /> Rating: <span className="text-accent">12</span></div>
                            <div className="creatorStat"><BsPersonCheck className="inline" /> Joined: <span className="text-accent">13 Months Ago</span></div>
                        </div>
                    </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full min-h-[400px]">
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product, i) => (
                                <SmallCard
                                    key={product.id}
                                    i={product.id}
                                    tags={product.tags}
                                    MAX_TAGS={MAX_TAGS}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-400 py-12">
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