import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { amount, currency, uploaderAccountId, courseIds } = await req.json();

        if (!amount || !currency || !courseIds || courseIds.length === 0) {
            return Response.json({
                success: false,
                message: "Amount, currency and at least one courseId required",
            }, { status: 400 });
        }

        // Razorpay order params
        const options = {
            amount: amount * 100, // amount in paise
            currency: currency,
            receipt: `rcpt_${Date.now()}`, // ✅ <= 40 chars
            notes: {
                courses: Array.isArray(courseIds) ? courseIds.join(",") : courseIds,
                uploaderAccountId,
            },
        };

        const order = await razorpay.orders.create(options);

        return Response.json({
            success: true,
            order,
        }, { status: 200 });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        return Response.json({
            success: false,
            message: "Failed to create order",
            error: err,
        }, { status: 500 });
    }
}

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
