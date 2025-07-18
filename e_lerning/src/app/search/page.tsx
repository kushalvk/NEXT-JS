'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';
import {FaHeart} from "react-icons/fa";

const SearchCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
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
            image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
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

    const toggleLike = (courseId: number) => {
        setLikedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
        // In a real app, sync with backend or favorites page here
    };

    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {filteredCourses.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            No courses found. Try adjusting your search.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
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
                                        <button
                                            onClick={() => toggleLike(course.id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={likedCourses.includes(course.id) ? 'Unlike course' : 'Like course'}
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
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{course.title}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{course.description}</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">{course.price}</p>
                                    <Button variant="destructive" className="rounded-lg duration-300 w-full">
                                        <Link href={`/view/course/${course.id}`} className="text-white">
                                            View Course
                                        </Link>
                                    </Button>
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