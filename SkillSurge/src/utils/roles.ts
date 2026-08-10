import {DEMO_USERNAME} from "@/utils/demoUser";

/**
 * This app has no roles field - admin is whoever is called "Admin". That means
 * the username is a privilege boundary, so it cannot be freely chosen or
 * changed. Keep signup and profile updates in sync with this list.
 */
export const ADMIN_USERNAME = "Admin";

export const RESERVED_USERNAMES = new Set([
    ADMIN_USERNAME.toLowerCase(),
    DEMO_USERNAME.toLowerCase(),
    "administrator",
    "root",
    "system",
]);

export function isAdmin(user: { Username?: string } | null | undefined): boolean {
    return user?.Username === ADMIN_USERNAME;
}
