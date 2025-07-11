'use client';

import Link from 'next/link';
import React from 'react';
import {CgProfile} from 'react-icons/cg';
import {RiShoppingCartFill} from 'react-icons/ri';
import {FaHeart} from 'react-icons/fa';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {useRouter} from "next/navigation";

const Header: React.FC = () => {
    const router = useRouter();

    return (
        <header
            className="w-full bg-black/50 backdrop-blur-md shadow-sm py-4 px-6 flex items-center justify-between fixed top-0 left-0 z-50">
            {/* Logo */}
            <Link href="/public"
                  className="text-2xl font-extrabold text-white tracking-tight hover:text-indigo-300 transition-colors duration-300">
                SkillSurge
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4 text-base font-semibold">

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full px-4 py-2 bg-black/30 backdrop-blur-md text-[#F5F5F5] placeholder-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300"
                    />
                    <FiSearch
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D1D5DB] hover:text-[#FF6B6B] cursor-pointer transition-colors duration-300"/>
                </div>

                <Link href="/public"
                      className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300 relative group">
                    My Courses
                </Link>
                <Button onClick={() => router.push('/login')} variant="outline" className="text-white">
                    Login
                </Button>
                <Button variant="destructive" onClick={() => router.push('/signup')}>Sign Up</Button>
                <Link href="/public" className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300">
                    <FaHeart className="w-7 h-7"/>
                </Link>
                <Link href="/public" className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300">
                    <RiShoppingCartFill className="w-7 h-7"/>
                </Link>
                <Link href="/public" className="text-[#F5F5F5] hover:text-[#FF6B6B] transition-colors duration-300">
                    <CgProfile className="w-7 h-7"/>
                </Link>
            </nav>
        </header>
    );
};

export default Header;