'use client';

import Link from 'next/link';
import React, {useState, useRef} from 'react';
import { CgProfile } from 'react-icons/cg';
import { RiShoppingCartFill } from 'react-icons/ri';
import { FaHeart } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const Header: React.FC = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user, isLoggedIn, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsProfileDropdownOpen(false);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsProfileDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsProfileDropdownOpen(false);
        }, 300);
    };

    const handleClickLogout = () => {
        logout();
    }

    return (
        <header
            className="w-full bg-black/50 backdrop-blur-md shadow-sm py-4 px-4 sm:px-6 flex items-center justify-between fixed top-0 left-0 z-50"
        >
            <div className="flex items-center gap-2">
                {/* Logo */}
                <Image
                    src="/Logo.png"
                    alt="logo"
                    width={400}
                    height={400}
                    className="h-10 w-10 sm:h-12 sm:w-12"
                />
                <div
                    className="text-lg sm:text-2xl ml-3 sm:ml-12 font-extrabold text-white tracking-tight"
                >
                    SkillSurge
                </div>
            </div>

            {/* Hamburger Menu for Mobile */}
            <button
                className="sm:hidden text-white focus:outline-none"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <HiX className="w-7 h-7" /> : <HiMenu className="w-7 h-7" />}
            </button>

            {/* Navigation */}
            <nav
                className={`${
                    isMenuOpen ? 'flex' : 'hidden'
                } sm:flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm sm:text-base font-semibold absolute sm:static top-16 left-0 w-full sm:w-auto bg-black/90 sm:bg-transparent p-4 sm:p-0 transition-all duration-300`}
            >
                <Link
                    href="/"
                    className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                >
                    Home
                </Link>
                <Link
                    href="/search"
                    className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                >
                    Search Courses
                </Link>
                {isLoggedIn ? (
                    <>
                        <Link
                            href="/mycourses"
                            className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                        >
                            My Courses
                        </Link>
                        <Button
                            onClick={handleClickLogout}
                            variant="destructive"
                            className="w-full sm:w-auto text-sm sm:text-base py-2"
                        >
                            Logout
                        </Button>
                        <div className="flex gap-3 sm:gap-4">
                            <Link
                                href="/favorite"
                                className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                            >
                                <FaHeart className="w-5 h-5 sm:w-6 sm:h-6"/>
                            </Link>
                            <Link
                                href="/cart"
                                className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                            >
                                <RiShoppingCartFill className="w-5 h-5 sm:w-6 sm:h-6"/>
                            </Link>
                            <div
                                className="relative group"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300"
                                    aria-label="Profile menu"
                                >
                                    <CgProfile className="w-5 h-5 sm:w-6 sm:h-6"/>
                                </button>
                                <div
                                    className={`${
                                        isMenuOpen || isProfileDropdownOpen ? 'flex' : 'hidden'
                                    } sm:group-hover:flex flex-col absolute right-0 sm:right-0 top-8 sm:top-10 w-40 bg-black/90 backdrop-blur-md rounded-lg shadow-lg p-2 z-50 sm:bg-black/50 sm:backdrop-blur-md`}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {user && (
                                        <div
                                            className="text-[#FF6B6B] px-4 py-2 rounded-lg transition-colors duration-300 text-sm"
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            {user?.Username}
                                        </div>
                                    )}
                                    <Link
                                        href="/uploadCourse"
                                        className="text-[#F5F5F5] hover:text-[#FF6B6B] px-4 py-2 rounded-lg transition-colors duration-300 text-sm"
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Upload Course
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="text-[#F5F5F5] hover:text-[#FF6B6B] px-4 py-2 rounded-lg transition-colors duration-300 text-sm"
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Button
                            onClick={() => router.push('/login')}
                            variant="outline"
                            className="text-white w-full sm:w-auto text-sm sm:text-base py-2"
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => router.push('/signup')}
                            variant="destructive"
                            className="w-full sm:w-auto text-sm sm:text-base py-2"
                        >
                            Sign Up
                        </Button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;