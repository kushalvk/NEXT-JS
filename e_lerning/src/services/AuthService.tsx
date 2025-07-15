import axios from 'axios';
import {SignupData} from "@/app/(auth)/signup/page";
import CommonApiResponse from "@/utils/CommonApiResponse";
import {LoginData, LoginResponse} from "@/app/(auth)/login/page";

export const signup = async (data: SignupData): Promise<CommonApiResponse> => {
    try {
        const response = await axios.post<CommonApiResponse>('/api/sign-up', data);
        return response.data;
    } catch (error: any) {
        Error(error);
    }
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>('/api/sign-in', data);
        return response.data;
    } catch (error) {
        Error(error);
    }
}

const Error = (err: any) => {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    return {success: false, message: errorMessage};
}