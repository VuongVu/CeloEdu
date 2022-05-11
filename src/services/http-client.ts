import axios from 'axios';
import type { AxiosRequestConfig, AxiosInstance } from 'axios';
import HttpStatus from 'constants/http-status';

// Create an Axios Client with defaults
const client: AxiosInstance = axios.create({
    baseURL: '/',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

client.interceptors.response.use(
    response => {
        const { status, data } = response;

        if (status < HttpStatus.BAD_REQUEST) {
            return data;
        }

        return null;
    },
    error => Promise.reject(error),
);

// Request Wrapper with default success/error actions
async function httpRequest<T>(configs: AxiosRequestConfig): Promise<T | null | never> {
    try {
        const response = await client({
            ...configs,
            data: configs?.method || configs.method === 'GET' ? {} : configs?.data,
        });

        return response as any;
    } catch (error: any) {
        return Promise.reject(error?.response?.data ?? error?.response ?? error);
    }
}

export default httpRequest;

export function httpGet<T>(configs: Omit<AxiosRequestConfig, 'method' | 'data'>) {
    return httpRequest<T>({
        ...configs,
        method: 'GET',
        data: {},
    });
}

export function httpPost<T>(configs: Omit<AxiosRequestConfig, 'method'>) {
    return httpRequest<T>({
        ...configs,
        method: 'POST',
    });
}

export function httpPut<T>(configs: Omit<AxiosRequestConfig, 'method'>) {
    return httpRequest<T>({
        ...configs,
        method: 'PUT',
    });
}

export function httpPatch<T>(configs: Omit<AxiosRequestConfig, 'method'>) {
    return httpRequest<T>({
        ...configs,
        method: 'PATCH',
    });
}

export function httpDelete<T>(configs: Omit<AxiosRequestConfig, 'method'>) {
    return httpRequest<T>({
        ...configs,
        method: 'DELETE',
    });
}
