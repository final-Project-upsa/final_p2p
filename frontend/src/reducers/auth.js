import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_FAIL,
    AUTHENTICATED_SUCCESS,
    LOGOUT,
    SIGNUP_FAIL,
    SIGNUP_SUCCESS,
    ACTIVATION_FAIL,
    ACTIVATION_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCCESS,
    SELLER_LOADED_FAIL,
    SELLER_LOADED_SUCCESS
} from '../actions/types';

const initialState = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: false,
    user: null,
    loading: true
}

export default function(state = initialState, action) {
    const { type, payload } = action;

    switch(type) {
        case AUTHENTICATED_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                loading: false
            }
        case LOGIN_SUCCESS:
            localStorage.setItem('access', payload.access);
            localStorage.setItem('refresh', payload.refresh);
            return {
                ...state,
                isAuthenticated: true,
                access: payload.access,
                refresh: payload.refresh,
                loading: false
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                isAuthenticated: false,
                loading: false
            }
        case USER_LOADED_SUCCESS:
            return {
                ...state,
                user: payload,
                isAuthenticated: true,
                loading: false
            }
        case AUTHENTICATED_FAIL:
            return {
                ...state,
                isAuthenticated: false,
                loading: false
            }
        case USER_LOADED_FAIL:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false
            }
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
                user: null,
                loading: false
            }
        case ACTIVATION_SUCCESS:
        case ACTIVATION_FAIL:
        case PASSWORD_RESET_SUCCESS:
        case PASSWORD_RESET_FAIL:
            return {
                ...state,
                loading: false
            }
       
//========================================================= 
        case SELLER_LOADED_SUCCESS:
            return {
                ...state,
                user: {
                    ...state.user,
                    is_seller: true,
                    seller_id: payload.id
                }
            }
        case SELLER_LOADED_FAIL:
            return {
            ...state,
            user: {
                ...state.user,
                is_seller: false,
                seller_id: null
            }
        }
        default:
            return state

        
    }


    
}


//=========================================================
