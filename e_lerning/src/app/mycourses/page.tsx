'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {FaHeart, FaPlayCircle} from 'react-icons/fa';
import {User} from "@/models/User";
import {loggedUser, loggedUserResponse} from "@/services/AuthService";
import {getCourseData} from "@/services/MyCourseService";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";

const MyCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [myCourses, setMyCourses] = useState([]);
    const [userData, setUserData] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const response: loggedUserResponse = await loggedUser();
            if (response.success) {
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
                const favIds = response.User.Favourite.map((fav) => fav.toString());
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
        <div
            className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                {/* Hero Section */}
                <div
                    className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-5 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            My Courses
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            Track your learning progress and continue your journey with our expert-led courses.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                            >
                                <Link href="/courses">Explore More Courses</Link>
                            </Button>
                            <Link
                                href="/profile"
                                className="text-white hover:text-gray-400 font-medium hover:underline transition-colors duration-300 text-base sm:text-lg mt-2 text-center"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="w-full max-w-6xl px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                        <div className="relative w-full sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search my courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm sm:text-base"
                                aria-label="Search my courses"
                            />
                            <FiSearch
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B6B] cursor-pointer transition-colors duration-300 w-5 h-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses List */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6">Your Enrolled Courses</h2>
                    {isLoading ? (
                        <Loader/>
                    ) : filteredCourses.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            No courses found. Try adjusting your search or enroll in a new course.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.courseId._id}
                                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={course.courseId.Image || "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                                            alt={course.courseId.Course_Name}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <div
                                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                        <button
                                            onClick={() => toggleLike(course.courseId._id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={likedCourses.includes(course.courseId._id) ? 'Unlike course' : 'Like course'}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(course.courseId._id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{course.courseId.Course_Name}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{course.courseId.Description}</p>
                                    {/*<div className="mb-3">*/}
                                    {/*    <p className="text-sm font-semibold text-gray-700">Progress: {course.progress}%</p>*/}
                                    {/*    <div className="w-full bg-gray-200 rounded-full h-2.5">*/}
                                    {/*        <div*/}
                                    {/*            className="bg-[#FF6B6B] h-2.5 rounded-full"*/}
                                    {/*            style={{ width: `${course.progress}%` }}*/}
                                    {/*        ></div>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            className="rounded-lg duration-300 flex-1 flex items-center justify-center gap-2"
                                        >
                                            <Link href={`/view/course/${course.courseId._id}`} className="text-white">
                                                Continue Learning
                                            </Link>
                                            <FaPlayCircle className="w-5 h-5"/>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-lg duration-300 flex items-center justify-center"
                                            onClick={() => toggleLike(course.courseId._id)}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(course.courseId._id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Keep Learning!</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Explore new courses to continue your learning journey and achieve your goals.
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

export default MyCoursesPage;