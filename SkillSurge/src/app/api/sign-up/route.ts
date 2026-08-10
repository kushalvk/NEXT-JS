import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import {badRequest, conflict, ok, readBody, serverError} from "@/utils/apiResponse";
import {RESERVED_USERNAMES} from "@/utils/roles";

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RULE = /^[a-zA-Z0-9_.-]{3,30}$/;

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await readBody(req);
        const Username = body.Username?.trim();
        const Email = body.Email?.trim().toLowerCase();
        const Password = body.Password;
        const Full_name = body.Full_name?.trim() || "";

        if (!Username || !Password || !Email) {
            return badRequest("Username, password and email are required");
        }

        if (!USERNAME_RULE.test(Username)) {
            return badRequest("Username must be 3-30 characters, using letters, numbers, dot, dash or underscore");
        }

        // Roles are derived from the username, so the privileged ones cannot be
        // claimed at signup.
        if (RESERVED_USERNAMES.has(Username.toLowerCase())) {
            return conflict("That username is not available");
        }

        if (!EMAIL_RULE.test(Email)) {
            return badRequest("Please provide a valid email address");
        }

        // Enforce server-side what the signup form asks for client-side.
        if (!PASSWORD_RULE.test(Password)) {
            return badRequest(
                "Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number"
            );
        }

        const existing = await UserModel.findOne({$or: [{Username}, {Email}]})
            .select("Username Email")
            .lean();

        if (existing && !Array.isArray(existing)) {
            return conflict(
                existing.Username === Username
                    ? "An account with this username already exists"
                    : "An account with this email already exists"
            );
        }

        const hashedPassword = await bcrypt.hash(Password, 12);

        await UserModel.create({Username, Password: hashedPassword, Email, Full_name});

        return ok("User Registered Successfully.", undefined, 201);
    } catch (error) {
        // A unique index can still reject a racing duplicate.
        if (typeof error === "object" && error && (error as {code?: number}).code === 11000) {
            return conflict("An account with those details already exists");
        }
        return serverError("sign-up", error);
    }
}
