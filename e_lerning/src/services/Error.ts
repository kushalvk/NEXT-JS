import {CommonApiResponse} from "@/utils/Responses";

const Error = (err): CommonApiResponse => {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    return {success: false, message: errorMessage};
}

export default Error;