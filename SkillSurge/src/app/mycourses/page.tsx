'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {HiOutlinePlay, HiOutlineSearch} from 'react-icons/hi';
import {getCourseData} from '@/services/MyCourseService';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {CourseGridSkeleton} from '@/components/Loader';
import {useFavourites} from '@/hooks/useFavourites';
import {Button} from '@/components/ui/button';

interface PurchasedCourse {
    courseId: CourseCardCourse | null;
    buyDate?: string;
}

interface WatchedCourse {
    courseId: string;
    completedVideos: string[];
}

const MyCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [purchased, setPurchased] = useState<PurchasedCourse[]>([]);
    const [watched, setWatched] = useState<WatchedCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {isFavourite, toggleFavourite} = useFavourites();

    const fetchCourses = useCallback(async () => {
        try {
            const response = await getCourseData();

            if (response?.success && response.User) {
                setPurchased((response.User.Buy_Course || []) as unknown as PurchasedCourse[]);
                setWatched((response.User.Watched_Course || []) as unknown as WatchedCourse[]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not load your courses');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    /** Percentage of lessons watched, derived from the user's Watched_Course entry. */
    const progressFor = useCallback(
        (course: CourseCardCourse) => {
            const total = course.Video?.length ?? 0;
            if (!total) return 0;

            const entry = watched.find((w) => w.courseId?.toString() === course._id.toString());
            const done = entry?.completedVideos?.length ?? 0;
            return Math.min(100, (done / total) * 100);
        },
        [watched]
    );

    const visible = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return purchased
            .filter((item): item is PurchasedCourse & {courseId: CourseCardCourse} => Boolean(item.courseId))
            .filter(({courseId}) =>
                !query ||
                courseId.Course_Name.toLowerCase().includes(query) ||
                (courseId.Description || '').toLowerCase().includes(query)
            );
    }, [purchased, searchQuery]);

    const completedCount = useMemo(
        () => visible.filter(({courseId}) => progressFor(courseId) >= 100).length,
        [visible, progressFor]
    );

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Your library"
                title="My courses"
                description="Everything you have bought. Pick up where you left off."
                actions={
                    <Button asChild variant="outline">
                        <Link href="/courses">Find more courses</Link>
                    </Button>
                }
            >
                {purchased.length > 0 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <HiOutlineSearch
                                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search your courses"
                                aria-label="Search your courses"
                                className="field-input pl-11"
                            />
                        </div>

                        <p className="text-sm text-ink-500">
                            <span className="font-semibold text-ink-900">{completedCount}</span> of{' '}
                            <span className="font-semibold text-ink-900">{visible.length}</span> completed
                        </p>
                    </div>
                )}
            </PageHeader>

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton count={4}/>
                ) : visible.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visible.map(({courseId: course}) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                progress={progressFor(course)}
                                isFavourite={isFavourite(course._id)}
                                onToggleFavourite={toggleFavourite}
                                actions={
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={`/view/course/${course._id}`}>
                                            <HiOutlinePlay className="h-4 w-4"/>
                                            {progressFor(course) > 0 ? 'Continue' : 'Start learning'}
                                        </Link>
                                    </Button>
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<HiOutlinePlay/>}
                        title={searchQuery ? 'No matching courses' : 'You have not bought a course yet'}
                        description={
                            searchQuery
                                ? `Nothing in your library matches “${searchQuery}”.`
                                : 'Once you buy a course it appears here, along with your progress.'
                        }
                        actionLabel="Browse courses"
                        actionHref="/courses"
                    />
                )}
            </div>
        </div>
    );
};

export default MyCoursesPage;
