import jwt, {JwtPayload} from "jsonwebtoken";

export function verifyToken(token: string): string | JwtPayload | null {
    try {
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("Error verifying token", err);
        return null;
    }
}