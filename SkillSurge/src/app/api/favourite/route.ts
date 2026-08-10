import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {badRequest, isValidObjectId, notFound, ok, readBody, serverError} from "@/utils/apiResponse";

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        // Authorize first: the previous order let anonymous callers probe which
        // course ids exist before ever being asked for a token.
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const exists = await CourseModel.exists({_id: courseId});
        if (!exists) return notFound("Course not Found");

        // $addToSet, not $push - favouriting twice used to add a duplicate.
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$addToSet: {Favourite: courseId}},
            {new: true, projection: "-Password"}
        ).lean();

        return ok("Course added to favourite Successfully", {User: updatedUser});
    } catch (error) {
        return serverError("favourite:PUT", error);
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$pull: {Favourite: courseId}},
            {new: true, projection: "-Password"}
        ).lean();

        return ok("Course remove from favourite Successfully", {User: updatedUser});
    } catch (error) {
        return serverError("favourite:DELETE", error);
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const updatedUser = await UserModel.findById(user._id)
            .select("Favourite")
            .populate({
                path: "Favourite",
                select: "Image Course_Name Description Department Price Video.Description",
            })
            .lean();

        return ok("Favourite found Successfully", {User: updatedUser});
    } catch (error) {
        return serverError("favourite:GET", error);
    }
}
