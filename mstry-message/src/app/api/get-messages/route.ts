import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Not Authenticated",
        }, { status: 401 });
    }

    try {
        const userId = new mongoose.Types.ObjectId(user._id);

        const userData = await UserModel.findById(userId, "messages").lean();

        if (!userData) {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            messages: userData.messages.reverse(),
        }, { status: 200 });
    } catch (e) {
        console.error("Failed to get messages", e);
        return Response.json({
            success: false,
            message: "Failed to get messages",
        }, { status: 500 });
    }
}
