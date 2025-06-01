'use client'
import { useUser } from '@clerk/nextjs';
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AiOutlineProduct } from "react-icons/ai";
import { BsPeople, BsPersonCheck, BsPersonPlus } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";

interface CreatorCardProps {
    creatorId: string;
}
interface DisplayUser {
    id: string;
    imageUrl?: string | null;
    fullName?: string | null;
    createdAt?: string | null;
    productCount?: number;
    followerCount?: number;
    rating?: number;
}
const timeAgo = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(days / 30.44);
    const years = Math.round(days / 365.25);

    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`; // Up to 4 weeks
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    return `${years} year${years === 1 ? '' : 's'} ago`;
};

function CreatorCard({ creatorId }: CreatorCardProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [loadingCreator, setLoadingCreator] = useState(true);
    const [displayUser, setDisplayUser] = useState<DisplayUser | null>(null);
    const fullCreatorUserId = `user_${creatorId}`;

    const { isSignedIn, user } = useUser();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !creatorId) {
            if (!creatorId) setLoadingCreator(false);
            return;
        }

        const fetchCreatorData = async () => {
            setLoadingCreator(true);
            try {
                const response = await fetch(`/api/users/${fullCreatorUserId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch creator data: ${response.statusText}`);
                }
                const data = await response.json();

                setDisplayUser({
                    ...data,
                    productCount: 5, // Placeholder - fetch from your DB
                    followerCount: 120, // Placeholder - fetch from your DB
                    rating: 4.5, // Placeholder - fetch from your DB
                });
            } catch (error) {
                console.error("Error fetching creator data:", error);
                setDisplayUser(null);
            } finally {
                setLoadingCreator(false);
            }
        };

        fetchCreatorData();
    }, [creatorId, isMounted]);

    if (!isMounted || loadingCreator) {
        return (
            <div className="flex items-center gap-6 animate-pulse">
                <div className="flex flex-col gap-5">
                    <div className="w-[100px] h-[100px] bg-text/10 rounded-full"></div>
                    <div className="h-10 bg-text/10 rounded w-24"></div>
                </div>
                <div className="flex gap-3 flex-col">
                    <div className="h-6 bg-text/10 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-text/10 rounded w-28"></div>
                    <div className="h-4 bg-text/10 rounded w-24"></div>
                    <div className="h-4 bg-text/10 rounded w-20"></div>
                    <div className="h-4 bg-text/10 rounded w-28"></div>
                </div>
            </div>
        );
    }
    const canFollow = isSignedIn && user.id !== fullCreatorUserId;

    return (
        <div className="flex items-center gap-6">
            <div className="flex flex-col gap-5">
                <Image
                    src={displayUser?.imageUrl || "/user.jpg"}
                    alt={displayUser?.fullName ? `${displayUser?.fullName}'s Profile Photo` : "Creator Profile Photo"}
                    width={100}
                    height={100}
                    className="rounded-full object-cover aspect-square"
                    priority
                />
                {canFollow ? (
                    <button className="button-primary flex items-center justify-center">
                        <BsPersonPlus className="inline mr-2" size={12} /> Follow
                    </button>
                ) : (
                    <button className="button-primary flex items-center justify-center">
                       Followers
                    </button>
                )}
                {/* Add other buttons like "Edit Profile" if isViewingOwnProfile */}
            </div>
            <div className="flex gap-3 flex-col">
                <h3 className="mb-2 text-lg font-semibold">{displayUser?.fullName || "Creator Name"}</h3>
                <div className="creatorStat"><AiOutlineProduct className="inline mr-1" /> Products: <span className="text-accent dark:font-normal font-bold">{displayUser?.productCount ?? 0}</span></div>
                <div className="creatorStat"><BsPeople className="inline mr-1" /> Followers: <span className="text-accent dark:font-normal font-bold">{displayUser?.followerCount ?? 0}</span></div>
                <div className="creatorStat"><FaRegStar className="inline mr-1" /> Rating: <span className="text-accent dark:font-normal font-bold">{displayUser?.rating ?? 'N/A'}</span></div>
                <div className="creatorStat"><BsPersonCheck className="inline mr-1" /> Joined: <span className="text-accent dark:font-normal font-bold">{timeAgo(displayUser?.createdAt)}</span></div>
            </div>
        </div>
    )
}

export default CreatorCard