import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {badRequest, conflict, isValidObjectId, notFound, ok, readBody, serverError} from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const exists = await CourseModel.exists({_id: courseId});
        if (!exists) return notFound("Course not Found");

        if (user.Buy_Course.some((entry) => entry.courseId === courseId)) {
            return conflict("You already own this course");
        }

        // $addToSet keeps the cart free of duplicates.
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$addToSet: {Cart: courseId}},
            {new: true, projection: "-Password"}
        ).lean();

        return ok("Course added to cart Successfully", {User: updatedUser});
    } catch (error) {
        return serverError("cart:POST", error);
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        // The cart now comes from the database rather than a stale token claim.
        if (!user.Cart.includes(courseId)) {
            return notFound("Course doesn't exist in your cart.");
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$pull: {Cart: courseId}},
            {new: true, projection: "-Password"}
        ).lean();

        return ok("Course remove from cart Successfully", {User: updatedUser});
    } catch (error) {
        return serverError("cart:DELETE", error);
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        // An empty cart is a successful 200 with an empty list; it used to
        // answer {success: true} with a 400, which the client read as an error.
        if (user.Cart.length === 0) {
            return ok("Your cart is empty", {Cart: []});
        }

        const Cart = await CourseModel.find({_id: {$in: user.Cart}})
            .select("Image Course_Name Description Department Price")
            .lean();

        return ok("Cart fetch successfully", {Cart});
    } catch (error) {
        return serverError("cart:GET", error);
    }
}
