import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import {ok, serverError} from "@/utils/apiResponse";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const userCourse = await CourseModel.find({Username: user._id})
            .select("Image Course_Name Description Department Price createdAt Video.Description")
            .sort({createdAt: -1})
            .lean();

        return ok("Course found", {Course: userCourse});
    } catch (error) {
        return serverError("course:user", error);
    }
}
