'use client'

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoIosMenu } from "react-icons/io";
import Logo from "./Logo";

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
            <div className='absolute justify-between px-12 items-center hidden md:flex w-screen z-50 h-24'>
                <Link href='/' className="navItem">
                     <Logo
                        width={50} // Set desired width
                        height={50} // Set desired height
                    />
                </Link>
                <div className='flex gap-10 justify-between items-center'>
                    <Link href='/browse' className="navItem">Browse</Link>
                    <Link href='/filament' className="navItem">Filament</Link>
                    <Link href='/creators' className="navItem">Creators</Link>
                    <Link href='/about' className="navItem">About Us</Link>
                    <button onClick={toggleDarkMode} className="navItem">
                        Toggle Dark Mode
                    </button>
                </div>
                <div className='flex rounded-full bg-white h-7 w-7'>

                </div>
            </div>
            <div className='fixed justify-between px-6 items-center md:hidden flex w-screen h-24 z-50'>
                <button onClick={handleMenu} className='navItem cursor-pointer'>
                    <IoIosMenu size={30} />
                </button>
            </div>
        </>
    )
}

export default Navbar