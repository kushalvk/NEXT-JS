import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import {generateToken} from "@/utils/token";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const {Username, Password} = await req.json();

        if (!Username || !Password) {
            return Response.json({
                success: false,
                message: "Username and password are required",
            }, {status: 400})
        }

        const user = await UserModel.findOne({Username});

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {status: 404})
        }

        const isMatch = await bcrypt.compare(Password, user.Password);

        if (!isMatch) {
            return Response.json({
                success: false,
                message: "Password doesn't match",
            }, {status: 500})
        }

        // const { Password: _ , ...senitizedUser} = user;

        const token = generateToken({user});

        return Response.json({
            success: true,
            message: "User Login Successfully",
            UserToken: token,
        }, {status: 200})
    } catch (error) {
        console.error("Error Sign In User", error);
        return Response.json({
            success: false,
            message: "Error Sign In User",
        }, {status: 500})
    }
}