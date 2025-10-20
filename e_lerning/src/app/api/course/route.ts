import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import { uploadBufferToCloudinary } from "@/utils/cloudinary";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
// ...existing code...

export async function POST(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();

        const video = formData.get("Video") as File | null;
        const image = formData.get("Image") as File | null;

        if (!video && !image) {
            return Response.json({
                success: false,
                message: "At least one file (video or image) is required.",
            }, {status: 400});
        }

        let resultVideo: { secure_url: string } | null = null;
        let resultImage: { secure_url: string } | null = null;

        if (video) {
            // Limit video size to 30MB
            if (video.size > 30 * 1024 * 1024) {
                return Response.json({
                    success: false,
                    message: "Video file size must be 30MB or less.",
                }, { status: 400 });
            }
            const bytesVideo = await video.arrayBuffer();
            const bufferVideo = Buffer.from(bytesVideo);
            resultVideo = await uploadBufferToCloudinary(bufferVideo, "video", "courses") as { secure_url: string };
        }

        if (image) {
            const bytesImage = await image.arrayBuffer();
            const bufferImage = Buffer.from(bytesImage);
            resultImage = await uploadBufferToCloudinary(bufferImage, "image", "courses") as { secure_url: string };
        }

        const Course_Name = formData.get("Course_Name")?.toString() || "";
        const Description = formData.get("Description")?.toString() || "";
        const Department = formData.get("Department")?.toString() || "";
        const Video_Description = formData.get("Video_Description")?.toString() || "";
        const Price = formData.get("Price")?.toString() || "";

        if (!(Course_Name && Description && Department)) {
            return Response.json({
                success: false,
                message: "All fields are required",
            }, {status: 400});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const newCourse = new CourseModel({
            Image: resultImage ? resultImage.secure_url : undefined,
            Course_Name,
            Description,
            Department,
            Price,
            Username: user._id,
            Video: resultVideo ? {
                Video_Url: resultVideo.secure_url,
                Description: Video_Description
            } : undefined,
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
        const Price = formData.get("Price")?.toString() || "";

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const update = {
            Course_Name,
            Description,
            Department,
            Price,
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
                    Buy_Course: {
                        courseId: courseId,
                    },
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
        const course = await CourseModel.find()
            .populate("Username", "Username")
            .sort({ createdAt: -1 })
            .limit(100);

        if (!course || course.length === 0) {
            return Response.json({
                success: false,
                message: "No courses found for this department",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Courses fetched successfully",
            course
        })
    } catch (error) {
        console.error("Error to fetching course by department", error);
        return Response.json({
            success: false,
            message: "Server error while fetching courses",
        }, {status: 500});
    }
}