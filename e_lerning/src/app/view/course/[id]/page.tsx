'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaHeart, FaPlayCircle } from 'react-icons/fa';

const ViewCoursePage: React.FC = () => {
    const { id } = useParams();
    const [likedCourses, setLikedCourses] = useState<number[]>([]);
    const [videoProgress, setVideoProgress] = useState<{ [key: number]: number }>({
        1: 0, // Placeholder: 0% for video ID 1
        2: 0, // Placeholder: 0% for video ID 2
    });
    const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
    const videoContainerRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Placeholder course data (in a real app, fetch from backend using course ID)
    const course = {
        id: parseInt(id as string) || 7,
        name: 'Advanced JavaScript',
        description: 'Deep dive into modern JavaScript concepts and patterns, including ES6+, async programming, and functional programming techniques.',
        department: 'Development',
        price: '$59.99',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4683e1650?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        videos: [
            {
                id: 1,
                title: 'Introduction to ES6',
                description: 'Learn the basics of ES6 features like arrow functions, destructuring, and template literals.',
                url: 'https://res.cloudinary.com/da0lceyy7/video/upload/v1750865921/courses/deas2mkubfgffbuec6sf.mp4',
            },
            {
                id: 2,
                title: 'Async/Await in JavaScript',
                description: 'Master asynchronous programming with promises and async/await syntax.',
                url: 'https://res.cloudinary.com/da0lceyy7/video/upload/v1750865921/courses/deas2mkubfgffbuec6sf.mp4',
            },
        ],
    };

    const toggleLike = (courseId: number) => {
        setLikedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };

    const handleTimeUpdate = (videoId: number, videoElement: HTMLVideoElement) => {
        const progress = (videoElement.currentTime / videoElement.duration) * 100 || 0;
        setVideoProgress((prev) => ({
            ...prev,
            [videoId]: Math.min(progress, 100),
        }));
        // In a real app, save progress to backend API
    };

    const handlePlay = (videoId: number) => {
        const video = videoRefs.current[videoId];
        const container = videoContainerRefs.current[videoId];
        if (!video || !container) return;

        if (!document.fullscreenElement) {
            // Request fullscreen for the video container with proper styling
            container.requestFullscreen().then(() => {
                video.play().catch((err) => {
                    console.error('Video play failed:', err);
                });
                // Ensure video fills the screen
                container.style.width = '100%';
                container.style.height = '100%';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'contain';
            }).catch((err) => {
                console.error('Fullscreen request failed:', err);
                video.pause();
            });
        }
    };

    // Monitor fullscreen changes to pause video and reset styling when exiting fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                Object.keys(videoRefs.current).forEach((videoId) => {
                    const video = videoRefs.current[parseInt(videoId)];
                    const container = videoContainerRefs.current[parseInt(videoId)];
                    if (video && !video.paused) {
                        video.pause();
                        if (container) {
                            container.style.width = '';
                            container.style.height = '';
                            video.style.width = '';
                            video.style.height = '';
                            video.style.objectFit = '';
                        }
                    }
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Calculate course completion percentage: count fully completed videos (100%)
    const completedVideos = course.videos.filter((video) => (videoProgress[video.id] || 0) >= 100).length;
    const courseProgress = course.videos.length > 0 ? (completedVideos / course.videos.length) * 100 : 0;

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                {/* Hero Section */}
                <div className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-5 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            {course.name}
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            {course.description}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Button
                                variant="destructive"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg flex items-center justify-center gap-2"
                            >
                                <Link href={`/courses/${course.id}/start`} className="text-white">
                                    Start Course
                                </Link>
                                <FaPlayCircle className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                            >
                                <Link href="/courses">Back to Courses</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative mt-6 lg:mt-0 lg:ml-6">
                        <img
                            src={course.image}
                            alt={course.name}
                            className="w-full max-w-md h-48 sm:h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                        <button
                            onClick={() => toggleLike(course.id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                            aria-label={likedCourses.includes(course.id) ? 'Unlike course' : 'Like course'}
                        >
                            <FaHeart
                                className={`w-5 h-5 ${
                                    likedCourses.includes(course.id) ? 'text-[#FF6B6B]' : 'text-gray-400'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Course Details */}
                <div className="w-full max-w-6xl mb-10 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4">Course Details</h2>
                    <div className="bg-white/10 rounded-lg p-6">
                        <p className="text-white text-base sm:text-lg mb-2">
                            <span className="font-semibold">Department:</span> {course.department}
                        </p>
                        <p className="text-white text-base sm:text-lg mb-2">
                            <span className="font-semibold">Price:</span> {course.price}
                        </p>
                        <p className="text-white text-base sm:text-lg mb-4">
                            <span className="font-semibold">Progress:</span> {Math.round(courseProgress)}% Complete
                        </p>
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                            <div
                                className="bg-[#FF6B6B] h-2.5 rounded-full"
                                style={{ width: `${courseProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Videos Section */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-200">Course Videos</h2>
                        <Button
                            variant="outline"
                            className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                        >
                            <Link href={`/view/course/${course.id}/add-video`}>Add Video</Link>
                        </Button>
                    </div>
                    {course.videos.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            No videos available. Add a video to get started!
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {course.videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-white/10 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                                >
                                    <div className="w-full sm:w-1/3">
                                        <div
                                            ref={(el) => (videoContainerRefs.current[video.id] = el)}
                                            className="relative"
                                            style={{ width: '100%', height: '0', paddingBottom: '56.25%' }} // 16:9 aspect ratio
                                        >
                                            <video
                                                controls
                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                src={video.url}
                                                ref={(el) => (videoRefs.current[video.id] = el)}
                                                onTimeUpdate={() => handleTimeUpdate(video.id, videoRefs.current[video.id]!)}
                                                onPlay={() => handlePlay(video.id)}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                                        <p className="text-gray-400 text-sm sm:text-base">{video.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Learn?</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Start this course now or explore more courses to continue your learning journey.
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

export default ViewCoursePage;