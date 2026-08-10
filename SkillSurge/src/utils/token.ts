import jwt from 'jsonwebtoken';

export interface TokenUser {
    _id: string;
    Username: string;
}

/**
 * The token carries an identity only - never the user document.
 *
 * It used to be signed with the whole Mongoose document, which put the bcrypt
 * password hash into localStorage, made every request carry ~1.7KB of stale
 * data, and meant a purchase was invisible until the user signed in again.
 * `getVerifiedUser` now loads the current user from the database instead.
 */
export function generateToken(payload: { user: TokenUser }, expiresIn: string = "7d"): string {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
}
