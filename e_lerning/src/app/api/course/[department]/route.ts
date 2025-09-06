import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";

export async function GET(req: Request, { params }: { params: { department: string } }) {
    await dbConnect();

    const department = params.department;

    if (!department) {
        return new Response(
            JSON.stringify({ success: false, message: "Department required" }),
            { status: 400 }
        );
    }

    try {
        const courses = await CourseModel.find({ Department: department });

        if (!courses || courses.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "No courses found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Courses fetched", courses }),
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ success: false, message: "Server error" }),
            { status: 500 }
        );
    }
}