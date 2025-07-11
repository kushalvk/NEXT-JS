'use client';

import Link from 'next/link';
import React, { useState, useRef } from 'react';

const Dropdown: React.FC<{ title: string; items: string[]; basePath: string }> = ({ title, items, basePath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        // @ts-ignore
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 100);
    };

    return (
        <div
            className="relative mx-3"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href={basePath}
                className="text-md font-semibold text-white hover:text-[#FF6B6B] transition-colors duration-300 flex items-center"
            >
                {title}
            </Link>
            <div
                className={`absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg z-50 transition-opacity duration-200 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                {items.map((item, index) => (
                    <Link
                        key={index}
                        href={`${basePath}/${item.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </div>
    );
};

const SubHeader: React.FC = () => {
    const dropdownItems: { [key: string]: { items: string[]; basePath: string } } = {
        Development: {
            items: ['Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development'],
            basePath: '/courses/development',
        },
        Business: {
            items: ['Entrepreneurship', 'Management', 'Sales', 'Business Strategy'],
            basePath: '/courses/business',
        },
        'Finance & Accounting': {
            items: ['Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing'],
            basePath: '/courses/finance-accounting',
        },
        'IT & Software': {
            items: ['Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking'],
            basePath: '/courses/it-software',
        },
        'Office Productivity': {
            items: ['Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry'],
            basePath: '/courses/office-productivity',
        },
        'Personal Development': {
            items: ['Leadership', 'Time Management', 'Communication Skills', 'Mindfulness'],
            basePath: '/courses/personal-development',
        },
        Design: {
            items: ['Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design'],
            basePath: '/courses/design',
        },
        Marketing: {
            items: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing'],
            basePath: '/courses/marketing',
        },
        'Health & Fitness': {
            items: ['Yoga', 'Nutrition', 'Fitness Training', 'Mental Health'],
            basePath: '/courses/health-fitness',
        },
        Music: {
            items: ['Music Production', 'Guitar', 'Piano', 'Vocal Training'],
            basePath: '/courses/music',
        },
    };

    return (
        <header
            className="w-full bg-black/50 backdrop-blur-md shadow-sm py-1 px-6 flex fixed justify-center items-center top-16 left-0 z-50 border-t border-white"
        >
            {Object.entries(dropdownItems).map(([category, { items, basePath }]) => (
                <Dropdown key={category} title={category} items={items} basePath={basePath} />
            ))}
        </header>
    );
};

export default SubHeader;