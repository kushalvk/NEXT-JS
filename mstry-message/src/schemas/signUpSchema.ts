import { z } from "zod";

export const usernamevalidation = z
    .string()
    .min(2, "Username Must be at least 2 characters long")
    .max(20, "Username Must be no more then 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character")

export const signUpSchema = z.object({
    username: usernamevalidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
})