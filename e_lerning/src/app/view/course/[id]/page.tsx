'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaHeart } from 'react-icons/fa';
import { loggedUser, loggedUserResponse } from '@/services/AuthService';
import { User } from '@/models/User';
import { CourseCard, CourseResponse, UserResponse } from '@/utils/Responses';
import { addToCartCourse, buyCourse, getCourseById, RemoveFromCartCourse } from '@/services/CourseService';
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { addToFavouriteService, removeFromFavouriteService } from "@/services/FavouriteService";
import { completeVideoApi } from '@/services/WatchedService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Video } from '@/models/Course';

// Define types to replace 'any'
type BuyCourseType = { courseId: string | { _id: string } };
type WatchedCourseType = {
    courseId: string | { _id: string };
    completedVideos?: (string | { toString(): string })[];
};
type UserType = User & {
    Buy_Course?: BuyCourseType[];
    Favourite?: (string | number)[];
    Cart?: (string | number)[];
    Upload_Course?: (string | number)[];
    Watched_Course?: WatchedCourseType[];
};
type VideoWithId = Video & { _id: string };

const ViewCoursePage: React.FC = () => {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
    const [likedCourses, setLikedCourses] = useState<boolean>(false);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
    const [userData, setUserData] = useState<UserType | undefined>();
    const [CourseData, setCourseData] = useState<CourseCard | undefined>();
    const [isBuyed, setIsBuyed] = useState<boolean>(false);
    const [shouldFetchUserData, setShouldFetchUserData] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isInCart, setIsInCart] = useState<boolean>(false);
    const [userUploded, setUserUploded] = useState<boolean>(false);

    const router = useRouter();
    const { logout } = useAuth();

    const fetchUserData = async () => {
        try {
            const response = await loggedUser() as loggedUserResponse;
            if (response && response.success) {
                const user = response.User as UserType;
                setUserData(user);
                // Defensive: courseId can be string or object
                if (
                    Array.isArray(user.Buy_Course) &&
                    user.Buy_Course.some(
                        (course: BuyCourseType) =>
                            course.courseId === id ||
                            (typeof course.courseId === 'object' && (course.courseId as { _id: string })._id === id)
                    )
                ) {
                    setIsBuyed(true);
                }
                if (Array.isArray(user.Favourite) && user.Favourite.map((Id) => Id.toString()).includes(id.toString())) {
                    setLikedCourses(true);
                }
                if (Array.isArray(user.Cart) && user.Cart.map((Id) => Id.toString()).includes(id.toString())) {
                    setIsInCart(true);
                }
                if (Array.isArray(user.Upload_Course) && user.Upload_Course.map((Id) => Id.toString()).includes(id.toString())) {
                    setUserUploded(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await getCourseById(id) as CourseResponse;
                if (response && response.success) {
                    setCourseData(response.course as unknown as CourseCard);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (id) {
            fetchCourseData();
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (shouldFetchUserData) {
            fetchUserData();
            setShouldFetchUserData(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetchUserData]);

    const toggleLike = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", { icon: '⚠️' });
            return;
        }

        try {
            if (likedCourses) {
                setLikedCourses(false);
                await removeFromFavouriteService({ courseId });
            } else {
                setLikedCourses(true);
                await addToFavouriteService({ courseId });
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const handleTimeUpdate = async (videoId: string, videoElement: HTMLVideoElement) => {
        if (!videoElement || !videoElement.duration) return;
        const progress = (videoElement.currentTime / videoElement.duration) * 100 || 0;

        if (progress >= 100 && userData) {
            // Find the watched course entry for this course
            let watchedCourse: WatchedCourseType | undefined;
            if (userData?.Watched_Course) {
                watchedCourse = userData.Watched_Course.find((item: WatchedCourseType) => {
                    if (typeof item.courseId === 'string') {
                        return item.courseId === id;
                    }
                    if (typeof item.courseId === 'object' && (item.courseId as { _id: string })._id) {
                        return (item.courseId as { _id: string })._id === id;
                    }
                    return false;
                });
            }

            // Check if this video is already completed
            let alreadyCompleted = false;
            if (watchedCourse && Array.isArray(watchedCourse.completedVideos)) {
                alreadyCompleted = watchedCourse.completedVideos.some((vid) => {
                    if (typeof vid === 'string') return vid === videoId;
                    if (typeof vid === 'object' && vid?.toString) return vid.toString() === videoId;
                    return false;
                });
            }

            if (!alreadyCompleted) {
                setProgressLoading(true);
                try {
                    await completeVideoApi(id, videoId);
                    // Optimistically update local userData for instant UI feedback
                    // Only refetch user data for UI update
                    setShouldFetchUserData(true); // refetch for backend sync
                } catch (err) {
                    console.error("Failed to mark video complete", err);
                } finally {
                    setProgressLoading(false);
                }
            }
        }
    };

    const handlePlay = (videoId: string) => {
        const video = videoRefs.current[videoId];
        if (!video) return;

        if (!document.fullscreenElement) {
            video.requestFullscreen().then(() => {
                video.play().catch((err) => console.error('Video play failed:', err));
            }).catch((err) => console.error('Fullscreen request failed:', err));
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                Object.values(videoRefs.current).forEach((video) => {
                    if (video && !video.paused) video.pause();
                });
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!CourseData) {
        return (
            <div className="flex h-screen w-screen bg-blue-900 justify-center items-center">
                <Loader />
            </div>
        );
    }

    if (progressLoading) {
        return (
            <div className="flex h-screen w-screen bg-blue-900 justify-center items-center">
                <Loader />
                <span className="ml-4 text-white text-lg">Updating progress...</span>
            </div>
        );
    }

    // Helper: get completedVideos array for this course from userData
    let completedVideosArr: string[] = [];
    if (userData && userData.Watched_Course) {
        const watchedCourse = userData.Watched_Course.find((entry) => {
            if (typeof entry.courseId === 'string') {
                return entry.courseId === id;
            }
            if (typeof entry.courseId === 'object' && entry.courseId && '_id' in entry.courseId) {
                return String((entry.courseId as any)._id) === String(id);
            }
            return false;
        });
        if (watchedCourse && Array.isArray(watchedCourse.completedVideos)) {
            completedVideosArr = watchedCourse.completedVideos.map((vid) => String(vid));
        }
    }

    // Calculate course progress based on completedVideosArr
    let courseProgress = 0;
    if (CourseData && Array.isArray(CourseData.Video) && CourseData.Video.length > 0) {
        const totalVideos = CourseData.Video.length;
        const completedVideos = CourseData.Video.filter((video: Video) => completedVideosArr.includes(String((video as Video).Video_Url))).length;
        courseProgress = (completedVideos / totalVideos) * 100;
    }

    const handleBuyCourse = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", { icon: '⚠️' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('courseId', courseId);

            const response = await buyCourse(formData) as UserResponse;

            if (response?.success) {
                toast.success("You successfully bought this course!");
                setIsBuyed(true);
                setShouldFetchUserData(true);
                setShowLoginPopup(true);
            } else {
                toast.error(response?.message || "Something went wrong.");
            }

        } catch (error) {
            toast.error("" + error);
        }
    };

    const handleCartCourse = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", { icon: '⚠️' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('courseId', courseId);

            const response = await addToCartCourse(formData) as UserResponse;

            if (response?.success) {
                toast.success("Added to cart!");
                setIsInCart(true);
            } else {
                toast.error(response?.message || "Something went wrong.");
            }
        } catch (error) {
            toast.error("" + error);
        }
    };

    const handleRemoveCartCourse = async (courseId: string) => {
        try {
            const response = await RemoveFromCartCourse({courseId}) as UserResponse;

            if (response?.success) {
                toast.success("Remove from cart!");
                setIsInCart(false);
            } else {
                toast.error(response?.message || "Something went wrong.");
            }
        } catch (error) {
            toast.error("" + error);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                <div
                    className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-5 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            {CourseData.Course_Name}
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            {CourseData.Description}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            {!userUploded &&
                                !isBuyed && (
                                    <>
                                        <Button variant="destructive"
                                            className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                                            onClick={() => handleBuyCourse(CourseData._id.toString())}
                                        >
                                            Buy
                                        </Button>
                                        {isInCart ? (
                                            <Button variant="destructive"
                                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                                                onClick={() => handleRemoveCartCourse(CourseData._id.toString())}
                                            >
                                                Remove from Cart
                                            </Button>
                                        ) : (
                                            <Button variant="destructive"
                                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                                                onClick={() => handleCartCourse(CourseData._id.toString())}
                                            >
                                                Cart
                                            </Button>
                                        )}
                                    </>
                                )
                            }

                            <Button variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg">
                                <Link href="/courses">Back to Courses</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative mt-6 lg:mt-0 lg:ml-6">
                        <Image
                            src={CourseData.Image ||
                                "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                            alt={CourseData.Course_Name}
                            width={400}
                            height={400}
                            className="w-full max-w-md h-48 sm:h-64 object-cover rounded-lg"
                        />
                        <div
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
                        <button
                            onClick={() => toggleLike(CourseData._id.toString())}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                            aria-label={likedCourses ? 'Unlike course' : 'Like course'}
                        >
                            <FaHeart className={`w-5 h-5 ${likedCourses ? 'text-[#FF6B6B]' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-6xl mb-10 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4">Course Details</h2>
                    <div className="bg-white/10 rounded-lg p-6">
                        <p className="text-white text-base sm:text-lg mb-2">
                            <span className="font-semibold">Department:</span> {CourseData.Department}
                        </p>
                        <p className="text-white text-base sm:text-lg mb-2">
                            <span className="font-semibold">Price:</span> ₹{CourseData.Price}
                        </p>
                        <p className="text-white text-base sm:text-lg mb-2">
                            <span className="font-semibold">By:</span> {CourseData.Username?.Username || "Unknown"}
                        </p>
                    </div>
                </div>

                {isBuyed || userUploded ? (
                    <>
                        {!userUploded && (
                            <div className="w-full max-w-6xl mb-10 px-2 sm:px-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4">Progress</h2>
                                <div className="bg-white/10 rounded-lg p-6">
                                    <p className="text-white text-base sm:text-lg mb-4">
                                        <span className="font-semibold">Progress:</span> {Math.round(courseProgress)}%
                                        Complete
                                    </p>
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div className="bg-[#FF6B6B] h-2.5 rounded-full"
                                            style={{ width: `${courseProgress}%` }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                            {userUploded && (
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200">Course Videos</h2>
                                    <Button variant="outline"
                                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg">
                                        <Link href={`/view/course/${CourseData._id}/add-video`}>Add Video</Link>
                                    </Button>
                                </div>
                            )}
                            {(!CourseData.Video || CourseData.Video.length === 0) ? (
                                <p className="text-gray-400 text-base sm:text-lg text-center">
                                    No videos available. Add a video to get started!
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {CourseData.Video.map((video: Video) => {
                                        const { Video_Url, Description } = video as Video;
                                        const videoId = Video_Url;
                                        // Use completedVideosArr for status
                                        const isCompleted = completedVideosArr.includes(String(videoId));
                                        return (
                                            <div
                                                key={videoId}
                                                className="bg-white/10 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                                            >
                                                <div className="w-full sm:w-1/3">
                                                    <div className="relative"
                                                        style={{ width: '100%', paddingBottom: '56.25%' }}>
                                                        <video
                                                            controls
                                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                            src={Video_Url}
                                                            ref={el => { videoRefs.current[videoId] = el; }}
                                                            onTimeUpdate={() => {
                                                                const el = videoRefs.current[videoId];
                                                                if (el) handleTimeUpdate(videoId, el);
                                                            }}
                                                            onPlay={() => handlePlay(videoId)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-400 text-sm sm:text-base mb-2">{Description}</p>
                                                    {!userUploded && (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-400 text-gray-900'}`}>
                                                            Status: {isCompleted ? 'Completed' : 'Not Completed'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-red-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Buy the course to show a Video.
                    </p>
                )}

                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Learn?</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Start this course now or explore more courses to continue your learning journey.
                    </p>
                    <Button variant="outline"
                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg">
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </div>
            </div>

            <Dialog open={showLoginPopup} onOpenChange={setShowLoginPopup}>
                <DialogContent className="max-w-sm text-center">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-semibold">
                            To continue watching this course, you need to login again.
                        </DialogTitle>
                    </DialogHeader>
                    <Button
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                localStorage.removeItem("token");
                            }
                            router.push("/login");
                            logout();
                        }}
                        className="mt-4 w-full"
                    >
                        Login
                    </Button>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ViewCoursePage;