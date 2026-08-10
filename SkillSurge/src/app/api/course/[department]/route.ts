import {NextRequest} from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {badRequest, ok, serverError} from "@/utils/apiResponse";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ department: string }> }
) {
    try {
        await dbConnect();

        const {department} = await context.params;

        if (!department) return badRequest("Department required");

        const {searchParams} = new URL(req.url);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 60, 1), 100);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);

        // Served by the {Department, createdAt} index.
        const [courses, total] = await Promise.all([
            CourseModel.find({Department: department})
                .select("Image Course_Name Description Department Price Username createdAt Video.Description")
                .populate("Username", "Username")
                .sort({createdAt: -1})
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            CourseModel.countDocuments({Department: department}),
        ]);

        // An empty category is a valid answer, not a 404.
        return ok("Courses fetched", {courses, page, limit, total, hasMore: page * limit < total});
    } catch (error) {
        return serverError("course:department", error);
    }
}
