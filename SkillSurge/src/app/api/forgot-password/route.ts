import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/models/User";
import {badRequest, forbidden, notFound, ok, readBody, serverError} from "@/utils/apiResponse";
import {EMAIL_RULE, PASSWORD_REQUIREMENT, PASSWORD_RULE} from "@/utils/validation";
import {isDemoUsername} from "@/utils/demoUser";

/**
 * Resets a password from an email address alone.
 *
 * !! SECURITY NOTE !!
 * There is no verification that the caller owns the address - submitting a
 * registered email plus a new password changes that account's password
 * immediately. Anyone who knows a user's email can therefore take over their
 * account. This is a deliberate product decision for this project; the standard
 * fix is to email a single-use token and only accept the new password together
 * with that token.
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await readBody(req);
        const email = body.Email?.trim().toLowerCase();
        const password = body.Password;

        if (!email || !password) {
            return badRequest("Email and new password are required");
        }

        if (!EMAIL_RULE.test(email)) {
            return badRequest("Please provide a valid email address");
        }

        if (!PASSWORD_RULE.test(password)) {
            return badRequest(PASSWORD_REQUIREMENT);
        }

        const user = await UserModel.findOne({Email: email}).select("_id Username").lean();

        if (!user || Array.isArray(user)) {
            return notFound("No account found with that email address");
        }

        // The demo account is shared and its credentials are published on the
        // login page - letting anyone change them would break it for everyone.
        if (isDemoUsername(user.Username)) {
            return forbidden("The demo account's password cannot be changed");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await UserModel.updateOne(
            {_id: user._id},
            {
                $set: {
                    Password: hashedPassword,
                    // Invalidates tokens issued before now, so any existing
                    // session is signed out by the change. See getVerifiedUser.
                    Password_Changed_At: new Date(),
                },
            }
        );

        return ok("Your password has been changed. You can sign in now.");
    } catch (error) {
        return serverError("forgot-password", error);
    }
}
