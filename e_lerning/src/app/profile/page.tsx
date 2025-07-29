'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {User} from "@/models/User";
import {loggedUser, loggedUserResponse, updatedProfile} from "@/services/AuthService";
import toast from "react-hot-toast";

const ProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<User>();

    const fetchUserData = async () => {
        try {
            const response: loggedUserResponse = await loggedUser();
            if (response.success) {
                setUserData(response.User);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleUpdate = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();

            if (!userData) return;

            formData.append("Username", userData.Username);
            formData.append("Email", userData.Email);
            formData.append("Full_name", userData.Full_name);
            formData.append("RazorpayId", userData.RazorpayId || "");

            const response = await updatedProfile(formData);

            if (response.success) {
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsEditing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        const fieldMap = {
            username: "Username",
            email: "Email",
            fullName: "Full_name",
            razorpayId: "RazorpayId",
        };

        const actualKey = fieldMap[name];

        setUserData((prev) => ({ ...prev, [actualKey]: value }));
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full">
                {/* Hero Section */}
                <div
                    className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-12 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Your Profile
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            Manage your account details and track your learning progress.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                            >
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User Information */}
                <div className="w-full max-w-6xl mb-12 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6">Account Details</h2>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        {isEditing ? (
                            <>
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={userData?.Username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/10 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData?.Email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/10 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={userData?.Full_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/10 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Razorpay
                                        ID</label>
                                    <input
                                        type="text"
                                        name="razorpayId"
                                        value={userData?.RazorpayId || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/10 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm"
                                    />
                                </div>
                                <p className="text-sm text-[#1E3A8A] mb-4">Joined: {userData?.createdAt}</p>
                                <Button
                                    variant="destructive"
                                    className="text-white rounded-lg duration-300"
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-semibold text-gray-700 mb-2">Username: {userData?.Username}</p>
                                <p className="text-sm text-[#1E3A8A] mb-2">Email: {userData?.Email}</p>
                                <p className="text-sm text-[#1E3A8A] mb-2">Full Name: {userData?.Full_name}</p>
                                <p className="text-sm text-[#1E3A8A] mb-2">Joined: {new Date(userData?.createdAt).toLocaleString()}</p>
                                <p className="text-sm text-[#1E3A8A] mb-4">Razorpay
                                    ID: {userData?.RazorpayId || "Not Provided"}</p>
                                <Button
                                    variant="outline"
                                    className="text-[#1E3A8A] border-[#1E3A8A] hover:bg-[#1E3A8A] rounded-lg duration-300"
                                    onClick={handleUpdate}
                                >
                                    Update Details
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Continue Your Journey</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Explore new courses to expand your skills and achieve your goals.
                    </p>
                    <Button
                        variant="outline"
                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;