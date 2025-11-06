'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {signup} from '@/services/AuthService';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {HiEye, HiEyeOff} from 'react-icons/hi';

export interface SignupData {
    Username: string;
    Email: string;
    Password: string;
    Full_name: string;
}

const SignUp: React.FC = () => {
    const [Username, setUsername] = useState('');
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [Full_name, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const loadingToastId = toast.loading('Creating your account...');

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (!passwordRegex.test(Password)) {
            setError('Password must be 8+ chars with uppercase, lowercase & number.');
            toast.error('Invalid password format.');
            toast.dismiss(loadingToastId);
            return;
        }

        if (Password !== confirmPassword) {
            toast.error('Passwords do not match!');
            toast.dismiss(loadingToastId);
            return;
        }

        const payload: SignupData = {Username, Email, Password, Full_name};

        try {
            const response = await signup(payload);

            if (response?.success) {
                toast.success(response.message || 'Welcome! Account created.');
                router.push('/login');
            } else {
                toast.error(response?.message || 'Signup failed. Try again.');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            toast.dismiss(loadingToastId);
        }
    };

    return (
        <>
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"/>
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent animate-pulse"/>
            </div>

            <div
                className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 pt-20 lg:pt-24 font-sans">

                {/* Left Side - Sign-Up Form */}
                <div
                    className="flex-1 flex items-center justify-center p-4 sm:p-8 w-full max-w-xl"> {/* Increased width */}
                    <div
                        className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Join SkillSurge
                            </h1>
                            <p className="mt-2 text-gray-600">Start learning with expert-led courses</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={Username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                                    placeholder="yourusername"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={Email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={Password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-10 text-gray-500 hover:text-indigo-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <HiEyeOff className="w-5 h-5"/> : <HiEye className="w-5 h-5"/>}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <label htmlFor="confirmPassword"
                                       className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-10 text-gray-500 hover:text-indigo-600 transition-colors"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <HiEyeOff className="w-5 h-5"/> :
                                        <HiEye className="w-5 h-5"/>}
                                </button>
                            </div>

                            {/* Full Name (Optional) */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={Full_name}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-red-600 text-sm font-medium text-center bg-red-50 px-4 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="px-4 text-xs text-gray-500 font-medium">OR</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-gray-500 mt-8">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Side - SVG Illustration */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-8 animate-fade-in">
                    <div className="relative">
                        <Image
                            src="/svg/sign-up.svg"
                            alt="Welcome to SkillSurge"
                            width={500}
                            height={500}
                            className="max-w-md w-full drop-shadow-2xl"
                            priority
                        />
                        <div
                            className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 blur-3xl -z-10 animate-pulse"/>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </>
    );
};

export default SignUp;