export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
    const responseMessage = error?.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
        return responseMessage;
    }

    if (typeof error?.message === "string" && error.message.trim()) {
        return error.message;
    }

    return fallback;
};
