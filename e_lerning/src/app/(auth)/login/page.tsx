'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { loginService } from '@/services/AuthService';
import { useRouter } from 'next/navigation';
import { LoginData } from '@/utils/Responses';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Login: React.FC = () => {
    const [Username, setUsername] = useState<string>('');
    const [Password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loadingToastId = toast.loading('Signing you in...');

        const payload: LoginData = { Username, Password };

        try {
            const response = await loginService(payload);

            if (response?.success) {
                login(response.UserToken);
                toast.success('Welcome back!', { id: loadingToastId });
                router.push('/');
            } else {
                toast.error(response?.message || 'Invalid credentials', { id: loadingToastId });
            }
        } catch {
            toast.error('Network error. Please try again.', { id: loadingToastId });
        }
    };

    return (
        <>
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent animate-pulse" />
            </div>

            <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 font-sans">

                {/* Left Side - SVG Illustration */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-8 animate-fade-in">
                    <div className="relative">
                        <Image
                            src="/svg/login.svg"
                            alt="Welcome back to learning"
                            width={500}
                            height={500}
                            className="max-w-md w-full drop-shadow-2xl"
                            priority
                        />
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 blur-3xl -z-10 animate-pulse" />
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8 w-full max-w-md">
                    <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-gray-600">Continue your learning journey</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-10 text-gray-500 hover:text-indigo-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-all"
                                >
                                    Forgot Password?
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-all"
                                >
                                    Create Account
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                Sign In
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="px-4 text-xs text-gray-500 font-medium">OR</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300">
                                <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300">
                                <Image src="/icons/apple.svg" alt="Apple" width={20} height={20} />
                                <span className="text-sm font-medium text-gray-700">Apple</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-gray-500 mt-8">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="text-indigo-600 hover:underline">
                                Terms
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-indigo-600 hover:underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
        </>
    );
};

export default Login;