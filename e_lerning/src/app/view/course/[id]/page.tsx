'use client';

import React, {useState, useRef, useEffect} from 'react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {FaHeart} from 'react-icons/fa';
import {loggedUser, loggedUserResponse} from '@/services/AuthService';
import {User} from '@/models/User';
import {CourseCard, CourseResponse} from '@/utils/Responses';
import {addToCartCourse, buyCourse, getCourseById, RemoveFromCartCourse} from '@/services/CourseService';
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {completeVideoApi} from '@/services/WatchedService';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useAuth} from "@/context/AuthContext";

const ViewCoursePage: React.FC = () => {
    const {id} = useParams();
    const [likedCourses, setLikedCourses] = useState<boolean>(false);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
    const [userData, setUserData] = useState<User>();
    const [CourseData, setCourseData] = useState<CourseCard>();
    const [isBuyed, setIsBuyed] = useState<boolean>(false);
    const [shouldFetchUserData, setShouldFetchUserData] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isInCart, setIsInCart] = useState<boolean>(false);
    const [userUploded, setUserUploded] = useState<boolean>(false);

    const router = useRouter();
    const {logout} = useAuth();

    const fetchUserData = async () => {
        try {
            const response: loggedUserResponse = await loggedUser();
            if (response.success) {
                setUserData(response.User);
                if (response.User.Buy_Course.some((course) => course.courseId === id || course.courseId?._id === id)) {
                    setIsBuyed(true);
                }
                if (response.User.Favourite.includes(id)) {
                    setLikedCourses(true);
                }
                if (response.User.Cart.includes(id)) {
                    setIsInCart(true);
                }
                if (response.User.Upload_Course.includes(id)) {
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
                const response: CourseResponse = await getCourseById(id);
                if (response.success) {
                    setCourseData(response.course);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchCourseData();
        fetchUserData();
    }, [id]);

    useEffect(() => {
        if (shouldFetchUserData) {
            fetchUserData();
            setShouldFetchUserData(false);
        }
    }, [shouldFetchUserData]);

    const toggleLike = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", {icon: '⚠️'});
            return;
        }

        try {
            if (likedCourses) {
                setLikedCourses(false);
                await removeFromFavouriteService({courseId});
            } else {
                setLikedCourses(true);
                await addToFavouriteService({courseId});
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const handleTimeUpdate = async (videoId: string, videoElement: HTMLVideoElement) => {
        const progress = (videoElement.currentTime / videoElement.duration) * 100 || 0;

        if (progress >= 100 && userData) {
            const watched = userData.Watched_Course?.find(
                (entry) => entry.courseId === id || entry.courseId?._id === id
            );

            const alreadyCompleted = watched?.completedVideos.includes(videoId);
            if (!alreadyCompleted) {
                try {
                    await completeVideoApi(id, videoId);
                    setShouldFetchUserData(true);
                } catch (err) {
                    console.error("Failed to mark video complete", err);
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
                <Loader/>
            </div>
        );
    }

    let courseProgress = 0;
    if (userData && CourseData) {
        const watched = userData?.Watched_Course?.find(
            (entry: any) => entry.courseId === id || entry.courseId?._id === id
        );
        if (watched) {
            const completedVideos = watched.completedVideos?.length || 0;
            const totalVideos = CourseData.Video?.length || 0;
            if (totalVideos > 0) {
                courseProgress = (completedVideos / totalVideos) * 100;
            }
        }
    }

    const handleBuyCourse = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", {icon: '⚠️'});
            return;
        }

        try {
            const formData = new FormData();
            formData.append('courseId', courseId);

            const response = await buyCourse(formData);

            if (response.success) {
                toast.success("You successfully bought this course!");
                setIsBuyed(true);
                setShouldFetchUserData(true);
                setShowLoginPopup(true);
            }

        } catch (error) {
            toast.error("" + error);
        }
    };

    const handleCartCourse = async (courseId: string) => {
        if (!userData) {
            router.push('/login');
            toast("Please Login first", {icon: '⚠️'});
            return;
        }

        try {
            const formData = new FormData();
            formData.append('courseId', courseId);

            const response = await addToCartCourse(formData);

            if (response.success) {
                toast.success("Added to cart!");
                setIsInCart(true);
            }
        } catch (error) {
            toast.error("" + error);
        }
    }

    const handleRemoveCartCourse = async (courseId: string) => {
        try {
            const response = await RemoveFromCartCourse(courseId);

            if (response.success) {
                toast.success("Remove from cart!");
                setIsInCart(false);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("" + error);
        }
    }

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
                                                onClick={() => handleBuyCourse(CourseData._id)}
                                        >
                                            Buy
                                        </Button>
                                        {isInCart ? (
                                            <Button variant="destructive"
                                                    className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                                                    onClick={() => handleRemoveCartCourse(CourseData._id)}
                                            >
                                                Remove from Cart
                                            </Button>
                                        ) : (
                                            <Button variant="destructive"
                                                    className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                                                    onClick={() => handleCartCourse(CourseData._id)}
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
                        <img
                            src={CourseData.Image ||
                                "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                            alt={CourseData.Course_Name}
                            className="w-full max-w-md h-48 sm:h-64 object-cover rounded-lg"
                        />
                        <div
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"/>
                        <button
                            onClick={() => toggleLike(CourseData._id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                            aria-label={likedCourses ? 'Unlike course' : 'Like course'}
                        >
                            <FaHeart className={`w-5 h-5 ${likedCourses ? 'text-[#FF6B6B]' : 'text-gray-400'}`}/>
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
                                             style={{width: `${courseProgress}%`}}/>
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
                            {CourseData.Video.length === 0 ? (
                                <p className="text-gray-400 text-base sm:text-lg text-center">
                                    No videos available. Add a video to get started!
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {CourseData.Video.map((video) => {
                                        const watchedCourse = userData?.Watched_Course?.find(
                                            (item) => item.courseId?.toString() === id.toString()
                                        );

                                        const isCompleted = watchedCourse?.completedVideos?.some(
                                            (vid) => vid.toString() === video._id.toString()
                                        );

                                        return (
                                            <div
                                                key={video._id}
                                                className="bg-white/10 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                                            >
                                                <div className="w-full sm:w-1/3">
                                                    <div className="relative"
                                                         style={{width: '100%', paddingBottom: '56.25%'}}>
                                                        <video
                                                            controls
                                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                            src={video.Video_Url}
                                                            ref={(el) => (videoRefs.current[video._id] = el)}
                                                            onTimeUpdate={() => handleTimeUpdate(video._id, videoRefs.current[video._id]!)}
                                                            onPlay={() => handlePlay(video._id)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-400 text-sm sm:text-base mb-2">{video.Description}</p>
                                                    {!userUploded && (
                                                        <p className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            Status: {isCompleted ? 'Completed' : 'Pending'}
                                                        </p>
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
                            localStorage.removeItem("token");
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