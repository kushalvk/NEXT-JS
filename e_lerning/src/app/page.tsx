'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import Image from "next/image";

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
        <div
            className="pt-32 lg:pt-36 min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 items-stretch p-4 font-sans relative overflow-hidden">
            <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 absolute inset-0 opacity-10 pointer-events-none bg-pattern" aria-hidden="true"/>

            <div className="flex flex-col items-center justify-start p-6 sm:p-8 lg:p-12 max-h-full relative z-10">
                {/* Hero Section */}
                <div
                    className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left max-w-7xl mb-20 w-full gap-10 animate-fadeIn">
                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 animate-slideUp">
                                Unlock Your <br className="hidden sm:block"/> Learning Potential
                            </h1>
                            <p className="text-gray-300 text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-2xl">
                                Join thousands of learners exploring <span className="text-cyan-400 font-semibold">interactive courses</span>,
                                guided by <span className="text-indigo-400 font-semibold">expert instructors</span>, and
                                powered by <span className="text-purple-400 font-semibold">personalized paths</span>.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                            <button
                                onClick={() => router.push('/courses')}
                                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10">Start Learning Now</span>
                                <div
                                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            </button>

                            {!isLoggedIn ? (
                                <Link
                                    href="/login"
                                    className="px-8 py-4 text-cyan-300 font-semibold text-lg border-2 border-cyan-500/50 rounded-2xl hover:bg-cyan-500/10 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Already a Member? Log In
                                </Link>
                            ) : null}
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                            {[
                                {
                                    title: "Expert Instructors",
                                    desc: "Learn from industry leaders with real-world mastery.",
                                    icon: "🎓",
                                },
                                {
                                    title: "Flexible Learning",
                                    desc: "Study anytime, anywhere — on your schedule.",
                                    icon: "⏰",
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="group bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                                >
                                    <div className="text-3xl mb-3">{feature.icon}</div>
                                    <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                                    <p className="text-gray-300 text-sm mt-1">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Image with Floating Effect */}
                    <div className="hidden lg:flex flex-1 items-center justify-center relative animate-float">
                        <div className="relative">
                            <Image
                                src="https://static.vecteezy.com/system/resources/previews/002/629/904/non_2x/portrait-of-woman-university-student-holding-book-in-studio-grey-background-free-photo.jpg"
                                alt="Modern Learning Environment"
                                width={500}
                                height={500}
                                className="max-w-md object-cover rounded-3xl shadow-2xl border-4 border-white/20"
                            />
                            {/* Gradient Overlay */}
                            <div
                                className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-600/70 via-transparent to-cyan-600/70 pointer-events-none"></div>
                            {/* Floating Badge */}
                            <div
                                className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                10,000+ Learners
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="w-full max-w-6xl mb-20 px-4 animate-fadeInUp">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center lg:text-left">
                        Why <span className="text-cyan-400">Choose Us?</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            "Affordable pricing with lifetime access to all courses.",
                            "Official certificate upon completion of every course.",
                            "Interactive quizzes, projects, and community support.",
                            "Mobile app for learning on the go.",
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 text-gray-200 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition"
                            >
                                <span className="text-cyan-400 mt-1">✔</span>
                                <span className="text-base sm:text-lg">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials */}
                <div className="w-full max-w-5xl mb-24 text-center px-4 animate-fadeInUp">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
                        What Our <span className="text-indigo-400">Students Say</span>
                    </h2>
                    <div
                        className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-3xl mx-auto">
                        <div
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-cyan-500/30">“
                        </div>
                        <blockquote className="italic text-xl sm:text-2xl text-gray-100 leading-relaxed relative z-10">
                            “This platform changed the way I learn. The interactive lessons and expert teachers made
                            even the hardest topics easy!”
                        </blockquote>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                KV
                            </div>
                            <div className="text-left">
                                <p className="text-indigo-300 font-bold text-lg">Kushal Vaghela</p>
                                <p className="text-gray-400 text-sm">Full Stack Developer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 1s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.8s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 1s ease-out;
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;