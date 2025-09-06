'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {FaHeart} from 'react-icons/fa';
import {Course} from "@/models/Course";
import {CourseResponse} from "@/utils/Responses";
import {getAllCourses} from "@/services/CourseService";
import {User} from "@/models/User";
import {loggedUser, loggedUserResponse} from "@/services/AuthService";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";
import Image from "next/image";

const CoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [likedCourses, setLikedCourses] = useState<[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [userData, setUserData] = useState<User>();
    const [isLoding, setIsLoding] = useState(true);

    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const response: loggedUserResponse = await loggedUser();

            if (response.success) {
                setUserData(response.User);
                setLikedCourses(response.User.Favourite);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchCourses = async () => {
        try {
            const response: CourseResponse = await getAllCourses();

            if (response.success) {
                setCourses(response.course);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoding(false);
        }
    }

    useEffect(() => {
        fetchUserData();
        fetchCourses();
    }, []);

    const categories = ['All', 'Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development',
        'Entrepreneurship', 'Management', 'Sales', 'Business Strategy', 'Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing'];

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

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full">
                {/* Hero Section */}
                <div
                    className="flex flex-col mt-17 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-7 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Explore Our Courses
                        </h1>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="w-full max-w-6xl px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                        <div className="relative w-full sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm sm:text-base"
                            />
                            <FiSearch
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B6B] cursor-pointer transition-colors duration-300 w-5 h-5"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? 'destructive' : 'outline'}
                                    className={`text-white px-4 py-2 rounded-xl duration-300 text-sm sm:text-base ${
                                        selectedCategory === category ? '' : 'hover:bg-white/20'
                                    }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6">
                        {selectedCategory === 'All' ? 'All Courses' : `${selectedCategory} Courses`}
                    </h2>
                    {isLoding ? (
                        <Loader/>
                    ) : filteredCourses.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            No courses found. Try adjusting your search or category.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                >
                                    <div className="relative mb-4">
                                        <Image
                                            src={course.Image || "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                                            alt={course.Course_Name}
                                            width={400}
                                            height={400}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <div
                                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                        <button
                                            onClick={() => toggleLike(course._id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={likedCourses.includes(course._id) ? 'Unlike course' : 'Like course'}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(course._id) ? 'text-[#FF6B6B]' : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{course.Course_Name}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{course.Description}</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">₹ {course.Price}</p>
                                    <Button variant="destructive" className="rounded-lg duration-300 w-full">
                                        <Link href={`/view/course/${course._id}`} className="text-white">
                                            Add to Cart
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;