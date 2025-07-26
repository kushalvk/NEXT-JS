import axios from 'axios';
import Error from "@/services/Error";
import {CourseIdData, UserResponse} from "@/utils/Responses";

export const addToFavouriteService = async (data: CourseIdData): Promise<UserResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put<UserResponse>("/api/favourite",
            data,
            {
                headers: {
                    authorization: `${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const removeFromFavouriteService = async (data: CourseIdData): Promise<UserResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete<UserResponse>("/api/favourite",
            {
                data,
                headers: {
                    authorization: `${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const getFavouriteService = async (): Promise<UserResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get<UserResponse>(`/api/favourite`, {
            headers: {
                "authorization": `${token}`
            }
        });
        return response.data;
    } catch (error) {
        Error(error);
    }
}