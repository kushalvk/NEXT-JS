import mongoose from "mongoose";

/**
 * Response helpers so every endpoint answers with the same envelope
 * ({success, message, ...}) and a status code that matches what happened.
 */

export function ok<T extends object>(message: string, data?: T, status = 200): Response {
    return Response.json({success: true, message, ...(data ?? {})}, {status});
}

export function fail(message: string, status: number, extra?: Record<string, unknown>): Response {
    return Response.json({success: false, message, ...(extra ?? {})}, {status});
}

export const badRequest = (message = "Invalid request") => fail(message, 400);
export const unauthorized = (message = "Not signed in") => fail(message, 401);
export const forbidden = (message = "Not allowed") => fail(message, 403);
export const notFound = (message = "Not found") => fail(message, 404);
export const conflict = (message = "Already exists") => fail(message, 409);

/**
 * Logs the real error server-side and returns a generic message, so internal
 * details (stack traces, driver errors) never reach the client.
 */
export function serverError(context: string, error: unknown): Response {
    console.error(`[api] ${context}`, error);
    return fail("Something went wrong. Please try again.", 500);
}

/** Guards against Mongoose throwing a CastError on malformed ids. */
export function isValidObjectId(id: unknown): id is string {
    return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Reads a body that may arrive as multipart/form-data or JSON. Mutating
 * endpoints in this app are inconsistent about which they use, and the clients
 * send both; accepting either removes a whole class of 500s.
 */
export async function readBody(req: Request): Promise<Record<string, string>> {
    const contentType = req.headers.get("content-type") || "";

    try {
        if (contentType.includes("application/json")) {
            const json = await req.json();
            if (!json || typeof json !== "object") return {};
            return Object.fromEntries(
                Object.entries(json as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
            );
        }

        const formData = await req.formData();
        const entries: Record<string, string> = {};
        formData.forEach((value, key) => {
            if (typeof value === "string") entries[key] = value;
        });
        return entries;
    } catch {
        return {};
    }
}
