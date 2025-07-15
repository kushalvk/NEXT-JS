'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';

const CoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const categories = ['All', 'Development', 'Data Science', 'Design', 'Marketing', 'IT & Software', 'Personal Development'];

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full">
                {/* Hero Section */}
                <div className="flex flex-col mt-17 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-12 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Explore Our Courses
                        </h1>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="w-full max-w-6xl mb-12 px-2 sm:px-4">
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
                    {filteredCourses.length === 0 ? (
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
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{course.title}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{course.description}</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">{course.price}</p>
                                    <Button variant="destructive" className="rounded-lg duration-300 w-full">
                                        <Link href={`/courses/${course.id}`} className="text-white">
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