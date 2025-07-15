'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {signup} from '@/services/AuthService';
import toast from 'react-hot-toast';
import {useRouter} from "next/navigation";
import CommonApiResponse from "@/utils/CommonApiResponse";

export interface SignupData {
    Username: string;
    Email: string;
    Password: string;
    Full_name: string;
}

const SignUp: React.FC = () => {
    const [Username, setUsername] = useState<string>('');
    const [Email, setEmail] = useState<string>('');
    const [Password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [Full_name, setFullName] = useState<string>('');
    const [error, setError] = useState<string>('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const loadingToastId = toast.loading("Please wait while we finalize the details...");

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

        if (!passwordRegex.test(Password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 8 characters long.");
            toast.error("Invalid password format.");
            toast.dismiss(loadingToastId);
            return;
        }

        if (Password !== confirmPassword) {
            toast.error('Passwords do not match!');
            toast.dismiss(loadingToastId);
            return;
        }

        const payload: SignupData = {Username, Password, Email, Full_name};

        try {
            const response: CommonApiResponse = await signup(payload);

            if (!response.success) {
                toast.error(response.message);
                toast.dismiss(loadingToastId);
            } else {
                toast.success(response.message);
                router.push('/login');
                toast.dismiss(loadingToastId);
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            toast.dismiss(loadingToastId);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 p-4 font-sans">
            {/* Left Side - Sign-Up Form */}
            <div className="flex-1 flex items-center justify-center p-5">
                <div
                    className="mt-18 bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg transform transition-all duration-500 hover:scale-105">
                    <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 animate-fade-in">
                        Join Our Learning Community
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="Username" className="block text-indigo-600 font-semibold mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="Username"
                                value={Username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your Username"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="Email" className="block text-indigo-600 font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="Email"
                                id="Email"
                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your Email"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="Password" className="block text-indigo-600 font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="Password"
                                id="Password"
                                value={Password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Enter your Password"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-600 font-semibold text-center mb-4">{error}</p>
                        )}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-indigo-600 font-semibold mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="Password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition-all duration-300"
                                placeholder="Confirm your Password"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="Full_name" className="block text-indigo-600 font-semibold mb-2">
                                Full Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="Full_name"
                                value={Full_name}
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