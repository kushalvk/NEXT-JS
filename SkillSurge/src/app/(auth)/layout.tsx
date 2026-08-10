import React from "react";
import {HiOutlineBadgeCheck, HiOutlineCollection, HiOutlinePlay} from "react-icons/hi";

const POINTS = [
    {Icon: HiOutlineCollection, text: "250+ courses across development, business and design"},
    {Icon: HiOutlinePlay, text: "Lifetime access to everything you buy"},
    {Icon: HiOutlineBadgeCheck, text: "A shareable certificate when you finish a course"},
];

export default function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="grid min-h-[calc(100dvh-var(--nav-h))] lg:grid-cols-2">

            {/* Brand panel - desktop only, the form is the priority on small screens */}
            <aside className="relative hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-300">
                        SkillSurge
                    </p>
                    {/* Explicit colour: the base layer sets headings to ink-900, which
                        would otherwise render dark-on-dark here. */}
                    <h2 className="mt-6 max-w-md text-4xl font-bold leading-[1.15] text-white">
                        Learn the skills that move your career
                    </h2>
                    <p className="mt-4 max-w-sm leading-relaxed text-ink-400">
                        Join thousands of learners building real, practical skills at their own pace.
                    </p>
                </div>

                <ul className="space-y-4">
                    {POINTS.map(({Icon, text}) => (
                        <li key={text} className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
                                <Icon className="h-4 w-4 text-brand-300" aria-hidden="true"/>
                            </span>
                            <span className="text-sm leading-relaxed text-ink-300">{text}</span>
                        </li>
                    ))}
                </ul>

                <p className="text-xs text-ink-500">
                    © {new Date().getFullYear()} SkillSurge
                </p>
            </aside>

            {/* Form panel */}
            <main className="flex items-center justify-center bg-white px-4 py-10 sm:px-6 sm:py-14">
                <div className="w-full max-w-md">{children}</div>
            </main>
        </div>
    );
}
