// src/utils/axiosConfig.js
import axios from 'axios';

axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If the error status is 401 and there is no originalRequest._retry flag,
        // it means the token has expired and we need to refresh it
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem('refresh');
                const response = await axios.post('http://localhost:8000/auth/jwt/refresh/', {
                    refresh
                });

                const { access } = response.data;

                localStorage.setItem('access', access);

                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = `JWT ${access}`;
                return axios(originalRequest);
            } catch (error) {
                // Refresh token has expired, redirect to login
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);