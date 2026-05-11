'use client'

import React from "react";
import {usePathname} from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Navbar from "@/components/Navbar";

const HeaderWrapper:React.FC = () => {
    const pathname = usePathname();

    return (
        <>
            <Navbar/>
            {pathname !== '/login' && pathname !== '/signup' && <SubHeader />}
        </>
    )
}

export default HeaderWrapper;