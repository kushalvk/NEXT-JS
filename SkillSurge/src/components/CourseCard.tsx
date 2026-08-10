'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {FaHeart, FaRegHeart} from 'react-icons/fa';
import {HiOutlinePlay, HiOutlineUser} from 'react-icons/hi';
import {cn} from '@/lib/utils';

export interface CourseCardCourse {
    _id: string;
    Image?: string;
    Course_Name: string;
    Description?: string;
    Department?: string;
    Price?: number;
    Video?: { Video_Url: string; Description?: string }[];
    Username?: { _id?: string; Username?: string } | string | null;
}

export function formatPrice(price?: number): string {
    if (!price || price <= 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
}

function instructorName(username: CourseCardCourse['Username']): string | null {
    if (!username) return null;
    if (typeof username === 'string') return null;
    return username.Username || null;
}

interface CourseCardProps {
    course: CourseCardCourse;
    href?: string;
    /** Renders the heart toggle when provided. */
    isFavourite?: boolean;
    onToggleFavourite?: (courseId: string) => void;
    /** 0-100. Renders a progress bar instead of the price. */
    progress?: number;
    /** Replaces the price row, e.g. "Purchased 12 Jan". */
    footnote?: string;
    /** Buttons rendered at the bottom of the card. */
    actions?: React.ReactNode;
    className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
    course,
    href,
    isFavourite,
    onToggleFavourite,
    progress,
    footnote,
    actions,
    className,
}) => {
    const target = href ?? `/view/course/${course._id}`;
    const lessons = course.Video?.length ?? 0;
    const instructor = instructorName(course.Username);
    const showFavourite = typeof onToggleFavourite === 'function';

    return (
        <article
            className={cn(
                'group card-interactive flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-card shadow-e2',
                className
            )}
        >
            {/* Thumbnail - fixed 16:9 so rows stay aligned whatever the source image */}
            <div className="relative aspect-video w-full overflow-hidden bg-ink-100">
                <Link href={target} className="block h-full w-full" tabIndex={-1} aria-hidden="true">
                    {course.Image ? (
                        <Image
                            src={course.Image}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                            <HiOutlinePlay className="h-10 w-10 text-brand-600" aria-hidden="true"/>
                        </div>
                    )}
                </Link>

                {course.Department && (
                    <span className="chip absolute left-3 top-3 bg-white/95 text-ink-700 shadow-e2 backdrop-blur">
                        {course.Department}
                    </span>
                )}

                {showFavourite && (
                    <button
                        type="button"
                        onClick={() => onToggleFavourite?.(course._id)}
                        aria-label={isFavourite ? `Remove ${course.Course_Name} from favourites` : `Add ${course.Course_Name} to favourites`}
                        aria-pressed={isFavourite}
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-500 shadow-e2 backdrop-blur transition hover:scale-105 hover:text-danger focus-visible:ring-4 focus-visible:ring-brand-500/25"
                    >
                        {isFavourite
                            ? <FaHeart className="h-4 w-4 text-danger"/>
                            : <FaRegHeart className="h-4 w-4"/>}
                    </button>
                )}
            </div>

            {/* Body - flex-1 pushes the footer down so cards in a row end level */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-base font-bold leading-snug text-ink-900">
                    <Link href={target} className="line-clamp-2 hover:text-brand-700">
                        {course.Course_Name}
                    </Link>
                </h3>

                {course.Description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
                        {course.Description}
                    </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    {instructor && (
                        <span className="inline-flex items-center gap-1">
                            <HiOutlineUser className="h-3.5 w-3.5" aria-hidden="true"/>
                            {instructor}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <HiOutlinePlay className="h-3.5 w-3.5" aria-hidden="true"/>
                        {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
                    </span>
                </div>

                <div className="mt-auto pt-4">
                    {typeof progress === 'number' ? (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                                <span className="text-ink-600">
                                    {progress >= 100 ? 'Completed' : 'In progress'}
                                </span>
                                <span className="text-ink-900">{Math.round(progress)}%</span>
                            </div>
                            <div
                                className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200"
                                role="progressbar"
                                aria-valuenow={Math.round(progress)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${course.Course_Name} progress`}
                            >
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        progress >= 100 ? 'bg-success' : 'bg-brand-600'
                                    )}
                                    style={{width: `${Math.min(100, Math.max(0, progress))}%`}}
                                />
                            </div>
                        </div>
                    ) : footnote ? (
                        <p className="text-sm text-ink-500">{footnote}</p>
                    ) : (
                        <p className="text-lg font-bold text-ink-900">{formatPrice(course.Price)}</p>
                    )}

                    {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
                </div>
            </div>
        </article>
    );
};

export default CourseCard;
