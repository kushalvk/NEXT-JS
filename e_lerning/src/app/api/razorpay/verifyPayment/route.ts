import crypto from "crypto";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return Response.json(
                { data: { success: false, message: "Missing parameters" } },
                { status: 400 }
            );
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(sign)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        return Response.json({ data: { success: isValid } });
    } catch (error) {
        console.error("Verification error:", error);
        return Response.json({ data: { success: false } }, { status: 500 });
    }
}