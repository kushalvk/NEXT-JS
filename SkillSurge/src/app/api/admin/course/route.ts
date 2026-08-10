import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {forbidden, ok, serverError} from "@/utils/apiResponse";
import {isAdmin} from "@/utils/roles";

export async function GET(req: Request) {
    try {
        await dbConnect();

        // This endpoint previously had no authentication at all.
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!isAdmin(user)) {
            return forbidden("You are not authorized to list all courses");
        }

        const course = await CourseModel.find({})
            .select("Image Course_Name Department Price Username createdAt Video.Description")
            .populate("Username", "Username")
            .sort({createdAt: -1})
            .lean();

        return ok("All Course found", {course, total: course.length});
    } catch (error) {
        return serverError("admin:course", error);
    }
}
