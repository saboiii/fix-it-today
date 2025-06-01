'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import CreatorCard from "@/components/CreatorCard";
import { FaPlus } from "react-icons/fa";
import ProductDisplayGrid from "@/components/ProductDisplayGrid";
import ProductWindow from "@/components/ProductWindow";
import { BsPlus } from "react-icons/bs";

const MAX_TAGS = 2;

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [isMounted, setIsMounted] = useState(false);
    const pageTopRef = useRef<HTMLDivElement>(null);

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [editProductData, setEditProductData] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchUserProducts = () => {
        if (isLoaded && user) { // Ensure user is loaded before fetching
            setLoading(true);
            // Assuming /api/product returns all products, filter client-side for dashboard
            // OR modify API to fetch products by user: /api/product?userId=${user.id}
            fetch("/api/product")
                .then(res => res.json())
                .then(data => {
                    const userSpecificProducts = (data.products || []).filter((p: Product) => p.creatorUserId === user.id);
                    setAllProducts(userSpecificProducts);
                    setLoading(false);
                })
                .catch(() => {
                    setAllProducts([]);
                    setLoading(false);
                });
        } else if (isLoaded && !user) { // User not logged in
            setAllProducts([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProducts();
    }, [isLoaded, user]);

    const dashboardFilterOptions = useMemo(() => [
        "Most Recent", // Default sort for dashboard
        "Sales",
        "Price: Low to High",
        "Price: High to Low",
    ], []);

    const handleProductModalClose = () => {
        setShowCreateProductModal(false);
        setEditProductData(null);
    };

    const handleProductSaved = () => {
        handleProductModalClose();
        fetchUserProducts(); // Re-fetch products after save
    };

    const openEditModal = (productToEdit: Product) => {
        setEditProductData(productToEdit);
        setShowCreateProductModal(true);
    };

    const openCreateModal = () => {
        setEditProductData(null);
        setShowCreateProductModal(true);
    };

    if (!isMounted || !isLoaded) {
        return <div className="flex w-full h-screen items-center justify-center text-xl">Loading Dashboard...</div>;
    }
    if (isLoaded && !user) {
        return <div className="flex w-full h-screen items-center justify-center text-xl">Please sign in to view your dashboard.</div>;
    }


    return (
        <div ref={pageTopRef} className="flex flex-col w-screen px-6 md:px-12">
            <div className="flex relative w-full mt-24 aspect-[1920/500]">
                <Image
                    src="/creator-placeholder.jpg"
                    alt="Creator Banner"
                    fill
                    className="object-cover w-full h-full object-center z-0"
                    priority
                    sizes="100vw"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 mt-4 gap-4">
                <div className="flex flex-col md:col-span-1 p-0 md:p-4 gap-4">

                    <CreatorCard creatorId={user?.id.substring(5)} />
                    <button
                        className="button-secondary flex items-center justify-center md:justify-between w-full"
                        onClick={openCreateModal}
                    >
                        Create Product <BsPlus className="inline ml-3" size={16} />
                    </button>
                    {showCreateProductModal && (
                        <ProductWindow
                            onClose={handleProductModalClose}
                            product={editProductData ?? undefined}
                            onProductCreated={handleProductSaved}
                            onProductUpdated={handleProductSaved}
                        />
                    )}
                </div>

                <div className="flex flex-col md:col-span-2 bg-background md:p-4 rounded-lg">
                    <ProductDisplayGrid
                        initialProducts={allProducts} // Already filtered for the user
                        loading={loading}
                        filterOptions={dashboardFilterOptions}
                        MAX_TAGS={MAX_TAGS}
                        isEditable={true}
                        onProductEdit={openEditModal}
                        topScrollRef={pageTopRef} // Optional: for scrolling the whole page on pagination
                        gridItemColSpan="md:col-span-3" // For loading/empty states to span 3 cols on md+
                    />
                </div>
            </div>
        </div>
    );
}