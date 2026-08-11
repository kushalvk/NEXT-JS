import axios from 'axios';
import {SignupData} from "@/app/(auth)/signup/page";
import {CommonApiResponse, LoginData, LoginResponse} from "@/utils/Responses";
import Error from "./Error"
import {User} from "@/models/User";

export interface loggedUserResponse {
    success: boolean;
    message: string;
    User: User
}

export const signup = async (data: SignupData): Promise<CommonApiResponse | undefined> => {
    try {
        const response = await axios.post<CommonApiResponse>('/api/sign-up', data);
        return response.data;
    } catch (error) {
        Error(error);
    }
    return undefined; // <-- Add this line
}

export const loginService = async (data: LoginData): Promise<LoginResponse | undefined> => {
    try {
        const response = await axios.post<LoginResponse>('/api/sign-in', data);
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const loggedUser = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get<loggedUserResponse>('/api/loggedUser', {
            headers: {
                authorization: `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}

/**
 * Changes a password given the account's email address. Returns the API's own
 * message on failure (wrong email, weak password) so the form can show it.
 */
export const resetPasswordByEmail = async (
    Email: string,
    Password: string
): Promise<CommonApiResponse | undefined> => {
    try {
        const response = await axios.post<CommonApiResponse>('/api/forgot-password', {Email, Password});
        return response.data;
    } catch (error) {
        return Error(error);
    }
}

export const updatedProfile = async (data: FormData): Promise<LoginResponse | undefined> => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.put<LoginResponse>('/api/profile', data, {
            headers: {
                authorization: `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}