'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import CreatorCard from "@/components/CreatorCard";
import ProductDisplayGrid from "@/components/ProductDisplayGrid";
import { useParams } from "next/navigation";
import { COMMON_FILTER_OPTIONS } from "@/lib/constants";

const MAX_TAGS = 2;

export default function CreatorPage() {
    const [isMounted, setIsMounted] = useState(false);
    const pageTopRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const creatorId = params.creatorId as string;

    const [creatorProducts, setCreatorProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const fullCreatorUserId = `user_${creatorId}`;
    
    useEffect(() => {
        setIsMounted(true);
        if (creatorId) {
            fetchCreatorProducts();
        }
    }, []);

    const fetchCreatorProducts = () => {
        setLoading(true);
        fetch("/api/product")
            .then(res => res.json())
            .then(data => {
                const products = (data.products || []) ;
                const creatorSpecificProducts = products.filter((p: Product) => p.creatorUserId === fullCreatorUserId);
                setCreatorProducts(creatorSpecificProducts);
                setLoading(false);
            })
            .catch(() => {
                setCreatorProducts([]);
                setLoading(false);
            });
    };

    if (!isMounted) {
        return <div className="flex w-full h-screen items-center justify-center text-xl">Loading...</div>
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
                    <CreatorCard creatorId={creatorId} />
                </div>

                <div className="flex flex-col md:col-span-2 bg-background md:p-4 rounded-lg">
                    <ProductDisplayGrid
                        initialProducts={creatorProducts}
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