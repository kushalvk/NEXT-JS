// /pages/api/razorpay/route.ts
import { razorpay } from '@/app/lib/razorpay';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {

    const { amount, currency, uploaderAccountId, courseId } = await req.json();

    if (!amount) {
        return new Response(JSON.stringify({ error: 'Amount is required' }), {
            status: 400,
        });
    }

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // convert to paise
            currency: currency || 'INR',
            receipt: `receipt_${courseId}_${Date.now()}`,
            transfers: [
                {
                    account: uploaderAccountId, // Razorpay sub-account ID
                    amount: Math.floor(amount * 100 * 0.95), // 95% to uploader
                    currency: currency || 'INR',
                    notes: {
                        courseId,
                        role: 'Uploader',
                    },
                },
                {
                    account: "acc_Qyxd4d3lkAPoVf", // Your commission
                    amount: Math.floor(amount * 100 * 0.05),
                    currency: currency || 'INR',
                    notes: {
                        courseId,
                        role: 'Platform Commission',
                    },
                },
            ],
        });

        res.status(200).json({ order });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Order creation failed' });
    }
}