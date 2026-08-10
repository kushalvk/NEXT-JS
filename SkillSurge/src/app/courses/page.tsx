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
import {cn} from '@/lib/utils';

const CATEGORIES = [
    'All', 'Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development',
    'Entrepreneurship', 'Management', 'Sales', 'Business Strategy', 'Accounting',
    'Bookkeeping', 'Financial Analysis', 'Investing',
];

const CoursesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [courses, setCourses] = useState<CourseCardCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const filteredCourses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesSearch =
                !query ||
                course.Course_Name.toLowerCase().includes(query) ||
                (course.Description || '').toLowerCase().includes(query);
            const matchesCategory = selectedCategory === 'All' || course.Department === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [courses, searchQuery, selectedCategory]);

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Catalogue"
                title="All courses"
                description="Browse everything published on SkillSurge, then filter by category or search by name."
            >
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative max-w-xl">
                        <HiOutlineSearch
                            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses"
                            aria-label="Search courses"
                            className="field-input pl-11 pr-10"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                            >
                                <HiOutlineX className="h-4 w-4"/>
                            </button>
                        )}
                    </div>

                    {/* Category rail - scrolls sideways instead of wrapping into a wall of chips */}
                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                aria-pressed={selectedCategory === category}
                                className={cn(
                                    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                                    selectedCategory === category
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900'
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </PageHeader>

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton/>
                ) : filteredCourses.length > 0 ? (
                    <>
                        <p className="mb-5 text-sm text-ink-500">
                            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                        </p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredCourses.map((course) => (
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
                        title="No courses found"
                        description={
                            searchQuery
                                ? `Nothing matches “${searchQuery}”. Try a different search or category.`
                                : 'There are no courses in this category yet.'
                        }
                        actionLabel="Clear filters"
                        actionHref="/courses"
                    />
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
