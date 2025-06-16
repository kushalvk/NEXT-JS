import dbConnect from "@/app/lib/dbConnect";
import {verifyToken} from "@/middleware/verifyToken";
import CourseModel from "@/models/Course";
import {writeFile} from "fs/promises";
import cloudinary from "@/utils/cloudinary";

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

        const fileName = `${Date.now()}-${file.name}`;
        // const filePath = path.join(process.cwd(), "public/uploads/videos", fileName);

        await writeFile(fileName, buffer);

        const result = await cloudinary.uploader.upload(fileName, {
            resource_type: "video",
            folder: "courses",
        });

        const Course_Name = formData.get("Course_Name")?.toString() || "";
        const Description = formData.get("Description")?.toString() || "";
        const Department = formData.get("Department")?.toString() || "";
        const Username = formData.get("Username")?.toString() || "";
        const Video_Description = formData.get("Video_Description")?.toString() || "";

        if (!(Course_Name && Description && Department && Username)) {
            return Response.json({
                success: false,
                message: "All fields are required",
            }, {status: 400});
        }

        const token = req.headers.get("authorization");
        if (!token) {
            return Response.json({
                success: false,
                message: "No token provided",
            }, {status: 401});
        }

        const decoded = verifyToken(token);
        if (!decoded || typeof decoded !== "object") {
            return Response.json({
                success: false,
                message: "Invalid token",
            }, {status: 403});
        }

        const newCourse = new CourseModel({
            Course_Name,
            Description,
            Department,
            Username: decoded.user._id,
            Video: {
                Video_Url: result.secure_url,
                Description: Video_Description
            },
        });

        await newCourse.save();

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