'use client'
import { useUser } from '@clerk/nextjs';
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AiOutlineProduct } from "react-icons/ai";
import { BsPeople, BsPersonCheck, BsPersonPlus } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";

function CreatorCard() {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { user, isLoaded } = useUser();

    return (
        <div className="flex items-center gap-6">
            <div className="flex flex-col gap-5">
                <Image
                    src={isMounted && isLoaded && user?.imageUrl || "/user.jpg"}
                    alt="Creator Profile Photo"
                    width={100}
                    height={100}
                    className="rounded-full object-cover aspect-square"
                    loading="lazy"
                />
                <button className="button-primary flex items-center"><BsPersonPlus className="inline mr-2" size={12} /> Follow</button>
            </div>
            <div className="flex gap-3 flex-col">
                <h3 className="mb-2">Creator Name</h3>
                <div className="creatorStat"><AiOutlineProduct className="inline" /> Products: <span className="text-accent dark:font-normal font-bold">2</span></div>
                <div className="creatorStat"><BsPeople className="inline" /> Followers: <span className="text-accent dark:font-normal font-bold">0</span></div>
                <div className="creatorStat"><FaRegStar className="inline" /> Rating: <span className="text-accent dark:font-normal font-bold">5</span></div>
                <div className="creatorStat"><BsPersonCheck className="inline" /> Joined: <span className="text-accent dark:font-normal font-bold">0</span></div>
            </div>
        </div>
    )
}

export default CreatorCard