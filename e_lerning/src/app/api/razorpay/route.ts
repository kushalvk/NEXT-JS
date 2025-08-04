// /pages/api/razorpay/route.ts
import {razorpay} from '@/app/lib/razorpay';

export async function POST(req: Request) {

    const {amount, currency, uploaderAccountId, courseId} = await req.json();

    if (!amount) {
        return new Response(JSON.stringify({error: 'Amount is required'}), {
            status: 400,
        });
    }

    try {
        const shortReceipt = `rcpt_${courseId.slice(-4)}_${Date.now().toString().slice(-6)}`;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: currency || 'INR',
            receipt: shortReceipt, // ✅ Fixed receipt length
            transfers: [
                {
                    account: "acc_Qyxd4d3lkAPoVf", // this is your account ID
                    amount: 5000, // in paise (₹50)
                    currency: "INR",
                    notes: {
                        purpose: "Payout to vendor",
                    },
                },
            ],
            // transfers: [
            //     {
            //         account: uploaderAccountId,
            //         amount: Math.floor(amount * 100 * 0.95),
            //         currency: currency || 'INR',
            //         notes: {
            //             courseId,
            //             role: 'Uploader',
            //         },
            //     },
            //     {
            //         account: process.env.MY_ACCOUNT_ID,
            //         amount: Math.floor(amount * 100 * 0.05),
            //         currency: currency || 'INR',
            //         notes: {
            //             courseId,
            //             role: 'Platform Commission',
            //         },
            //     },
            // ],
        });

        return Response.json({
            success: true,
            order
        }, {status: 200});
    } catch (error: any) {
        console.error(error);
        return Response.json({
            success: false,
            error: 'Order creation failed'
        }, {status: 500});
    }
}