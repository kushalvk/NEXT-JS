"use client"
import React, {useState} from 'react';
import Link from "next/link";

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Username:', username, 'Password:', password);
    };

    return (
        <div
            className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 p-4 font-sans">
            {/* Left Side - SVG Illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                <img src={"/svg/login.svg"} alt="Login Illustration" className="max-h-md max-w-md"/>
            </div>
            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div
                    className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md transform transition-all duration-500 hover:scale-105">
                    <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 animate-fade-in">
                        Let's get back to Learning
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
                        <div className="flex justify-between items-center">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition-colors duration-300"
                            >
                                Forgot Password?
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition-colors duration-300"
                            >
                                Sign Up
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-semibold text-lg"
                        >
                            Sign In
                        </button>
                    </form>
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Join our e-learning community to unlock a world of knowledge!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;