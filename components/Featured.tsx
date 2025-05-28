'use client'

import { useEffect, useState } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { motion, MotionConfig, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { PiDotsThreeThin } from "react-icons/pi";
import Link from "next/link";
import Card from "./Card";

function Featured() {
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [cardWidth, setCardWidth] = useState(30);
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

    const TOTAL_CARDS = 6;
    const tags = [".obj", ".glb", ".gltf", ".stl", ".blend"];
    const MAX_TAGS = 4;

    const motionCardWidth = useMotionValue(30);

    useEffect(() => {
        setMounted(true);
        function handleResize() {
            const target = window.innerWidth <= 640 ? 65 : 30;
            animate(motionCardWidth, target, { duration: 0.5, ease: [0.32, 0.72, 0.0, 1.0] });
            setCardWidth(target);
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [motionCardWidth]);

    const onPrevClick = () => {
        if (current > 0) setCurrent(current - 1);
    };
    const onNextClick = () => {
        if (current < TOTAL_CARDS - 1) setCurrent(current + 1);
    };

    const slides = Array.from({ length: TOTAL_CARDS }, (_, i) => (
        <Card key={i} i={i} cardWidth={cardWidth} tags={tags} MAX_TAGS={MAX_TAGS} />
    ));

    if (!mounted) return null;

    return (
        <div className="flex flex-col w-full px-6 md:px-12 py-24 justify-center md:items-start items-center h-screen md:h-full">
            <h3 className="md:ml-12">We just launched.</h3>
            <h2 className="md:ml-12">Featured 3d models</h2>
            <div className="flex mt-4 md:mt-8 flex-row items-center justify-between w-full">

                <button onClick={onPrevClick} disabled={current == 0} className="cursor-pointer z-5 mr-4 disabled:opacity-30 disabled:cursor-not-allowed">
                    <GoChevronLeft size={20} />
                </button>
                <div className="relative flex items-center mt-4 overflow-hidden w-full overflow-x-hidden">
                    <motion.div
                        className="flex flex-no-wrap gap-8 items-center"
                        animate={{
                            x: motionCardWidth.get()
                                ? `calc(-${current * motionCardWidth.get()}vw - ${current * 2}rem)`
                                : undefined
                        }}
                        transition={{ duration: 0.7, ease: [0.32, 0.72, 0.0, 1.0] }}
                    >
                        {slides}
                        <div
                            className="flex flex-col h-[57vh] border-[0.5px] border-text/20 shrink-0 justify-center p-3 items-center"
                            style={{
                                width: cardWidth + "vw",
                            }}
                        >
                            <Link href='/browse' className="flex button-primary">
                                View More
                                <GoChevronRight size={12} className="ml-2 flex" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <button onClick={onNextClick} disabled={current == TOTAL_CARDS - 1} className="cursor-pointer z-5 ml-4 disabled:opacity-30 disabled:cursor-not-allowed">
                    <GoChevronRight size={20} />
                </button>

            </div>
        </div>
    );
}

export default Featured;