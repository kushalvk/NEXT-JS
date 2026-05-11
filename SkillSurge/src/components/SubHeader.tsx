'use client';

import Link from 'next/link';
import React, {useState, useRef, useEffect} from 'react';
import {HiChevronDown, HiMenu, HiX} from 'react-icons/hi';

interface DropdownItem {
    title: string;
    items: string[];
    basePath: string;
}

const Dropdown: React.FC<DropdownItem> = ({ title, items, basePath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // To store delay timeout

    const openDropdown = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const closeDropdown = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300); // 300ms delay before closing
    };

    const toggleDropdown = () => {
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setIsOpen(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div
            className="relative group"
            ref={dropdownRef}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
        >
            {/* Trigger Button */}
            <button
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 px-3 py-2 text-sm lg:text-base font-semibold text-gray-200 hover:text-cyan-400 transition-all duration-300 group-hover:scale-105 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
        <span className="relative">
          {title}
            <span
                className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-cyan-400 transform origin-left transition-transform duration-300 ${
                    isOpen ? 'scale-x-100' : 'scale-x-0'
                }`}
            />
        </span>
                <HiChevronDown
                    className={`w-4 h-4 transition-all duration-300 ease-out ${
                        isOpen ? 'rotate-180 text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`
          absolute left-1/2 -translate-x-1/2 mt-3 w-56 origin-top 
          transition-all duration-300 ease-out z-50
          ${isOpen
                    ? 'opacity-100 visible scale-100'
                    : 'opacity-0 invisible scale-95 pointer-events-none'
                }
        `}
                style={{ transformOrigin: 'top' }}
            >
                <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-3 ring-1 ring-cyan-500/20 overflow-hidden">
                    {items.map((item, i) => (
                        <Link
                            key={i}
                            href={`${basePath}/${encodeURIComponent(item)}`}
                            onClick={() => {
                                setIsOpen(false);
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            }}
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 hover:text-white rounded-lg transition-all duration-200 whitespace-nowrap"
                        >
                            {item}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SubHeader: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    const categories: DropdownItem[] = [
        {
            title: 'Development',
            items: ['Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development'],
            basePath: '/courses',
        },
        {
            title: 'Business',
            items: ['Entrepreneurship', 'Management', 'Sales', 'Business Strategy'],
            basePath: '/courses',
        },
        {
            title: 'Finance & Accounting',
            items: ['Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing'],
            basePath: '/courses',
        },
        {
            title: 'IT & Software',
            items: ['Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking'],
            basePath: '/courses',
        },
        {
            title: 'Office Productivity',
            items: ['Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry'],
            basePath: '/courses',
        },
        {
            title: 'Personal Development',
            items: ['Leadership', 'Time Management', 'Communication Skills', 'Mindfulness'],
            basePath: '/courses',
        },
        {
            title: 'Design',
            items: ['Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design'],
            basePath: '/courses',
        },
        {
            title: 'Marketing',
            items: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing'],
            basePath: '/courses',
        },
        {
            title: 'Health & Fitness',
            items: ['Yoga', 'Nutrition', 'Fitness Training', 'Mental Health'],
            basePath: '/courses',
        },
        {
            title: 'Music',
            items: ['Music Production', 'Guitar', 'Piano', 'Vocal Training'],
            basePath: '/courses',
        },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleMobileMenu}
                />
            )}

            <header
                className="fixed top-16 lg:top-20 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-xl border-t border-white/10">
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center relative">

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        className={`
                            lg:hidden fixed top-3 left-4 z-50
                            flex items-center justify-center
                            w-12 h-12 rounded-full
                            bg-black/60 backdrop-blur-xl
                            border border-white/20
                            shadow-lg
                            hover:bg-black/70 hover:border-white/30
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60
                            transition-all duration-300 ease-out
                            ${isMobileMenuOpen ? 'scale-110 rotate-12' : 'scale-100'}
                        `}
                    >
                        <span className="relative block w-6 h-6">
                            {/* Hamburger Icon */}
                            <HiMenu
                                className={`
                                    absolute inset-0 w-full h-full text-white
                                    transition-all duration-300 ease-out
                                    ${isMobileMenuOpen
                                    ? 'opacity-0 rotate-90 scale-0'
                                    : 'opacity-100 rotate-0 scale-100'
                                }
                                `}
                            />
                            {/* Close (X) Icon */}
                            <HiX
                                className={`
                                    absolute inset-0 w-full h-full text-white
                                    transition-all duration-300 ease-out
                                    ${isMobileMenuOpen
                                    ? 'opacity-100 rotate-0 scale-100'
                                    : 'opacity-0 -rotate-90 scale-0'
                                }
                                `}
                            />
                        </span>

                        {/* Optional: Pulse glow on open */}
                        {isMobileMenuOpen && (
                            <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"/>
                        )}
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {categories.map((cat) => (
                            <Dropdown key={cat.title} {...cat} />
                        ))}
                    </nav>

                    {/* Mobile Slide-In Menu */}
                    <div
                        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl transform transition-transform duration-500 ease-out lg:hidden z-50 ${
                            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="p-6 space-y-5 overflow-y-auto h-full">
                            {categories.map((cat) => (
                                <div key={cat.title} className="border-b border-white/10 pb-4 last:border-0">
                                    <h3 className="text-lg font-bold text-cyan-400 mb-3">{cat.title}</h3>
                                    <div className="space-y-1.5">
                                        {cat.items.map((item, i) => (
                                            <Link
                                                key={i}
                                                href={`${cat.basePath}/${encodeURIComponent(item)}`}
                                                onClick={toggleMobileMenu}
                                                className="block px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-cyan-400 rounded-lg transition-all"
                                            >
                                                {item}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default SubHeader;