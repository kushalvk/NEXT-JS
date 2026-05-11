import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (user.Username !== "Admin") {
            return Response.json({
                success: false,
                message: "You are not authorized to get all Users",
            }, {status: 403});
        }

        const Users = await UserModel.find({Username: {$ne: "Admin"}});

        if (Users.length === 0) {
            return Response.json({
                success: false,
                message: "No Users Found",
            })
        }

        return Response.json({
            success: true,
            message: "Users found",
            Users
        }, {status: 200});
    } catch (error) {
        console.log("Error at fetch all users ", error);
        return Response.json({
            success: false,
            message: "Error at fetch all users",
        }, {status: 500});
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    try {
        const formDate = await req.formData();
        const userId = formDate.get("user_Id")?.toString() || null;

        if (!userId) {
            return Response.json({
                success: false,
                message: "User Id is required",
            }, {status: 400});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (user.Username !== "Admin") {
            return Response.json({
                success: false,
                message: "You are not authorized to delete Users",
            }, {status: 403});
        }

        const userToDelete = await UserModel.findById(userId);

        if (userToDelete.Username === "Admin") {
            return Response.json({
                success: false,
                message: "This User is not for delete",
            }, {status: 403});
        }

        if (userToDelete.Upload_Course.length >= 0) {
            await CourseModel.deleteMany({_id: userToDelete.Upload_Course});
        }

        await UserModel.findByIdAndDelete(userId);

        return Response.json({
            success: true,
            message: "User Deleted successfully",
        }, {status: 200});
    } catch (error) {
        console.error("Error at deleting user ", error);
        return Response.json({
            success: false,
            message: "Error at delete user",
        }, {status: 500});
    }
}