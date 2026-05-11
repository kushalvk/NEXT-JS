'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { loggedUser } from '@/services/AuthService';
import toast from 'react-hot-toast';
import { addToFavouriteService, removeFromFavouriteService } from '@/services/FavouriteService';
import { fetchCartCourse, checkoutCourse } from '@/services/CourseService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import axios from 'axios';
import Script from 'next/script';
import {User} from "@/models/User";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type CartItem = {
    _id: string;
    Course_Name: string;
    Description: string;
    Price: number;
    Image?: string;
};

interface LoggedUserResponse {
    success: boolean;
    User: User & { Favourite: string[] };
}

interface FetchCartResponse {
    success: boolean;
    Cart: CartItem[];
}

interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
}

interface RazorpayVerifyResponse {
    data: { success: boolean };
}

interface CheckoutResponse {
    success: boolean;
    message?: string;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// ------------------------------------------------------------------
// Reusable Components (same as SearchCoursesPage)
// ------------------------------------------------------------------
const CourseCardItem: React.FC<{
    course: CartItem;
    isLiked: boolean;
    onToggleLike: () => void;
    index: number;
}> = ({ course, isLiked, onToggleLike, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={course.Image || '/images/placeholder-course.jpg'}
                        alt={course.Course_Name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={onToggleLike}
                        className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                        <FaHeart
                            className={`w-5 h-5 transition-all duration-300 ${
                                isLiked ? 'text-red-500 scale-110' : 'text-gray-600'
                            }`}
                        />
                    </motion.button>
                </div>

                <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {course.Course_Name}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-2">{course.Description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">₹{course.Price}</span>
                        <Button
                            asChild
                            variant="default"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium rounded-xl px-4 py-2 text-sm"
                        >
                            <Link href={`/view/course/${course._id}`}>View Details</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 animate-pulse border border-white/10">
        <div className="bg-gray-300/20 h-48 rounded-xl mb-4" />
        <div className="space-y-3">
            <div className="h-5 bg-gray-300/20 rounded w-3/4" />
            <div className="h-4 bg-gray-300/20 rounded w-full" />
            <div className="h-4 bg-gray-300/20 rounded w-2/3" />
            <div className="h-10 bg-gray-300/20 rounded mt-4" />
        </div>
    </div>
);

const EmptyState = ({ query }: { query: string }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-20"
    >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md mx-auto border border-white/20">
            <div className="bg-gray-300/20 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-300 mb-6">
                {query
                    ? `No items match "${query}"`
                    : 'Add courses to your cart to get started!'}
            </p>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/courses">Browse Courses</Link>
            </Button>
        </div>
    </motion.div>
);

// Debounce Hook
function useDebounce<T>(value: T, delay: number): [T] {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return [debounced];
}

// ------------------------------------------------------------------
// Main CartPage
// ------------------------------------------------------------------
const CartPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);

    const [likedCourses, setLikedCourses] = useState<string[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    // ----------------------------------------------------------------
    // Fetch user + cart
    // ----------------------------------------------------------------
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userRes, cartRes] = await Promise.all([loggedUser(), fetchCartCourse()]);

            // User & Favorites
            const favs = (userRes as unknown as LoggedUserResponse).User.Favourite || [];
            setLikedCourses(favs.map(id => id.toString()));

            // Cart
            if ((cartRes as FetchCartResponse)?.success) {
                setCartItems((cartRes as FetchCartResponse).Cart);
            }
        } catch (err) {
            console.error('Failed to load cart', err);
            toast.error('Could not load your cart');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------------------------------
    // Toggle Like (optimistic + rollback)
    // ----------------------------------------------------------------
    const toggleLike = async (courseId: string) => {
        const wasLiked = likedCourses.includes(courseId);
        const service = wasLiked ? removeFromFavouriteService : addToFavouriteService;

        setLikedCourses(prev =>
            wasLiked ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );

        try {
            await service({ courseId });
        } catch (err) {
            toast.error('Failed to update favorite');
            console.log(err);
            setLikedCourses(prev =>
                wasLiked ? [...prev, courseId] : prev.filter(id => id !== courseId)
            );
        }
    };

    // ----------------------------------------------------------------
    // Filter & Total
    // ----------------------------------------------------------------
    const filteredItems = cartItems.filter(
        item =>
            item.Course_Name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            item.Description.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    const totalPrice = filteredItems.reduce((sum, item) => sum + item.Price, 0);
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(totalPrice);

    const courseIds = filteredItems.map(item => item._id);

    // ----------------------------------------------------------------
    // Checkout with Razorpay
    // ----------------------------------------------------------------
    const handleCheckout = async () => {
        if (courseIds.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                toast('Please login to checkout', { icon: 'Warning' });
                return;
            }

            const { data } = await axios.post<RazorpayOrder>(
                '/api/razorpay',
                {
                    amount: totalPrice, // in paise
                    currency: 'INR',
                    courseIds,
                },
                { headers: { Authorization: token, 'Content-Type': 'application/json' } }
            );

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: data.amount,
                currency: data.currency,
                name: 'VK Learning Platform',
                description: 'Course Purchase',
                order_id: data.id,
                handler: async (response: RazorpayResponse) => {
                    try {
                        const verifyRes = await axios.post<RazorpayVerifyResponse>('/api/razorpay/verifyPayment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.data.data.success) {
                            const checkoutRes = await checkoutCourse({ courseIds }) as CheckoutResponse;
                            if (checkoutRes.success) {
                                toast.success('Payment successful! Courses added.');
                                setCartItems([]);
                                router.push('/mycourses');
                            } else {
                                toast.error(checkoutRes.message || 'Checkout failed');
                            }
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        console.log(err);
                        toast.error('Payment failed');
                    }
                },
                theme: { color: '#6366f1' },
            };

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error(err);
            toast.error('Payment initiation failed');
        }
    };

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------
    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />

            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 font-sans">
                {/* Header */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-4xl text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight mt-21">
                        Your Cart
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Review and complete your purchase to start learning.
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-3xl mb-12"
                >
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search your cart..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg group-hover:bg-white/15"
                        />
                        <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 w-6 h-6" />
                    </div>
                </motion.div>

                {/* Loading / Empty / Items */}
                {isLoading ? (
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <>
                        {/* Items Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-7xl"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredItems.map((item, idx) => (
                                    <CourseCardItem
                                        key={item._id}
                                        course={item}
                                        isLiked={likedCourses.includes(item._id)}
                                        onToggleLike={() => toggleLike(item._id)}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Total & Checkout */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-7xl mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-lg text-gray-300">Total ({filteredItems.length} items)</p>
                                    <p className="text-3xl font-bold text-white">{formattedPrice}</p>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl transform transition-all duration-300 hover:scale-105"
                                >
                                    Checkout Now
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-4xl text-center mt-20 mb-10"
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Keep Learning
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Add more courses to your cart and unlock your potential.
                    </p>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold px-8 py-6 rounded-xl text-lg shadow-xl transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </motion.div>
            </div>
        </>
    );
};

export default CartPage;