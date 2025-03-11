import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Not Authenticated",
        }, {status: 401});
    }

    const userId = user._id;
    const {acceptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new: true}
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "fail to update user status to accept message",
            }, {status: 401});
        } else {
            return Response.json({
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser
            }, {status: 200});
        }
    } catch (e) {
        console.error("fail to update user status to accept message", e);
        return Response.json({
            success: false,
            message: "fail to update user status to accept message",
        }, {status: 500});
    }
}

export async function GET() {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Not Authenticated",
        }, {status: 401});
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {status: 404});
        } else {
            return Response.json({
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage
            }, {status: 200});
        }
    } catch (e) {
        console.error("Error in getting message accepting status", e);
        return Response.json({
            success: false,
            message: "Error in getting message accepting status",
        }, {status: 500});
    }
}