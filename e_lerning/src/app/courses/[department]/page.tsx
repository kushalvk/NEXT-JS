'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaHeart } from 'react-icons/fa';

const CoursesByDepartmentPage: React.FC = () => {
    const [likedCourses, setLikedCourses] = useState<number[]>([]);

    const courses = [
        {
            id: 1,
            title: 'React Basics',
            category: 'Development',
            description: 'Learn the fundamentals of React to build dynamic web applications.',
            price: '$49.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
        {
            id: 2,
            title: 'Data Science with Python',
            category: 'Data Science',
            description: 'Master data analysis and machine learning with Python.',
            price: '$79.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
        {
            id: 3,
            title: 'UI/UX Design Essentials',
            category: 'Design',
            description: 'Create user-friendly interfaces with modern design principles.',
            price: '$59.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
        {
            id: 4,
            title: 'Digital Marketing 101',
            category: 'Marketing',
            description: 'Boost your marketing skills with SEO and social media strategies.',
            price: '$39.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
        {
            id: 5,
            title: 'Cloud Computing with AWS',
            category: 'IT & Software',
            description: 'Explore cloud infrastructure with Amazon Web Services.',
            price: '$69.99',
            image: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        },
        {
            id: 6,
            title: 'Leadership Skills',
            category: 'Personal Development',
            description: 'Develop leadership qualities to inspire and manage teams.',
            price: '$29.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
    ];

    // Group courses by department
    const coursesByDepartment = courses.reduce((acc, course) => {
        (acc[course.category] = acc[course.category] || []).push(course);
        return acc;
    }, {} as { [key: string]: typeof courses });

    const toggleFavorite = (courseId: number) => {
        setLikedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
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
                    {Object.keys(coursesByDepartment).map((department) => (
                        <div key={department} className="mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4">
                                {department} Courses
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coursesByDepartment[department].map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                    >
                                        <div className="relative mb-4">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                            <button
                                                onClick={() => toggleFavorite(course.id)}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                                aria-label={
                                                    likedCourses.includes(course.id)
                                                        ? 'Unlike course'
                                                        : 'Like course'
                                                }
                                            >
                                                <FaHeart
                                                    className={`w-5 h-5 ${
                                                        likedCourses.includes(course.id)
                                                            ? 'text-[#FF6B6B]'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-[#1E3A8A] mb-3">{course.description}</p>
                                        <p className="text-sm font-semibold text-gray-700 mb-3">{course.price}</p>
                                        <Button
                                            variant="destructive"
                                            className="rounded-lg duration-300 w-full"
                                        >
                                            <Link href={`/courses/${course.id}`} className="text-white">
                                                Add to Cart
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursesByDepartmentPage;