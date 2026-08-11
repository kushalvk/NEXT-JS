'use client'

import React from "react";
import {usePathname} from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Navbar from "@/components/Navbar";

/**
 * The navbar is sticky rather than fixed, so it occupies flow space and pages
 * never have to compensate with a top padding. The category bar scrolls away.
 */
/** Routes in the (auth) group, which use their own split-screen layout. */
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

const HeaderWrapper: React.FC = () => {
    const pathname = usePathname();
    const isAuthPage = AUTH_ROUTES.includes(pathname);

    return (
        <>
            <div className="sticky top-0 z-50">
                <Navbar/>
            </div>
            {!isAuthPage && <SubHeader/>}
        </>
    )
}

export default HeaderWrapper;
