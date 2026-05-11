import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const latestUser = await UserModel.findById(user._id);

        const updatedUser = await CourseModel.find({_id: latestUser.Upload_Course});

        return Response.json({
            success: true,
            message: "Uploaded course fetch successfully",
            Course: updatedUser,
        });
    } catch (error) {
        console.error("Error at fetching user uploaded course ", error);
        return Response.json({
            success: false,
            message: "Could not fetch user uploaded course"
        }, {status: 500});
    }
}