import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { Notification, NotificationState } from '../../types';
import { setLoading } from './uiSlice';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  error: null
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params: { isRead?: boolean; type?: string; limit?: number } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Notification[] }>('/notifications', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: { count: number } }>('/notifications/unread/count');
      return response.data.data.count;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Notification }>(`/notifications/${id}/read`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.put('/notifications/read-all');
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/notifications/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete('/notifications/clear-all');
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to clear notifications');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.error = null;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.error = null;
      });
  }
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
