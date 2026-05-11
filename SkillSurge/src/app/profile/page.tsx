'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { loggedUser, updatedProfile } from '@/services/AuthService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit2, Save, User as UserIcon, Mail, Calendar, CreditCard } from 'lucide-react';
import {User} from "@/models/User";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface LoggedUserResponse {
    success: boolean;
    User: User;
}

interface UpdateProfileResponse {
    success: boolean;
    message?: string;
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<User | null>(null);

    // ----------------------------------------------------------------
    // Fetch User Data
    // ----------------------------------------------------------------
    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await loggedUser() as LoggedUserResponse;
            if (response?.success) {
                setUserData(response.User);
            } else {
                toast.error('Failed to load profile');
                router.push('/login');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Could not load your profile');
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // ----------------------------------------------------------------
    // Handle Edit / Save
    // ----------------------------------------------------------------
    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        fetchUserData(); // Revert changes
    };

    const handleSave = async () => {
        if (!userData) return;

        const loadingToast = toast.loading('Updating profile...');

        try {
            const formData = new FormData();
            formData.append('Username', userData.Username);
            formData.append('Email', userData.Email);
            formData.append('Full_name', userData.Full_name);
            if (userData.RazorpayId) formData.append('RazorpayId', userData.RazorpayId);

            const response = await updatedProfile(formData) as UpdateProfileResponse;

            if (response?.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                toast.error(response?.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Update error:', err);
            toast.error('Something went wrong');
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setUserData((prev) => {
            if (!prev) return prev;

            const fieldMap: Record<string, keyof User> = {
                username: 'Username',
                email: 'Email',
                fullName: 'Full_name',
                razorpayId: 'RazorpayId',
            };

            const userField = fieldMap[name];
            if (!userField) return prev;

            // Spread + type assertion to satisfy TypeScript
            return {
                ...prev,
                [userField]: value,
            } as User; // This fixes the error
        });
    };

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------
    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!userData) {
        return <div className="text-white text-center">No user data found.</div>;
    }

    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 font-sans mt-21">
                {/* Header */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-4xl text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        Your Profile
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Manage your account and track your learning journey.
                    </p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                <UserIcon className="w-7 h-7 text-cyan-400" />
                                Account Details
                            </CardTitle>
                            {!isEditing ? (
                                <Button
                                    onClick={handleEdit}
                                    variant="outline"
                                    className="border-white/30 hover:bg-white/10"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="border-white/30 text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                            <UserIcon className="w-4 h-4" /> Username
                                        </label>
                                        <Input
                                            name="Username"
                                            value={userData.Username}
                                            onChange={handleChange}
                                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                            <Mail className="w-4 h-4" /> Email
                                        </label>
                                        <Input
                                            name="Email"
                                            type="email"
                                            value={userData.Email}
                                            onChange={handleChange}
                                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                            <UserIcon className="w-4 h-4" /> Full Name
                                        </label>
                                        <Input
                                            name="Full_name"
                                            value={userData.Full_name}
                                            onChange={handleChange}
                                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                            <CreditCard className="w-4 h-4" /> Razorpay ID
                                        </label>
                                        <Input
                                            name="RazorpayId"
                                            value={userData.RazorpayId || ''}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-white">
                                            <UserIcon className="w-5 h-5 text-cyan-400" />
                                            <span className="font-medium">Username:</span>
                                            <span className="text-gray-300">{userData.Username}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-white">
                                            <Mail className="w-5 h-5 text-cyan-400" />
                                            <span className="font-medium">Email:</span>
                                            <span className="text-gray-300">{userData.Email}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-white">
                                            <UserIcon className="w-5 h-5 text-cyan-400" />
                                            <span className="font-medium">Full Name:</span>
                                            <span className="text-gray-300">{userData.Full_name}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-white">
                                            <Calendar className="w-5 h-5 text-cyan-400" />
                                            <span className="font-medium">Joined:</span>
                                            <span className="text-gray-300">
                        {userData.createdAt
                            ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : '—'}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-white">
                                            <CreditCard className="w-5 h-5 text-cyan-400" />
                                            <span className="font-medium">Razorpay ID:</span>
                                            <span className="text-gray-300">
                        {userData.RazorpayId || 'Not linked'}
                      </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-4xl text-center mt-16 mb-10"
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Keep Learning
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Explore new courses and continue building your skills.
                    </p>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </motion.div>
            </div>
        </>
    );
};

// ------------------------------------------------------------------
// Skeleton Loader
// ------------------------------------------------------------------
const ProfileSkeleton = () => (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20">
        <div className="w-full max-w-2xl space-y-8">
            <Skeleton className="h-12 w-64 mx-auto bg-white/10" />
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                    <Skeleton className="h-8 w-48 bg-white/10" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-white/10" />
                            <Skeleton className="h-10 w-full bg-white/20" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
);

export default ProfilePage;