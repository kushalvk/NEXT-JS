// app/api/razorpay/route.ts
import Razorpay from "razorpay";
import { NextRequest } from "next/server";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency = "INR", courseIds } = body;

        if (!amount || amount <= 0 || !courseIds || courseIds.length === 0) {
            return Response.json(
                { success: false, message: "Invalid amount or courseIds" },
                { status: 400 }
            );
        }

        const order = await razorpay.orders.create({
            amount: amount * 100, // already in rupees → convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseIds: courseIds.join(","),
            },
        });

        return Response.json({
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Razorpay order error:", error);
        return Response.json(
            { success: false || "Failed to create order" },
            { status: 500 }
        );
    }
}