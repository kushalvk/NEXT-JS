'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import {FaRegHeart} from 'react-icons/fa';
import {HiOutlineSearch} from 'react-icons/hi';
import {getFavouriteService} from '@/services/FavouriteService';
import CourseCard, {CourseCardCourse} from '@/components/CourseCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {CourseGridSkeleton} from '@/components/Loader';
import {useFavourites} from '@/hooks/useFavourites';

const FavoritePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [favouriteCourses, setFavouriteCourses] = useState<CourseCardCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {isFavourite, toggleFavourite} = useFavourites();

    const fetchFavourites = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getFavouriteService();

            if (response?.success && Array.isArray(response.User?.Favourite)) {
                setFavouriteCourses(response.User.Favourite as unknown as CourseCardCourse[]);
            } else {
                setFavouriteCourses([]);
            }
        } catch (error) {
            console.error('Failed to load favourites', error);
            toast.error('Could not load your favourites');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavourites();
    }, [fetchFavourites]);

    // Removing a favourite should drop the card from this page immediately.
    const handleToggle = async (courseId: string) => {
        const wasFavourite = isFavourite(courseId);
        await toggleFavourite(courseId);
        if (wasFavourite) {
            setFavouriteCourses((prev) => prev.filter((course) => course._id !== courseId));
        }
    };

    const visibleCourses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return favouriteCourses;

        return favouriteCourses.filter((course) =>
            course.Course_Name.toLowerCase().includes(query) ||
            (course.Description || '').toLowerCase().includes(query)
        );
    }, [favouriteCourses, searchQuery]);

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Your library"
                title="Favourites"
                description="Courses you saved for later. Tap the heart on any card to remove it."
            >
                {favouriteCourses.length > 0 && (
                    <div className="relative max-w-md">
                        <HiOutlineSearch
                            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your favourites"
                            aria-label="Search favourites"
                            className="field-input pl-11"
                        />
                    </div>
                )}
            </PageHeader>

            <div className="container-page page-shell">
                {isLoading ? (
                    <CourseGridSkeleton count={4}/>
                ) : visibleCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleCourses.map((course) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                isFavourite
                                onToggleFavourite={handleToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FaRegHeart/>}
                        title={searchQuery ? 'No matching favourites' : 'No favourites yet'}
                        description={
                            searchQuery
                                ? `Nothing saved matches “${searchQuery}”.`
                                : 'Tap the heart on any course to save it here for later.'
                        }
                        actionLabel="Browse courses"
                        actionHref="/courses"
                    />
                )}
            </div>
        </div>
    );
};

export default FavoritePage;
