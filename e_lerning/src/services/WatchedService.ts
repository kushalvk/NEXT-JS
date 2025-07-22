import axios from "axios";
import {CommonApiResponse} from "@/utils/Responses";


export const completeVideoApi = async (courseId: string, videoId: string): Promise<CommonApiResponse> => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("videoId", videoId);

    const response = await axios.post<CommonApiResponse>("/api/progress/watch", formData, {
        headers: {
            authorization: `${token}`,
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};
