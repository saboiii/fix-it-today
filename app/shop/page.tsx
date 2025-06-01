'use client'
import { useEffect, useState, useRef, useMemo } from "react";
import CategoryMenu from "@/components/CategoryMenu";
import CategoryDropdown from "@/components/CategoryDropdown";
import Image from "next/image";
import ProductDisplayGrid from "@/components/ProductDisplayGrid";
import { SHOP_CATEGORIES, COMMON_FILTER_OPTIONS } from "@/lib/constants";



const MAX_TAGS = 2;

export default function Prints() {
    const [allFetchedProducts, setAllFetchedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState<boolean>(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(SHOP_CATEGORIES[0]?.subcategories[0] || null); // Default to first subcategory

    const pageTopRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        fetch("/api/product")
            .then(res => res.json())
            .then(data => {
                setAllFetchedProducts(data.products || []);
                setLoading(false);
            })
            .catch(() => {
                setAllFetchedProducts([]);
                setLoading(false);
            });
    }, []);

    const productsForDisplay = useMemo(() => {
        if (!selectedSubCategory) return allFetchedProducts; // Show all if no subcategory selected, or handle differently
        return allFetchedProducts.filter(p => p.subcategory === selectedSubCategory);
    }, [allFetchedProducts, selectedSubCategory]);

    return (
        <div ref={pageTopRef} className="flex flex-col w-screen px-6 md:px-12">
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
            <div className="grid grid-cols-1 md:grid-cols-3 mt-4 gap-4">
                <div className="md:col-span-1">
                    <CategoryMenu
                        categories={SHOP_CATEGORIES}
                        openIndex={openIndex}
                        setOpenIndex={setOpenIndex}
                        selectedSubCategory={selectedSubCategory}
                        setSelectedSubCategory={setSelectedSubCategory}
                    />
                </div>

                <div className="flex flex-col gap-4 md:col-span-2">
                    <div className="md:hidden">
                        <CategoryDropdown
                            categories={SHOP_CATEGORIES}
                            openCategory={openCategoryDropdown}
                            setOpenCategory={setOpenCategoryDropdown}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            selectedSubCategory={selectedSubCategory}
                            setSelectedSubCategory={setSelectedSubCategory}
                        />
                    </div>
                    <ProductDisplayGrid
                        initialProducts={productsForDisplay}
                        loading={loading}
                        filterOptions={COMMON_FILTER_OPTIONS}
                        MAX_TAGS={MAX_TAGS}
                        isEditable={false}
                        topScrollRef={pageTopRef}
                        gridItemColSpan="md:col-span-3"
                    />
                </div>
            </div>
        </div>
    );
}