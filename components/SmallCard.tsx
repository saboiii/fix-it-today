import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { PiDotsThreeThin } from "react-icons/pi";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import LinkToolTip from "./LinkToolTip";
import { useUser } from "@clerk/nextjs";
import { RiEditBoxLine } from "react-icons/ri";

interface SmallCardProps {
    product: Product;
    MAX_TAGS: number;
    editable?: boolean;
    onEdit?: (product: Product) => void;
}

export default function SmallCard({
    product,
    MAX_TAGS,
    editable,
    onEdit,
}: SmallCardProps) {
    const { isSignedIn, user } = useUser();
    const [liked, setLiked] = useState(user?.id ? product.likes?.includes?.(user.id) ?? false : false);
    const [likeCount, setLikeCount] = useState(product.likes?.length ?? 0);
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
    const [hoveringLink, setHoveringLink] = useState(false);
    const router = useRouter();
    const images = product.images || [];
    const imageUrl = images && images.length > 0 ? images[0] : undefined;

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSignedIn) {
            router.push("/sign-in?redirect=/products");
            return;
        }
        if (!user?.id) return;

        setLiked(true);
        setLikeCount((prev: number) => prev + 1);

        try {
            const res = await fetch(`/api/product/${product._id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, action: "like" }),
            });
            const data = await res.json();
            if (res.ok) {
                setLiked(data.liked);
                setLikeCount(data.likeCount);
            } else {
                setLiked(false);
                setLikeCount((prev: number) => Math.max(0, prev - 1));
            }
        } catch (err) {
            setLiked(false);
            setLikeCount((prev: number) => Math.max(0, prev - 1));
        }
    };

    const handleUnlike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSignedIn) {
            router.push("/sign-in?redirect=/products");
            return;
        }

        if (!user?.id) return;
        setLiked(false);
        setLikeCount((prev: number) => Math.max(0, prev - 1));

        try {
            const res = await fetch(`/api/product/${product._id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, action: "unlike" }),
            });
            const data = await res.json();
            if (res.ok) {
                setLiked(data.liked);
                setLikeCount(data.likeCount);
            } else {
                setLiked(true);
                setLikeCount((prev: number) => prev + 1);
            }
        } catch (err) {
            setLiked(true);
            setLikeCount((prev: number) => prev + 1);
        }
    };

    const getTagsFromAssets = (assets?: string[]) => {
        if (!assets) return [];
        return assets
            .map(url => {
                const match = url.match(/\.\w+$/);
                return match ? match[0] : null;
            })
            .filter(Boolean) as string[];
    };

    const displayTags = getTagsFromAssets(product.downloadableAssets);

    const handleCardClick = (e: React.MouseEvent) => {
        // Only navigate if not clicking on the creator link
        if (!hoveringLink) {
            window.open(`/products/${product.slug}`, '_blank');
        }
    };

    return (
        <div
            className="relative hover:cursor-pointer bg-text/8 dark:bg-text/2 rounded-lg flex flex-col justify-between overflow-visible shrink-0 transition-transform ease-in-out p-3 items-center"
            onMouseMove={e => {
                if (!hoveringLink) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={handleCardClick}
            tabIndex={0}
            role="button"
        >
            {!hoveringLink && <LinkToolTip tooltip={tooltip} title={"View " + product.name} />}
            <div className="w-full flex flex-col items-center justify-start">
                {imageUrl && (
                    <div className="flex w-full rounded-md overflow-hidden mb-2">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="object-cover w-full aspect-square"
                        />
                    </div>
                )}
                <div className="flex flex-col items-start w-full pt-2">
                    <div className="flex flex-row items-center w-full justify-between">
                        <div className="w-full truncate smallCardTitle">{product.name}</div>
                        <div className="flex flex-row items-center text-xs bg-text/10 dark:bg-text/5 rounded-full px-2 py-1 font-semibold gap-1 mr-2">
                            {likeCount}
                            <IoIosHeart />
                        </div>
                    </div>
                    {product.creatorFullName && (
                        <Link
                            href={`/creators/${product.creatorUserId.substring(5)}`}
                            className="smallCardAuthor truncate"
                            onMouseEnter={() => {
                                setHoveringLink(true);
                                setTooltip(null);
                            }}
                            onMouseLeave={() => setHoveringLink(false)}
                            onClick={e => {
                                e.stopPropagation(); // Prevent card click
                            }}
                        >
                            {product.creatorFullName}
                        </Link>
                    )}
                    <div className="mt-2 w-full truncate smallCardDescription">
                        {product.description}
                    </div>
                    <div className="mt-2 w-full justify-center py-2 px-3 rounded-lg bg-text/10 dark:bg-text/5 flex items-center flex-row gap-2">
                        <div className="font-bold text-lg">
                            {typeof product.price === "number"
                                ? product.price.toLocaleString("en-SG", { style: "currency", currency: "SGD" })
                                : product.price}
                        </div>
                        <div className="text-xs uppercase">
                            | {product.priceCredits} {product.priceCredits === 1 ? "Credit" : "Credits"}
                        </div>
                    </div>
                    {editable && onEdit && (
                        <div
                            className="button-primary flex mt-3 cursor-pointer w-full"
                            onClick={() => onEdit(product)}
                            onMouseEnter={() => {
                                setHoveringLink(true);
                                setTooltip(null);
                            }}
                            onMouseLeave={() => setHoveringLink(false)}
                        >
                            Edit
                            <RiEditBoxLine className="flex ml-3" />
                        </div>
                    )}
                    <div className="flex justify-start gap-2 mt-2 items-center overflow-x-hidden">
                        {displayTags.slice(0, MAX_TAGS).map((tag, idx) => (
                            <div className="flex tags" key={`${tag}-${idx}`}>{tag}</div>
                        ))}
                        {displayTags.length > MAX_TAGS && (
                            <div className="flex items-center text-lg text-gray-400">
                                <PiDotsThreeThin />
                            </div>
                        )}
                    </div>
                </div>
                {user?.id !== product.creatorUserId && (
                    <button
                        className="absolute right-4 top-4 z-5 bg-transparent border-none p-0 m-0"
                        onClick={liked ? handleUnlike : handleLike}
                        aria-label={liked ? "Unlike" : "Like"}
                        tabIndex={0}
                        type="button"
                        onMouseEnter={() => {
                            setHoveringLink(true);
                            setTooltip(null);
                        }}
                        onMouseLeave={() => setHoveringLink(false)}

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
                )}

            </div>


        </div>
    );
}
