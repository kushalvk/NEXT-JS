// /pages/api/razorpay/verify-payment.ts
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // ✅ Save purchase to DB
        return res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
}