import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("courseId")?.toString();

        if (!courseId) {
            return Response.json({
                success: false,
                message: "Course Id is required",
            }, {status: 400});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user.Buy_Course.some(id => id.toString() === courseId)) {
            return Response.json({
                success: false,
                message: "Your are not bought this course",
            }, {status: 403});
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return Response.json({
                success: false,
                message: "Course not found",
            }, {status: 404});
        }

        const totalVideo = course.Video.length;

        const freshUser = await UserModel.findById(user._id);
        if (!freshUser) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {status: 404});
        }

        const userCourseProgress = freshUser.Watched_Course.find(course => course.courseId.toString() === courseId);

        const watchCount = userCourseProgress?.completedVideos.length || 0;

        const alreadyIssued = freshUser.Certificate.some(cert => cert.courseId.toString() === courseId);

        if (alreadyIssued) {
            return Response.json({
                success: false,
                message: "Certificate already issued for this course",
            }, {status: 409});
        }

        if (watchCount < totalVideo) {
            return Response.json({
                success: false,
                message: "You must complete all videos to get the certificate"
            }, {status: 403});
        }

        await UserModel.findByIdAndUpdate(user._id, {
            $push: {
                Certificate: {
                    courseId: course._id,
                    issuedAt: new Date()
                }
            }
        });

        return Response.json({
            success: true,
            message: "Certificate issued successfully"
        }, {status: 200});
    } catch (error) {
        console.error("Error issuing certificate:", error);
        return Response.json({
            success: false,
            message: "Internal server error while issuing certificate"
        }, {status: 500});
    }
}