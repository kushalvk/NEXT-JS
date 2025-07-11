'use client';

import React, {useState} from 'react';
import Link from 'next/link';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Handle sign-up logic here
        console.log('Username:', username, 'Email:', email, 'Password:', password, 'Full Name:', fullName);
    };

    return (
        <div
            className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 p-4 font-sans">
            {/* Left Side - Sign-Up Form */}
            <div className="flex-1 flex items-center justify-center p-5">
                <div
                    className="mt-11 bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg transform transition-all duration-500 hover:scale-105">
                    <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 animate-fade-in">
                        Join Our Learning Community
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-indigo-600 font-semibold mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-indigo-600 font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-indigo-600 font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-indigo-600 font-semibold mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="fullName" className="block text-indigo-600 font-semibold mb-2">
                                Full Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href="/login"
                                className="text-sm text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition-colors duration-300"
                            >
                                Back to Login
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-semibold text-lg"
                        >
                            Sign Up
                        </button>
                    </form>
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Start your learning journey with us today!
                    </p>
                </div>
            </div>
            {/* Right Side - SVG Illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                <img src={"/svg/sign-up.svg"} alt="Sign-up Illustration" className="max-h-md max-w-md"/>
            </div>
        </div>
    );
};

export default SignUp;