import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { user, errorResponse } = await getVerifiedUser(req);

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
                error: errorResponse,
            }, {status: 404});
        }

        const User = await UserModel.findById(user._id);

        return Response.json({
            success: true,
            message: "User found successfully",
            User
        }, {status: 200});
    } catch (error) {
        console.error("Error to get Logged User", error);
        return Response.json({
            success: false,
            message: "Error fetching Logged User",
        }, {status: 500});
    }
}