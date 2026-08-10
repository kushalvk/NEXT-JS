import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from 'react-hot-toast';
import HeaderWrapper from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import {AuthProvider} from "@/context/AuthContext";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "SkillSurge - Learn the skills that move your career",
        template: "%s | SkillSurge",
    },
    description:
        "Online courses in development, business and finance. Watch expert-led lessons, track your progress and earn a certificate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans text-foreground">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: "0.625rem",
                        background: "var(--ink-900)",
                        color: "white",
                        fontSize: "0.875rem",
                        maxWidth: "32rem",
                    },
                }}
            />
            <AuthProvider>
                <HeaderWrapper />
                <main>
                    {children}
                    <SpeedInsights />
                </main>
                <Footer />
            </AuthProvider>
        </body>
      </html>
  );
}
