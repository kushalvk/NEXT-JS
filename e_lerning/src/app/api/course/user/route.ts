import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const userId = user._id;

        const userCourse = await CourseModel.find({Username: userId});

        if (!userCourse) return Response.json({
            success: false,
            message: "Course not found",
        }, {status: 404});

        return Response.json({
            success: true,
            message: "Course found",
            Course: userCourse,
        }, {status: 200});
    } catch (error) {
        console.error("Error at fetch course by User", error);
        return Response.json({
            success: false,
            message: "Error at fetch course by User",
        }, {status: 500});
    }
}