'use client';

import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-stretch bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 font-sans relative overflow-x-hidden">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full">

                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-16 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">
                            Unlock Your Learning Potential
                        </h1>
                        <p className="text-black dark:text-gray-200 text-base sm:text-lg lg:text-xl mb-6">
                            Join our learning platform to explore interactive courses, learn from expert instructors,
                            and achieve your educational goals with personalized learning paths.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Link
                                href="/signup"
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-semibold text-base sm:text-lg shadow-md text-center"
                            >
                                Start Learning Now
                            </Link>
                            <Link
                                href="/login"
                                className="text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium hover:underline transition-colors duration-300 text-base sm:text-lg mt-2 text-center"
                            >
                                Already a Member? Log In
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                                <h3 className="text-indigo-600 dark:text-indigo-300 font-semibold text-sm sm:text-base">
                                    Expert Instructors
                                </h3>
                                <p className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm">
                                    Learn from industry leaders with years of experience.
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                                <h3 className="text-indigo-600 dark:text-indigo-300 font-semibold text-sm sm:text-base">
                                    Flexible Learning
                                </h3>
                                <p className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm">
                                    Study at your own pace, anytime, anywhere.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SVG Illustration inside Hero Section only */}
                    <div className="hidden lg:flex flex-1 items-center justify-center p-6">
                        <img src="/svg/learning.svg" alt="Learning Illustration"
                             className="w-full max-w-xs object-contain"/>
                    </div>
                </div>

                {/* Featured Courses */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Featured Courses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {['React Basics', 'Data Science', 'UI/UX Design'].map((course, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition">
                                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">{course}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    Kickstart your journey with this hands-on beginner-friendly course.
                                </p>
                                <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 text-sm font-medium">
                                    Enroll Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Why Choose Us</h2>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 pl-2 sm:pl-4">
                        <li>Affordable course pricing with lifetime access.</li>
                        <li>Certificate of completion on every course.</li>
                    </ul>
                </div>

                {/* Testimonials */}
                <div className="w-full max-w-4xl mb-20 text-center px-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">What Our Students Say</h2>
                    <blockquote className="italic text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                        "This platform changed the way I learn. The interactive lessons and expert teachers made even the hardest topics easy!"
                    </blockquote>
                    <p className="text-indigo-500 dark:text-indigo-300 mt-2 font-semibold">– Riya Sharma, Frontend Developer</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
