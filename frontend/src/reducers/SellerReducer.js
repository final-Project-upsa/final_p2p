import axios from 'axios';
import {
    SELLER_PROFILE_FAIL,
    SELLER_PROFILE_REQUEST,
    SELLER_PROFILE_SUCCESS,
    SELLER_REGISTER_FAIL,
    SELLER_REGISTER_REQUEST,
    SELLER_REGISTER_SUCCESS,
} from '../actions/SellerTypes';

export const sellerRegisterReducer = (state = {}, action) => {
    switch (action.type) {
        case SELLER_REGISTER_REQUEST:
            return { loading: true };
        case SELLER_REGISTER_SUCCESS:
            return {
                loading: false,
                success: true,
                sellerInfo: action.payload
            };
        case SELLER_REGISTER_FAIL:
            return {
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};