import {resend} from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import {ApiResponse} from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    veriofyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'waghelakushal2003@gmail.com',
            to: email,
            subject: 'Mystry Message | Verification Code',
            react: VerificationEmail({username, veriofyCode}),
        });

        return {success: true, message: 'verification email send successfully'};
    } catch (emailError) {
        console.error("Error sending verification email", emailError);
        return {success: false, message: 'Failed to send verification email'}
    }
}