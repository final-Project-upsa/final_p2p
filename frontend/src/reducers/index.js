import { combineReducers } from "redux";
import auth from "./auth";
import favorites from '../redux/features/favoriteSlice';
import notifications from '../redux/features/notificationSlice';

export default combineReducers({
    auth,
    favorites,
    notifications,
});