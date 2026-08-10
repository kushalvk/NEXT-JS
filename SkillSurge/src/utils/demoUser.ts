/**
 * Demo account definition.
 *
 * These credentials are intentionally public - they are rendered on the login
 * page so visitors can explore the app without signing up. Everything the demo
 * account can do is read-only; the enforcement lives in
 * `getVerifiedUser` (src/utils/verifyRequest.ts), which every protected route
 * handler already calls.
 *
 * Keep this module free of server-only imports (jsonwebtoken, mongoose, ...):
 * it is imported by client components.
 *
 * The credentials below are mirrored in scripts/seed-demo.mjs (which cannot
 * import this file - see the note at the top of that script). Change both.
 */

export const DEMO_USERNAME = "demo";
export const DEMO_PASSWORD = "Demo@1234";
export const DEMO_EMAIL = "demo@skillsurge.dev";
export const DEMO_FULL_NAME = "Demo User";

export const DEMO_READ_ONLY_CODE = "DEMO_READ_ONLY";

export const DEMO_READ_ONLY_MESSAGE =
    "The demo account is read-only. Create a free account to buy courses, upload your own or track progress.";

/** Methods the demo account is allowed to perform. */
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isReadOnlyMethod(method?: string | null): boolean {
    return READ_ONLY_METHODS.has((method || "GET").toUpperCase());
}

export function isDemoUsername(username?: string | null): boolean {
    return typeof username === "string" && username.trim().toLowerCase() === DEMO_USERNAME;
}

export function isDemoUser(user?: { Username?: string } | null): boolean {
    return isDemoUsername(user?.Username);
}

export function demoReadOnlyResponse(): Response {
    return Response.json({
        success: false,
        message: DEMO_READ_ONLY_MESSAGE,
        code: DEMO_READ_ONLY_CODE,
    }, {status: 403});
}
