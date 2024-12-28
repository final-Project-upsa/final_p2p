import axios from 'axios';
import {
    SELLER_PROFILE_FAIL,
    SELLER_PROFILE_REQUEST,
    SELLER_PROFILE_SUCCESS,
    SELLER_REGISTER_FAIL,
    SELLER_REGISTER_REQUEST,
    SELLER_REGISTER_SUCCESS,
} from './SellerTypes';

import { USER_LOADED_SUCCESS, USER_LOADED_FAIL } from './types'; // Make sure path is correct

export const enroll_seller = (sellerData) => async (dispatch, getState) => {
    try {
        dispatch({
            type: SELLER_REGISTER_REQUEST
        });

        // Get access token from state
        const { auth: { access } } = getState();

        // Correct headers configuration
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${access}`
            }
        };

        // Make API request
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/enroll_seller/`,
            sellerData, 
            config
        );

        dispatch({
            type: SELLER_REGISTER_SUCCESS,
            payload: res.data
        });

        dispatch(loadUser());
    } catch (err) {
        console.error(err.response?.data);
        dispatch({
            type: SELLER_REGISTER_FAIL,
            payload: err.response?.data?.error || 'Registration failed'
        });
    }
};

export const loadUser = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };

        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/auth/users/me/`, 
                config
            );

            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: res.data
            });
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