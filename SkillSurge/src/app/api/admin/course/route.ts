import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";

export async function GET() {
    await dbConnect();

    try {
        const course = await CourseModel.find({});

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not found",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "All Course found",
            course
        }, {status: 200});
    } catch (error) {
        console.error("Error at getting Course", error);
        return Response.json({
            success: false,
            message: "Error at getting Course",
        }, {status: 500});
    }
}