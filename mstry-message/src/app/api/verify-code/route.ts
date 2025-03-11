import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();

        const decodeUsername = decodeURIComponent(username); // if the username is ancodeed the decode it(username)
        const user = await UserModel.findOne({username: decodeUsername});

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {status: 500});
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "Account verification successfully",
            }, {status: 200});
        } else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code is expired, please signup to get a new code",
            }, {status: 400});
        } else {
            return Response.json({
                success: false,
                message: "Incorrect Verification code",
            }, {status: 400});
        }
    } catch (e) {
        console.error("Error Verifying user", e);
        return Response.json({
            success: false,
            message: "Error Verifying user",
        }, {status: 500});
    }
}