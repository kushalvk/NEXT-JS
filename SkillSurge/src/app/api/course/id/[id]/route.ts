import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {NextRequest} from "next/server";
import {badRequest, isValidObjectId, notFound, ok, serverError} from "@/utils/apiResponse";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const {id} = await context.params;

        // Guards the CastError a malformed id used to turn into a 500.
        if (!isValidObjectId(id)) return badRequest("A valid course id is required");

        const course = await CourseModel.findById(id)
            .populate("Username", "Username")
            .lean();

        if (!course || Array.isArray(course)) return notFound("No courses found for this id");

        return ok("Courses fetched successfully", {course});
    } catch (error) {
        return serverError("course:byId", error);
    }
}
