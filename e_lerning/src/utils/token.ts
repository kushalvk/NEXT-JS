import jwt from 'jsonwebtoken';

export function generateToken(
    payload: object,
    expiresIn: string = "1h"
): string {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
}