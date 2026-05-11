'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { CourseCard, CourseResponse } from "@/utils/Responses";
import { getAllCourses } from "@/services/CourseService";
import { User } from "@/models/User";
import { loggedUser, loggedUserResponse } from "@/services/AuthService";
import toast from "react-hot-toast";
import { addToFavouriteService, removeFromFavouriteService } from "@/services/FavouriteService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Types } from 'mongoose';
import { motion } from "framer-motion";

const CoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [courses, setCourses] = useState<CourseCard[]>([]);
    const [userData, setUserData] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const response = await loggedUser() as loggedUserResponse;
            if (response.success) {
                setUserData(response.User);
                setLikedCourses(response.User.Favourite.map((id: string | Types.ObjectId) => id.toString()));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await getAllCourses() as CourseResponse;
            if (response.success) {
                setCourses(response.course as unknown as CourseCard[]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchCourses();
    }, []);

    const categories = [
        'All', 'Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development',
        'Entrepreneurship', 'Management', 'Sales', 'Business Strategy', 'Accounting',
        'Bookkeeping', 'Financial Analysis', 'Investing'
    ];

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.Course_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.Description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.Department === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleLike = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", { icon: 'Warning' });
            return;
        }

        const isLiked = likedCourses.includes(courseId);
        try {
            if (isLiked) {
                setLikedCourses(prev => prev.filter(id => id !== courseId));
                await removeFromFavouriteService({ courseId });
            } else {
                setLikedCourses(prev => [...prev, courseId]);
                await addToFavouriteService({ courseId });
            }
        } catch (error) {
            toast.error("Failed to update favorite");
            console.log(error);
            setLikedCourses(prev => isLiked ? [...prev, courseId] : prev.filter(id => id !== courseId));
        }
    };

    return (
        <>
            {/* Animated Gradient Background - EXACT SAME AS SearchCoursesPage */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"/>
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"/>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"/>
            </div>

            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 font-sans">
                {/* Hero + Search */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-3xl mb-12 mt-15 text-center"
                >
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
                        Explore Our Courses
                    </h1>

                    {/* Search Bar - IDENTICAL TO SearchCoursesPage */}
                    <div className="relative group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 w-6 h-6"/>
                        <input
                            type="text"
                            placeholder="Search courses by name or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg group-hover:bg-white/15"
                        />
                    </div>
                </motion.div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md ${
                                selectedCategory === category
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:border-cyan-400'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Loading / Empty / Courses */}
                {isLoading ? (
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i}/>
                            ))}
                        </div>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center"
                        >
                            {selectedCategory === 'All' ? 'All Courses' : `${selectedCategory} Courses`}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-7xl"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCourses.map((course, index) => (
                                    <CourseCardItem
                                        key={course._id.toString()}
                                        course={course}
                                        isLiked={likedCourses.includes(course._id.toString())}
                                        onToggleLike={() => toggleLike(course._id.toString())}
                                        index={index}
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
                        Discover expert-led courses in programming, design, business, and more.
                    </p>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href="/search">Search More Courses</Link>
                    </Button>
                </motion.div>
            </div>
        </>
    );
};

// Reusable Components - 100% MATCHED TO SearchCoursesPage
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
                    <p className="text-xs text-cyan-300">by {course?.Username?.Username || 'Instructor'}</p>
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
        <div className="bg-gray-300/20 h-48 rounded-xl mb-4"/>
        <div className="space-y-3">
            <div className="h-5 bg-gray-300/20 rounded w-3/4"/>
            <div className="h-4 bg-gray-300/20 rounded w-full"/>
            <div className="h-4 bg-gray-300/20 rounded w-2/3"/>
            <div className="h-10 bg-gray-300/20 rounded mt-4"/>
        </div>
    </div>
);

const EmptyState = () => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-20"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md mx-auto border border-white/20">
            <div className="bg-gray-300/20 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6"/>
            <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-gray-300 mb-6">
                Try adjusting your search or category filters.
            </p>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/courses">Clear Filters</Link>
            </Button>
        </div>
    </motion.div>
);

export default CoursesPage;