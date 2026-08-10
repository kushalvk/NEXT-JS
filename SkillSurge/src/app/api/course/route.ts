import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {uploadBufferToCloudinary} from "@/utils/cloudinary";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {badRequest, forbidden, isValidObjectId, notFound, ok, serverError} from "@/utils/apiResponse";

const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/**
 * Fields a course card needs. `Video.Description` (not `Video_Url`) keeps the
 * lesson count available to the UI without shipping every video URL - the
 * listing payload is roughly a third smaller as a result.
 */
const CARD_FIELDS = "Image Course_Name Description Department Price Username createdAt Video.Description";

function parsePrice(raw: string | undefined): number | null {
    if (raw === undefined || raw === "") return 0;
    const price = Number(raw);
    if (!Number.isFinite(price) || price < 0) return null;
    return Math.round(price);
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        const formData = await req.formData();

        const video = formData.get("Video") as File | null;
        const image = formData.get("Image") as File | null;

        if (!video && !image) {
            return badRequest("At least one file (video or image) is required.");
        }

        const Course_Name = formData.get("Course_Name")?.toString().trim() || "";
        const Description = formData.get("Description")?.toString().trim() || "";
        const Department = formData.get("Department")?.toString().trim() || "";
        const Video_Description = formData.get("Video_Description")?.toString().trim() || "";
        const price = parsePrice(formData.get("Price")?.toString());

        if (!(Course_Name && Description && Department)) {
            return badRequest("All fields are required");
        }

        if (price === null) return badRequest("Price must be a positive number");

        // Authorize before touching Cloudinary, so a rejected request (e.g. the
        // read-only demo account) never uploads anything.
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (video && video.size > MAX_VIDEO_BYTES) {
            return badRequest("Video file size must be 30MB or less.");
        }

        // Upload both files concurrently rather than one after the other.
        const [resultVideo, resultImage] = await Promise.all([
            video
                ? video.arrayBuffer().then((bytes) =>
                    uploadBufferToCloudinary(Buffer.from(bytes), "video", "courses") as Promise<{secure_url: string}>)
                : Promise.resolve(null),
            image
                ? image.arrayBuffer().then((bytes) =>
                    uploadBufferToCloudinary(Buffer.from(bytes), "image", "courses") as Promise<{secure_url: string}>)
                : Promise.resolve(null),
        ]);

        const newCourse = await CourseModel.create({
            Image: resultImage ? resultImage.secure_url : undefined,
            Course_Name,
            Description,
            Department,
            Price: price,
            Username: user._id,
            Video: resultVideo
                ? [{Video_Url: resultVideo.secure_url, Description: Video_Description}]
                : [],
        });

        const updateUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$addToSet: {Upload_Course: newCourse._id}},
            {new: true, projection: "_id"}
        ).lean();

        if (!updateUser) {
            // Do not leave an orphaned course behind if the owner vanished.
            await CourseModel.findByIdAndDelete(newCourse._id);
            return badRequest("User not able to upload course! try again");
        }

        return ok("Course added successfully", {courseId: newCourse._id});
    } catch (error) {
        return serverError("course:POST", error);
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const formData = await req.formData();
        const courseId = formData.get("Course_Id")?.toString();

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const course = await CourseModel.findById(courseId).select("Username").lean();
        if (!course || Array.isArray(course)) return notFound("Course not found");

        // Previously missing: without this check any signed-in user could rewrite
        // someone else's course and reassign its owner to themselves.
        if (String(course.Username) !== user._id) {
            return forbidden("You are not authorized to update this course");
        }

        // Only apply the fields actually supplied, so a partial form does not
        // blank out the rest of the course.
        const update: Record<string, string | number> = {};
        for (const field of ["Course_Name", "Description", "Department"] as const) {
            const value = formData.get(field)?.toString().trim();
            if (value) update[field] = value;
        }

        const rawPrice = formData.get("Price")?.toString();
        if (rawPrice !== undefined && rawPrice !== "") {
            const price = parsePrice(rawPrice);
            if (price === null) return badRequest("Price must be a positive number");
            update.Price = price;
        }

        if (Object.keys(update).length === 0) return badRequest("Nothing to update");

        const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, update, {
            new: true,
            runValidators: true,
        }).lean();

        return ok("Course updated successfully", {course: updatedCourse});
    } catch (error) {
        return serverError("course:PUT", error);
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();

        const formData = await req.formData();

        const courseId = formData.get("Course_Id")?.toString();
        const videoDesc = formData.get("Video_Description")?.toString().trim();
        const file = formData.get("Video") as File | null;

        if (!isValidObjectId(courseId) || !videoDesc || !file) {
            return badRequest("Course Id, video file and description are required");
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const course = await CourseModel.findById(courseId).select("Username").lean();
        if (!course || Array.isArray(course)) return notFound("Course not found");

        if (String(course.Username) !== user._id) {
            return forbidden("You are not authorized to update this course");
        }

        if (file.size > MAX_VIDEO_BYTES) {
            return badRequest("Video file size must be 30MB or less.");
        }

        const bytes = await file.arrayBuffer();
        const result = await uploadBufferToCloudinary(
            Buffer.from(bytes), "video", "courses"
        ) as {secure_url: string};

        const updated = await CourseModel.findByIdAndUpdate(
            courseId,
            {$push: {Video: {Video_Url: result.secure_url, Description: videoDesc}}},
            {new: true}
        ).lean();

        return ok("Video added to course", {course: updated});
    } catch (error) {
        return serverError("course:PATCH", error);
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const formData = await req.formData();
        const courseId = formData.get("Course_Id")?.toString();

        if (!isValidObjectId(courseId)) return badRequest("A valid Course Id is required");

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const course = await CourseModel.findById(courseId).select("Username").lean();
        if (!course || Array.isArray(course)) return notFound("Course not found");

        if (String(course.Username) !== user._id) {
            return forbidden("You are not authorized to delete this course");
        }

        // Detach the course from every user in one pass, then remove it.
        await UserModel.updateMany(
            {},
            {
                $pull: {
                    Upload_Course: courseId,
                    Favourite: courseId,
                    Cart: courseId,
                    Buy_Course: {courseId},
                    Watched_Course: {courseId},
                    Certificate: {courseId},
                },
            }
        );

        await CourseModel.findByIdAndDelete(courseId);

        return ok("Course deleted successfully");
    } catch (error) {
        return serverError("course:DELETE", error);
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {searchParams} = new URL(req.url);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 60, 1), 100);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const department = searchParams.get("department")?.trim();
        const search = searchParams.get("q")?.trim();

        const filter: Record<string, unknown> = {};
        if (department && department !== "All") filter.Department = department;
        if (search) {
            // Escaped so a user-supplied "(" cannot throw an invalid-regex error.
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                {Course_Name: {$regex: safe, $options: "i"}},
                {Description: {$regex: safe, $options: "i"}},
            ];
        }

        const [course, total] = await Promise.all([
            CourseModel.find(filter)
                .select(CARD_FIELDS)
                .populate("Username", "Username")
                .sort({createdAt: -1})
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            CourseModel.countDocuments(filter),
        ]);

        // An empty catalogue is a valid result, not an error.
        return ok("Courses fetched successfully", {
            course,
            page,
            limit,
            total,
            hasMore: page * limit < total,
        });
    } catch (error) {
        return serverError("course:GET", error);
    }
}
