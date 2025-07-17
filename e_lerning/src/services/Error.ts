const Error = (err: any) => {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    return {success: false, message: errorMessage};
}

export default Error;