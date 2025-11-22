'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaHeart } from 'react-icons/fa';
import { loggedUser } from '@/services/AuthService';
import toast from 'react-hot-toast';
import { addToFavouriteService, removeFromFavouriteService } from '@/services/FavouriteService';
import { useParams, useRouter } from 'next/navigation';
import { fetchCourseByDepartment } from '@/services/CourseService';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Types } from 'mongoose';

// ------------------------------------------------------------------
// DTOs (plain objects – no Mongoose)
// ------------------------------------------------------------------
export interface CourseCard {
    _id: string;
    Image?: string;
    Course_Name: string;
    Description: string;
    Department: string;
    Price: number;
    Username: { _id: string; Username: string };
    Video: { _id: string; Video_Description: string }[];
}

export interface CourseResponse {
    success: boolean;
    message?: string;
    courses: CourseCard | CourseCard[];
}

// ------------------------------------------------------------------
// Reusable UI
// ------------------------------------------------------------------
const CourseCardItem: React.FC<{
    course: CourseCard;
    isLiked: boolean;
    onToggleLike: () => void;
    index: number;
}> = ({ course, isLiked, onToggleLike, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
            <div className="relative aspect-video overflow-hidden">
                <Image
                    src={course.Image || '/images/placeholder-course.jpg'}
                    alt={course.Course_Name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={onToggleLike}
                    className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                >
                    <FaHeart
                        className={`w-5 h-5 transition-all duration-300 ${
                            isLiked ? 'text-red-500 scale-110' : 'text-gray-600'
                        }`}
                    />
                </motion.button>
            </div>

            <div className="p-5 space-y-3">
                <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {course.Course_Name}
                </h3>
                <p className="text-sm text-gray-300 line-clamp-2">{course.Description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{course.Price}</span>
                    <Button
                        asChild
                        variant="default"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium rounded-xl px-4 py-2 text-sm"
                    >
                        <Link href={`/view/course/${course._id}`}>View Details</Link>
                    </Button>
                </div>
            </div>
        </div>
    </motion.div>
);

const SkeletonCard = () => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 animate-pulse border border-white/10">
        <div className="bg-gray-300/20 h-48 rounded-xl mb-4" />
        <div className="space-y-3">
            <div className="h-5 bg-gray-300/20 rounded w-3/4" />
            <div className="h-4 bg-gray-300/20 rounded w-full" />
            <div className="h-4 bg-gray-300/20 rounded w-2/3" />
            <div className="h-10 bg-gray-300/20 rounded mt-4" />
        </div>
    </div>
);

const LoginRequired = () => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-20"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md mx-auto border border-white/20">
            <div className="bg-gray-300/20 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
            <p className="text-gray-300 mb-6">
                Please log in to view courses and add them to your favorites.
            </p>
            <Button
                asChild
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
            >
                <Link href="/login">Log In Now</Link>
            </Button>
        </div>
    </motion.div>
);

const EmptyState = ({ dept }: { dept: string }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-24"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto border border-white/20">
            {/* Custom Beautiful SVG Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-8 w-28 h-28"
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#gradient)" strokeWidth="8" opacity="0.3"/>
                    <circle cx="100" cy="100" r="60" fill="none" stroke="url(#gradient)" strokeWidth="6"/>
                    <path d="M70 80 L95 105 L130 70" stroke="#ef4444" strokeWidth="8" fill="none" strokeLinecap="round"/>
                    <circle cx="130" cy="130" r="25" fill="#ef4444" opacity="0.2"/>
                    <path d="M120 120 L140 140 M140 120 L120 140" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4"/>
                            <stop offset="100%" stopColor="#a855f7"/>
                        </linearGradient>
                    </defs>
                </svg>
            </motion.div>

            <h3 className="text-3xl font-bold text-white mb-3">No courses in {dept}</h3>
            <p className="text-gray-300 mb-10">
                This department is empty for now.<br />
                <span className="text-cyan-400">Stay tuned for new courses!</span>
            </p>

            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold">
                <Link href="/courses">Back to All Courses</Link>
            </Button>
        </div>
    </motion.div>
);

// ------------------------------------------------------------------
// Main Page – **ONLY SHOWS COURSES WHEN LOGGED IN**
// ------------------------------------------------------------------
const CoursesByDepartmentPage: React.FC = () => {
    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [courses, setCourses] = useState<CourseCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null); // null = checking

    const router = useRouter();
    const params = useParams();
    const department = decodeURIComponent(params?.department as string);

    // ----------------------------------------------------------------
    // 1. Check Auth → 2. Fetch Courses (only if logged in)
    // ----------------------------------------------------------------
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // ---- 1. AUTH CHECK ----
            const userRes = await loggedUser();

            if (!userRes?.success) {
                setIsLoggedIn(false);
                toast.error('Please log in to view courses');
                router.replace('/login'); // hard redirect
                return;
            }

            setIsLoggedIn(true);
            const favs = userRes.User.Favourite || [];
            setLikedCourses(favs.map((id: string | Types.ObjectId) => id.toString()));

            // ---- 2. FETCH COURSES (only if logged in) ----
            const courseRes = await fetchCourseByDepartment(department);

            if (courseRes?.success) {
                const data = (courseRes as unknown as CourseResponse).courses;
                const courseArray: CourseCard[] = Array.isArray(data) ? data : [data];
                setCourses(courseArray);
            } else {
                toast.error('No courses found in this department');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load data');
            setIsLoggedIn(false);
            router.replace('/login');
        } finally {
            setIsLoading(false);
        }
    }, [department, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------------------------------
    // Like / Unlike (only if logged in)
    // ----------------------------------------------------------------
    const toggleLike = async (courseId: string) => {
        if (!isLoggedIn) return;

        const wasLiked = likedCourses.includes(courseId);
        const service = wasLiked ? removeFromFavouriteService : addToFavouriteService;

        setLikedCourses((prev) =>
            wasLiked ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );

        try {
            await service({ courseId });
        } catch {
            toast.error('Failed to update favorite');
            setLikedCourses((prev) =>
                wasLiked ? [...prev, courseId] : prev.filter((id) => id !== courseId)
            );
        }
    };

    // ----------------------------------------------------------------
    // Render – **NO COURSES IF NOT LOGGED IN**
    // ----------------------------------------------------------------
    if (isLoggedIn === null) {
        // Still checking auth → show loading skeletons
        return (
            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20">
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <LoginRequired />;
    }

    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 font-sans">
                {/* Header */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-4xl text-center mb-12 mt-21"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        {department} Courses
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Explore courses in your chosen department.
                    </p>
                </motion.div>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Button asChild variant="outline" className="border-white/30 text-bleck hover:bg-white/10">
                        <Link href="/courses">Back to All Courses</Link>
                    </Button>
                </motion.div>

                {/* Loading / Empty / Courses */}
                {isLoading ? (
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : courses.length === 0 ? (
                    <EmptyState dept={department} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-7xl"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses
                                .filter((course): course is CourseCard =>
                                    !!course?.Course_Name && !!course?._id
                                )
                                .map((course, idx) => (
                                    <CourseCardItem
                                        key={course._id}
                                        course={course}
                                        isLiked={likedCourses.includes(course._id)}
                                        onToggleLike={() => toggleLike(course._id)}
                                        index={idx}
                                    />
                                ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default CoursesByDepartmentPage;