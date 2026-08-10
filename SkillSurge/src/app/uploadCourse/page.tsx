'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {HiOutlinePlus, HiOutlineSearch, HiOutlineUpload} from 'react-icons/hi';
import {userUploadedCourse} from '@/services/CourseService';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {CourseGridSkeleton} from '@/components/Loader';
import {Button} from '@/components/ui/button';

const UploadCoursePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<CourseCardCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCourses = useCallback(async () => {
        try {
            const response = await userUploadedCourse();

            if (response?.success && Array.isArray(response.Course)) {
                setCourses(response.Course as unknown as CourseCardCourse[]);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not load your uploads');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const visible = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return courses;

        return courses.filter((course) =>
            course.Course_Name.toLowerCase().includes(query) ||
            (course.Description || '').toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    const totalLessons = useMemo(
        () => courses.reduce((sum, course) => sum + (course.Video?.length ?? 0), 0),
        [courses]
    );

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Teaching"
                title="Courses you uploaded"
                description="Manage the courses you publish on SkillSurge."
                actions={
                    <Button asChild>
                        <Link href="/addCourse">
                            <HiOutlinePlus className="h-4 w-4"/>
                            New course
                        </Link>
                    </Button>
                }
            >
                {courses.length > 0 && (
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
                                aria-label="Search your uploaded courses"
                                className="field-input pl-11"
                            />
                        </div>

                        <p className="text-sm text-ink-500">
                            <span className="font-semibold text-ink-900">{courses.length}</span>{' '}
                            {courses.length === 1 ? 'course' : 'courses'} ·{' '}
                            <span className="font-semibold text-ink-900">{totalLessons}</span>{' '}
                            {totalLessons === 1 ? 'lesson' : 'lessons'}
                        </p>
                    </div>
                )}
            </PageHeader>

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton count={4}/>
                ) : visible.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visible.map((course) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                actions={
                                    <>
                                        <Button asChild size="sm" variant="outline" className="flex-1">
                                            <Link href={`/view/course/${course._id}`}>View</Link>
                                        </Button>
                                        <Button asChild size="sm" className="flex-1">
                                            <Link href={`/view/course/${course._id}/add-video`}>
                                                <HiOutlineUpload className="h-4 w-4"/>
                                                Add lesson
                                            </Link>
                                        </Button>
                                    </>
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<HiOutlineUpload/>}
                        title={searchQuery ? 'No matching courses' : 'You have not published anything yet'}
                        description={
                            searchQuery
                                ? `None of your courses match “${searchQuery}”.`
                                : 'Create your first course and start teaching. You can add lessons at any time.'
                        }
                        actionLabel="Create a course"
                        actionHref="/addCourse"
                    />
                )}
            </div>
        </div>
    );
};

export default UploadCoursePage;
