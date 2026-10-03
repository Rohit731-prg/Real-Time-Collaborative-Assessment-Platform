import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
    baseURL: `${API_BASE_URL}/student`,
    withCredentials: true,
})

export const courseApi = axios.create({
    baseURL: `${API_BASE_URL}/course`,
    withCredentials: true,
})

export const roomApi = axios.create({
    baseURL: `${API_BASE_URL}/room`,
    withCredentials: true,
});

export const messageApi = axios.create({
    baseURL: `${API_BASE_URL}/message`,
    withCredentials: true,
});

export const examApi = axios.create({
    baseURL: `${API_BASE_URL}/exam`,
    withCredentials: true,
});

export const aiApi = axios.create({
    baseURL: `${API_BASE_URL}/ai`,
    withCredentials: true,
});

// export const getApiErrorMessage = (error: unknown, fallback: string) => {
//     if (axios.isAxiosError<{ message?: string }>(error)) {
//         return error.response?.data?.message || error.message || fallback
//     }

//     return error instanceof Error ? error.message : fallback
// }