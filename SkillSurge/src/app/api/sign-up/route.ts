import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const {Username, Password, Email, Full_name} = await req.json();

        if (!Username || !Password || !Email) {
            return Response.json({
                success: false,
                message: "Username, password and Email are required",
            }, {status: 400, statusText: "Username, password and Email are required"});
        }

        const checkUserNotExist = await UserModel.findOne({Username});

        if (checkUserNotExist) {
            return Response.json({
                success: false,
                message: "User already exists with this Username",
            }, {status: 400})
        }

        const checkExistUserByEmail = await UserModel.findOne({Email: Email});

        if (checkExistUserByEmail) {
            return Response.json({
                success: false,
                message: "User already exists with this Email",
            }, {status: 500})
        } else {
            const hashedPassword = await bcrypt.hash(Password, 12);

            const newUser = new UserModel({
                Username,
                Password: hashedPassword,
                Email,
                Full_name,
            })

            await newUser.save();
        }

        return Response.json({
            success: true,
            message: "User Registered Successfully.",
        }, {status: 201})
    } catch (error) {
        console.error("Error registering User", error);
        return Response.json({
            success: false,
            message: "Error registering User",
        }, {status: 500})
    }
}