import {verifyToken} from "@/middleware/verifyToken";

export async function getVerifiedUser(req: Request) {
    const token = req.headers.get("authorization");

    if (!token) {
        return {
            user: null,
            errorResponse: Response.json({
                success: false,
                message: "No token provided",
            }, {status: 401}),
        };
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded !== "object") {
        return {
            user: null,
            errorResponse: Response.json({
                success: false,
                message: "Invalid token",
            }, {status: 403}),
        };
    }

    return {user: decoded.user, errorResponse: null};
}
