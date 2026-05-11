import {NextRequest} from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        return Response.json({
            success: true,
            message: "User Found",
            user
        }, {status: 200});

    } catch (error) {
        console.error("Error at token Verification", error);
        return Response.json({
            success: false,
            message: "Error at token Verification",
        }, {status: 500});
    }
}

export async function PUT(req: Request) {
    await dbConnect();

    try {

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const formData = await req.formData();

        const Username = formData.get("Username")?.toString() || "";
        const Email = formData.get("Email")?.toString() || "";
        const Full_name = formData.get("Full_name")?.toString() || "";
        const RazorpayId = formData.get("RazorpayId")?.toString() || "";
        console.log(RazorpayId);

        const userId = user._id;

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            Username,
            Email,
            Full_name,
            RazorpayId,
        }, {new: true});

        return Response.json({
            success: true,
            message: "User Updated",
            user: updatedUser
        }, {status: 200});

    } catch (error) {
        console.error("Error at updating Profile ", error);
        return Response.json({
            success: false,
            message: "Error at updating Profile",
        }, {status: 500});
    }
}