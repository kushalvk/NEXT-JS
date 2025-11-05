'use client';

import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { CgProfile } from 'react-icons/cg';
import { RiShoppingCartFill } from 'react-icons/ri';
import { FaHeart } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsProfileDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsProfileDropdownOpen(false), 300);
    };

    const closeAll = () => {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleMenu}
                />
            )}

            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">

                    {/* Logo + Brand */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Image
                                src="/Logo.png"
                                alt="SkillSurge"
                                width={140}
                                height={140}
                                className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border-2 border-cyan-500/40 p-0.5 shadow-md group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />
                        </div>
                        <span className="text-lg sm:text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-tight whitespace-nowrap">
              SkillSurge
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                        {['Home', 'Search Courses', 'My Courses'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : item === 'Search Courses' ? '/search' : '/mycourses'}
                                className="text-sm xl:text-base text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                            >
                                {item}
                            </Link>
                        ))}

                        {/* Auth Section */}
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3 xl:gap-4">
                                <Link href="/favorite" className="relative group">
                                    <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-red-500 transition-all duration-300 group-hover:scale-125" />
                                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                </Link>

                                <Link href="/cart" className="relative group">
                                    <RiShoppingCartFill className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-yellow-400 transition-all duration-300 group-hover:scale-125" />
                                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                                </Link>

                                {/* Profile Dropdown */}
                                <div
                                    className="relative"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5">
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                                {user?.Username?.[0]?.toUpperCase() || <CgProfile className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown */}
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-3 py-2 border-b border-white/10">
                                                <p className="text-sm font-semibold text-cyan-400 truncate">{user?.Username}</p>
                                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-2 space-y-1">
                                                <Link
                                                    href="/uploadCourse"
                                                    onClick={closeAll}
                                                    className="block px-3 py-2 text-xs sm:text-sm text-gray-200 hover:bg-white/10 hover:text-cyan-400 rounded-lg transition-all"
                                                >
                                                    Upload Course
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    onClick={closeAll}
                                                    className="block px-3 py-2 text-xs sm:text-sm text-gray-200 hover:bg-white/10 hover:text-cyan-400 rounded-lg transition-all"
                                                >
                                                    My Profile
                                                </Link>
                                            </div>
                                            <Button
                                                onClick={() => { logout(); closeAll(); }}
                                                variant="destructive"
                                                size="sm"
                                                className="w-full mt-2 text-xs h-8"
                                            >
                                                Logout
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 xl:gap-3">
                                <Button
                                    onClick={() => router.push('/login')}
                                    variant="outline"
                                    className="text-xs sm:text-sm px-3 h-8 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 whitespace-nowrap"
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => router.push('/signup')}
                                    className="text-xs sm:text-sm px-3 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold whitespace-nowrap"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                        {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Slide-In Menu */}
                <div
                    className={`fixed top-14 sm:top-16 right-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-72 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-out lg:hidden z-50 ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="p-5 sm:p-6 space-y-5 overflow-y-auto h-full">
                        <nav className="space-y-3">
                            {['Home', 'Search Courses', 'My Courses'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Home' ? '/' : item === 'Search Courses' ? '/search' : '/mycourses'}
                                    onClick={closeAll}
                                    className="block text-base sm:text-lg font-medium text-gray-200 hover:text-cyan-400 transition-all"
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>

                        {isLoggedIn ? (
                            <div className="space-y-4 pt-5 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                                            {user?.Username?.[0]?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-cyan-400 text-sm truncate">{user?.Username}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <Link href="/favorite" onClick={closeAll} className="text-red-400">
                                        <FaHeart className="w-6 h-6" />
                                    </Link>
                                    <Link href="/cart" onClick={closeAll} className="text-yellow-400">
                                        <RiShoppingCartFill className="w-6 h-6" />
                                    </Link>
                                </div>
                                <Button onClick={() => { logout(); closeAll(); }} variant="destructive" className="w-full text-sm h-9">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-5">
                                <Button onClick={() => { router.push('/login'); closeAll(); }} variant="outline" className="w-full text-sm h-9">
                                    Login
                                </Button>
                                <Button onClick={() => { router.push('/signup'); closeAll(); }} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-sm h-9">
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;