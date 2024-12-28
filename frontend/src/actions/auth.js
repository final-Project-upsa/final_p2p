import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_FAIL,
    SIGNUP_SUCCESS,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_FAIL,
    AUTHENTICATED_SUCCESS,
    LOGOUT,
    ACTIVATION_FAIL,
    ACTIVATION_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET,
    SELLER_LOADED_FAIL,
    SELLER_LOADED_SUCCESS
} from './types';
import axios from 'axios';

// Create public axios instance for non-authenticated requests
const publicAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Create authenticated axios instance
const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add response interceptor for automatic token refresh only to authAxios
authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const res = await publicAxios.post('/auth/jwt/refresh/', {
                    refresh: refreshToken
                });

                const newAccessToken = res.data.access;
                localStorage.setItem('access', newAccessToken);

                authAxios.defaults.headers.common['Authorization'] = `JWT ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `JWT ${newAccessToken}`;

                return authAxios(originalRequest);
            } catch (err) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// Helper to set auth header
const setAuthHeader = () => {
    const token = localStorage.getItem('access');
    if (token) {
        authAxios.defaults.headers.common['Authorization'] = `JWT ${token}`;
    } else {
        delete authAxios.defaults.headers.common['Authorization'];
    }
};

export const register = (name, email, username, password, re_password) => async dispatch => {
    try {
        const body = {
            name,
            email,
            username,
            password,
            re_password
        };

        // Use publicAxios for registration
        const res = await publicAxios.post('/auth/users/', body);

        dispatch({
            type: SIGNUP_SUCCESS,
            payload: res.data
        });

    } catch (err) {
        console.error('Registration error:', err.response?.data);
        dispatch({
            type: SIGNUP_FAIL
        });
        throw err;
    }
};

export const verify = (uid, token) => async dispatch => {
    try {
        const body = { uid, token };
        // Use publicAxios for verification
        await publicAxios.post('/auth/users/activation/', body);

        dispatch({
            type: ACTIVATION_SUCCESS
        });

    } catch (err) {
        console.error('Activation error:', err.response?.data);
        dispatch({
            type: ACTIVATION_FAIL
        });
        throw err;
    }
};

export const login = (email, password) => async dispatch => {
    try {
        const body = { email, password };
        // Use publicAxios for login
        const res = await publicAxios.post('/auth/jwt/create/', body);

        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        
        setAuthHeader();

        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        });

        dispatch(loadUser());

    } catch (err) {
        console.error('Login error:', err.response?.data);
        dispatch({
            type: LOGIN_FAIL
        });
        throw err;
    }
};

export const checkAuthenticated = () => async dispatch => {
    if (localStorage.getItem('access')) {
        try {
            const body = { token: localStorage.getItem('access') };
            await authAxios.post('/auth/jwt/verify/', body);
            
            dispatch({
                type: AUTHENTICATED_SUCCESS
            });
        } catch (err) {
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }
    } else {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};

export const loadUser = () => async dispatch => {
    if (localStorage.getItem('access')) {
        try {
            setAuthHeader();
            const userRes = await authAxios.get('/auth/users/me/');
            
            if (userRes.data.is_seller) {
                try {
                    const sellerRes = await authAxios.get(
                        `/api/seller_dashboardd/${userRes.data.seller_id}/`
                    );
                    
                    dispatch({
                        type: USER_LOADED_SUCCESS,
                        payload: {
                            ...userRes.data,
                            seller_id: sellerRes.data.seller_id
                        }
                    });
                } catch (sellerErr) {
                    console.error('Error loading seller data:', sellerErr);
                    dispatch({
                        type: USER_LOADED_SUCCESS,
                        payload: userRes.data
                    });
                }
            } else {
                dispatch({
                    type: USER_LOADED_SUCCESS,
                    payload: userRes.data
                });
            }
        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL
            });
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
    }
};

export const password_reset = (email) => async dispatch => {
    try {
        const body = { email };
        // Use publicAxios for password reset
        await publicAxios.post('/auth/users/reset_password/', body);

        dispatch({
            type: PASSWORD_RESET
        });

    } catch (err) {
        console.error('Password reset error:', err.response?.data);
        dispatch({
            type: PASSWORD_RESET_FAIL
        });
        throw err;
    }
};

export const password_reset_confirm = (uid, token, new_password, re_password) => async dispatch => {
    try {
        const body = {
            uid,
            token,
            new_password,
            re_password
        };
        // Use publicAxios for password reset confirmation
        await publicAxios.post('/auth/users/reset_password_confirm/', body);

        dispatch({
            type: PASSWORD_RESET_SUCCESS
        });

    } catch (err) {
        console.error('Password reset confirmation error:', err.response?.data);
        dispatch({
            type: PASSWORD_RESET_FAIL
        });
        throw err;
    }
};

export const logout = () => dispatch => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    delete authAxios.defaults.headers.common['Authorization'];
    dispatch({
        type: LOGOUT
    });
};