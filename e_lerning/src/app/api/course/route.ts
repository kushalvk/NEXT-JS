import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {writeFile} from "fs/promises";
import cloudinary from "@/utils/cloudinary";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import path from "path";
import {unlink} from "fs/promises";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();

        const file = formData.get("Video") as File;

        if (!file) {
            return Response.json({
                success: false,
                message: "No video uploaded",
            }, {status: 400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const tempFilePath = path.join(process.cwd(), "public/uploads/videos", `${Date.now()}-${file.name}`);
        await writeFile(tempFilePath, buffer);

        const result = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "video",
            folder: "courses",
        });

        await unlink(tempFilePath);

        const Course_Name = formData.get("Course_Name")?.toString() || "";
        const Description = formData.get("Description")?.toString() || "";
        const Department = formData.get("Department")?.toString() || "";
        const Video_Description = formData.get("Video_Description")?.toString() || "";

        if (!(Course_Name && Description && Department)) {
            return Response.json({
                success: false,
                message: "All fields are required",
            }, {status: 400});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const newCourse = new CourseModel({
            Course_Name,
            Description,
            Department,
            Username: user._id,
            Video: {
                Video_Url: result.secure_url,
                Description: Video_Description
            },
        });

        await newCourse.save();
        const userUpdateId = user._id;

        const updateUser = await UserModel.findOneAndUpdate(
            {_id: userUpdateId},
            {$push: {Upload_Course: newCourse._id}},
            {new: true}
        );

        if (!updateUser) return Response.json({
            success: false,
            message: "User not able to upload course! try again",
        }, {status: 400});

        return Response.json({
            success: true,
            message: "Course added successfully",
        }, {status: 200});

    } catch (error) {
        console.error("Error at adding Course", error);
        return Response.json({
            success: false,
            message: "Error at adding Course",
        }, {status: 500});
    }
}

export async function PUT(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("Course_Id")?.toString();

        if (!courseId) {
            return Response.json({
                success: false,
                message: "Course Id is required",
            }, {status: 400})
        }

        const Course_Name = formData.get("Course_Name")?.toString() || "";
        const Description = formData.get("Description")?.toString() || "";
        const Department = formData.get("Department")?.toString() || "";

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const update: any = {
            Course_Name,
            Description,
            Department,
            Username: user._id,
        };

        const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, update, {
            new: true,
        });

        if (!updatedCourse) {
            return Response.json({
                success: false,
                message: "Course not found",
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        }, {status: 200});
    } catch (error) {
        console.error("Error at updating Course", error);
        return Response.json({
            success: false,
            message: "Error at updating Course",
        }, {status: 500});
    }
}

export async function PATCH(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();

        const courseId = formData.get("Course_Id")?.toString();
        const videoDesc = formData.get("Video_Description")?.toString();
        const file = formData.get("Video") as File | null;

        if (!courseId || !videoDesc || !file) {
            return Response.json({
                success: false,
                message: "Course Id , video file and description are required",
            }, {status: 400});
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not found",
            }, {status: 404})
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (course.Username.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "You are not authorized to update this course",
            }, {status: 403});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = path.join(process.cwd(), "public/uploads/videos", `${Date.now()}-${file.name}`);
        await writeFile(tempFilePath, buffer);

        const result = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "video",
            folder: "courses",
        });

        await unlink(tempFilePath);

        const videoData = {
            Video_Url: result.secure_url,
            Description: videoDesc,
        };

        const updated = await CourseModel.findByIdAndUpdate(
            courseId,
            {$push: {Video: videoData}},
            {new: true}
        );

        return Response.json({
            success: true,
            message: "Video added to course",
            course: updated,
        }, {status: 200});

    } catch (error) {
        console.error("Error at adding a Video", error);
        return Response.json({
            success: false,
            message: "Error at adding a Video",
        }, {status: 500})
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("Course_Id")?.toString();

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
                message: "Course not found",
            }, {status: 404})
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (course.Username.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "You are not authorized to delete this course",
            }, {status: 403});
        }

        await UserModel.findByIdAndUpdate(
            user._id,
            {
                $pull: {
                    Upload_Course: courseId
                }
            }
        );

        await UserModel.updateMany(
            {},
            {
                $pull: {
                    Buy_Course: courseId,
                    Cart: courseId
                },
            }
        )

        await CourseModel.findByIdAndDelete(courseId);

        return Response.json({
            success: true,
            message: "Course deleted successfully",
        }, {status: 200});
    } catch (error) {
        console.error("Error at deleting Course", error);
        return Response.json({
            success: false,
            message: "Error at deleting Course",
        }, {status: 500});
    }
}

export async function GET() {
    await dbConnect();

    try {
        const course = await CourseModel.find({});

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not found",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "All Course found",
            course
        }, {status: 200});
    } catch (error) {
        console.error("Error at getting Course", error);
        return Response.json({
            success: false,
            message: "Error at getting Course",
        }, {status: 500});
    }
}