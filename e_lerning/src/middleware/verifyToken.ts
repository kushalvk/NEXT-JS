import jwt, {JwtPayload} from "jsonwebtoken";

export function verifyToken(token: string): string | JwtPayload | null {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("Error verifying token", err);
        return null;
    }
}
