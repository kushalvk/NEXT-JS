import axios from 'axios';
import {checkoutCourse} from '@/services/CourseService';

/**
 * Shared Razorpay purchase flow, used by the cart and by "Buy now" on a course.
 *
 * The order amount is computed server-side from the database, and the resulting
 * payment signature is verified server-side in /api/checkout - the browser only
 * carries the handshake between the two.
 */

interface RazorpayOrder {
    success: boolean;
    id: string;
    amount: number;
    currency: string;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);

    // @ts-expect-error injected by the external script
    if (window.Razorpay) return Promise.resolve(true);

    return new Promise((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(true), {once: true});
            existing.addEventListener('error', () => resolve(false), {once: true});
            return;
        }

        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export interface CheckoutResult {
    success: boolean;
    message?: string;
    /** True when the shopper closed the Razorpay modal without paying. */
    dismissed?: boolean;
}

export async function startCoursePurchase(courseIds: string[]): Promise<CheckoutResult> {
    if (courseIds.length === 0) return {success: false, message: 'Nothing to buy'};

    const token = localStorage.getItem('token');
    if (!token) return {success: false, message: 'Please sign in to check out'};

    const scriptReady = await loadRazorpayScript();
    if (!scriptReady) return {success: false, message: 'Could not load the payment window'};

    // The server prices the order; the client never sends an amount.
    const {data: order} = await axios.post<RazorpayOrder>(
        '/api/razorpay',
        {courseIds},
        {headers: {Authorization: token, 'Content-Type': 'application/json'}}
    );

    return new Promise<CheckoutResult>((resolve) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount: order.amount,
            currency: order.currency,
            name: 'SkillSurge',
            description: courseIds.length > 1 ? `${courseIds.length} courses` : 'Course purchase',
            order_id: order.id,
            handler: async (response: RazorpayResponse) => {
                try {
                    const result = await checkoutCourse({
                        courseIds,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    resolve(
                        result?.success
                            ? {success: true, message: result.message}
                            : {success: false, message: result?.message || 'Checkout failed'}
                    );
                } catch {
                    resolve({success: false, message: 'Could not confirm the payment'});
                }
            },
            modal: {
                ondismiss: () => resolve({success: false, dismissed: true}),
            },
            theme: {color: '#4f46e5'},
        };

        // @ts-expect-error Razorpay is injected by the external checkout script
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    });
}
