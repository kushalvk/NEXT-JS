'use client';

import Link from 'next/link';
import React, {useEffect, useRef, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Image from 'next/image';
import {CgProfile} from 'react-icons/cg';
import {RiShoppingCartFill} from 'react-icons/ri';
import {FaHeart} from 'react-icons/fa';
import {HiMenu, HiOutlineSearch, HiX} from 'react-icons/hi';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/context/AuthContext';
import {cn} from '@/lib/utils';

const NAV_LINKS = [
    {href: '/', label: 'Home'},
    {href: '/courses', label: 'Courses'},
    {href: '/search', label: 'Search'},
    {href: '/mycourses', label: 'My Courses'},
];

const Navbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const {user, isLoggedIn, isDemo, logout} = useAuth();

    const closeAll = () => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    };

    // Route change closes any open menu.
    useEffect(() => {
        closeAll();
    }, [pathname]);

    // Click-outside and Escape close the profile menu.
    useEffect(() => {
        if (!isProfileOpen) return;

        const onPointerDown = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsProfileOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isProfileOpen]);

    // The slide-in panel locks background scroll while open.
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    const initial = user?.Username?.[0]?.toUpperCase();

    return (
        <header className="border-b border-white/10 bg-ink-950 text-white">
            <div className="container-page flex h-[var(--nav-h)] items-center justify-between gap-4">

                {/* Brand */}
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <Image
                        src="/Logo.png"
                        alt=""
                        width={80}
                        height={80}
                        className="h-9 w-9 rounded-lg"
                    />
                    <span className="text-lg font-bold tracking-tight sm:text-xl">SkillSurge</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? 'page' : undefined}
                            className={cn(
                                'rounded-lg px-3 py-2 text-sm font-medium transition',
                                isActive(link.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right cluster */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {isDemo && (
                        <span className="chip hidden bg-warning-soft text-ink-900 xl:inline-flex">
                            Demo · read-only
                        </span>
                    )}

                    <Link
                        href="/search"
                        aria-label="Search courses"
                        className="grid h-10 w-10 place-items-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <HiOutlineSearch className="h-5 w-5"/>
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/favorite"
                                aria-label="Favourites"
                                className="hidden h-10 w-10 place-items-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-white sm:grid"
                            >
                                <FaHeart className="h-[18px] w-[18px]"/>
                            </Link>

                            <Link
                                href="/cart"
                                aria-label="Cart"
                                className="hidden h-10 w-10 place-items-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-white sm:grid"
                            >
                                <RiShoppingCartFill className="h-[18px] w-[18px]"/>
                            </Link>

                            {/* Profile menu */}
                            <div className="relative hidden lg:block" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen((open) => !open)}
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="menu"
                                    aria-label="Account menu"
                                    className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-500"
                                >
                                    {initial ?? <CgProfile className="h-5 w-5"/>}
                                </button>

                                {isProfileOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-900 shadow-e4"
                                    >
                                        <div className="border-b border-ink-200 px-4 py-3">
                                            <p className="truncate text-sm font-semibold">{user?.Username}</p>
                                            <p className="truncate text-xs text-ink-500">{user?.email}</p>
                                            {isDemo && (
                                                <span className="chip mt-2 bg-warning-soft text-ink-800">
                                                    Read-only demo
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-1.5">
                                            {[
                                                {href: '/mycourses', label: 'My courses'},
                                                {href: '/favorite', label: 'Favourites'},
                                                {href: '/cart', label: 'Cart'},
                                                {href: '/uploadCourse', label: 'Courses I uploaded'},
                                                {href: '/addCourse', label: 'Create a course'},
                                                {href: '/profile', label: 'Profile settings'},
                                            ].map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    role="menuitem"
                                                    onClick={closeAll}
                                                    className="block rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-ink-200 p-1.5">
                                            <button
                                                role="menuitem"
                                                onClick={() => {
                                                    logout();
                                                    closeAll();
                                                    router.push('/');
                                                }}
                                                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                                            >
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="hidden items-center gap-2 lg:flex">
                            <Button variant="inverse-outline" size="sm" onClick={() => router.push('/login')}>
                                Log in
                            </Button>
                            <Button variant="inverse" size="sm" onClick={() => router.push('/signup')}>
                                Sign up
                            </Button>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        className="grid h-10 w-10 place-items-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
                    >
                        {isMenuOpen ? <HiX className="h-6 w-6"/> : <HiMenu className="h-6 w-6"/>}
                    </button>
                </div>
            </div>

            {/* Mobile panel */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 top-[var(--nav-h)] z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    'fixed right-0 top-[var(--nav-h)] z-50 h-[calc(100dvh-var(--nav-h))] w-[min(20rem,85vw)] overflow-y-auto border-l border-white/10 bg-ink-950 transition-transform duration-300 lg:hidden',
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}
                aria-hidden={!isMenuOpen}
            >
                <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeAll}
                            className={cn(
                                'rounded-lg px-3 py-2.5 text-base font-medium transition',
                                isActive(link.href) ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="my-3 h-px bg-white/10"/>

                    {isLoggedIn ? (
                        <>
                            <div className="mb-2 px-3">
                                <p className="truncate text-sm font-semibold text-white">{user?.Username}</p>
                                <p className="truncate text-xs text-ink-400">{user?.email}</p>
                                {isDemo && (
                                    <span className="chip mt-2 bg-warning-soft text-ink-900">Read-only demo</span>
                                )}
                            </div>
                            {[
                                {href: '/favorite', label: 'Favourites'},
                                {href: '/cart', label: 'Cart'},
                                {href: '/uploadCourse', label: 'Courses I uploaded'},
                                {href: '/addCourse', label: 'Create a course'},
                                {href: '/profile', label: 'Profile settings'},
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeAll}
                                    className="rounded-lg px-3 py-2.5 text-base font-medium text-ink-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Button
                                variant="destructive"
                                className="mt-3"
                                onClick={() => {
                                    logout();
                                    closeAll();
                                    router.push('/');
                                }}
                            >
                                Log out
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button variant="inverse" onClick={() => { closeAll(); router.push('/signup'); }}>
                                Create free account
                            </Button>
                            <Button variant="inverse-outline" onClick={() => { closeAll(); router.push('/login'); }}>
                                Log in
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
