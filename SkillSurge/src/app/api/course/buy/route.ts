import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {
    badRequest,
    conflict,
    fail,
    isValidObjectId,
    notFound,
    ok,
    readBody,
    serverError,
} from "@/utils/apiResponse";

/**
 * Enrols the user in a FREE course.
 *
 * This handler used to grant any course, at any price, with no payment - the
 * "Buy now" button was effectively a giveaway. Paid courses now have to go
 * through /api/checkout, which verifies the Razorpay signature.
 */
export async function PUT(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const course = await CourseModel.findById(courseId).select("Price").lean();
        if (!course || Array.isArray(course)) return notFound("Course not Found");

        if ((course.Price || 0) > 0) {
            return fail("This course must be purchased through checkout", 402);
        }

        if (user.Buy_Course.some((item) => item.courseId === courseId)) {
            return conflict("You have already bought this course.");
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: user._id},
            {
                $push: {Buy_Course: {courseId, buyDate: new Date()}},
                $pull: {Cart: courseId},
            },
            {new: true, projection: "-Password"}
        ).lean();

        return ok("You are enrolled in this course", {User: updatedUser});
    } catch (error) {
        return serverError("course:buy:PUT", error);
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user.Buy_Course.some((item) => item.courseId === courseId)) {
            return conflict("You haven't bought this course.");
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: user._id},
            {$pull: {Buy_Course: {courseId}}},
            {new: true, projection: "-Password"}
        ).lean();

        return ok("Course removed from your purchased list", {User: updatedUser});
    } catch (error) {
        return serverError("course:buy:DELETE", error);
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const modifiedUser = await UserModel.findById(user._id)
            .select("Buy_Course Watched_Course")
            .populate({
                path: "Buy_Course.courseId",
                select: "Image Course_Name Description Video.Description",
            })
            .lean();

        return ok("Buy Course course fetch successfully", {User: modifiedUser});
    } catch (error) {
        return serverError("course:buy:GET", error);
    }
}
