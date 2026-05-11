'use client';

import {RingLoader} from "react-spinners";
import React from "react";

const Loader: React.FC = () => {
    return (
        <center>
            <RingLoader color="rgba(255, 255, 255, 1)" />
        </center>
    )
};

export default Loader;