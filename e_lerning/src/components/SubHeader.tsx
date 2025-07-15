'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiMenu, HiX } from 'react-icons/hi';

const Dropdown: React.FC<{ title: string; items: string[]; basePath: string }> = ({ title, items, basePath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative mx-2 sm:mx-3" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="text-sm lg:text-md font-semibold text-white hover:text-[#FF6B6B] transition-colors duration-300 flex items-center"
            >
                {title}
                <HiChevronDown className="ml-1 w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <div
                className={`absolute left-0 mt-2 w-48 lg:w-56 bg-black/90 backdrop-blur-md rounded-lg shadow-lg z-50 transition-all duration-200 ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                {items.map((item, index) => (
                    <Link
                        key={index}
                        href={`${basePath}/${item.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}`}
                        className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </div>
    );
};

const SubHeader: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const dropdownItems: { [key: string]: { items: string[]; basePath: string } } = {
        'Development': {
            items: ['Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development'],
            basePath: '/courses',
        },
        'Business': {
            items: ['Entrepreneurship', 'Management', 'Sales', 'Business Strategy'],
            basePath: '/courses',
        },
        'Finance & Accounting': {
            items: ['Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing'],
            basePath: '/courses',
        },
        'IT & Software': {
            items: ['Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking'],
            basePath: '/courses',
        },
        'Office Productivity': {
            items: ['Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry'],
            basePath: '/courses',
        },
        'Personal Development': {
            items: ['Leadership', 'Time Management', 'Communication Skills', 'Mindfulness'],
            basePath: '/courses',
        },
        Design: {
            items: ['Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design'],
            basePath: '/courses',
        },
        Marketing: {
            items: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing'],
            basePath: '/courses',
        },
        'Health & Fitness': {
            items: ['Yoga', 'Nutrition', 'Fitness Training', 'Mental Health'],
            basePath: '/courses',
        },
        Music: {
            items: ['Music Production', 'Guitar', 'Piano', 'Vocal Training'],
            basePath: '/courses',
        },
    };

    return (
        <header
            className="w-full bg-black/50 backdrop-blur-md shadow-sm py-2 lg:py-3 px-4 lg:px-6 flex justify-center items-center fixed top-16 lg:top-[4.5rem] left-0 z-40 border-t border-white/20"
        >
            <button
                className="lg:hidden text-white focus:outline-none absolute left-4 top-1"
                onClick={toggleMobileMenu}
                aria-label="Toggle subheader menu"
            >
                {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
            <nav
                className={`${
                    isMobileMenuOpen ? 'flex' : 'hidden'
                } lg:flex flex-col lg:flex-row items-center gap-2 lg:gap-3 w-full lg:w-auto bg-black/90 lg:bg-transparent p-4 lg:p-0 absolute lg:static top-12 left-0 transition-all duration-300`}
            >
                {Object.entries(dropdownItems).map(([category, { items, basePath }]) => (
                    <Dropdown key={category} title={category} items={items} basePath={basePath} />
                ))}
            </nav>
        </header>
    );
};

export default SubHeader;