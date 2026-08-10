import React from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    children,
}) => (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
        {icon && (
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600 [&_svg]:h-7 [&_svg]:w-7">
                {icon}
            </div>
        )}
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>}
        {actionLabel && actionHref && (
            <Button asChild className="mt-6">
                <Link href={actionHref}>{actionLabel}</Link>
            </Button>
        )}
        {children && <div className="mt-6">{children}</div>}
    </div>
);

export default EmptyState;
