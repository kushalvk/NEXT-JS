'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-black backdrop-blur-md shadow-sm py-8 px-4 sm:px-6 text-white mt-auto">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/Logo.png" alt="logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                        <div className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                            SkillSurge
                        </div>
                    </div>
                    <p className="text-white text-sm sm:text-base leading-relaxed text-center sm:text-left">
                        Empowering your learning journey with expert-led courses.
                    </p>
                </div>

                {/* Navigation Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-white text-sm sm:text-base">
                        <li>
                            <Link href="/courses" className="hover:text-[#FF6B6B] transition-colors duration-300">
                                Browse Courses
                            </Link>
                        </li>
                        <li>
                            <Link href="/mycourses" className="hover:text-[#FF6B6B] transition-colors duration-300">
                                My Courses
                            </Link>
                        </li>
                        <li>
                            <Link href="/favorite" className="hover:text-[#FF6B6B] transition-colors duration-300">
                                Favorites
                            </Link>
                        </li>
                        <li>
                            <Link href="/cart" className="hover:text-[#FF6B6B] transition-colors duration-300">
                                Cart
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="hover:text-[#FF6B6B] transition-colors duration-300">
                                Profile
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                    <ul className="space-y-2 text-white text-sm sm:text-base">
                        <li>Email: <a href="mailto:support@skillsurge.com" className="hover:text-[#FF6B6B] transition-colors duration-300">support@skillsurge.com</a></li>
                        <li>Phone: <a href="tel:+1234567890" className="hover:text-[#FF6B6B] transition-colors duration-300">+1 (234) 567-890</a></li>
                        <li>Address: 123 Learning Lane, Education City, EC 12345</li>
                    </ul>
                </div>

                {/* Social Media */}
                <div className="flex flex-col items-center sm:items-start">
                    <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF6B6B] transition-colors duration-300">
                            <FaFacebook className="w-6 h-6" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF6B6B] transition-colors duration-300">
                            <FaTwitter className="w-6 h-6" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF6B6B] transition-colors duration-300">
                            <FaInstagram className="w-6 h-6" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF6B6B] transition-colors duration-300">
                            <FaLinkedin className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-4 border-t border-white/20 text-center text-white text-sm">
                <p>&copy; {new Date().getFullYear()} SkillSurge. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;