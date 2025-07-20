import axios from 'axios';
import Error from "@/services/Error";
import {FavouriteData, FavouriteResponse} from "@/utils/Responses";

export const addToFavouriteService = async (data: FavouriteData): Promise<FavouriteResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put<FavouriteResponse>("api/favourite",
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

export const removeFromFavouriteService = async (data: FavouriteData): Promise<FavouriteResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete<FavouriteResponse>("api/favourite",
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