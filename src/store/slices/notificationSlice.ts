import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  Notification,
  NotificationState,
  NotificationWithStats,
  NotificationDetail,
  CreateNotificationRequest
} from '../../types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  allNotifications: [],
  selectedNotification: null,
  error: null
};

// ============ User Actions ============

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params: { isRead?: boolean; type?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Notification[] }>('/notifications', { params });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch notifications'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
      return response.data.data.count;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch unread count'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to mark as read'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to mark all as read'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const clearMyNotifications = createAsyncThunk(
  'notifications/clearMine',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete('/notifications/clear-mine');
      return true;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to clear notifications'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============ Admin/Manager Actions ============

export const fetchAllNotificationsWithStats = createAsyncThunk(
  'notifications/fetchAllWithStats',
  async (params: { type?: string; priority?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: NotificationWithStats[] }>('/notifications/admin/all', { params });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch all notifications'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchNotificationRecipients = createAsyncThunk(
  'notifications/fetchRecipients',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: NotificationDetail }>(`/notifications/admin/${id}/recipients`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch notification recipients'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (data: CreateNotificationRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: NotificationWithStats }>('/notifications', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create notification'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateNotification = createAsyncThunk(
  'notifications/update',
  async ({ id, data }: { id: number; data: { title?: string; message?: string; priority?: string } }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Notification }>(`/notifications/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update notification'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete notification'));
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
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.allNotifications = [];
      state.selectedNotification = null;
      state.error = null;
    },
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // User actions
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
      .addCase(clearMyNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.error = null;
      })
      // Admin actions
      .addCase(fetchAllNotificationsWithStats.fulfilled, (state, action) => {
        state.allNotifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotificationRecipients.fulfilled, (state, action) => {
        state.selectedNotification = action.payload;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.allNotifications.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        const index = state.allNotifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.allNotifications[index] = {
            ...state.allNotifications[index],
            title: action.payload.title,
            message: action.payload.message,
            priority: action.payload.priority
          };
        }
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.allNotifications = state.allNotifications.filter(n => n.id !== action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.error = null;
      });
  }
});

export const { clearError, addNotification, resetNotifications, clearSelectedNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
