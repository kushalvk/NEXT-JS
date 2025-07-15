'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const CartPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedCourses, setLikedCourses] = useState<number[]>([]); // Track liked courses

    const cartItems = [
        {
            id: 2,
            title: 'Data Science with Python',
            category: 'Data Science',
            description: 'Master data analysis and machine learning with Python.',
            price: '$79.99',
            image: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
        },
        {
            id: 5,
            title: 'Cloud Computing with AWS',
            category: 'IT & Software',
            description: 'Explore cloud infrastructure with Amazon Web Services.',
            price: '$69.99',
            image: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        },
    ];

    const toggleLike = (courseId: number) => {
        setLikedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
        // In a real app, sync with backend or favorites page
    };

    const filteredCartItems = cartItems.filter(
        (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPrice = filteredCartItems
        .reduce((total, item) => total + parseFloat(item.price.replace('$', '')), 0)
        .toFixed(2);

    return (
        <div className="min-h-screen w-full flex flex-col bg-blue-900 items-stretch p-4 font-sans relative overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-h-full flex-1">
                {/* Hero Section */}
                <div className="flex flex-col mt-16 lg:flex-row items-center justify-between text-center lg:text-left max-w-6xl mb-5 w-full">
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
                    {filteredCartItems.length === 0 ? (
                        <p className="text-gray-400 text-base sm:text-lg text-center">
                            Your cart is empty. Add some courses to get started!
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                                        <button
                                            onClick={() => toggleLike(item.id)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-300"
                                            aria-label={likedCourses.includes(item.id) ? 'Unlike course' : 'Like course'}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(item.id)
                                                        ? 'text-[#FF6B6B]'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{item.title}</h3>
                                    <p className="text-sm text-[#1E3A8A] mb-3">{item.description}</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">{item.price}</p>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" className="rounded-lg duration-300 flex-1">
                                            <Link href={`/courses/${item.id}`} className="text-white">
                                                View Course
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-lg duration-300 flex items-center justify-center"
                                            onClick={() => toggleLike(item.id)}
                                        >
                                            <FaHeart
                                                className={`w-5 h-5 ${
                                                    likedCourses.includes(item.id)
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
                            <p className="text-lg font-semibold text-white mb-4">Total: ${totalPrice}</p>
                            <Button
                                variant="destructive"
                                className="rounded-lg duration-300 px-6 py-3 sm:text-lg"
                            >
                                <Link href="/checkout" className="text-white">
                                    Proceed to Checkout
                                </Link>
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