import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel, { BuyCourse } from "@/models/User";
import CourseModel, { Video } from "@/models/Course";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();

        const courseId = formData.get("courseId")?.toString();
        const videoId = formData.get("videoId")?.toString();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!courseId || !videoId || !user._id) {
            return Response.json({
                success: false,
                message: "Course Id & Video Id is required",
            }, {status: 400});
        }

        if (!user?.Buy_Course?.some((item: BuyCourse) => item.courseId.toString() === courseId)) {
            return Response.json({
                success: false,
                message: "Your are not bought this course.",
            }, {status: 404});
        }

        const course = await CourseModel.findById(courseId);

        if (!course) return Response.json({
            success: false,
            message: "Course Not Found",
        }, {status: 404});

        const videoExist = course.Video.some((video: Video) => (video.Video_Url as string) === videoId);

        if (!videoExist) return Response.json({
            success: false,
            message: "This video does not exist in the course",
        }, {status: 404});

        const result = await UserModel.findOneAndUpdate(
            {
                _id: user._id,
                "Watched_Course.courseId": courseId,
            },
            {
                $addToSet: {
                    "Watched_Course.$.completedVideos": videoId,
                },
            },
            {new: true}
        );

        // If no course progress found, add new one
        if (!result) {
            await UserModel.updateOne(
                {_id: user._id},
                {
                    $push: {
                        Watched_Course: {
                            courseId,
                            completedVideos: [videoId],
                            completedAt: null,
                        },
                    },
                }
            );
        }

        return Response.json({
            success: true,
            message: "Video marked as watched successfully",
        }, {status: 200});
    } catch (error) {
        console.error("Error at track progress ", error);
        return Response.json({
            success: false,
            message: "Error at track progress",
        }, {status: 500});
    }
}