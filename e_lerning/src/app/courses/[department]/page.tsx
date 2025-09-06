'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FaHeart} from 'react-icons/fa';
import {User} from "@/models/User";
import {loggedUser, loggedUserResponse} from "@/services/AuthService";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {useParams, useRouter} from "next/navigation";
import {fetchCourseByDepartment} from "@/services/CourseService";
import {Course} from "@/models/Course";
import {CourseResponse} from "@/utils/Responses";
import Loader from "@/components/Loader";

const CoursesByDepartmentPage: React.FC = () => {
    const [likedCourses, setLikedCourses] = useState<any[]>([]);
    const [userData, setUserData] = useState<User>();
    const [coursesDepartment, setCoursesDepartment] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    const params = useParams();
    const department = decodeURIComponent(params?.department as string);

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

    const fetchCoursesDepartment = async () => {
        try {
            const response: CourseResponse = await fetchCourseByDepartment(department);

            if (response.success) {
                setCoursesDepartment(response.course)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUserData();
        fetchCoursesDepartment();
    }, [department]);

    const courses = coursesDepartment;

    // Group courses by department
    const coursesByDepartment = courses.reduce((acc, course) => {
        (acc[course.Department] = acc[course.Department] || []).push(course);
        return acc;
    }, {} as { [key: string]: typeof courses });

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
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                <div className="mt-16 w-full max-w-6xl">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">
                        Courses by Department
                    </h1>
                    <Button
                        variant="outline"
                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg mb-6"
                    >
                        <Link href="/courses">Back to Courses</Link>
                    </Button>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4">
                        {department} Courses
                    </h2>
                    {isLoading ? (
                        <Loader/>
                    ) : (
                        Object.keys(coursesByDepartment).map((department) => (
                            <div key={department} className="mb-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coursesByDepartment[department].map((course) => (
                                        <div
                                            key={course._id}
                                            className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                        >
                                            <div className="relative mb-4">
                                                <img
                                                    src={course.Image}
                                                    alt={course.Course_Name}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <div
                                                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                                <button
                                                    onClick={() => toggleLike(course._id)}
                                                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                                    aria-label={
                                                        likedCourses.includes(course._id)
                                                            ? 'Unlike course'
                                                            : 'Like course'
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
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                {course.Course_Name}
                                            </h3>
                                            <p className="text-sm text-[#1E3A8A] mb-3">{course.Description}</p>
                                            <p className="text-sm font-semibold text-gray-700 mb-3">₹ {course.Price}</p>
                                            <Button
                                                variant="destructive"
                                                className="rounded-lg duration-300 w-full"
                                            >
                                                <Link href={`/view/course/${course._id}`} className="text-white">
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursesByDepartmentPage;