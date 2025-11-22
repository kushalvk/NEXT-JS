'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FiUpload, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addVideo } from '@/services/CourseService';
import { motion } from 'framer-motion';

const AddVideoPage: React.FC = () => {
    const { id } = useParams();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoFile) {
            toast.error("Please select a video to upload.");
            return;
        }

        if (videoFile.size > 30 * 1024 * 1024) {
            toast.error("Video file size must be 30MB or less.");
            return;
        }

        const loadingToastId = toast.loading("Uploading your video... Please wait");

        try {
            const formData = new FormData();
            formData.append("courseId", Array.isArray(id) ? id[0] : id || "");
            formData.append("Video", videoFile);
            formData.append("Video_Description", description);

            const response = await addVideo(formData);

            if (response?.success) {
                toast.success("Video uploaded successfully!");
                setVideoFile(null);
                setDescription('');
            } else {
                toast.error(response?.message || "Failed to upload video.");
            }
        } catch (error) {
            console.log(error);
        } finally {
            toast.dismiss(loadingToastId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
        } else {
            toast.error("Please upload a valid video file.");
        }
    };

    return (
        <>
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-20 lg:pt-24 font-sans">
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-2xl"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-5xl mt-21 sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Add New Video
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Upload a video lesson to enrich your course
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Drag & Drop Upload Area */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                                isDragging
                                    ? 'border-cyan-400 bg-cyan-500/10'
                                    : 'border-white/30 bg-white/5'
                            } backdrop-blur-xl`}
                        >
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />

                            <FiUpload className="w-16 h-16 mx-auto mb-6 text-cyan-400" />

                            {videoFile ? (
                                <div className="space-y-3">
                                    <p className="text-white font-semibold text-lg flex items-center justify-center gap-2">
                                        <FiCheckCircle className="text-green-400" />
                                        {videoFile.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <p className="text-cyan-300 text-sm">Click to change</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xl font-medium text-white">
                                        Drop your video here or click to browse
                                    </p>
                                    <p className="text-gray-400 mt-2">
                                        Supports MP4, WebM, MOV • Max 30MB
                                    </p>
                                </>
                            )}
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-white text-lg font-medium mb-3">
                                Video Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain what this video covers... (e.g., Introduction to React Hooks)"
                                required
                                rows={4}
                                className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 resize-none shadow-lg"
                            />
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-white/30 text-black hover:bg-white/10 backdrop-blur-xl rounded-xl font-medium flex items-center justify-center gap-2"
                            >
                                <Link href={`/view/course/${id}`}>
                                    <FiArrowLeft className="w-5 h-5" />
                                    Back to Course
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                size="lg"
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 flex-1 flex items-center justify-center gap-3"
                            >
                                <FiUpload className="w-5 h-5" />
                                Upload Video
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default AddVideoPage;