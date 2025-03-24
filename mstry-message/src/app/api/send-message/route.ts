import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import {Message} from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    const {username, content} = await request.json();

    try {
        const user = await UserModel.findOne({username});
        console.log(user);

        if (!user) {
            return Response.json({
                success: false,
                message: "User no found",
            }, {status: 404});
        }

        //     is User accepting messages
        if (!user.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "User is not accepting the message",
            }, {status: 201});
        }

        const newMessages = {content, createdAt: new Date()};
        user.messages.push(newMessages as Message);
        await user.save()

        return Response.json({
            success: true,
            message: "Message sent successfully",
        }, {status: 200});
    } catch (e) {
        console.error("Error to adding messages", e);
        return Response.json({
            success: false,
            message: "Error to adding messages",
        }, {status: 500});
    }
}