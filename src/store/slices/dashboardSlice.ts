import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { DashboardState, DashboardStats, RecentActivity, Alert } from '../../types';
import { setLoading } from './uiSlice';

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  alerts: [],
  error: null
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (limit: number = 10, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: RecentActivity[] }>('/dashboard/recent-activity', { params: { limit } });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recent activity');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Alert[] }>('/dashboard/alerts');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const [statsResponse, activityResponse, alertsResponse] = await Promise.all([
        axiosInstance.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
        axiosInstance.get<{ success: boolean; data: RecentActivity[] }>('/dashboard/recent-activity', { params: { limit: 10 } }),
        axiosInstance.get<{ success: boolean; data: Alert[] }>('/dashboard/alerts')
      ]);
      return {
        stats: statsResponse.data.data,
        recentActivity: activityResponse.data.data,
        alerts: alertsResponse.data.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.stats = null;
      state.recentActivity = [];
      state.alerts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.recentActivity;
        state.alerts = action.payload.alerts;
        state.error = null;
      });
  }
});

export const { clearError, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
