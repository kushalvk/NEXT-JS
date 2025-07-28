import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { courseIds } = await req.json();
        console.log(courseIds);

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return Response.json({
                success: false,
                message: 'Invalid data'
            }, { status: 400 });
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const objectIds = courseIds
            .filter(id => id && mongoose.Types.ObjectId.isValid(id))
            .map(id => ({
                courseId: new mongoose.Types.ObjectId(id),
                buyDate: new Date(),
            }));

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $addToSet: {
                    Buy_Course: { $each: objectIds },
                },
                $pull: {
                    Cart: { $in: courseIds.map(id => new mongoose.Types.ObjectId(id)) },
                }
            },
            {new: true},
        );

        return Response.json({
            success: true,
            message: "Course buy successfully",
            User: updatedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at checkout ", error);
        return Response.json({
            success: false,
            message: "Error at checkout ",
        }, {status: 400});
    }
}