import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { courseIds } = await req.json();

        if (!courseIds || courseIds.length === 0) {
            return Response.json({
                success: false,
                message: "At least one Course Id is required",
            }, { status: 400 });
        }

        const { user, errorResponse } = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const courses = await CourseModel.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return Response.json({
                success: false,
                message: "One or more Course IDs are invalid",
            }, { status: 404 });
        }

        const alreadyBought = user?.Buy_Course?.map(c => c.courseId.toString()) || [];
        const newCourseIds = courseIds.filter(id => !alreadyBought.includes(id));

        if (newCourseIds.length === 0) {
            return Response.json({
                success: false,
                message: "You already bought all selected courses",
            }, { status: 409 });
        }

        const newBuyCourses = newCourseIds.map(id => ({
            courseId: id,
            buyDate: new Date(),
        }));

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: user._id },
            {
                $push: { Buy_Course: { $each: newBuyCourses } },
                $pull: { Cart: { $in: newCourseIds } },
            },
            { new: true }
        );

        return Response.json({
            success: true,
            message: `You successfully bought ${newCourseIds.length} course(s)`,
            boughtCourses: newCourseIds,
            User: updatedUser,
        }, { status: 200 });
    } catch (error) {
        console.error("Error at Buy Multiple Courses ", error);
        return Response.json({
            success: false,
            message: "Error at Buy Multiple Courses",
        }, { status: 500 });
    }
}