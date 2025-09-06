'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {FaHeart} from "react-icons/fa";
import {getAllCourses} from "@/services/CourseService";
import {loggedUser, loggedUserResponse} from "@/services/AuthService";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {CourseCard, CourseResponse} from "@/utils/Responses";
import {User} from "@/models/User";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";

const SearchCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [courses, setCourses] = useState<CourseCard[]>([]);
    const [userData, setUserData] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const courseData = async () => {
            try {
                const response: CourseResponse = await getAllCourses();

                if (!response.success) {
                    console.error(response.message);
                } else {
                    setCourses(response.course);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        const userdata = async () => {
            try {
                const response: loggedUserResponse = await loggedUser();

                if (response.success) {
                    setUserData(response.User);
                    const favIds = response.User.Favourite.map((fav: any) => fav.toString()); // convert ObjectId to string
                    setLikedCourses(favIds);
                }
            } catch (error) {
                console.error(error);
            }
        }
        userdata();
        courseData();
    }, []);

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
                await removeFromFavouriteService({ courseId });
            } else {
                // Call LIKE API
                setLikedCourses((prev) => [...prev, courseId]);
                await addToFavouriteService({ courseId });
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const filteredCourses = courses.filter(
        (course) =>
            course.Course_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.Description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                {/* Search Input */}
                <div className="w-full max-w-3xl mt-20 mb-12 px-2 sm:px-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-white/10 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-lg sm:text-xl text-center"
                            aria-label="Search for courses"
                        />
                        <FiSearch
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B6B] cursor-pointer transition-colors duration-300 w-6 h-6"
                        />
                    </div>
                </div>

                {/* Courses List */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6 text-center">
                        {searchQuery ? 'Search Results' : 'All Courses'}
                    </h2>

                    {isLoading ? (
                        <Loader />
                    ) : filteredCourses.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            No courses found. Try adjusting your search.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={
                                                course.Image ||
                                                "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
                                            }
                                            alt={course.Course_Name}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => toggleLike(course._id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={
                                                likedCourses.includes(course._id) ? 'Unlike course' : 'Like course'
                                            }
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(course._id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{course.Course_Name}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{course.Description}</p>
                                    <p className="text-sm text-[#1E3A8A] mb-3">
                                        By: {course?.Username?.Username || "Unknown"}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">
                                        Price: ₹{course.Price}
                                    </p>

                                    <Link href={`/view/course/${course._id}`} passHref>
                                        <Button variant="destructive" className="rounded-lg duration-300 w-full text-white">
                                            View Course
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Explore More Courses</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Discover a wide range of courses to boost your skills and achieve your goals.
                    </p>
                    <Button
                        variant="outline"
                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SearchCoursesPage;