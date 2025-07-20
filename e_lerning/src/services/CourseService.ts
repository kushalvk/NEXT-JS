import axios from 'axios';
import Error from "@/services/Error";
import {CourseResponse} from "@/utils/Responses";

export const getAllCourses = async () => {
    try {
        const response = await axios.get<CourseResponse>("/api/course");
        return response.data;
    } catch (error) {
        Error(error);
    }
}