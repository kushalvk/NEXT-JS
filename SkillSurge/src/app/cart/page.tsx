'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {HiOutlinePlay, HiOutlineShoppingCart, HiOutlineTrash} from 'react-icons/hi';
import {RemoveFromCartCourse, fetchCartCourse} from '@/services/CourseService';
import {startCoursePurchase} from '@/lib/razorpayCheckout';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import {Button} from '@/components/ui/button';

type CartItem = {
    _id: string;
    Course_Name: string;
    Description: string;
    Price: number;
    Image?: string;
};

interface FetchCartResponse {
    success: boolean;
    Cart: CartItem[];
}

const inr = (value: number) =>
    new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(value);

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const router = useRouter();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const cartRes = await fetchCartCourse() as FetchCartResponse;
            if (cartRes?.success) setCartItems(cartRes.Cart || []);
        } catch (error) {
            console.error('Failed to load cart', error);
            toast.error('Could not load your cart');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRemove = async (courseId: string) => {
        setRemovingId(courseId);
        const snapshot = cartItems;
        setCartItems((prev) => prev.filter((item) => item._id !== courseId));

        try {
            const response = await RemoveFromCartCourse({courseId});
            if (!response?.success) throw new Error(response?.message);
            toast.success('Removed from cart');
        } catch {
            setCartItems(snapshot);
        } finally {
            setRemovingId(null);
        }
    };

    const totalPrice = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.Price || 0), 0),
        [cartItems]
    );

    const courseIds = useMemo(() => cartItems.map((item) => item._id), [cartItems]);

    const handleCheckout = async () => {
        if (courseIds.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (!localStorage.getItem('token')) {
            toast('Please log in to check out');
            router.push('/login');
            return;
        }

        setIsCheckingOut(true);

        try {
            const result = await startCoursePurchase(courseIds);

            if (result.success) {
                toast.success(result.message || 'Payment successful. Courses added to your library.');
                setCartItems([]);
                router.push('/mycourses');
            } else if (!result.dismissed) {
                toast.error(result.message || 'Checkout failed');
            }
        } catch (error) {
            console.error(error);
            // A demo-account rejection is already explained by the axios interceptor.
            if (!axios.isAxiosError(error) || error.response?.data?.code !== 'DEMO_READ_ONLY') {
                toast.error('Payment initiation failed');
            }
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <>
            {/* The Razorpay script is loaded on demand by startCoursePurchase. */}
            <div className="animate-fade-in">
                <PageHeader
                    eyebrow="Checkout"
                    title="Your cart"
                    description={
                        cartItems.length > 0
                            ? `${cartItems.length} ${cartItems.length === 1 ? 'course' : 'courses'} ready to buy.`
                            : 'Courses you add will show up here.'
                    }
                />

                <div className="container-page page-shell">
                    {isLoading ? (
                        <Loader fullPage label="Loading your cart"/>
                    ) : cartItems.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineShoppingCart/>}
                            title="Your cart is empty"
                            description="Browse the catalogue and add a course to get started."
                            actionLabel="Browse courses"
                            actionHref="/courses"
                        />
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                            {/* Line items */}
                            <ul className="min-w-0 space-y-4 lg:col-span-2">
                                {cartItems.map((item) => (
                                    <li
                                        key={item._id}
                                        className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5"
                                    >
                                        <Link
                                            href={`/view/course/${item._id}`}
                                            className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:w-44"
                                        >
                                            {item.Image ? (
                                                <Image
                                                    src={item.Image}
                                                    alt=""
                                                    fill
                                                    sizes="(min-width: 640px) 11rem, 100vw"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="grid h-full place-items-center">
                                                    <HiOutlinePlay className="h-7 w-7 text-ink-400"/>
                                                </div>
                                            )}
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-bold leading-snug">
                                                <Link
                                                    href={`/view/course/${item._id}`}
                                                    className="line-clamp-2 hover:text-brand-700"
                                                >
                                                    {item.Course_Name}
                                                </Link>
                                            </h2>
                                            <p className="mt-1 line-clamp-2 text-sm text-ink-500">{item.Description}</p>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                            <span className="text-lg font-bold">{inr(item.Price || 0)}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(item._id)}
                                                disabled={removingId === item._id}
                                                className="text-ink-500 hover:text-danger"
                                            >
                                                <HiOutlineTrash className="h-4 w-4"/>
                                                Remove
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Order summary - sticks alongside the list on desktop */}
                            <aside className="min-w-0 lg:col-span-1">
                                <div className="surface-card sticky top-[calc(var(--nav-h)+1.5rem)] p-5 sm:p-6">
                                    <h2 className="text-lg font-bold">Order summary</h2>

                                    <dl className="mt-5 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-ink-500">
                                                Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                                            </dt>
                                            <dd className="font-medium">{inr(totalPrice)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-ink-500">Tax</dt>
                                            <dd className="font-medium">Included</dd>
                                        </div>
                                        <div className="flex justify-between border-t border-ink-200 pt-3 text-base">
                                            <dt className="font-bold">Total</dt>
                                            <dd className="font-bold">{inr(totalPrice)}</dd>
                                        </div>
                                    </dl>

                                    <Button
                                        size="lg"
                                        className="mt-6 w-full"
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                    >
                                        {isCheckingOut ? 'Starting checkout...' : 'Proceed to checkout'}
                                    </Button>

                                    <p className="mt-3 text-center text-xs text-ink-500">
                                        Secure payment via Razorpay. Lifetime access to every course you buy.
                                    </p>

                                    <Button asChild variant="ghost" className="mt-2 w-full">
                                        <Link href="/courses">Keep browsing</Link>
                                    </Button>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartPage;
