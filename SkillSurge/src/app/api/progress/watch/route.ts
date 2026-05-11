import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel, { BuyCourse } from "@/models/User";
import CourseModel, { Video } from "@/models/Course";
import mongoose from "mongoose";

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

        // Validate courseId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return Response.json({
                success: false,
                message: "Invalid courseId",
            }, { status: 400 });
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

        // Use native collection updates to avoid Mongoose casting issues
        let userObjectId: mongoose.Types.ObjectId;
        let courseObjectId: mongoose.Types.ObjectId;
        try {
            if (!mongoose.Types.ObjectId.isValid(String(user._id))) {
                return Response.json({ success: false, message: 'Invalid user id' }, { status: 401 });
            }
            userObjectId = new mongoose.Types.ObjectId(user._id);
            courseObjectId = new mongoose.Types.ObjectId(courseId);
        } catch (err) {
            console.error('Invalid ObjectId conversion', err);
            return Response.json({ success: false, message: 'Invalid id format' }, { status: 400 });
        }

        try {
            const result = await UserModel.collection.updateOne(
                {
                    _id: userObjectId,
                    "Watched_Course.courseId": courseObjectId,
                },
                {
                    $addToSet: {
                        "Watched_Course.$.completedVideos": videoId,
                    },
                }
            );

            // If no course progress found (no matched array element), push a new Watched_Course entry
            if (result.matchedCount === 0) {
                await UserModel.collection.updateOne(
                    { _id: userObjectId },
                    {
                        $push: {
                            Watched_Course: {
                                courseId: courseObjectId,
                                completedVideos: [videoId],
                                completedAt: null,
                            },
                        },
                    } as Partial<{ Watched_Course: { courseId: mongoose.Types.ObjectId, completedVideos: string[], completedAt: null } }>
                );
            }
        } catch (err) {
            console.error('Error updating user progress collection', err);
            return Response.json({ success: false, message: 'Failed to update progress' }, { status: 500 });
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