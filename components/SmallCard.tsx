import Image from "next/image";
import Link from "next/link";
import { PiDotsThreeThin } from "react-icons/pi";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { RiEditBoxLine } from "react-icons/ri";

export default function SmallCard({
    i,
    name,
    description,
    tags,
    creatorFullName,
    imageUrl,
    MAX_TAGS,
    editable,
    onEdit,
    product
}: {
    i: number | string,
    name: string,
    description: string,
    tags: string[],
    creatorFullName?: string,
    imageUrl?: string,
    MAX_TAGS: number,
    editable?: boolean,
    onEdit?: (product: any) => void,
    product?: any
}) {
    const [liked, setLiked] = useState(false);
    // Placeholder for Clerk authentication check
    // const isLoggedIn = false; // integrate Clerk later

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        // if (!isLoggedIn) {
        //     // Show login popup here in the future
        //     return;
        // }
        setLiked((prev) => !prev);
    };
    return (
        <div
            key={i}
            className="relative flex flex-col justify-between overflow-visible shrink-0 transition-transform ease-in-out p-3 items-center border-[0.5px] dark:border-none"
        >
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-40 object-cover rounded-md mb-2"
                />
            )}

            <button
                className="absolute right-4 top-4 z-5 bg-transparent border-none p-0 m-0"
                onClick={handleLike}
                aria-label={liked ? "Unlike" : "Like"}
                tabIndex={0}
                type="button"
            >
                <MotionConfig transition={{ duration: 0.15, ease: "easeInOut" }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {liked ? (
                            <motion.span
                                key="liked"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                            >
                                <IoIosHeart size={22} className="text-accent drop-shadow" />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="unliked"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                            >
                                <IoIosHeartEmpty size={22} className="text-white drop-shadow" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </MotionConfig>
            </button>

            <div className="flex flex-col w-full pt-3">
                <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex smallCardTitle">{name}</div>
                    {creatorFullName && (
                        <span className="flex smallCardAuthor">{creatorFullName}</span>
                    )}
                </div>
                <div className="mt-3 w-full truncate smallCardDescription">
                    {description}
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
                {editable && (
                    <div
                        className="button-primary flex mt-3 cursor-pointer"
                        onClick={() => onEdit && onEdit(product)}
                    >
                        Edit
                        <RiEditBoxLine className="flex ml-3" />
                    </div>
                )}
            </div>
        </div>
    );
}
