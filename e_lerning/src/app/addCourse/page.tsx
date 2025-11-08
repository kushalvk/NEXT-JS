'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { addCourse } from '@/services/CourseService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle } from 'lucide-react';

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB
const DEPARTMENTS = [
    'Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development',
    'Entrepreneurship', 'Management', 'Sales', 'Business Strategy',
    'Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing',
    'Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking',
    'Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry',
    'Leadership', 'Time Management', 'Communication Skills', 'Mindfulness',
    'Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design',
    'Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing',
    'Yoga', 'Nutrition', 'Fitness Training', 'Mental Health',
    'Music Production', 'Guitar', 'Piano', 'Vocal Training'
];

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
const AddCoursePage: React.FC = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        department: '',
        price: '',
        videoDescription: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ----------------------------------------------------------------
    // Handlers
    // ----------------------------------------------------------------
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_VIDEO_SIZE) {
                toast.error('Video must be 30MB or smaller');
                if (videoInputRef.current) videoInputRef.current.value = '';
                return;
            }
            setVideoFile(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { courseName, description, department, price, videoDescription } = formData;

        if (!courseName || !description || !department || !price || !videoFile || !videoDescription) {
            toast.error('All fields are required');
            return;
        }

        if (!imageFile) {
            toast.error('Please upload a course image');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Uploading your course...');

        try {
            const form = new FormData();
            form.append('Course_Name', courseName);
            form.append('Description', description);
            form.append('Department', department);
            form.append('Price', price);
            form.append('Video', videoFile);
            form.append('Video_Description', videoDescription);
            if (imageFile) form.append('Image', imageFile);

            const response = await addCourse(form);

            if (response?.success) {
                toast.success(response.message || 'Course uploaded successfully!');
                router.push('/uploaded-courses');
            } else {
                toast.error(response?.message || 'Failed to upload course');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            toast.dismiss(loadingToast);
            setIsSubmitting(false);
            // Reset form
            setFormData({
                courseName: '',
                description: '',
                department: '',
                price: '',
                videoDescription: '',
            });
            setImageFile(null);
            setVideoFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------
    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 mt-37">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white">
                                Add New Course
                            </CardTitle>
                            <p className="text-gray-300 mt-2">Share your knowledge with the world</p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <label className="text-white font-medium flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Course Image <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-500 file:to-purple-600 file:text-white hover:file:from-cyan-600 hover:file:to-purple-700 cursor-pointer"
                                        />
                                    </div>
                                    {imagePreview && (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative inline-block"
                                        >
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                width={160}
                                                height={90}
                                                className="rounded-lg border-2 border-white/30 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Course Name */}
                                <div>
                                    <label className="text-white font-medium">
                                        Course Name <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        value={formData.courseName}
                                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                        placeholder="e.g. React Mastery 2025"
                                        className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-white font-medium">
                                        Description <span className="text-red-400">*</span>
                                    </label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What will students learn?"
                                        rows={4}
                                        className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400 resize-none"
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="text-white font-medium">
                                        Department <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value: never) => setFormData({ ...formData, department: value })}
                                    >
                                        <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-900/95 backdrop-blur-xl border-white/20">
                                            {DEPARTMENTS.map((dept) => (
                                                <SelectItem key={dept} value={dept} className="text-white hover:bg-white/10">
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="text-white font-medium">
                                        Price (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="000"
                                        min="0"
                                        step="0.01"
                                        className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400"
                                    />
                                </div>

                                {/* Video Upload */}
                                <div className="space-y-3">
                                    <label className="text-white font-medium flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Course Video <span className="text-red-400">*</span>
                                        <span className="text-xs text-gray-400">(Max 30MB)</span>
                                    </label>
                                    <input
                                        ref={videoInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-500 file:to-purple-600 file:text-white hover:file:from-cyan-600 hover:file:to-purple-700 cursor-pointer"
                                    />
                                    {videoFile && (
                                        <div className="flex items-center gap-2 text-green-400 text-sm">
                                            <CheckCircle className="w-5 h-5" />
                                            {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                    )}
                                </div>

                                {/* Video Description */}
                                <div>
                                    <label className="text-white font-medium">
                                        Video Description <span className="text-red-400">*</span>
                                    </label>
                                    <Textarea
                                        value={formData.videoDescription}
                                        onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
                                        placeholder="Brief description of the video content"
                                        rows={3}
                                        className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1 border-white/30 hover:bg-white/10"
                                        disabled={isSubmitting}
                                    >
                                        <Link href="/courses">Cancel</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
                                    >
                                        {isSubmitting ? 'Uploading...' : 'Submit Course'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Back to Courses */}
                    <div className="text-center mt-8">
                        <Button
                            asChild
                            variant="ghost"
                            className="text-gray-300 hover:text-black"
                        >
                            <Link href="/courses">← Back to All Courses</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AddCoursePage;