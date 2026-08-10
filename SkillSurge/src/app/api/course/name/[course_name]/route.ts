import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {NextRequest} from "next/server";
import {badRequest, ok, serverError} from "@/utils/apiResponse";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ course_name: string }> }
) {
    try {
        await dbConnect();

        const {course_name} = await context.params;

        if (!course_name) return badRequest("Course Name is required");

        // Case-insensitive exact match, with the input escaped so regex
        // metacharacters in a title cannot break the query.
        const safe = course_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const course = await CourseModel.find({Course_Name: {$regex: `^${safe}$`, $options: "i"}})
            .select("Image Course_Name Description Department Price Username createdAt Video.Description")
            .populate("Username", "Username")
            .limit(20)
            .lean();

        return ok("Courses fetched successfully", {course});
    } catch (error) {
        return serverError("course:byName", error);
    }
}
