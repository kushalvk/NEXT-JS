import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import {usernamevalidation} from "@/schemas/signUpSchema"

const UsernameQuerySchema = z.object({
    username: usernamevalidation
})

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {searchParams} = new URL(req.url);
        const queryParam = {
            username: searchParams.get("username")
        }

        //     validate with Zod
        const result = UsernameQuerySchema.safeParse(queryParam);

        console.log(result); // TODO: Remove

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid Query Parameters',
            }, {status: 400})
        }

        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: "Username available"
        }, {status: 200})
    } catch (e) {
        console.error("Error checking Username", e);
        return Response.json({
            success: false,
            message: "Error checking Username",
        }, {status: 500});
    }
}