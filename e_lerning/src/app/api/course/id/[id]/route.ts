import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

export async function GET(req: Request, {params}: { params: { id: Types.ObjectId } }): Promise {
    await dbConnect();

    try {
        const id = params.id;

        if (!id) {
            return Response.json({
                success: false,
                message: "Department required",
            }, {status: 400});
        }

        const course = await CourseModel.findById(id)
            .populate("Username", "Username");

        if (!course) {
            return Response.json({
                success: false,
                message: "No courses found for this id",
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