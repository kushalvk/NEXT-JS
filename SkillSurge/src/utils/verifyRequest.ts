import {verifyToken} from "@/middleware/verifyToken";
import {demoReadOnlyResponse, isDemoUser, isReadOnlyMethod} from "@/utils/demoUser";
import {fail} from "@/utils/apiResponse";
import UserModel from "@/models/User";
import dbConnect from "@/app/lib/dbConnect";

/**
 * The authenticated user, loaded fresh from the database on every request.
 *
 * Every id is normalised to a string so route handlers can compare with `===`
 * and `.includes()` - which is what they did back when this object came out of
 * the JWT payload.
 */
export interface VerifiedUser {
    _id: string;
    Username: string;
    Email: string;
    Full_name: string;
    Favourite: string[];
    Cart: string[];
    Upload_Course: string[];
    Buy_Course: { courseId: string; buyDate?: Date }[];
    Watched_Course: { courseId: string; completedVideos: string[]; completedAt?: Date | null }[];
    Certificate: { courseId: string; issuedAt?: Date }[];
    RazorpayId: string;
    createdAt?: Date;
}

function readToken(req: Request): string | null {
    let token = req.headers.get("authorization");

    // Accept 'Bearer <token>' or a raw token
    if (token && token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7);
    }

    return token || null;
}

const idList = (values: unknown): string[] =>
    Array.isArray(values) ? values.filter(Boolean).map((v) => String(v)) : [];

function normalise(doc: Record<string, unknown>): VerifiedUser {
    const sub = (key: string, extra: (entry: Record<string, unknown>) => object = () => ({})) =>
        (Array.isArray(doc[key]) ? doc[key] as Record<string, unknown>[] : [])
            .filter((entry) => entry && entry.courseId)
            .map((entry) => ({courseId: String(entry.courseId), ...extra(entry)}));

    return {
        _id: String(doc._id),
        Username: String(doc.Username ?? ""),
        Email: String(doc.Email ?? ""),
        Full_name: String(doc.Full_name ?? ""),
        Favourite: idList(doc.Favourite),
        Cart: idList(doc.Cart),
        Upload_Course: idList(doc.Upload_Course),
        Buy_Course: sub("Buy_Course", (e) => ({buyDate: e.buyDate as Date})),
        Watched_Course: sub("Watched_Course", (e) => ({
            completedVideos: Array.isArray(e.completedVideos) ? e.completedVideos as string[] : [],
            completedAt: (e.completedAt as Date | null) ?? null,
        })),
        Certificate: sub("Certificate", (e) => ({issuedAt: e.issuedAt as Date})),
        RazorpayId: String(doc.RazorpayId ?? ""),
        createdAt: doc.createdAt as Date | undefined,
    } as VerifiedUser;
}

type VerifyResult =
    | { user: VerifiedUser; errorResponse: null }
    | { user: null; errorResponse: Response };

export async function getVerifiedUser(req: Request): Promise<VerifyResult> {
    const token = readToken(req);

    if (!token) {
        return {user: null, errorResponse: fail("No token provided", 401)};
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded !== "object" || !decoded.user?._id) {
        return {user: null, errorResponse: fail("Invalid token", 403)};
    }

    await dbConnect();

    // Load the live user. Password is never selected, so it cannot leak into a
    // response by accident.
    const doc = await UserModel.findById(decoded.user._id).select("-Password").lean();

    if (!doc || Array.isArray(doc)) {
        return {user: null, errorResponse: fail("Account no longer exists", 401)};
    }

    const user = normalise(doc as Record<string, unknown>);

    // The demo account may read anything it is allowed to see, but never write.
    if (isDemoUser(user) && !isReadOnlyMethod(req.method)) {
        return {user: null, errorResponse: demoReadOnlyResponse()};
    }

    return {user, errorResponse: null};
}

/**
 * Token-only demo check, for handlers that do not go through getVerifiedUser
 * (e.g. /api/razorpay, which talks to an external service before any DB write).
 */
export function isDemoRequest(req: Request): boolean {
    const token = readToken(req);
    if (!token) return false;

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded !== "object") return false;

    return isDemoUser((decoded as { user?: { Username?: string } }).user);
}
