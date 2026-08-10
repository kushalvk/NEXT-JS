import crypto from "crypto";
import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {razorpay} from "@/app/lib/razorpay";
import {badRequest, conflict, fail, isValidObjectId, ok, serverError} from "@/utils/apiResponse";

/**
 * Grants courses after a Razorpay payment.
 *
 * This endpoint used to take a list of course ids and hand them over with no
 * proof of payment at all - posting to it directly was enough to get any course
 * for free. It now requires the signed payment triple, checks the signature
 * against RAZORPAY_KEY_SECRET, confirms the order is actually paid, and refuses
 * to hand over more value than the order was for.
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const body = await req.json().catch(() => ({}));
        const {courseIds, razorpay_order_id, razorpay_payment_id, razorpay_signature} = body ?? {};

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return badRequest("At least one Course Id is required");
        }

        if (!courseIds.every(isValidObjectId)) {
            return badRequest("One or more Course IDs are invalid");
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return badRequest("Payment details are required");
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return serverError("checkout", new Error("RAZORPAY_KEY_SECRET is not set"));
        }

        // 1. The signature proves the payment came from Razorpay for this order.
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const provided = Buffer.from(String(razorpay_signature));
        const expected = Buffer.from(expectedSignature);

        if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
            return fail("Payment verification failed", 400);
        }

        // 2. The order must exist, belong to this user and be paid for.
        const order = await razorpay.orders.fetch(razorpay_order_id);

        if (!order || order.notes?.userId !== user._id) {
            return fail("This payment does not belong to your account", 403);
        }

        if (order.status !== "paid") {
            return fail("Payment has not completed yet", 402);
        }

        // 3. An order can only be redeemed once.
        const alreadyRedeemed = user.Buy_Course.some(
            (entry) => (entry as {orderId?: string}).orderId === razorpay_order_id
        );
        if (alreadyRedeemed) {
            return conflict("This payment has already been used");
        }

        const owned = new Set(user.Buy_Course.map((c) => c.courseId));
        const newCourseIds: string[] = courseIds.filter((id: string) => !owned.has(id));

        if (newCourseIds.length === 0) {
            return conflict("You already bought all selected courses");
        }

        const courses = await CourseModel.find({_id: {$in: newCourseIds}}).select("Price").lean();
        if (courses.length !== newCourseIds.length) {
            return badRequest("One or more Course IDs are invalid");
        }

        // 4. The order must cover what is being claimed, so a cheap order cannot
        //    be redeemed against an expensive cart.
        const dueInPaise = courses.reduce((sum, course) => sum + (course.Price || 0), 0) * 100;
        const paidInPaise = Number(order.amount);

        if (paidInPaise < dueInPaise) {
            return fail("The payment does not cover these courses", 400);
        }

        const buyDate = new Date();
        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: user._id},
            {
                $push: {
                    Buy_Course: {
                        $each: newCourseIds.map((id) => ({courseId: id, buyDate, orderId: razorpay_order_id})),
                    },
                },
                $pull: {Cart: {$in: newCourseIds}},
            },
            {new: true, projection: "-Password"}
        ).lean();

        return ok(`You successfully bought ${newCourseIds.length} course(s)`, {
            boughtCourses: newCourseIds,
            User: updatedUser,
        });
    } catch (error) {
        return serverError("checkout", error);
    }
}
