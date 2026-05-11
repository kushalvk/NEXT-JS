import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {getVerifiedUser} from "@/utils/verifyRequest";
import { uploadBufferToCloudinary } from "@/utils/cloudinary";

export async function PUT(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();

        const courseId = formData.get('courseId')?.toString() || "";
        const Video_Description = formData.get("Video_Description")?.toString() || "";
        const file = formData.get("Video") as File;

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

        if (course.Username.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "You are not authorized to update this course",
            }, {status: 403});
        }

        // Limit video size to 30MB
        if (file.size > 30 * 1024 * 1024) {
            return Response.json({
                success: false,
                message: "Video file size must be 30MB or less.",
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
    const result = await uploadBufferToCloudinary(buffer, "video", "courses") as { secure_url: string };

        const updatedCourse = await CourseModel.findOneAndUpdate(
            {_id: courseId},
            {
                $push: {
                    Video: {
                        Video_Url: result.secure_url,
                        Description: Video_Description,
                    },
                },
            },
            {new: true}
        );

        return Response.json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        }, {status: 200});
    } catch (error) {
        console.error("Error at updating video", error);
        return Response.json({
            success: false,
            message: "Error at updating video",
        }, {status: 500});
    }
}