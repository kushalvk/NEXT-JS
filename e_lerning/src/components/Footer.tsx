'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-white/10 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <Link href="/" className="flex items-center gap-3 group mb-5">
                            <div className="relative">
                                <Image
                                    src="/Logo.png"
                                    alt="SkillSurge Logo"
                                    width={160}
                                    height={160}
                                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 border-cyan-500/40 p-1 shadow-lg group-hover:scale-110 transition-all duration-300"
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-tighter">
                SkillSurge
              </span>
                        </Link>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs">
                            Empowering your learning journey with expert-led courses and personalized paths.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 relative inline-block">
                            Quick Links
                            <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></span>
                        </h3>
                        <ul className="space-y-2.5 text-sm sm:text-base">
                            {[
                                { href: '/courses', label: 'Browse Courses' },
                                { href: '/mycourses', label: 'My Courses' },
                                { href: '/favorite', label: 'Favorites' },
                                { href: '/cart', label: 'Cart' },
                                { href: '/profile', label: 'Profile' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-300 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className=" figuras flex flex-col">
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 relative inline-block">
                            Contact Us
                            <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></span>
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                            <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                <span className="text-cyan-400">Email</span>
                                <a href="mailto:support@skillsurge.com" className="hover:underline">
                                    support@skillsurge.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                <span className="text-cyan-400">Phone</span>
                                <a href="tel:+1234567890" className="hover:underline">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-0.5">Address</span>
                                <span className="max-w-xs leading-tight">
                  123 Learning Lane,<br />Education City, EC 12345
                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 relative inline gradients inline-block">
                            Follow Us
                            <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></span>
                        </h3>
                        <div className="flex gap-4">
                            {[
                                { Icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
                                { Icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
                                { Icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
                                { Icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                            ].map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Follow us on ${label}`}
                                    className="group p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-110"
                                >
                                    <Icon className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                        <p className="mt-6 text-xs text-gray-400">
                            Join our community of <span className="text-cyan-400 font-bold">10,000+</span> learners
                        </p>
                    </div>
                </div>

                {/* Bottom Bar with Wave */}
                <div className="mt-10 pt-6 border-t border-white/10 text-center">
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                        <p className="text-xs sm:text-sm text-gray-400">
                            © {currentYear} <span className="text-cyan-400 font-semibold">SkillSurge</span>. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;