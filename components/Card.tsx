import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PiDotsThreeThin } from "react-icons/pi";
import LinkToolTip from "./LinkToolTip";

export default function Card({ i, cardWidth, tags, MAX_TAGS }: { i: number, cardWidth: number, tags: string[], MAX_TAGS: number }) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

    return (
        <Link
            href='/prints'
            onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }}
            onMouseLeave={() => setTooltip(null)}
            key={i}
            className="relative flex flex-col justify-between overflow-visible shrink-0 transition-transform ease-in-out p-3 items-center border-[0.5px] dark:border-none"
            style={{
                width: cardWidth + "vw",
            }}
        >
            <LinkToolTip tooltip={tooltip} title={undefined} />
            <Image
                src='/product-placeholder.jpg'
                alt={`Slide ${i + 1}`}
                width={500}
                height={500}
                className="object-cover w-full aspect-square flex object-center"
            />
            <div className="flex flex-col w-full pt-3">
                <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex cardTitle">Featured 3D Model</div>
                    <div className="flex cardTag">N°{i + 1}</div>
                </div>
                <div className="flex cardDescription mt-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Praesent vehicula metus id enim fermentum,
                    consequat sollicitudin nibh porttitor.
                    Donec ligula ipsum, efficitur mollis turpis eu,
                    imperdiet scelerisque nunc.
                </div>
                <div className="flex justify-start gap-2 mt-3 items-center overflow-x-hidden">
                    {tags.slice(0, MAX_TAGS).map((tag, idx) => (
                        <div className="flex tags" key={tag}>{tag}</div>
                    ))}
                    {tags.length > MAX_TAGS && (
                        <div className="flex items-center text-lg text-gray-400">
                            <PiDotsThreeThin />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
