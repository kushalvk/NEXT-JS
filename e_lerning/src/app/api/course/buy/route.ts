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

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not Found",
            }, {status: 404});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (user?.Buy_Course?.some(item => item.courseId.toString() === courseId)) {
            return Response.json({
                success: false,
                message: "You have already bought this course.",
            }, {status: 409});
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: user._id},
            {
                $push: {
                    Buy_Course: {
                        courseId: courseId,
                        buyDate: new Date(),
                    },
                },
                $pull: {
                    Cart: courseId,
                },
            },
            {new: true}
        );

        return Response.json({
            success: true,
            message: "You successfully Buy the course",
            User: updatedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at Buy a Course ", error);
        return Response.json({
            success: false,
            message: "Error at Buy a Course",
        }, {status: 500});
    }
}

export async function DELETE(req: Request) {
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

        if (!user?.Buy_Course?.some(item => item.courseId.toString() === courseId)) {
            return Response.json({
                success: false,
                message: "You haven't bought this course.",
            }, {status: 409});
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: user._id},
            {
                $pull: {
                    Buy_Course: {
                        courseId: courseId
                    }
                }
            },
            {new: true}
        );

        return Response.json({
            success: true,
            message: "Course removed from your purchased list",
            User: updatedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at deleting course from users ", error);
        return Response.json({
            success: false,
            message: "Error at deleting course from users ",
        }, {status: 500});
    }
}

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const modifiedUser = await UserModel.findById(user._id)
            .populate({
                path: "Buy_Course.courseId",
                select: "Image Course_Name Description Video"
            })
            .lean();

        return Response.json({
            success: true,
            message: "Buy Course course fetch successfully",
            User: modifiedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at getting course from users ", error);
        return Response.json({
            success: false,
            message: "Error at getting course from users ",
        }, {status: 500});
    }
}