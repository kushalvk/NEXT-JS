"use client"
import React, {useState} from 'react';
import Link from "next/link";
import toast from "react-hot-toast";
import {login} from "@/services/AuthService";
import {useRouter} from "next/navigation";

export interface LoginData {
    Username: string;
    Password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    UserToken: string;
}

const Login: React.FC = () => {
    const [Username, setUsername] = useState<string>('');
    const [Password, setPassword] = useState<string>('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loadingToastId = toast.loading("Please wait while we finalize the details...");

        const payload: LoginData = {Username, Password};

        try {
            const response: LoginResponse = await login(payload);

            if (!response.success) {
                toast.error(response.message);
                toast.dismiss(loadingToastId);
            } else {
                toast.success(response.message);
                router.push('/');
                toast.dismiss(loadingToastId);
                localStorage.setItem('token', response.UserToken);
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            toast.dismiss(loadingToastId);
        }
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