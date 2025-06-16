import {NextRequest} from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import {verifyToken} from "@/middleware/verifyToken"; // point to correct path

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const token = req.headers.get("authorization");

        if (!token) {
            return Response.json({
                success: false,
                message: "No token provided",
            }, {status: 401});
        }

        const decoded = verifyToken(token);

        if (!decoded || typeof decoded !== "object") {
            return Response.json({
                success: false,
                message: "Invalid Token",
            }, {status: 403});
        }

        const user = decoded.user;

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
