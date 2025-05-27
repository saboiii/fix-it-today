'use client'

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoIosMenu } from "react-icons/io";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        root.classList.toggle('dark');

        if (root.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }

    const handleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <>
            <div className='fixed justify-between px-12 items-center hidden md:flex w-screen h-24'>
                <Link href='/'>
                    {/* <Image
                    src="/logo.png"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="cursor-pointer"
                /> */}
                </Link>
                <div className='flex gap-10 justify-between items-center'>
                    <Link href='/browse' className="navItem">Browse</Link>
                    <Link href='/filament' className="navItem">Filament</Link>
                    <Link href='/creators' className="navItem">Creators</Link>
                    <Link href='/creators' className="navItem">About Us</Link>
                </div>
                <div className='flex rounded-full bg-white h-7 w-7'>

                </div>
            </div>
            <div className='fixed justify-between px-12 items-center md:hidden flex w-screen h-24'>
                <button onClick={handleMenu} className='navItem cursor-pointer'>
                    <IoIosMenu size={30}/>
                </button>
            </div>
        </>
    )
}

export default Navbar