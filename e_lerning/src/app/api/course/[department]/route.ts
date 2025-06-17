import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";

export async function GET(req: Request, {params}: { params: { department: string } }) {
    await dbConnect();

    try {
        const department = params.department;

        if (!department) {
            return Response.json({
                success: false,
                message: "Department required",
            }, {status: 400});
        }

        const course = await CourseModel.find({Department: department});

        if (!course || course.length === 0) {
            return Response.json({
                success: false,
                message: "No courses found for this department",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Courses fetched successfully",
            course
        })
    } catch (error) {
        console.error("Error to fetching course by department", error);
        return Response.json({
            success: false,
            message: "Server error while fetching courses",
        }, {status: 500});
    }
}