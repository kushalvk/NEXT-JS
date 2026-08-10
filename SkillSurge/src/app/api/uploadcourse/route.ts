import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import {ok, serverError} from "@/utils/apiResponse";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        // Query by owner directly (served by the Username index) instead of
        // re-reading the user to get their Upload_Course array first.
        const Course = await CourseModel.find({Username: user._id})
            .select("Image Course_Name Description Department Price createdAt Video.Description")
            .sort({createdAt: -1})
            .lean();

        return ok("Uploaded course fetch successfully", {Course});
    } catch (error) {
        return serverError("uploadcourse", error);
    }
}
