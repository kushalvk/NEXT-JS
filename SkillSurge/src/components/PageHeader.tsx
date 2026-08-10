import React from 'react';

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    /** Buttons or filters aligned to the right on desktop, stacked on mobile. */
    actions?: React.ReactNode;
    /** Rendered under the description, e.g. a category rail or search field. */
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({eyebrow, title, description, actions, children}) => (
    <header className="border-b border-ink-200 bg-white">
        <div className="container-page py-8 sm:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
                    <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{title}</h1>
                    {description && (
                        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-500">
                            {description}
                        </p>
                    )}
                </div>

                {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
            </div>

            {children && <div className="mt-6">{children}</div>}
        </div>
    </header>
);

export default PageHeader;
