import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

export async function PUT(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("courseId")?.toString() || null;

        if (!courseId) {
            return Response.json({
                success: false,
                message: "Course Id is required",
            }, {status: 400});
        }

        const course = await CourseModel.findOne({_id: courseId});

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not Found",
            }, {status: 404});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found",
            }, {status: 404});
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$push: {Favourite: courseId}},
            {new: true}
        );

        return Response.json({
            success: true,
            message: "Course added to favourite Successfully",
            User: updatedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at add to favourite", error);
        return Response.json({
            success: false,
            message: "Error at add to favourite",
        }, {status: 500});
    }
}