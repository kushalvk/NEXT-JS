import {getVerifiedUser} from "@/utils/verifyRequest";
import {ok, serverError} from "@/utils/apiResponse";

export async function GET(req: Request) {
    try {
        // getVerifiedUser already loads the live user without the password hash.
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        return ok("User found successfully", {User: user});
    } catch (error) {
        return serverError("loggedUser", error);
    }
}
