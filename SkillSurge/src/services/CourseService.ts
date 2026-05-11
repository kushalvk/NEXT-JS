import axios from 'axios';
import Error from "@/services/Error";
import {CommonApiResponse, CourseIdData, CourseResponse, UserResponse} from "@/utils/Responses";

export const getAllCourses = async () => {
    try {
        const response = await axios.get<CourseResponse>("/api/course");
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const getCourseById = async (id: string): Promise<CourseResponse | undefined> => {
    try {
        const response = await axios.get<CourseResponse>(`/api/course/id/${id}`);
        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const buyCourse = async (courseId: FormData): Promise<UserResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
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

export const addToCartCourse = async (courseId: FormData): Promise<UserResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
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

export const RemoveFromCartCourse = async (courseId: CourseIdData): Promise<UserResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
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

export const addVideo = async (data: FormData): Promise<CourseResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
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

export const fetchCartCourse = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/api/course/cart', {
            headers: {
                "authorization": `${token}`,
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}

interface CheckoutCourseData {
    courseIds: string[];
}

export const checkoutCourse = async (data: CheckoutCourseData): Promise<UserResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post<UserResponse>(`/api/checkout`, data, {
            headers: {
                "authorization": `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const userUploadedCourse = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/uploadcourse`, {
            headers: {
                "authorization": `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const addCourse = async (course: FormData): Promise<CommonApiResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post<CommonApiResponse>(`/api/course`, course, {
            headers: {
                "authorization": `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}

export const fetchCourseByDepartment = async (department: string): Promise<CourseResponse | undefined> => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get<CourseResponse>(`/api/course/${department}`, {
            headers: {
                "authorization": `${token}`
            }
        });

        return response.data;
    } catch (error) {
        Error(error);
    }
}