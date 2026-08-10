import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {badRequest, conflict, forbidden, isValidObjectId, notFound, ok, readBody, serverError} from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const {courseId} = await readBody(req);

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user.Buy_Course.some((entry) => entry.courseId === courseId)) {
            return forbidden("You have not bought this course");
        }

        // The user object is already live, so the extra re-fetch this handler
        // used to do is no longer needed.
        if (user.Certificate.some((cert) => cert.courseId === courseId)) {
            return conflict("Certificate already issued for this course");
        }

        const course = await CourseModel.findById(courseId).select("Course_Name Video.Video_Url").lean();
        if (!course || Array.isArray(course)) return notFound("Course not found");

        const totalVideos = (course.Video || []).length;
        const watched = user.Watched_Course.find((entry) => entry.courseId === courseId);
        const watchCount = watched?.completedVideos.length ?? 0;

        if (totalVideos === 0 || watchCount < totalVideos) {
            return forbidden("You must complete all videos to get the certificate");
        }

        const issuedAt = new Date();

        // Conditional write: if two requests race, only the first one adds a
        // certificate.
        const result = await UserModel.updateOne(
            {_id: user._id, "Certificate.courseId": {$ne: courseId}},
            {$push: {Certificate: {courseId, issuedAt}}}
        );

        if (result.modifiedCount === 0) {
            return conflict("Certificate already issued for this course");
        }

        return ok("Certificate issued successfully", {
            certificate: {
                courseId,
                courseName: course.Course_Name,
                issuedTo: user.Full_name || user.Username,
                issuedAt,
            },
        });
    } catch (error) {
        return serverError("certificate", error);
    }
}
