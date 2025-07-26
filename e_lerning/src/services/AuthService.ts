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

export const signup = async (data: SignupData): Promise<CommonApiResponse> => {
    try {
        const response = await axios.post<CommonApiResponse>('/api/sign-up', data);
        return response.data;
    } catch (error: any) {
        Error(error);
    }
}

export const loginService = async (data: LoginData): Promise<LoginResponse> => {
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

export const updatedProfile = async (data: FormData): Promise<LoginResponse> => {
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