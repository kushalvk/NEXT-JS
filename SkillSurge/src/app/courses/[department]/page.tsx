'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import toast from 'react-hot-toast';
import {HiOutlineCollection} from 'react-icons/hi';
import {fetchCourseByDepartment} from '@/services/CourseService';
import {loggedUser} from '@/services/AuthService';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {CourseGridSkeleton} from '@/components/Loader';
import {useFavourites} from '@/hooks/useFavourites';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

const CoursesByDepartmentPage: React.FC = () => {
    const [courses, setCourses] = useState<CourseCardCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null);

    const router = useRouter();
    const params = useParams();
    const department = decodeURIComponent((params?.department as string) || '');

    const {isFavourite, toggleFavourite} = useFavourites();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // This listing is behind auth, same as before.
            const userRes = await loggedUser();

            if (!userRes?.success) {
                setIsLoggedIn(false);
                toast.error('Please log in to view courses');
                router.replace('/login');
                return;
            }

            setIsLoggedIn(true);

            const courseRes = await fetchCourseByDepartment(department);

            if (courseRes?.success) {
                const data = (courseRes as unknown as {courses: CourseCardCourse | CourseCardCourse[]}).courses;
                setCourses(Array.isArray(data) ? data : data ? [data] : []);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load courses');
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    }, [department, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoggedIn === false) {
        return (
            <div className="container-page page-shell">
                <EmptyState
                    title="Sign in to browse this category"
                    description="Redirecting you to the login page."
                    actionLabel="Go to login"
                    actionHref="/login"
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Category"
                title={department}
                description={`Courses published under ${department}.`}
                actions={
                    <Button asChild variant="outline">
                        <Link href="/courses">All categories</Link>
                    </Button>
                }
            />

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton count={4}/>
                ) : courses.length > 0 ? (
                    <>
                        <p className="mb-5 text-sm text-ink-500">
                            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                        </p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    isFavourite={isFavourite(course._id)}
                                    onToggleFavourite={toggleFavourite}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={<HiOutlineCollection/>}
                        title={`Nothing in ${department} yet`}
                        description="This category is empty for now. Check back soon or browse the full catalogue."
                        actionLabel="Browse all courses"
                        actionHref="/courses"
                    />
                )}
            </div>
        </div>
    );
};

export default CoursesByDepartmentPage;
