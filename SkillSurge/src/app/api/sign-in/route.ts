import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import {generateToken} from "@/utils/token";
import {badRequest, fail, ok, readBody, serverError} from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const {Username, Password} = await readBody(req);

        if (!Username || !Password) {
            return badRequest("Username and password are required");
        }

        // Password is excluded by default elsewhere, so ask for it explicitly.
        const user = await UserModel.findOne({Username}).select("_id Username Password").lean();

        // Same response and roughly the same work for "no such user" and "wrong
        // password", so the endpoint cannot be used to enumerate accounts.
        if (!user || Array.isArray(user)) {
            return fail("Incorrect username or password", 401);
        }

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return fail("Incorrect username or password", 401);
        }

        const token = generateToken({
            user: {_id: String(user._id), Username: user.Username},
        });

        return ok("User login Successfully", {UserToken: token});
    } catch (error) {
        return serverError("sign-in", error);
    }
}
