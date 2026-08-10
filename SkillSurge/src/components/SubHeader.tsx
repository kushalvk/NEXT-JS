'use client';

import Link from 'next/link';
import React, {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {HiChevronDown, HiOutlineViewGrid} from 'react-icons/hi';
import {cn} from '@/lib/utils';

interface CategoryGroup {
    title: string;
    items: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
    {title: 'Development', items: ['Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development']},
    {title: 'Business', items: ['Entrepreneurship', 'Management', 'Sales', 'Business Strategy']},
    {title: 'Finance & Accounting', items: ['Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing']},
    {title: 'IT & Software', items: ['Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking']},
    {title: 'Office Productivity', items: ['Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry']},
    {title: 'Personal Development', items: ['Leadership', 'Time Management', 'Communication Skills', 'Mindfulness']},
    {title: 'Design', items: ['Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design']},
    {title: 'Marketing', items: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing']},
    {title: 'Health & Fitness', items: ['Yoga', 'Nutrition', 'Fitness Training', 'Mental Health']},
    {title: 'Music', items: ['Music Production', 'Guitar', 'Piano', 'Vocal Training']},
];

/** Shown inline in the bar for one-tap access to the busiest categories. */
const QUICK_LINKS = [
    'Web Development',
    'Mobile Apps',
    'Programming Languages',
    'UI/UX Design',
    'Digital Marketing',
    'Cloud Computing',
    'Investing',
    'Leadership',
];

const courseHref = (category: string) => `/courses/${encodeURIComponent(category)}`;

const SubHeader: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) return;

        const onPointerDown = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const activeCategory = decodeURIComponent(pathname.replace('/courses/', ''));

    return (
        <div className="relative border-b border-ink-200 bg-white" ref={panelRef}>
            <div className="container-page flex h-12 items-center gap-2">

                <button
                    onClick={() => setIsOpen((open) => !open)}
                    aria-expanded={isOpen}
                    aria-controls="category-panel"
                    className={cn(
                        'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                        isOpen ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-100'
                    )}
                >
                    <HiOutlineViewGrid className="h-4 w-4" aria-hidden="true"/>
                    <span className="hidden sm:inline">Browse categories</span>
                    <span className="sm:hidden">Categories</span>
                    <HiChevronDown
                        className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                        aria-hidden="true"
                    />
                </button>

                <span className="hidden h-5 w-px shrink-0 bg-ink-200 sm:block" aria-hidden="true"/>

                {/* Quick links scroll horizontally rather than wrapping the bar */}
                <nav
                    className="no-scrollbar -mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1"
                    aria-label="Popular categories"
                >
                    {QUICK_LINKS.map((category) => (
                        <Link
                            key={category}
                            href={courseHref(category)}
                            className={cn(
                                'shrink-0 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap transition',
                                activeCategory === category
                                    ? 'bg-brand-50 font-semibold text-brand-700'
                                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                            )}
                        >
                            {category}
                        </Link>
                    ))}
                </nav>

                <Link
                    href="/courses"
                    className="hidden shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 md:block"
                >
                    All courses
                </Link>
            </div>

            {/* Mega panel */}
            {isOpen && (
                <div
                    id="category-panel"
                    className="absolute inset-x-0 top-full z-40 max-h-[70vh] overflow-y-auto border-b border-ink-200 bg-white shadow-e4"
                >
                    <div className="container-page grid grid-cols-1 gap-x-8 gap-y-7 py-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {CATEGORY_GROUPS.map((group) => (
                            <div key={group.title}>
                                <h2 className="mb-2.5 text-sm font-bold text-ink-900">{group.title}</h2>
                                <ul className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <li key={item}>
                                            <Link
                                                href={courseHref(item)}
                                                onClick={() => setIsOpen(false)}
                                                className="block rounded-md px-2 py-1.5 -mx-2 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-brand-700"
                                            >
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubHeader;
