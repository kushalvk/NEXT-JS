'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaHeart, FaPlayCircle } from 'react-icons/fa';
import { loggedUser, loggedUserResponse } from '@/services/AuthService';
import { User } from '@/models/User';
import { CourseCard, CourseResponse, UserResponse } from '@/utils/Responses';
import {
    addToCartCourse,
    buyCourse,
    getCourseById,
    RemoveFromCartCourse,
} from '@/services/CourseService';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';
import {
    addToFavouriteService,
    removeFromFavouriteService,
} from '@/services/FavouriteService';
import { completeVideoApi } from '@/services/WatchedService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Video } from '@/models/Course';
import { motion } from 'framer-motion';
import { Types } from 'mongoose';

interface BuyCourse {
    courseId: Types.ObjectId;
    buyDate: Date;
}

interface WatchedCourse {
    courseId: Types.ObjectId;
    completedVideos: string[];
    completedAt?: Date | null;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
interface UserType extends User {
    Buy_Course?: BuyCourse[];
    Watched_Course?: WatchedCourse[];
    Favourite?: Types.ObjectId[];
    Cart?: Types.ObjectId[];
    Upload_Course?: Types.ObjectId[];
}

const ViewCoursePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { logout } = useAuth();

    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string) || '';

    const [liked, setLiked] = useState(false);
    const [userData, setUserData] = useState<UserType | null>(null);
    const [course, setCourse] = useState<CourseCard | null>(null);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isUploadedByUser, setIsUploadedByUser] = useState(false);
    const [refetchUser, setRefetchUser] = useState(false);
    const [savingProgress, setSavingProgress] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Perfectly typed ref
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

    const fetchUser = async () => {
        try {
            const res = (await loggedUser()) as loggedUserResponse;
            if (res?.success && res.User) {
                const user = res.User as UserType;
                setUserData(user);

                const strId = id.toString();

                setIsPurchased(
                    user.Buy_Course?.some((c) => c.courseId.toString() === strId) ?? false
                );
                setLiked(user.Favourite?.some((fid) => fid.toString() === strId) ?? false);
                setIsInCart(user.Cart?.some((cid) => cid.toString() === strId) ?? false);
                setIsUploadedByUser(
                    user.Upload_Course?.some((uid) => uid.toString() === strId) ?? false
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const res = (await getCourseById(id)) as CourseResponse;
                if (res?.success) setCourse(res.course as CourseCard);
            } catch (err) {
                console.log(err);
                toast.error('Failed to load course');
            }
            await fetchUser();
        };
        load();
    }, [id]);

    useEffect(() => {
        if (refetchUser) {
            fetchUser();
            setRefetchUser(false);
        }
    }, [refetchUser]);

    const toggleFavorite = async () => {
        if (!userData) {
            router.push('/login');
            toast('Please login first', { icon: 'Warning' });
            return;
        }
        try {
            if (liked) {
                await removeFromFavouriteService({ courseId: id });
            } else {
                await addToFavouriteService({ courseId: id });
            }
            setLiked(!liked);
        } catch (err) {
            console.log(err);
            toast.error('Failed to update favorite');
        }
    };

    const handleVideoProgress = async (videoUrl: string, videoEl: HTMLVideoElement) => {
        if (!videoEl?.duration || videoEl.currentTime / videoEl.duration < 0.98) return;

        const alreadyDone = userData?.Watched_Course?.some(
            (wc) => wc.courseId.toString() === id && wc.completedVideos.includes(videoUrl)
        );
        if (alreadyDone) return;

        setSavingProgress(true);
        try {
            await completeVideoApi(id, videoUrl);
            setRefetchUser(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingProgress(false);
        }
    };

    const playFullscreen = (videoUrl: string) => {
        const vid = videoRefs.current[videoUrl];
        if (vid && !document.fullscreenElement) {
            vid.requestFullscreen().catch(() => {});
        }
    };

    useEffect(() => {
        const exitFs = () => {
            if (!document.fullscreenElement) {
                Object.values(videoRefs.current).forEach((v) => v?.pause());
            }
        };
        document.addEventListener('fullscreenchange', exitFs);
        return () => document.removeEventListener('fullscreenchange', exitFs);
    }, []);

    const buyNow = async () => {
        if (!userData) return router.push('/login');
        try {
            const fd = new FormData();
            fd.append('courseId', id);
            const res = (await buyCourse(fd)) as UserResponse;
            if (res?.success) {
                toast.success('Course purchased!');
                setIsPurchased(true);
                setShowLoginDialog(true);
            }
        } catch (err) {
            console.log(err);
            toast.error('Purchase failed');
        }
    };

    const toggleCart = async () => {
        if (!userData) return router.push('/login');
        try {
            if (isInCart) {
                await RemoveFromCartCourse({ courseId: id });
                toast.success('Removed from cart');
            } else {
                const fd = new FormData();
                fd.append('courseId', id);
                await addToCartCourse(fd);
                toast.success('Added to cart');
            }
            setIsInCart(!isInCart);
        } catch (err) {
            console.log(err);
            toast.error('Cart update failed');
        }
    };

    const watchedEntry = userData?.Watched_Course?.find(
        (wc) => wc.courseId.toString() === id
    );
    const completedVideos = watchedEntry?.completedVideos || [];

    const progress =
        course?.Video?.length
            ? (completedVideos.filter((url) =>
                    course.Video.some((v) => v.Video_Url === url)
                ).length /
                course.Video.length) *
            100
            : 0;

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-950 to-purple-950">
                <Loader />
            </div>
        );
    }

    if (savingProgress) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 to-purple-950">
                <Loader />
                <p className="text-xl text-white">Saving your progress...</p>
            </div>
        );
    }

    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />
                <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 left-0 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute bottom-20 right-0 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl"
                />
            </div>

            <div className="min-h-screen pt-20 pb-32 px-4 font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-2 gap-12 items-center mb-20"
                    >
                        <div>
                            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
                                {course.Course_Name}
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                {course.Description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                {/* Buy & Cart Buttons - Only show if not purchased & not uploaded by user */}
                                {!isUploadedByUser && !isPurchased && (
                                    <>
                                        <Button
                                            onClick={buyNow}
                                            size="lg"
                                            className="relative overflow-hidden bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold text-lg px-12 py-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                                        >
                                            <span className="relative z-10">Buy Now ₹{course.Price}</span>
                                            <div
                                                className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"/>
                                        </Button>

                                        <Button
                                            onClick={toggleCart}
                                            size="lg"
                                            variant="outline"
                                            className="group relative overflow-hidden border-2 border-white/40 hover:border-white/60 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-10 py-8 rounded-3xl shadow-xl transition-all duration-300 hover:scale-105"
                                        >
        <span className="relative z-10">
          {isInCart ? 'Remove from Cart' : 'Add to Cart'}
        </span>
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 translate-x-full transition-transform duration-500 group-hover:translate-x-0"/>
                                        </Button>
                                    </>
                                )}

                                {/* Back to Courses - Always visible */}
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="group relative overflow-hidden border-2 border-cyan-500/60 hover:border-cyan-400 backdrop-blur-xl bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 font-bold text-lg px-10 py-8 rounded-3xl shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <Link href="/courses" className="flex items-center gap-3">
                                        <span>Back to Courses</span>
                                        <motion.span
                                            initial={{x: -10, opacity: 0}}
                                            animate={{x: 0, opacity: 1}}
                                            transition={{duration: 0.3}}
                                            className="inline-block"
                                        >
                                            →
                                        </motion.span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="relative group mt-21">
                            <Image
                                src={course.Image || '/placeholder.jpg'}
                                alt={course.Course_Name}
                                width={600}
                                height={600}
                                className="rounded-3xl shadow-2xl object-cover w-full"
                            />
                            <div
                                className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/70 to-transparent"/>
                            <motion.button
                                whileTap={{scale: 0.8}}
                                onClick={toggleFavorite}
                                className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40"
                            >
                                <FaHeart className={`w-8 h-8 ${liked ? 'text-pink-500' : 'text-white/70'}`}/>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Course Details */}
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.3}}
                        className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 mb-16"
                    >
                        <h2 className="text-4xl font-bold text-white mb-8">Course Details</h2>
                        <div className="grid md:grid-cols-3 gap-6 text-white text-lg">
                            <div><span className="text-cyan-400 font-semibold">Department:</span> {course.Department}
                            </div>
                            <div><span className="text-cyan-400 font-semibold">Price:</span> ₹{course.Price}</div>
                            <div><span
                                className="text-cyan-400 font-semibold">Instructor:</span> {course.Username?.Username || 'Unknown'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Course Content */}
                    {(isPurchased || isUploadedByUser) && (
                        <>
                            {!isUploadedByUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-16"
                                >
                                    <h2 className="text-4xl font-bold text-white mb-8">Your Progress</h2>
                                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20">
                                        <div className="flex justify-between mb-4">
                                            <span className="text-2xl text-white font-semibold">Completion</span>
                                            <span className="text-3xl font-bold text-cyan-400">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from cyan-500 to-purple-600 rounded-full shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-4xl font-bold text-white">Course Content</h2>
                                    {isUploadedByUser && (
                                        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                            <Link href={`/view/course/${id}/add-video`}>Add Video</Link>
                                        </Button>
                                    )}
                                </div>

                                {course.Video?.length === 0 ? (
                                    <p className="text-center py-20 text-gray-400 text-xl">
                                        {isUploadedByUser ? 'No videos yet. Upload one!' : 'Videos coming soon!'}
                                    </p>
                                ) : (
                                    <div className="space-y-8">
                                        {course.Video?.map((video: Video, i: number) => {
                                            const videoUrl = video.Video_Url;
                                            const isCompleted = completedVideos.includes(videoUrl);

                                            return (
                                                <motion.div
                                                    key={videoUrl}
                                                    initial={{ opacity: 0, x: -50 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/20"
                                                >
                                                    <div className="grid lg:grid-cols-3 gap-8 p-8">
                                                        <div className="lg:col-span-1">
                                                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                                                                <video
                                                                    controls
                                                                    className="w-full h-full object-cover"
                                                                    src={videoUrl}
                                                                    ref={(el) => {
                                                                        if (el) videoRefs.current[videoUrl] = el;
                                                                    }}
                                                                    onTimeUpdate={() => {
                                                                        const el = videoRefs.current[videoUrl];
                                                                        if (el) handleVideoProgress(videoUrl, el);
                                                                    }}
                                                                    onPlay={() => playFullscreen(videoUrl)}
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                                                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                                                    <FaPlayCircle className="w-10 h-10 text-white/90" />
                                                                    <span className="text-white font-semibold text-lg">Play</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="lg:col-span-2 flex flex-col justify-center">
                                                            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                                                {video.Description}
                                                            </p>
                                                            {!isUploadedByUser && (
                                                                <span
                                                                    className={`inline-block px-6 py-3 rounded-full font-bold text-sm ${
                                                                        isCompleted
                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                                            : 'bg-white/20 text-gray-300'
                                                                    }`}
                                                                >
                                  {isCompleted ? 'Completed' : 'Not Started'}
                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}

                    {/* Final CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-32"
                    >
                        <h2 className="text-5xl font-black text-white mb-6">Keep Learning!</h2>
                        <p className="text-xl text-gray-300 mb-10">Explore more courses and level up.</p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-16 py-8 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                        >
                            <Link href="/courses">Browse All Courses</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Session Expired Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Session Expired</DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-gray-300 mb-6">Log in again to continue.</p>
                    <Button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('token');
                            }
                            router.push('/login');
                            logout();
                        }}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                    >
                        Login Again
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewCoursePage;