export default function Error(error: unknown) {
    const errorMessage = (error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong";
    return {success: false, message: errorMessage};
}