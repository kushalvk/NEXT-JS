'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const Home: React.FC = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token)
            setIsLoggedIn(true);
        else
            setIsLoggedIn(false);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full">
                {/* Hero Section */}
                <div className="flex flex-col mt-3 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-16 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Unlock Your Learning Potential
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            Join our learning platform to explore interactive courses, learn from expert instructors,
                            and achieve your educational goals with personalized learning paths.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Button
                                variant={"outline"}
                                onClick={() => router.push('/courses')}
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                            >
                                Start Learning Now
                            </Button>
                            {!isLoggedIn ? (
                                <Link
                                    href="/login"
                                    className="text-white hover:text-gray-400 font-medium hover:underline transition-colors duration-300 text-base sm:text-lg mt-2 text-center"
                                >
                                    Already a Member? Log In
                                </Link>
                            ) : null }
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#F5F5F5] p-4 rounded-xl shadow-lg hover:shadow-xl transition">
                                <h3 className="text-gray-700 font-semibold text-sm sm:text-base">
                                    Expert Instructors
                                </h3>
                                <p className="text-[#1E3A8A] text-xs sm:text-sm">
                                    Learn from industry leaders with years of experience.
                                </p>
                            </div>
                            <div className="bg-[#F5F5F5] p-4 rounded-xl shadow-lg hover:shadow-xl transition">
                                <h3 className="text-gray-700 font-semibold text-sm sm:text-base">
                                    Flexible Learning
                                </h3>
                                <p className="text-[#1E3A8A] text-xs sm:text-sm">
                                    Study at your own pace, anytime, anywhere.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Section Image */}
                    <div className="ml-5 hidden lg:flex flex-1 items-center justify-center relative">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/002/629/904/non_2x/portrait-of-woman-university-student-holding-book-in-studio-grey-background-free-photo.jpg"
                            alt="Modern Learning Environment"
                            className="max-w-lg object-cover rounded-lg shadow-xl"
                        />
                        <div className="ml-7 absolute inset-0 rounded-lg bg-gradient-to-r from-black/70 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Why Choose Us</h2>
                    <ul className="list-disc list-inside text-[#F5F5F5]/80 space-y-2 pl-2 sm:pl-4 text-base">
                        <li>Affordable course pricing with lifetime access.</li>
                        <li>Certificate of completion on every course.</li>
                    </ul>
                </div>

                {/* Testimonials */}
                <div className="w-full max-w-4xl mb-20 text-center px-2">
                    <h2 className="text-2xl font-bold text-gray-200 mb-4">What Our Students Say</h2>
                    <blockquote className="italic text-[#F5F5F5]/80 max-w-xl mx-auto text-lg">
                        &quot;This platform changed the way I learn. The interactive lessons and expert teachers made even the hardest topics easy!&quot;
                    </blockquote>
                    <p className="text-indigo-300 mt-2 font-semibold">– Kushal Vaghela, Full Stack Developer</p>
                </div>
            </div>
        </div>
    );
};

export default Home;