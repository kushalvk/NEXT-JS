import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {FaFacebook, FaInstagram, FaLinkedin, FaTwitter} from 'react-icons/fa';

const LINK_COLUMNS = [
    {
        title: 'Learn',
        links: [
            {href: '/courses', label: 'Browse courses'},
            {href: '/search', label: 'Search'},
            {href: '/mycourses', label: 'My courses'},
            {href: '/favorite', label: 'Favourites'},
        ],
    },
    {
        title: 'Teach',
        links: [
            {href: '/addCourse', label: 'Create a course'},
            {href: '/uploadCourse', label: 'Courses I uploaded'},
        ],
    },
    {
        title: 'Account',
        links: [
            {href: '/profile', label: 'Profile'},
            {href: '/cart', label: 'Cart'},
            {href: '/login', label: 'Log in'},
            {href: '/signup', label: 'Create account'},
        ],
    },
];

const SOCIALS = [
    {Icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook'},
    {Icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter'},
    {Icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram'},
    {Icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn'},
];

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-ink-950 text-ink-300">
            <div className="container-page py-12 sm:py-14">
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
                            <Image src="/Logo.png" alt="" width={80} height={80} className="h-9 w-9 rounded-lg"/>
                            <span className="text-lg font-bold text-white">SkillSurge</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed">
                            Expert-led courses in development, business and design. Learn at your own pace and earn a
                            certificate when you finish.
                        </p>

                        <div className="mt-5 flex gap-2">
                            {SOCIALS.map(({Icon, href, label}) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-ink-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    <Icon className="h-4 w-4"/>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {LINK_COLUMNS.map((column) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h2 className="mb-3 text-sm font-semibold text-white">{column.title}</h2>
                            <ul className="space-y-2 text-sm">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="transition hover:text-white">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p>© {currentYear} SkillSurge. All rights reserved.</p>
                    <a href="mailto:support@skillsurge.com" className="transition hover:text-white">
                        support@skillsurge.com
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
