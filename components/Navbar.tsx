'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosMenu } from "react-icons/io";
import Logo from "./Logo";
import { CiLight, CiDark } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SignInButton, SignOutButton, SignUpButton, useUser } from "@clerk/nextjs";


type NavbarProps = {
    reverseNavItem?: boolean;
};

function Navbar({ reverseNavItem = false }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { user, isLoaded, isSignedIn } = useUser();
    const navItemClass = reverseNavItem ? "navItemReverse" : "navItem";

    const toggleDarkMode = () => {
        const root = document.documentElement;
        root.classList.toggle('dark');
        setIsDark(root.classList.contains('dark'));

        if (root.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsDark(document.documentElement.classList.contains("dark"));
        }
    }, []);

    const handleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <>
            <div className='absolute justify-between px-12 items-center hidden md:flex w-screen z-50 h-24'>
                <Link href='/' className={navItemClass}>
                    <Logo
                        width={50}
                        height={50}
                    />
                </Link>
                <div className='flex gap-10 justify-between items-center'>
                    <Link href='/shop' className={navItemClass}>Shop</Link>
                    <Link href='/prints' className={navItemClass}>Prints</Link>
                    {/* <Link href='/filament'className={navItemClass}>Filament</Link> */}
                    <Link href='/creators' className={navItemClass}>Creators</Link>
                    <Link href='/about' className={navItemClass}>About Us</Link>
                    <button onClick={toggleDarkMode} className={navItemClass + " relative flex items-center justify-center"}>
                        <AnimatePresence mode="wait" initial={false}>
                            {isDark ? (
                                <motion.span
                                    key="dark"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="flex items-center"
                                >
                                    <CiLight size={18} />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="light"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="flex items-center"
                                >
                                    <CiDark size={18} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
                <div
                    className="relative flex items-center"
                    onMouseEnter={() => setDropdownOpen(true)}
                >
                    <div className='flex rounded-full h-7 w-7 relative overflow-hidden'>
                        <Image
                            src={isMounted && isLoaded && user?.imageUrl || "/user.jpg"}
                            alt="User Profile"
                            fill
                            className="object-cover object-center"
                            loading="lazy"
                        />
                    </div>
                    {dropdownOpen && (
                        <div
                            className="absolute top-10 right-0 dropdownMenu flex flex-col p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-lg z-50"
                            onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            {isLoaded && isSignedIn ? (
                                <>
                                    <Link href='/account' className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        Account
                                    </Link>
                                    <Link href='/account?section=purchases' className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        Purchases
                                    </Link>
                                    <Link href='/dashboard' className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        <SignOutButton>LOGOUT</SignOutButton>
                                            
                                    </div>
                                </>

                            ) : (
                                <>
                                    <div className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        <SignInButton>LOGIN</SignInButton>
                                    </div>
                                    <div className="flex items-center dropdownMenuItem dropdownPrimaryNoBorder cursor-pointer">
                                        <SignUpButton>REGISTER</SignUpButton>
                                    </div>
                                </>
                            )}

                        </div>
                    )}
                </div>
            </div>
            <div className='fixed justify-between px-6 items-center md:hidden flex w-screen h-24 z-50'>
                <button onClick={handleMenu} className={navItemClass + ' cursor-pointer'}>
                    <IoIosMenu size={30} />
                </button>
            </div>
        </>
    )
}

export default Navbar