import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";

export async function GET(req: Request, { params }: { params: { course_name: string } }) {
    await dbConnect();

    try {
        const Course_Name = params.course_name;

        if (!Course_Name) {
            return Response.json({
                success: false,
                message: "Course Name is required",
            }, {status: 400});
        }

        const course = await CourseModel.find({Course_Name});

        if (!course || course.length === 0) {
            return Response.json({
                success: false,
                message: "No courses found for this name",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Courses fetched successfully",
            course
        })
    } catch (error) {
        console.error("Error at fetch Course ", error);
        return Response.json({
            success: false,
            message: "Server Error at fetch Course",
        }, {status: 500});
    }
}