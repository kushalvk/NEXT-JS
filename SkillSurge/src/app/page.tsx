'use client';

import React, {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {useAuth} from '@/context/AuthContext';
import {getAllCourses} from '@/services/CourseService';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import {CourseCardSkeleton} from '@/components/Loader';
import {Button} from '@/components/ui/button';
import {
    HiOutlineAcademicCap,
    HiOutlineArrowRight,
    HiOutlineBadgeCheck,
    HiOutlineClock,
    HiOutlineDeviceMobile,
} from 'react-icons/hi';

const FEATURES = [
    {
        Icon: HiOutlineAcademicCap,
        title: 'Learn from practitioners',
        body: 'Every course is built by someone who does the work, not just teaches it.',
    },
    {
        Icon: HiOutlineClock,
        title: 'Go at your own pace',
        body: 'Lifetime access to what you buy. Pick up exactly where you left off.',
    },
    {
        Icon: HiOutlineBadgeCheck,
        title: 'Finish with a certificate',
        body: 'Complete every lesson in a course and claim a certificate you can share.',
    },
    {
        Icon: HiOutlineDeviceMobile,
        title: 'Works on any screen',
        body: 'Watch on your laptop at your desk and on your phone on the train.',
    },
];

const STATS = [
    {value: '10,000+', label: 'Learners'},
    {value: '250+', label: 'Courses'},
    {value: '40+', label: 'Instructors'},
    {value: '4.8/5', label: 'Average rating'},
];

const Home: React.FC = () => {
    const {isLoggedIn} = useAuth();
    const [courses, setCourses] = useState<CourseCardCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = useCallback(async () => {
        const response = await getAllCourses();
        const list = (response?.course as unknown as CourseCardCourse[]) || [];
        setCourses(Array.isArray(list) ? list.slice(0, 8) : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return (
        <div className="animate-fade-in">

            {/* Hero */}
            <section className="border-b border-ink-200 bg-white">
                <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
                    <div className="lg:col-span-7">
                        <p className="eyebrow mb-4">Online learning, done properly</p>
                        <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
                            Learn the skills that move your career
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
                            Practical, expert-led courses in development, business, design and finance. Buy once,
                            keep forever, and earn a certificate when you finish.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="xl">
                                <Link href="/courses">
                                    Browse courses
                                    <HiOutlineArrowRight className="h-4 w-4"/>
                                </Link>
                            </Button>
                            {!isLoggedIn && (
                                <Button asChild variant="outline" size="xl">
                                    <Link href="/login">I already have an account</Link>
                                </Button>
                            )}
                        </div>

                        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink-200 pt-8 sm:grid-cols-4">
                            {STATS.map((stat) => (
                                <div key={stat.label}>
                                    <dt className="sr-only">{stat.label}</dt>
                                    <dd>
                                        <span className="block text-2xl font-bold text-ink-900 sm:text-3xl">
                                            {stat.value}
                                        </span>
                                        <span className="mt-0.5 block text-sm text-ink-500">{stat.label}</span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Decorative panel - hidden on small screens where it would just push content down */}
                    <div className="hidden lg:col-span-5 lg:block">
                        <div className="relative rounded-2xl border border-ink-200 bg-ink-25 p-6 shadow-e3">
                            <div className="rounded-xl bg-ink-950 p-5 text-white shadow-e4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                                    Now playing
                                </p>
                                <p className="mt-2 text-lg font-bold">Modern React from Scratch</p>
                                <p className="mt-1 text-sm text-ink-400">Lesson 2 of 3 · Components and props</p>
                                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                                    <div className="h-full w-2/3 rounded-full bg-brand-400"/>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {['Node.js & MongoDB REST APIs', 'Flutter for Beginners', 'Python Fundamentals'].map(
                                    (title, i) => (
                                        <div
                                            key={title}
                                            className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-e1"
                                        >
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                                                {i + 1}
                                            </span>
                                            <span className="truncate text-sm font-medium text-ink-800">{title}</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured courses */}
            <section className="container-page py-14 sm:py-16">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold sm:text-3xl">Fresh on SkillSurge</h2>
                        <p className="mt-1.5 text-[0.9375rem] text-ink-500">
                            The most recently published courses from our instructors.
                        </p>
                    </div>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
                    >
                        See all courses
                        <HiOutlineArrowRight className="h-4 w-4"/>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({length: 4}).map((_, i) => <CourseCardSkeleton key={i}/>)}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {courses.map((course) => <CourseCard key={course._id} course={course}/>)}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
                        <p className="text-sm text-ink-500">
                            No courses published yet.{' '}
                            <Link href="/addCourse" className="font-semibold text-brand-700 hover:underline">
                                Be the first to add one.
                            </Link>
                        </p>
                    </div>
                )}
            </section>

            {/* Why us */}
            <section className="border-y border-ink-200 bg-white py-14 sm:py-16">
                <div className="container-page">
                    <h2 className="text-2xl font-bold sm:text-3xl">Why learners stay</h2>
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({Icon, title, body}) => (
                            <div key={title}>
                                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                    <Icon className="h-5 w-5" aria-hidden="true"/>
                                </div>
                                <h3 className="text-base font-bold">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="container-page py-14 sm:py-16">
                <figure className="mx-auto max-w-3xl text-center">
                    <blockquote className="text-xl font-medium leading-relaxed text-ink-800 sm:text-2xl">
                        “The lessons are short enough to fit into a lunch break, but they actually go deep. I
                        finished two courses in a month and used both at work the week after.”
                    </blockquote>
                    <figcaption className="mt-7 flex items-center justify-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                            KV
                        </span>
                        <span className="text-left">
                            <span className="block text-sm font-semibold text-ink-900">Kushal Vaghela</span>
                            <span className="block text-sm text-ink-500">Full stack developer</span>
                        </span>
                    </figcaption>
                </figure>
            </section>

            {/* CTA */}
            <section className="container-page pb-16 sm:pb-20">
                <div className="rounded-2xl bg-ink-950 px-6 py-12 text-center sm:px-12 sm:py-14">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to start?</h2>
                    <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-300">
                        Create a free account to save favourites and track your progress, or jump straight into the
                        catalogue.
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button asChild variant="inverse" size="lg">
                            <Link href={isLoggedIn ? '/courses' : '/signup'}>
                                {isLoggedIn ? 'Browse courses' : 'Create free account'}
                            </Link>
                        </Button>
                        {!isLoggedIn && (
                            <Button asChild variant="inverse-outline" size="lg">
                                <Link href="/courses">Browse first</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
