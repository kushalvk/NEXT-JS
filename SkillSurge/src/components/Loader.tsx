'use client';

import React from "react";
import {cn} from "@/lib/utils";

interface LoaderProps {
    /** Full-height centred block, for whole-page loading. */
    fullPage?: boolean;
    label?: string;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({fullPage = false, label = 'Loading', className}) => (
    <div
        role="status"
        aria-live="polite"
        className={cn(
            'flex flex-col items-center justify-center gap-3',
            fullPage ? 'min-h-[50vh] w-full' : 'py-10',
            className
        )}
    >
        <span
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-ink-200 border-t-brand-600"
            aria-hidden="true"
        />
        <span className="text-sm text-ink-500">{label}</span>
    </div>
);

/** Placeholder grid that matches the CourseCard shape while data loads. */
export const CourseCardSkeleton: React.FC = () => (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-card shadow-e2">
        <div className="skeleton aspect-video w-full rounded-none"/>
        <div className="space-y-3 p-5">
            <div className="skeleton h-4 w-4/5"/>
            <div className="skeleton h-3 w-full"/>
            <div className="skeleton h-3 w-2/3"/>
            <div className="skeleton h-5 w-20"/>
        </div>
    </div>
);

export const CourseGridSkeleton: React.FC<{count?: number}> = ({count = 8}) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({length: count}).map((_, i) => <CourseCardSkeleton key={i}/>)}
    </div>
);

export default Loader;
