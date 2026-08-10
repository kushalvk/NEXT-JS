import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {badRequest, forbidden, isValidObjectId, notFound, ok, readBody, serverError} from "@/utils/apiResponse";
import {ADMIN_USERNAME, isAdmin} from "@/utils/roles";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!isAdmin(user)) {
            return forbidden("You are not authorized to get all Users");
        }

        // Explicitly excludes Password - this used to return every hash.
        const Users = await UserModel.find({Username: {$ne: ADMIN_USERNAME}})
            .select("-Password")
            .sort({createdAt: -1})
            .lean();

        return ok("Users found", {Users, total: Users.length});
    } catch (error) {
        return serverError("admin:users:GET", error);
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!isAdmin(user)) {
            return forbidden("You are not authorized to delete Users");
        }

        const body = await readBody(req);
        const userId = body.user_Id || body.userId;

        if (!isValidObjectId(userId)) return badRequest("A valid User Id is required");

        const userToDelete = await UserModel.findById(userId).select("Username Upload_Course").lean();

        // Previously unchecked, so a bad id threw and returned a 500.
        if (!userToDelete || Array.isArray(userToDelete)) return notFound("User not found");

        if (userToDelete.Username === ADMIN_USERNAME) {
            return forbidden("This User is not for delete");
        }

        const ownedCourses = (userToDelete.Upload_Course || []).map(String);

        if (ownedCourses.length > 0) {
            await CourseModel.deleteMany({_id: {$in: ownedCourses}});

            // Otherwise every other user keeps dangling references to courses
            // that no longer exist.
            await UserModel.updateMany(
                {},
                {
                    $pull: {
                        Favourite: {$in: ownedCourses},
                        Cart: {$in: ownedCourses},
                        Buy_Course: {courseId: {$in: ownedCourses}},
                        Watched_Course: {courseId: {$in: ownedCourses}},
                        Certificate: {courseId: {$in: ownedCourses}},
                    },
                }
            );
        }

        await UserModel.findByIdAndDelete(userId);

        return ok("User Deleted successfully");
    } catch (error) {
        return serverError("admin:users:DELETE", error);
    }
}
