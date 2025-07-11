import jwt from 'jsonwebtoken';

export function generateToken(
    payload: object,
    expiresIn: string = "1h"
): string {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn});
}