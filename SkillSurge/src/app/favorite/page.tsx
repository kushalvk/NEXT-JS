'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { loggedUser, loggedUserResponse } from '@/services/AuthService';
import {
    getFavouriteService,
    addToFavouriteService,
    removeFromFavouriteService,
} from '@/services/FavouriteService';
import { CourseCard } from '@/utils/Responses';
import { User } from '@/models/User';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ------------------------------------------------------------------
// Re-usable components (same as SearchCoursesPage)
// ------------------------------------------------------------------
const CourseCardItem: React.FC<{
    course: CourseCard;
    isLiked: boolean;
    onToggleLike: () => void;
    index: number;
}> = ({ course, isLiked, onToggleLike, index }) => {
    return (
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
                    <p className="text-xs text-cyan-300">
                        by {course?.Username?.Username || 'Instructor'}
                    </p>
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
};

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

const EmptyState = ({ query }: { query: string }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-20"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md mx-auto border border-white/20">
            <div className="bg-gray-300/20 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No favorite courses</h3>
            <p className="text-gray-300 mb-6">
                {query
                    ? `We couldn't find any favorites matching "${query}"`
                    : 'Your favorite list is empty. Start adding courses!'}
            </p>
            <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
            >
                <Link href="/courses">Browse All Courses</Link>
            </Button>
        </div>
    </motion.div>
);

// ------------------------------------------------------------------
// Debounce hook (same as SearchCoursesPage)
// ------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): [T] {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return [debounced];
}

// ------------------------------------------------------------------
// Main FavoritePage
// ------------------------------------------------------------------
const FavoritePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);

    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [favouriteCourses, setFavouriteCourses] = useState<CourseCard[]>([]);
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    // ----------------------------------------------------------------
    // Fetch user + favourites in parallel
    // ----------------------------------------------------------------
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userRes, favRes] = await Promise.all([loggedUser(), getFavouriteService()]);

            // ----- User -----
            if ((userRes as loggedUserResponse)?.success) {
                const u = (userRes as loggedUserResponse).User;
                setUserData(u);
                const favIds = u.Favourite?.map((id) => id.toString()) ?? [];
                setLikedCourses(favIds);
            }

            // ----- Favourites -----
            if (favRes?.success && Array.isArray(favRes.User?.Favourite)) {
                const courses = favRes.User.Favourite as unknown as CourseCard[];
                setFavouriteCourses(courses);
                // sync liked state just in case
                setLikedCourses((prev) => {
                    const ids = courses.map((c) => c._id.toString());
                    return [...new Set([...prev, ...ids])];
                });
            }
        } catch (err) {
            console.error('Failed to load favorites', err);
            toast.error('Could not load your favorites');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------------------------------
    // Toggle like (optimistic + rollback)
    // ----------------------------------------------------------------
    const toggleLike = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast('Please login to manage favorites', { icon: 'Warning' });
            return;
        }

        const wasLiked = likedCourses.includes(courseId);
        const service = wasLiked ? removeFromFavouriteService : addToFavouriteService;

        // Optimistic UI
        setLikedCourses((prev) =>
            wasLiked ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
        if (wasLiked) {
            setFavouriteCourses((prev) => prev.filter((c) => c._id.toString() !== courseId));
        } else {
            // When adding, we *don't* have the full course object yet.
            // We'll fetch it later via refetch or accept the API returning it.
        }

        try {
            const res = await service({ courseId });
            // If API returns the added course (optional), push it
            if (!wasLiked && res?.success && res.course) {
                setFavouriteCourses((prev) => [...prev, res.course as CourseCard]);
            }
        } catch (err) {
            toast.error('Failed to update favorite');
            console.log(err);
            // Rollback
            setLikedCourses((prev) =>
                wasLiked ? [...prev, courseId] : prev.filter((id) => id !== courseId)
            );
            if (!wasLiked) {
                // remove the optimistic empty slot
                setFavouriteCourses((prev) => prev.filter((c) => c._id.toString() !== courseId));
            }
        }
    };

    // ----------------------------------------------------------------
    // Filter
    // ----------------------------------------------------------------
    const filteredCourses = favouriteCourses.filter(
        (c) =>
            c.Course_Name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            c.Description.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------
    return (
        <>
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 font-sans mt-21">
                {/* Header */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-4xl text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        My Favorite Courses
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Keep track of the courses you love and come back anytime.
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-3xl mb-12"
                >
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search your favorites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg group-hover:bg-white/15"
                            aria-label="Search favorite courses"
                        />
                        <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 w-6 h-6" />
                    </div>
                </motion.div>

                {/* Loading */}
                {isLoading ? (
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <>
                        {/* Results Header */}
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center"
                        >
                            {debouncedQuery
                                ? `${filteredCourses.length} favorite${filteredCourses.length > 1 ? 's' : ''}`
                                : 'Your Favorites'}
                        </motion.h2>

                        {/* Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-7xl"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCourses.map((course, idx) => (
                                    <CourseCardItem
                                        key={course._id.toString()}
                                        course={course}
                                        isLiked={likedCourses.includes(course._id.toString())}
                                        onToggleLike={() => toggleLike(course._id.toString())}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-4xl text-center mt-20 mb-10"
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Keep Exploring
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Discover more courses and add them to your favorites.
                    </p>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </motion.div>
            </div>
        </>
    );
};

export default FavoritePage;