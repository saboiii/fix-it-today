"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { HiCubeTransparent } from "react-icons/hi2";
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import { AnimatePresence, motion } from "framer-motion";

// Dynamically import Three.js canvas for SSR safety
const ModelViewer = dynamic(() => import("@/components/ModelViewer/ModelViewer"), { ssr: false });

const MODEL_EXTENSIONS = [".glb", ".gltf", ".obj", ".stl", ".fbx"];
const ARCHIVE_EXTENSIONS = [".zip", ".rar", ".7z", ".blend"];

function getLightweightModel(models: string[]): string | null {
    if (!models || models.length === 0) return null;
    // Prefer glb/gltf, then obj/stl/fbx, then others
    for (const ext of MODEL_EXTENSIONS) {
        const found = models.find((url) => url.toLowerCase().endsWith(ext));
        if (found) return found;
    }
    // If only archives/blend, return the first one
    for (const ext of ARCHIVE_EXTENSIONS) {
        const found = models.find((url) => url.toLowerCase().endsWith(ext));
        if (found) return found;
    }
    return models[0] || null;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;

    // All hooks at the top!
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const res = await fetch(`/api/getProduct/${slug}`);
            if (!res.ok) {
                setProduct(null);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setProduct(data.product);
            setLoading(false);
        }
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (direction) {
            const timeout = setTimeout(() => setDirection(null), 350);
            return () => clearTimeout(timeout);
        }
    }, [direction, selectedIdx]);

    // Now you can return early
    if (loading) {
        return <div className="flex items-center justify-center h-screen w-screen">Loading...</div>;
    }
    if (!product) {
        return <div className="flex items-center justify-center h-screen w-screen">Product not found.</div>;
    }

    const images: string[] = product.images || [];
    const models: string[] = product.downloadableAssets || [];
    const modelUrl = getLightweightModel(models);

    const tabs = [
        ...(modelUrl ? [{ type: "model" as const, label: "3D Model" }] : []),
        ...images.map((img, idx) => ({ type: idx as number, label: `Image ${idx + 1}` })),
    ];
    const handleTabClick = (idx: number) => {
        if (idx === selectedIdx) return;
        setDirection(idx > selectedIdx ? "right" : "left");
        setSelectedIdx(idx);
    };

    const goLeft = () => {
        if (selectedIdx > 0) {
            setDirection("left");
            setSelectedIdx(selectedIdx - 1);
        }
    };
    const goRight = () => {
        if (selectedIdx < tabs.length - 1) {
            setDirection("right");
            setSelectedIdx(selectedIdx + 1);
        }
    };

    const selected = tabs[selectedIdx]?.type;

    return (
        <div className="flex flex-col w-screen lg:h-screen pt-24 pb-8 px-6 md:px-14">
            <div className='grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-4 w-full h-full gap-4'>
                {/* image/model */}
                <div className='flex flex-col lg:flex-row lg:col-span-3 lg:row-span-3 h-full gap-4 rounded-lg overflow-hidden'>
                    <div className='flex flex-row lg:flex-col grow-4 order-2 lg:order-1 h-[15vh] lg:h-full bg-text/5 p-4 gap-2 grow overscroll-none overflow-x-scroll lg:overflow-y-scroll'>
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab.type}
                                className={`flex lg:w-full items-center ${selectedIdx === idx ? "opacity-100" : "opacity-50"} transition-opacity duration-300`}
                                onClick={() => handleTabClick(idx)}
                            >
                                {tab.type === "model" ? (
                                    <span className="text-xs rounded-lg border font-semibold h-full aspect-square lg:w-full flex items-center justify-center transition-opacity duration-300 ease-in-out">
                                        <HiCubeTransparent size={25} />
                                    </span>
                                ) : (
                                    <div className={`flex hover:opacity-100 hover:cursor-pointer h-full lg:w-full aspect-square relative rounded-lg overflow-hidden transition-opacity duration-300 ease-in-out ${selectedIdx === idx ? "opacity-100" : "opacity-50"}`}>
                                        <Image
                                            src={images[tab.type as number]}
                                            alt={`Thumbnail ${tab.type}`}
                                            fill
                                            quality={10}
                                            className="object-cover w-full"
                                        />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className='flex flex-col order-1 lg:order-2 h-full grow-6 aspect-square items-center justify-center overflow-hidden relative'>
                        <div className="flex items-center justify-center relative h-full w-full">
                            <button className="controlsTabs left-6 z-10" onClick={goLeft} disabled={selectedIdx === 0}>
                                <div className="rounded-full bg-background/60 ">
                                    <GoChevronLeft size={30} />
                                </div>
                            </button>

                            <div className="relative w-full aspect-square overflow-hidden"> {/* Viewport */}
                                <div
                                    className="w-full h-full transition-transform duration-700 ease-in-out" /* Transform Wrapper */
                                    style={{
                                        transform: `translateX(-${selectedIdx * 100}%)`
                                    }}
                                >
                                    <div
                                        className="flex h-full" /* Strip */
                                        style={{
                                            width: `${tabs.length * 100}%` // Makes Strip N times wider than its parent (Transform Wrapper)
                                        }}
                                    >
                                        {tabs.map((tab, idx) => (
                                            <div
                                                key={tab.type}
                                                // THIS IS THE CRITICAL CHANGE: Added `relative`
                                                className="relative h-full flex-shrink-0" /* Slide: now a positioned container */
                                                style={{
                                                    // Each slide is 1/Nth of the Strip's width.
                                                    // Since Strip is N * ViewportWidth, each slide becomes ViewportWidth.
                                                    width: `${100 / tabs.length}%`
                                                }}
                                                aria-hidden={selectedIdx !== idx}
                                            >
                                                {/* Optional: Inner div for centering content if Image/ModelViewer doesn't fill */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {tab.type === "model" && modelUrl ? (
                                                        <ModelViewer url={modelUrl} />
                                                    ) : (
                                                        typeof tab.type === "number" &&
                                                        images[tab.type] && images[tab.type] !== "" && (
                                                            <Image
                                                                src={images[tab.type]}
                                                                alt={`Product Image ${tab.type}`}
                                                                fill
                                                                quality={80}
                                                                className="object-cover w-full" // Ensures image covers the area
                                                                loading="lazy"
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button className="controlsTabs right-6 z-10" onClick={goRight} disabled={selectedIdx === tabs.length - 1}>
                                <div className="rounded-full bg-background/60  ">
                                    <GoChevronRight size={30} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* product details */}
                <div className='flex lg:row-span-4 bg-text/3 p-6 flex-col rounded-lg overflow-y-scroll'>
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                    <div className="mb-2">{product.description}</div>
                </div>

                {/* more product details */}
                <div className='flex lg:col-span-3 lg:row-span-1 bg-text/3 rounded-lg'>

                </div>
            </div>
        </div>
    );
}