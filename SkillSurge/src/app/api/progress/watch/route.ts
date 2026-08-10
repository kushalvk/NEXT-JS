import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {badRequest, forbidden, isValidObjectId, notFound, ok, readBody, serverError} from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const {courseId, videoId} = await readBody(req);

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!isValidObjectId(courseId) || !videoId) {
            return badRequest("Course Id & Video Id is required");
        }

        if (!user.Buy_Course.some((item) => item.courseId === courseId)) {
            return forbidden("You have not bought this course.");
        }

        // Only fetch the lesson list; the rest of the course is not needed here.
        const course = await CourseModel.findById(courseId).select("Video.Video_Url").lean();
        if (!course || Array.isArray(course)) return notFound("Course Not Found");

        const lessonUrls = (course.Video || []).map((video) => video.Video_Url);
        if (!lessonUrls.includes(videoId)) {
            return notFound("This video does not exist in the course");
        }

        // One conditional update instead of a read-then-write: add the lesson to
        // the existing progress entry, and create the entry only if there is none.
        const result = await UserModel.updateOne(
            {_id: user._id, "Watched_Course.courseId": courseId},
            {$addToSet: {"Watched_Course.$.completedVideos": videoId}}
        );

        if (result.matchedCount === 0) {
            await UserModel.updateOne(
                {_id: user._id, "Watched_Course.courseId": {$ne: courseId}},
                {$push: {Watched_Course: {courseId, completedVideos: [videoId], completedAt: null}}}
            );
        }

        // Stamp the completion date once every lesson has been watched.
        const watched = user.Watched_Course.find((entry) => entry.courseId === courseId);
        const completedCount = new Set([...(watched?.completedVideos || []), videoId]).size;

        if (completedCount >= lessonUrls.length) {
            await UserModel.updateOne(
                {_id: user._id, "Watched_Course.courseId": courseId, "Watched_Course.completedAt": null},
                {$set: {"Watched_Course.$.completedAt": new Date()}}
            );
        }

        return ok("Video marked as watched successfully", {
            completed: completedCount,
            total: lessonUrls.length,
        });
    } catch (error) {
        return serverError("progress:watch", error);
    }
}
