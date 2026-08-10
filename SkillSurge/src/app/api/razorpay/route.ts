// app/api/razorpay/route.ts
import {NextRequest} from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {razorpay} from "@/app/lib/razorpay";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {badRequest, isValidObjectId, ok, serverError} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Also blocks the read-only demo account before an order is created.
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const body = await req.json().catch(() => ({}));
        const courseIds: unknown = body?.courseIds;

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return badRequest("At least one course id is required");
        }

        if (!courseIds.every(isValidObjectId)) {
            return badRequest("One or more course ids are invalid");
        }

        const courses = await CourseModel.find({_id: {$in: courseIds}}).select("Price").lean();

        if (courses.length !== courseIds.length) {
            return badRequest("One or more courses no longer exist");
        }

        // The amount is derived from the database, never from the client. The
        // request used to carry it, which let anyone open a ₹1 order for a
        // cart of expensive courses.
        const amountInRupees = courses.reduce((sum, course) => sum + (course.Price || 0), 0);

        if (amountInRupees <= 0) {
            return badRequest("These courses are free - no payment is needed");
        }

        const order = await razorpay.orders.create({
            amount: amountInRupees * 100, // paise
            currency: "INR",
            receipt: `rcpt_${user._id.slice(-8)}_${Date.now()}`,
            notes: {userId: user._id},
        });

        return ok("Order created", {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        return serverError("razorpay:createOrder", error);
    }
}
