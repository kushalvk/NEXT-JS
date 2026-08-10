'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useParams, useRouter} from 'next/navigation';
import toast from 'react-hot-toast';
import {Types} from 'mongoose';
import {FaHeart, FaRegHeart} from 'react-icons/fa';
import {
    HiCheckCircle,
    HiOutlineArrowLeft,
    HiOutlineLockClosed,
    HiOutlinePlay,
    HiOutlinePlus,
    HiOutlineShoppingCart,
    HiOutlineUser,
} from 'react-icons/hi';
import {loggedUser, loggedUserResponse} from '@/services/AuthService';
import {User} from '@/models/User';
import {Video} from '@/models/Course';
import {CourseCard, CourseResponse, UserResponse} from '@/utils/Responses';
import {
    RemoveFromCartCourse,
    addToCartCourse,
    buyCourse,
    getCourseById,
} from '@/services/CourseService';
import {addToFavouriteService, removeFromFavouriteService} from '@/services/FavouriteService';
import {completeVideoApi} from '@/services/WatchedService';
import Loader from '@/components/Loader';
import {Button} from '@/components/ui/button';
import {formatPrice} from '@/components/CourseCard';
import {startCoursePurchase} from '@/lib/razorpayCheckout';
import {cn} from '@/lib/utils';

interface BuyCourseEntry {
    courseId: Types.ObjectId;
    buyDate: Date;
}

interface WatchedCourseEntry {
    courseId: Types.ObjectId;
    completedVideos: string[];
    completedAt?: Date | null;
}

// @ts-expect-error the populated shape differs from the mongoose document
interface UserType extends User {
    Buy_Course?: BuyCourseEntry[];
    Watched_Course?: WatchedCourseEntry[];
    Favourite?: Types.ObjectId[];
    Cart?: Types.ObjectId[];
    Upload_Course?: Types.ObjectId[];
}

const ViewCoursePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();

    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string) || '';

    const [liked, setLiked] = useState(false);
    const [userData, setUserData] = useState<UserType | null>(null);
    const [course, setCourse] = useState<CourseCard | null>(null);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isUploadedByUser, setIsUploadedByUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuying, setIsBuying] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    /** Guards against firing the completion request repeatedly during playback. */
    const savingRef = useRef<Set<string>>(new Set());

    const fetchUser = useCallback(async () => {
        try {
            const res = (await loggedUser()) as loggedUserResponse;
            if (res?.success && res.User) {
                const user = res.User as UserType;
                setUserData(user);

                const strId = id.toString();
                setIsPurchased(user.Buy_Course?.some((c) => c.courseId.toString() === strId) ?? false);
                setLiked(user.Favourite?.some((fid) => fid.toString() === strId) ?? false);
                setIsInCart(user.Cart?.some((cid) => cid.toString() === strId) ?? false);
                setIsUploadedByUser(user.Upload_Course?.some((uid) => uid.toString() === strId) ?? false);
            }
        } catch (err) {
            console.error(err);
        }
    }, [id]);

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
            setIsLoading(false);
        };

        load();
    }, [id, fetchUser]);

    const watchedEntry = userData?.Watched_Course?.find((wc) => wc.courseId.toString() === id);
    const completedVideos = useMemo(() => watchedEntry?.completedVideos || [], [watchedEntry]);

    const lessons: Video[] = useMemo(() => course?.Video || [], [course]);
    const activeLesson = lessons[activeIndex];

    const completedCount = useMemo(
        () => lessons.filter((lesson) => completedVideos.includes(lesson.Video_Url)).length,
        [lessons, completedVideos]
    );

    const progress = lessons.length ? (completedCount / lessons.length) * 100 : 0;

    const hasAccess = isPurchased || isUploadedByUser;

    const toggleFavorite = async () => {
        if (!userData) {
            toast('Sign in to save favourites');
            router.push('/login');
            return;
        }

        const wasLiked = liked;
        setLiked(!wasLiked);

        try {
            const service = wasLiked ? removeFromFavouriteService : addToFavouriteService;
            const response = await service({courseId: id});
            if (!response?.success) throw new Error();
        } catch {
            setLiked(wasLiked);
        }
    };

    /** Marks a lesson complete once it is 98% watched. */
    const handleTimeUpdate = async () => {
        const el = videoRef.current;
        const videoUrl = activeLesson?.Video_Url;

        if (!el || !videoUrl || !hasAccess) return;
        if (!el.duration || el.currentTime / el.duration < 0.98) return;
        if (completedVideos.includes(videoUrl) || savingRef.current.has(videoUrl)) return;

        savingRef.current.add(videoUrl);

        try {
            await completeVideoApi(id, videoUrl);
            await fetchUser();
        } catch (err) {
            console.error(err);
        } finally {
            savingRef.current.delete(videoUrl);
        }
    };

    const buyNow = async () => {
        if (!userData) return router.push('/login');

        setIsBuying(true);
        try {
            // Paid courses go through Razorpay; the server verifies the payment
            // before granting access. Free courses enrol directly.
            if ((course?.Price ?? 0) > 0) {
                const result = await startCoursePurchase([id]);

                if (result.success) {
                    toast.success(result.message || 'Course purchased.');
                    setIsPurchased(true);
                    await fetchUser();
                } else if (!result.dismissed) {
                    toast.error(result.message || 'Checkout failed');
                }
                return;
            }

            const fd = new FormData();
            fd.append('courseId', id);
            const res = (await buyCourse(fd)) as UserResponse;

            if (res?.success) {
                toast.success('You are enrolled in this course.');
                setIsPurchased(true);
                await fetchUser();
            }
        } catch (err) {
            console.log(err);
            toast.error('Purchase failed');
        } finally {
            setIsBuying(false);
        }
    };

    const toggleCart = async () => {
        if (!userData) return router.push('/login');

        const wasInCart = isInCart;
        setIsInCart(!wasInCart);

        try {
            if (wasInCart) {
                const res = await RemoveFromCartCourse({courseId: id});
                if (!res?.success) throw new Error();
                toast.success('Removed from cart');
            } else {
                const fd = new FormData();
                fd.append('courseId', id);
                const res = await addToCartCourse(fd);
                if (!res?.success) throw new Error();
                toast.success('Added to cart');
            }
        } catch {
            setIsInCart(wasInCart);
        }
    };

    if (isLoading) {
        return (
            <div className="container-page page-shell">
                <Loader fullPage label="Loading course"/>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container-page page-shell">
                <div className="mx-auto max-w-md rounded-xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
                    <h1 className="text-lg font-bold">Course not found</h1>
                    <p className="mt-1.5 text-sm text-ink-500">
                        This course may have been removed.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/courses">Browse courses</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">

            {/* Course header */}
            <header className="border-b border-ink-200 bg-white">
                <div className="container-page py-8 sm:py-10">
                    <Link
                        href="/courses"
                        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-900"
                    >
                        <HiOutlineArrowLeft className="h-4 w-4"/>
                        All courses
                    </Link>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 max-w-3xl">
                            {course.Department && <p className="eyebrow mb-2">{course.Department}</p>}
                            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{course.Course_Name}</h1>
                            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
                                {course.Description}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <HiOutlineUser className="h-4 w-4"/>
                                    {course.Username?.Username || 'Unknown instructor'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <HiOutlinePlay className="h-4 w-4"/>
                                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                                </span>
                                {isUploadedByUser && (
                                    <span className="chip bg-brand-50 text-brand-700">You own this course</span>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={toggleFavorite}
                                aria-pressed={liked}
                                aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
                            >
                                {liked
                                    ? <FaHeart className="h-4 w-4 text-danger"/>
                                    : <FaRegHeart className="h-4 w-4"/>}
                                {liked ? 'Saved' : 'Save'}
                            </Button>

                            {isUploadedByUser && (
                                <Button asChild>
                                    <Link href={`/view/course/${id}/add-video`}>
                                        <HiOutlinePlus className="h-4 w-4"/>
                                        Add lesson
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-page page-shell">
                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                    {/* Main column. min-w-0 stops the video's intrinsic width from
                        widening the grid track - grid items default to min-width:auto. */}
                    <div className="min-w-0 space-y-6 lg:col-span-2">
                        {hasAccess ? (
                            lessons.length > 0 ? (
                                <>
                                    {/* Player */}
                                    <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-950 shadow-e3">
                                        <video
                                            key={activeLesson?.Video_Url}
                                            ref={videoRef}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            poster={course.Image}
                                            src={activeLesson?.Video_Url}
                                            onTimeUpdate={handleTimeUpdate}
                                            className="aspect-video w-full bg-black"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm text-ink-500">
                                            Lesson {activeIndex + 1} of {lessons.length}
                                        </p>
                                        <h2 className="mt-1 text-xl font-bold">{activeLesson?.Description}</h2>

                                        {completedVideos.includes(activeLesson?.Video_Url || '') && (
                                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-success">
                                                <HiCheckCircle className="h-4 w-4"/>
                                                Completed
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3 border-t border-ink-200 pt-5">
                                        <Button
                                            variant="outline"
                                            disabled={activeIndex === 0}
                                            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                                        >
                                            Previous lesson
                                        </Button>
                                        <Button
                                            disabled={activeIndex >= lessons.length - 1}
                                            onClick={() => setActiveIndex((i) => Math.min(lessons.length - 1, i + 1))}
                                        >
                                            Next lesson
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
                                    <HiOutlinePlay className="mx-auto h-8 w-8 text-ink-400"/>
                                    <h2 className="mt-3 text-lg font-bold">No lessons yet</h2>
                                    <p className="mt-1.5 text-sm text-ink-500">
                                        {isUploadedByUser
                                            ? 'Upload your first lesson to get this course started.'
                                            : 'The instructor has not published any lessons yet.'}
                                    </p>
                                    {isUploadedByUser && (
                                        <Button asChild className="mt-6">
                                            <Link href={`/view/course/${id}/add-video`}>Add a lesson</Link>
                                        </Button>
                                    )}
                                </div>
                            )
                        ) : (
                            /* Locked preview */
                            <div className="overflow-hidden rounded-xl border border-ink-200 bg-card shadow-e2">
                                <div className="relative aspect-video w-full bg-ink-100">
                                    {course.Image ? (
                                        <Image
                                            src={course.Image}
                                            alt=""
                                            fill
                                            sizes="(min-width: 1024px) 66vw, 100vw"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : null}
                                    <div className="absolute inset-0 grid place-items-center bg-ink-950/55">
                                        <div className="text-center text-white">
                                            <HiOutlineLockClosed className="mx-auto h-8 w-8"/>
                                            <p className="mt-2 text-sm font-semibold">
                                                Buy this course to start watching
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        <section>
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <h2 className="text-lg font-bold">Course content</h2>
                                <p className="text-sm text-ink-500">
                                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                                </p>
                            </div>

                            <ol className="overflow-hidden rounded-xl border border-ink-200 bg-card shadow-e2">
                                {lessons.map((lesson, index) => {
                                    const isCompleted = completedVideos.includes(lesson.Video_Url);
                                    const isActive = hasAccess && index === activeIndex;

                                    return (
                                        <li key={lesson.Video_Url} className="border-b border-ink-200 last:border-0">
                                            <button
                                                type="button"
                                                onClick={() => hasAccess && setActiveIndex(index)}
                                                disabled={!hasAccess}
                                                aria-current={isActive ? 'true' : undefined}
                                                className={cn(
                                                    'flex w-full items-center gap-3 px-4 py-3.5 text-left transition',
                                                    hasAccess ? 'hover:bg-ink-50' : 'cursor-default',
                                                    isActive && 'bg-brand-50'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                                                        isCompleted
                                                            ? 'bg-success text-white'
                                                            : isActive
                                                                ? 'bg-brand-600 text-white'
                                                                : 'bg-ink-100 text-ink-600'
                                                    )}
                                                >
                                                    {isCompleted ? <HiCheckCircle className="h-4 w-4"/> : index + 1}
                                                </span>

                                                <span className="min-w-0 flex-1">
                                                    <span
                                                        className={cn(
                                                            'block truncate text-sm',
                                                            isActive ? 'font-semibold text-brand-800' : 'text-ink-800'
                                                        )}
                                                    >
                                                        {lesson.Description}
                                                    </span>
                                                </span>

                                                {hasAccess ? (
                                                    <HiOutlinePlay className="h-4 w-4 shrink-0 text-ink-400"/>
                                                ) : (
                                                    <HiOutlineLockClosed className="h-4 w-4 shrink-0 text-ink-400"/>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}

                                {lessons.length === 0 && (
                                    <li className="px-4 py-8 text-center text-sm text-ink-500">
                                        No lessons published yet.
                                    </li>
                                )}
                            </ol>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="min-w-0 lg:col-span-1">
                        <div className="sticky top-[calc(var(--nav-h)+1.5rem)] space-y-4">

                            {hasAccess && !isUploadedByUser && (
                                <div className="surface-card p-5">
                                    <h2 className="text-base font-bold">Your progress</h2>
                                    <div className="mt-3 flex items-baseline justify-between">
                                        <span className="text-sm text-ink-500">
                                            {completedCount} of {lessons.length} lessons
                                        </span>
                                        <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                                    </div>
                                    <div
                                        className="mt-2 h-2 overflow-hidden rounded-full bg-ink-200"
                                        role="progressbar"
                                        aria-valuenow={Math.round(progress)}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Course progress"
                                    >
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                progress >= 100 ? 'bg-success' : 'bg-brand-600'
                                            )}
                                            style={{width: `${progress}%`}}
                                        />
                                    </div>
                                    {progress >= 100 && (
                                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success">
                                            <HiCheckCircle className="h-4 w-4"/>
                                            You finished this course
                                        </p>
                                    )}
                                </div>
                            )}

                            {!hasAccess && (
                                <div className="surface-card overflow-hidden">
                                    {course.Image && (
                                        <div className="relative aspect-video w-full bg-ink-100">
                                            <Image
                                                src={course.Image}
                                                alt=""
                                                fill
                                                sizes="(min-width: 1024px) 33vw, 100vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <p className="text-3xl font-bold">{formatPrice(course.Price)}</p>
                                        <p className="mt-1 text-sm text-ink-500">One payment, lifetime access.</p>

                                        <div className="mt-5 space-y-2">
                                            <Button
                                                size="lg"
                                                className="w-full"
                                                onClick={buyNow}
                                                disabled={isBuying}
                                            >
                                                {isBuying ? 'Processing...' : 'Buy now'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full"
                                                onClick={toggleCart}
                                            >
                                                <HiOutlineShoppingCart className="h-4 w-4"/>
                                                {isInCart ? 'Remove from cart' : 'Add to cart'}
                                            </Button>
                                        </div>

                                        <ul className="mt-5 space-y-2 border-t border-ink-200 pt-4 text-sm text-ink-600">
                                            <li className="flex items-center gap-2">
                                                <HiCheckCircle className="h-4 w-4 shrink-0 text-success"/>
                                                {lessons.length} on-demand {lessons.length === 1 ? 'lesson' : 'lessons'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <HiCheckCircle className="h-4 w-4 shrink-0 text-success"/>
                                                Lifetime access
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <HiCheckCircle className="h-4 w-4 shrink-0 text-success"/>
                                                Certificate on completion
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="surface-card p-5">
                                <h2 className="text-base font-bold">Course details</h2>
                                <dl className="mt-3 space-y-2.5 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-ink-500">Category</dt>
                                        <dd className="truncate font-medium">{course.Department}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-ink-500">Instructor</dt>
                                        <dd className="truncate font-medium">
                                            {course.Username?.Username || 'Unknown'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-ink-500">Price</dt>
                                        <dd className="font-medium">{formatPrice(course.Price)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-ink-500">Lessons</dt>
                                        <dd className="font-medium">{lessons.length}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

        </div>
    );
};

export default ViewCoursePage;
