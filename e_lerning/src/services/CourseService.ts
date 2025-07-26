import axios from 'axios';
import Error from "@/services/Error";
import {CourseIdData, CourseResponse, UserResponse} from "@/utils/Responses";

const token = localStorage.getItem("token");

export const getAllCourses = async () => {
    try {
        const response = await axios.get<CourseResponse>("/api/course");
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const getCourseById = async (id: string): Promise<CourseResponse> => {
    try {
        const response = await axios.get<CourseResponse>(`/api/course/id/${id}`);
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const buyCourse = async (courseId: FormData): Promise<UserResponse> => {
    try {
        const response = await axios.put<UserResponse>(`/api/course/buy`, courseId, {
            headers: {
                "authorization": `${token}`
            }
        });
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const addToCartCourse = async (courseId: FormData): Promise<UserResponse> => {
    try {
        const response = await axios.post<UserResponse>(`/api/course/cart`, courseId, {
            headers: {
                "authorization": `${token}`
            }
        });
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const RemoveFromCartCourse = async (courseId: CourseIdData): Promise<UserResponse> => {
    try {
        const response = await axios.delete<UserResponse>("/api/course/cart", {
            headers: {
                "Content-Type": "application/json",
                "authorization": `${token}`,
            },
            data: { courseId },
        });
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const addVideo = async (data: FormData): Promise<CourseResponse> => {
    try {
        const response = await axios.put<CourseResponse>(`/api/course/video`, data, {
            headers: {
                "authorization": `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        Error(error);
    }
}