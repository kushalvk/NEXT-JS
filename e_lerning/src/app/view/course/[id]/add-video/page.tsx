'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from "react-hot-toast";
import {addVideo} from "@/services/CourseService";
import { CourseResponse } from '@/utils/Responses';

const AddVideoPage: React.FC = () => {
    const { id } = useParams();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (videoFile && videoFile.size > 30 * 1024 * 1024) {
            toast.error("Video file size must be 30MB or less.");
            return;
        }

        const loadingToastId = toast.loading("Please wait while we finalize the details...");

        try {
            const formData = new FormData();

            formData.append("courseId", Array.isArray(id) ? id[0] : id || "");
            if (videoFile) {
                formData.append("Video", videoFile);
            }
            formData.append("Video_Description", description);

            const response = await addVideo(formData) as CourseResponse;

            if (response?.success) {
                toast.success('You successfully add Video to this course!');
            } else {
                toast.error(response?.message || "Something went wrong.");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            toast.dismiss(loadingToastId);
            if (videoFile && description) {
                setVideoFile(null);
                setDescription('');
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                <div className="mt-16 w-full max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center">
                        Add New Video
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Upload Video
                            </label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Video Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter video description..."
                                className="w-full h-24 text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg flex-1"
                            >
                                <Link href={`/courses/${id}`}>Back to Course</Link>
                            </Button>
                            <Button
                                variant="destructive"
                                type="submit"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg flex-1"
                            >
                                Submit Video
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddVideoPage;