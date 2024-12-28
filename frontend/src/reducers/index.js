import { combineReducers } from "redux";
import auth from "./auth";
import favorites from '../redux/features/favoriteSlice';

export default combineReducers({
    auth,
    favorites,
});

