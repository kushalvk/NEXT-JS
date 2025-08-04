'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {FiSearch} from 'react-icons/fi';
import {FaHeart} from 'react-icons/fa';
import {User} from "@/models/User";
import {loggedUser, loggedUserResponse} from "@/services/AuthService";
import toast from "react-hot-toast";
import {addToFavouriteService, removeFromFavouriteService} from "@/services/FavouriteService";
import {useRouter} from "next/navigation";
import {fetchCartCourse} from "@/services/CourseService";
import Loader from "@/components/Loader";
import axios from "axios";
import Script from "next/script";

const CartPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedCourses, setLikedCourses] = useState([]);
    const [coursesCart, setCoursesCart] = useState<any[]>([]);
    const [userData, setUserData] = useState<User>();
    const [isloding, setIsLoding] = useState<boolean>(true);
    const [checkoutCourseData, setChckoutCourseData] = useState([]);

    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const response: loggedUserResponse = await loggedUser();

            if (response.success) {
                setUserData(response.User);
                setLikedCourses(response.User.Favourite);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    const fetchCourseCart = async () => {
        try {
            const response = await fetchCartCourse();

            if (response.success) {
                setCoursesCart(response.Cart);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsLoding(false);
        }
    }

    useEffect(() => {
        fetchUserData();
        fetchCourseCart();
    }, []);

    useEffect(() => {
        const cartIds = coursesCart.map((item) => item._id);
        setChckoutCourseData(cartIds);
    }, [coursesCart]);

    const cartItems = coursesCart;

    const toggleLike = async (courseId: string) => {

        if (!userData) {
            router.push('/login');
            toast("Please Login first", {
                icon: '⚠️',
            });
            return;
        }

        const isLiked = likedCourses.includes(courseId);

        try {
            if (isLiked) {
                // Call UNLIKE API
                setLikedCourses((prev) => prev.filter((id) => id !== courseId));
                await removeFromFavouriteService({courseId});
            } else {
                // Call LIKE API
                setLikedCourses((prev) => [...prev, courseId]);
                await addToFavouriteService({courseId});
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const filteredCartItems = cartItems.filter(
        (item) =>
            item.Course_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPrice = filteredCartItems
        .reduce((total, item) => total + item.Price, 0)
        .toFixed(2);

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(totalPrice);

    const handleCheckout = async () => {
        try {
            // Step 1: Get user token
            const token = localStorage.getItem("token");

            // Step 2: Call backend to create Razorpay order
            const { data } = await axios.post(
                "/api/razorpay", // your order creation route
                {
                    amount: 50000, // ₹500 in paise
                    currency: "INR",
                    uploaderAccountId: "acc_Qyxd4d3lkAPoVf",
                    courseId: "6887ad6c94720a9ee9742189",
                },
                {
                    headers: { Authorization: token },
                }
            );

            const order = data.order;

            // Step 3: Configure Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // From .env
                amount: order.amount,
                currency: order.currency,
                name: "VK Learning Platform",
                description: "Course Purchase",
                order_id: order.id,
                handler: async function (response: any) {
                    // Step 4: Call backend to verify payment
                    const verifyRes = await axios.post("/api/razorpay/verify-payment", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (verifyRes.data.success) {
                        toast.success("Payment Successful and Verified!");
                        // Optional: Update UI, redirect, store in DB, etc.
                    } else {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#6366f1",
                },
            };

            // Step 5: Open Razorpay Checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error("Payment Error:", error.message);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                {/* Hero Section */}
                <div
                    className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-5 w-full">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Your Cart
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                            Review your selected courses and proceed to checkout to start learning.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
                            <Button
                                variant="outline"
                                className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                            >
                                <Link href="/courses">Add More Courses</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="w-full max-w-6xl mb-10 px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search cart items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 text-sm sm:text-base"
                                aria-label="Search cart items"
                            />
                            <FiSearch
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B6B] cursor-pointer transition-colors duration-300 w-5 h-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Cart Items List */}
                <div className="w-full max-w-6xl mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6">Items in Your Cart</h2>
                    {isloding ? (
                        <Loader/>
                    ) : filteredCartItems.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            Your cart is empty. Add some courses to get started!
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={item.Image || "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"}
                                            alt={item.Course_Name}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <div
                                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                        <button
                                            onClick={() => toggleLike(item._id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={likedCourses.includes(item._id) ? 'Unlike course' : 'Like course'}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(item._id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{item.Course_Name}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{item.Description}</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">₹ {item.Price}</p>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" className="rounded-lg duration-300 flex-1">
                                            <Link href={`/view/course/${item._id}`} className="text-white">
                                                View Course
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-lg duration-300 flex items-center justify-center"
                                            onClick={() => toggleLike(item._id)}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(item._id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {filteredCartItems.length > 0 && (
                        <div className="mt-8 text-right">
                            <p className="text-lg font-semibold text-white mb-4">Total: {formattedPrice}</p>
                            <Button
                                variant="destructive"
                                className="rounded-lg duration-300 px-6 py-3 sm:text-lg"
                                onClick={() => handleCheckout()}
                            >
                                Checkout All Courses
                            </Button>
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-6xl text-center mb-16 px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Complete Your Purchase</h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                        Add more courses or proceed to checkout to start learning today.
                    </p>
                    <Button
                        variant="outline"
                        className="text-white px-6 py-3 rounded-xl duration-300 font-semibold sm:text-lg"
                    >
                        <Link href="/courses">Browse All Courses</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;