"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
    _id: string;
    Username: string;
    email: string;
}

interface AuthContextProps {
    isLoggedIn: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

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
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
