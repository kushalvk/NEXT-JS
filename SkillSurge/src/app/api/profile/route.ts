import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import {badRequest, conflict, ok, readBody, serverError} from "@/utils/apiResponse";
import {RESERVED_USERNAMES} from "@/utils/roles";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RULE = /^[a-zA-Z0-9_.-]{3,30}$/;

export async function GET(req: Request) {
    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        return ok("User Found", {user});
    } catch (error) {
        return serverError("profile:GET", error);
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        const body = await readBody(req);

        // Only fields that were actually submitted get written. The previous
        // version wrote "" for anything the form left out, wiping the rest of
        // the profile.
        const update: Record<string, string> = {};

        if (body.Username !== undefined && body.Username.trim() !== "") {
            const Username = body.Username.trim();

            if (!USERNAME_RULE.test(Username)) {
                return badRequest("Username must be 3-30 characters, using letters, numbers, dot, dash or underscore");
            }

            // Admin is "whoever is called Admin", so renaming yourself into a
            // reserved name would be a privilege escalation.
            if (Username !== user.Username && RESERVED_USERNAMES.has(Username.toLowerCase())) {
                return conflict("That username is not available");
            }

            update.Username = Username;
        }

        if (body.Email !== undefined && body.Email.trim() !== "") {
            const Email = body.Email.trim().toLowerCase();
            if (!EMAIL_RULE.test(Email)) return badRequest("Please provide a valid email address");
            update.Email = Email;
        }

        if (body.Full_name !== undefined) update.Full_name = body.Full_name.trim();
        if (body.RazorpayId !== undefined) update.RazorpayId = body.RazorpayId.trim();

        if (Object.keys(update).length === 0) return badRequest("Nothing to update");

        // Both fields are unique; check before writing so the client gets a
        // useful message instead of a duplicate-key 500. Only run the query when
        // one of them is actually changing - an empty $or would collapse to
        // "any other user" and reject every update.
        const uniqueChecks = [
            ...(update.Username ? [{Username: update.Username}] : []),
            ...(update.Email ? [{Email: update.Email}] : []),
        ];

        if (uniqueChecks.length > 0) {
            const clash = await UserModel.findOne({
                _id: {$ne: user._id},
                $or: uniqueChecks,
            }).select("Username Email").lean();

            if (clash && !Array.isArray(clash)) {
                return conflict(
                    clash.Username === update.Username
                        ? "That username is already taken"
                        : "That email is already in use"
                );
            }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, update, {
            new: true,
            runValidators: true,
        }).select("-Password").lean();

        return ok("User Updated", {user: updatedUser});
    } catch (error) {
        if (typeof error === "object" && error && (error as {code?: number}).code === 11000) {
            return conflict("Those details are already in use");
        }
        return serverError("profile:PUT", error);
    }
}
