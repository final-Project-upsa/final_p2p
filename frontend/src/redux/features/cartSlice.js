import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCarts = createAsyncThunk(
  'carts/fetchCarts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/carts/`,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      const cartsWithTimestamps = response.data.map(cart => ({
        ...cart,
        created_at: cart.created_at || new Date().toISOString()
      }));
      return cartsWithTimestamps;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const cartSlice = createSlice({
  name: 'carts',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addCart: (state, action) => {
      state.items.push({
        ...action.payload,
        created_at: new Date().toISOString() 
      });
    },
    removeCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCarts: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCarts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCarts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addCart, removeCart, clearCarts } = cartSlice.actions;
export default cartSlice.reducer;