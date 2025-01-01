import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Transform API data to notification format
const transformToNotifications = (data) => {
  const { user_orders = [], user_chats = [], unread_messages = [] } = data;
  
  const notifications = [
    // Transform orders to notifications
    ...user_orders.map(order => ({
      id: `order-${order.id}`,
      type: 'order',
      title: `Order #${order.id}`,
      message: `Order ${order.status}`,
      reference_id: order.id,
      created_at: order.created_at,
      read: order.status !== 'pending',
      data: order
    })),
    
    // Transform unread messages to notifications
    ...unread_messages.map(msg => ({
      id: `chat-${msg.chat_id}-${msg.id}`,
      type: 'chat',
      title: `Message from ${msg.sender_name}`,
      message: msg.content,
      reference_id: msg.chat_id,
      created_at: msg.timestamp,
      read: false,
      data: {
        chat_id: msg.chat_id,
        message_id: msg.id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name
      }
    }))
  ];

  // Sort by date, newest first
  return notifications.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
};

// Fetch notifications thunk
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      
      // Get current user
      const userResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/users/me/`,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      const userId = userResponse.data.id;
      
      // Get user profile with notifications data
      const profileResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/userprofile/${userId}/`,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      return transformToNotifications(profileResponse.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch notifications');
    }
  }
);

// Mark notification as read thunk
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read/`,
        {},
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark notification as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      // Check if notification already exists
      const exists = state.items.some(item => item.id === action.payload.id);
      if (!exists) {
        // Add new notification at the beginning of the array
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(item => !item.read).length;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(item => item.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

// Export actions
export const {
  clearNotifications,
  markAsRead,
  markAllAsRead,
  addNotification
} = notificationsSlice.actions;

// Export reducer
export default notificationsSlice.reducer;