import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import HeaderWrapper from "@/components/HeaderWrapper";
import { Toaster } from 'react-hot-toast';
import Footer from "@/components/Footer";
import {AuthProvider} from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
            <Toaster />
            <AuthProvider>
                <HeaderWrapper />
                    <main>{children}</main>
                <Footer />
            </AuthProvider>
        </body>
      </html>
  );
}
