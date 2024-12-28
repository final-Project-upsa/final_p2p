import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import { sellerRegisterReducer } from './reducers/SellerReducer';
import { combineReducers } from '@reduxjs/toolkit';

const initialState = {};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

const reducer = combineReducers({
  sellerRegister: sellerRegisterReducer,
});

export default store;