'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {HiOutlineSearch, HiOutlineX} from 'react-icons/hi';
import {getAllCourses} from '@/services/CourseService';
import {CourseResponse} from '@/utils/Responses';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {CourseGridSkeleton} from '@/components/Loader';
import {useFavourites} from '@/hooks/useFavourites';

/** Debounce so filtering doesn't run on every keystroke of a large catalogue. */
function useDebounced<T>(value: T, delay = 250): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

const SearchCoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<CourseCardCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const debouncedQuery = useDebounced(searchQuery);
    const {isFavourite, toggleFavourite} = useFavourites();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getAllCourses() as CourseResponse;
                if (response?.success) {
                    setCourses(response.course as unknown as CourseCardCourse[]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const results = useMemo(() => {
        const query = debouncedQuery.trim().toLowerCase();
        if (!query) return courses;

        return courses.filter((course) =>
            course.Course_Name.toLowerCase().includes(query) ||
            (course.Description || '').toLowerCase().includes(query) ||
            (course.Department || '').toLowerCase().includes(query)
        );
    }, [courses, debouncedQuery]);

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Search"
                title="Find your next course"
                description="Search by course name, description or category."
            >
                <div className="relative max-w-2xl">
                    <HiOutlineSearch
                        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try “React”, “marketing” or “Python”"
                        aria-label="Search courses"
                        autoFocus
                        className="field-input h-12 pl-11 pr-10 text-base"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                        >
                            <HiOutlineX className="h-4 w-4"/>
                        </button>
                    )}
                </div>
            </PageHeader>

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton/>
                ) : results.length > 0 ? (
                    <>
                        <p className="mb-5 text-sm text-ink-500">
                            {debouncedQuery
                                ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${debouncedQuery}”`
                                : `Showing all ${results.length} courses`}
                        </p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {results.map((course) => (
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
                        icon={<HiOutlineSearch/>}
                        title="No matches"
                        description={`We couldn't find anything for “${debouncedQuery}”. Try a shorter or more general term.`}
                        actionLabel="Browse all courses"
                        actionHref="/courses"
                    />
                )}
            </div>
        </div>
    );
};

export default SearchCoursesPage;
