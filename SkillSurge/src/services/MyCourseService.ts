import axios from "axios";
import Error from "@/services/Error";


export const getCourseData = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/api/course/buy', {
            headers: {
                "authorization": `${token}`
            }
        });
        return response.data;
    } catch (error) {
        Error(error)
    }
}