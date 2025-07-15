'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AddCoursePage: React.FC = () => {
    const [courseName, setCourseName] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [price, setPrice] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoDescription, setVideoDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (courseName && description && department && price && videoFile && videoDescription) {
            // In a real app, send form data to backend API (e.g., POST /api/courses)
            const formData = new FormData();
            formData.append('courseName', courseName);
            formData.append('description', description);
            formData.append('department', department);
            formData.append('price', price);
            formData.append('video', videoFile);
            formData.append('videoDescription', videoDescription);
            console.log('Course data:', Object.fromEntries(formData));
            // Reset form after submission (optional)
            setCourseName('');
            setDescription('');
            setDepartment('');
            setPrice('');
            setVideoFile(null);
            setVideoDescription('');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                <div className="mt-16 w-full max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center">
                        Add New Course
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Course Name
                            </label>
                            <input
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Enter course name..."
                                className="w-full text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter course description..."
                                className="w-full h-24 text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Department
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] appearance-none"
                            >
                                <option value="">Select a department</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile Apps">Mobile Apps</option>
                                <option value="Programming Languages">Programming Languages</option>
                                <option value="Game Development">Game Development</option>
                                <option value="Entrepreneurship">Entrepreneurship</option>
                                <option value="Management">Management</option>
                                <option value="Sales">Sales</option>
                                <option value="Business Strategy">Business Strategy</option>
                                <option value="Accounting">Accounting</option>
                                <option value="Bookkeeping">Bookkeeping</option>
                                <option value="Financial Analysis">Financial Analysis</option>
                                <option value="Investing">Investing</option>
                                <option value="Cloud Computing">Cloud Computing</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="DevOps">DevOps</option>
                                <option value="Networking">Networking</option>
                                <option value="Microsoft Office">Microsoft Office</option>
                                <option value="Google Workspace">Google Workspace</option>
                                <option value="Project Management">Project Management</option>
                                <option value="Data Entry">Data Entry</option>
                                <option value="Leadership">Leadership</option>
                                <option value="Time Management">Time Management</option>
                                <option value="Communication Skills">Communication Skills</option>
                                <option value="Mindfulness">Mindfulness</option>
                                <option value="Graphic Design">Graphic Design</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="3D & Animation">3D & Animation</option>
                                <option value="Fashion Design">Fashion Design</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                                <option value="SEO">SEO</option>
                                <option value="Content Marketing">Content Marketing</option>
                                <option value="Social Media Marketing">Social Media Marketing</option>
                                <option value="Yoga">Yoga</option>
                                <option value="Nutrition">Nutrition</option>
                                <option value="Fitness Training">Fitness Training</option>
                                <option value="Mental Health">Mental Health</option>
                                <option value="Music Production">Music Production</option>
                                <option value="Guitar">Guitar</option>
                                <option value="Piano">Piano</option>
                                <option value="Vocal Training">Vocal Training</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Price
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Enter price..."
                                className="w-full text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                                step="0.01"
                                min="0"
                            />
                        </div>
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
                                value={videoDescription}
                                onChange={(e) => setVideoDescription(e.target.value)}
                                placeholder="Enter video description..."
                                className="w-full h-24 text-white bg-white/10 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg flex-1"
                            >
                                <Link href="/courses">Back to Courses</Link>
                            </Button>
                            <Button
                                variant="destructive"
                                type="submit"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg flex-1"
                            >
                                Submit Course
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCoursePage;