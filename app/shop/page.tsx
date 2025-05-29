'use client'
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import CategoryMenu from "@/components/CategoryMenu";
import CategoryDropdown from "@/components/CategoryDropdown";
import SortDropdown from "@/components/SortDropdown";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import SmallCard from "@/components/SmallCard";
import { animate } from "framer-motion";
import Image from "next/image";

const categories = [
    { label: "Electronics", subcategories: ["Microcontrollers", "Sensors", "Displays", "Motors", "Power Supplies"] },
    { label: "Filament", subcategories: ["PLA", "ABS", "PETG", "TPU", "Specialty"] },
    { label: "Printer", subcategories: ["FDM Printers", "Resin Printers", "Parts & Upgrades", "Maintenance", "Enclosures"] },
    { label: "Accessories", subcategories: ["Nozzles", "Build Plates", "Tools", "Storage", "Cleaning"] },
    { label: "Power Tools", subcategories: ["Drills", "Soldering Irons", "Rotary Tools", "Heat Guns", "Cutters"] },
    { label: "Gears", subcategories: ["Belts & Pulleys", "Bearings", "Lead Screws", "Couplers", "Stepper Motors"] },
];

const MAX_TAGS = 2;

export default function Shop() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [openSort, setOpenSort] = useState<boolean>(false);
    const [openCategory, setOpenCategory] = useState<boolean>(false);

    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>("Microcontrollers");
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

    const filteredProducts = useMemo(() => {
        const s = search.toLowerCase();
        interface Product {
            _id?: string;
            creatorFullName?: string;
            name: string;
            category?: string;
            subcategory?: string;
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
            // Only show products matching the selected subcategory (if any)
            const matchesSubcategory =
                !selectedSubCategory ||
                !product.subcategory ||
                product.subcategory === selectedSubCategory;

            const tags = product.tags && product.tags.length > 0
                ? product.tags
                : getTagsFromAssets(product.downloadableAssets);

            return (
                matchesSubcategory &&
                (
                    !s ||
                    product.name.toLowerCase().includes(s) ||
                    tags.some((tag) => typeof tag === "string" && tag.toLowerCase().includes(s))
                )
            );
        });
    }, [search, products, selectedSubCategory]);


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
                    src="/ad-placeholder.jpg"
                    alt="Advertisement Banner"
                    fill
                    className="object-cover w-full h-full object-center z-0 transition-[object-position] duration-500 ease-in-out"
                    priority
                    sizes="100vw"
                />
            </div>
            <div className="grid grid-cols-3 mt-4 gap-4">
                <CategoryMenu
                    categories={categories}
                    openIndex={openIndex}
                    setOpenIndex={setOpenIndex}
                    selectedSubCategory={selectedSubCategory}
                    setSelectedSubCategory={setSelectedSubCategory}
                />
                <div className="flex flex-col gap-4 col-span-3 md:col-span-2">
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
                        <CategoryDropdown
                            categories={categories}
                            openCategory={openCategory}
                            setOpenCategory={setOpenCategory}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            selectedSubCategory={selectedSubCategory}
                            setSelectedSubCategory={setSelectedSubCategory}
                        />
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