'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {FaHeart, FaPlayCircle} from 'react-icons/fa';
import {User} from "@/models/User";
import {loggedUser} from "@/services/AuthService";
import {getCourseData} from "@/services/MyCourseService";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";
import Image from "next/image";
import { motion } from 'framer-motion';

const MyCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    type MyCourse = {
        courseId: {
            _id: string;
            Course_Name: string;
            Description: string;
            Image?: string;
        };
        Image?: string;
        // Add other properties if needed
    };
    const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
    const [userData, setUserData] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const response = await loggedUser();
            if (response && response.success) {
                setUserData(response.User);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const courseData = async () => {
        try {
            const response = await getCourseData();

            if (response.success) {
                setMyCourses(response.User.Buy_Course);
                const favIds = response.User.Favourite.map((id: string) => id);
                setLikedCourses(favIds);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUserData();
        courseData();
    }, []);

    const enrolledCourses = myCourses;

    const toggleLike = async (courseId: string) => {

        if (!userData) {
            router.push('/login');
            toast("Please Login first", {
                icon: '⚠️',
            });
            return;
        }

        const isLiked = likedCourses.includes(courseId);

        try {
            if (isLiked) {
                // Call UNLIKE API
                setLikedCourses((prev) => prev.filter((id) => id !== courseId));
                await removeFromFavouriteService({courseId});
            } else {
                // Call LIKE API
                setLikedCourses((prev) => [...prev, courseId]);
                await addToFavouriteService({courseId});
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const filteredCourses = enrolledCourses.filter(
        (course) =>
            course.courseId?.Course_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseId?.Description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />
                <motion.div
                    animate={{ x: [-100, 100, -100], y: [-50, 100, -50] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 left-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [100, -100, 100], y: [50, -100, 50] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-20 right-0 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"
                />
            </div>

            <div className="min-h-screen w-full flex flex-col items-stretch p-4 font-sans relative">
                <div className="flex flex-col items-center justify-start p-6 sm:p-8 lg:p-12 flex-1">

                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-6xl text-center mb-16 mt-21"
                    >
                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
                            My Courses
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Track your learning journey with expert-led courses.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
                            <Button asChild size="lg" className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white font-bold px-10 py-6 rounded-2xl shadow-xl">
                                <Link href="/courses">Explore More Courses</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-2 border-white/30 hover:bg-white/10 backdrop-blur-xl text-black font-semibold px-10 py-6 rounded-2xl">
                                <Link href="/profile">View Profile</Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Search */}
                    <div className="w-full max-w-6xl mb-12">
                        <div className="relative max-w-xl mx-auto group">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-cyan-400 transition-all text-2xl" />
                            <input
                                type="text"
                                placeholder="Search my courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-white/10 backdrop-blur-2xl border border-white/20 text-white placeholder-gray-400 rounded-3xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all text-lg shadow-2xl group-hover:bg-white/20"
                            />
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl -z-10 group-hover:opacity-100 opacity-70 transition-opacity" />
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="w-full max-w-6xl">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl font-bold text-white mb-10 text-center"
                        >
                            Your Enrolled Courses
                        </motion.h2>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader />
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-24"
                            >
                                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-16 max-w-md mx-auto border border-white/20">
                                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border-2 border-dashed border-white/30" />
                                    <h3 className="text-3xl font-bold text-white mb-4">No courses found</h3>
                                    <p className="text-gray-300 text-lg mb-8">Try a different search or enroll in new courses!</p>
                                    <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                                        <Link href="/courses">Browse Courses</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredCourses.map((course: MyCourse, index) => (
                                    <motion.div
                                        key={course.courseId._id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group"
                                    >
                                        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:-translate-y-3 border border-white/20">
                                            <div className="relative aspect-video">
                                                <Image
                                                    src={course.courseId.Image || "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                                                    alt={course.courseId.Course_Name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => toggleLike(course.courseId._id)}
                                                    className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all"
                                                >
                                                    <FaHeart className={`w-6 h-6 ${likedCourses.includes(course.courseId._id) ? 'text-pink-500' : 'text-white/70'}`} />
                                                </motion.button>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {course.courseId.Course_Name}
                                                </h3>
                                                <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                                                    {course.courseId.Description}
                                                </p>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        asChild
                                                        className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6 rounded-2xl shadow-xl transform transition-all hover:scale-105"
                                                    >
                                                        <Link href={`/view/course/${course.courseId._id}`} className="flex items-center justify-center gap-3">
                                                            <FaPlayCircle className="w-6 h-6" />
                                                            Continue Learning
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-11 h-11 border-white/30 bg-white/10"
                                                        onClick={() => toggleLike(course.courseId._id)}
                                                    >
                                                        <FaHeart className={`w-5 h-5 ${likedCourses.includes(course.courseId._id) ? 'text-pink-500' : 'text-black/50'}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="w-full max-w-6xl text-center mt-24"
                    >
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                            Keep Learning!
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Explore new courses and level up your skills every day.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
                        >
                            <Link href="/courses">Browse All Courses</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default MyCoursesPage;