"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { DEMO_READ_ONLY_CODE, DEMO_READ_ONLY_MESSAGE, isDemoUsername } from "@/utils/demoUser";

interface User {
    _id: string;
    Username: string;
    email: string;
}

interface AuthContextProps {
    isLoggedIn: boolean;
    user: User | null;
    /** True while the read-only demo account is signed in. */
    isDemo: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/**
 * Turn the API's read-only rejection into a single, clear toast instead of the
 * generic per-page error handling. Registered once for the whole app.
 */
let demoInterceptorRegistered = false;

function registerDemoInterceptor() {
    if (demoInterceptorRegistered) return;
    demoInterceptorRegistered = true;

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const data = error?.response?.data;
            if (data?.code === DEMO_READ_ONLY_CODE) {
                // Shared id so rapid clicks don't stack duplicate toasts.
                toast.error(data.message || DEMO_READ_ONLY_MESSAGE, { id: "demo-read-only" });
            }
            return Promise.reject(error);
        }
    );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        registerDemoInterceptor();
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get("/api/loggedUser", {
                headers: {
                    authorization: token
                }
            });

            if (res.status === 200) {
                const data = res.data;
                setUser(data.User);
                setIsLoggedIn(true);
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    };

    useEffect(() => {
        fetchUserProfile(); // on mount
    }, []);

    const login = async (token: string) => {
        localStorage.setItem("token", token);
        await fetchUserProfile(); // fetch user immediately after login
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isDemo: isDemoUsername(user?.Username), login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
