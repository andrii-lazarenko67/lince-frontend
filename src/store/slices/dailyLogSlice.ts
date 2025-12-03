import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { DailyLog, DailyLogState, CreateDailyLogRequest, UpdateDailyLogRequest } from '../../types';
import { setLoading } from './uiSlice';
import { fetchUnreadCount } from './notificationSlice';

const initialState: DailyLogState = {
  dailyLogs: [],
  currentDailyLog: null,
  error: null
};

export const fetchDailyLogs = createAsyncThunk(
  'dailyLogs/fetchAll',
  async (params: { systemId?: number; userId?: number; startDate?: string; endDate?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: DailyLog[] }>('/daily-logs', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch daily logs');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchDailyLogsBySystem = createAsyncThunk(
  'dailyLogs/fetchBySystem',
  async ({ systemId, startDate, endDate }: { systemId: number; startDate?: string; endDate?: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: DailyLog[] }>(`/daily-logs/system/${systemId}`, { params: { startDate, endDate } });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch daily logs');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchDailyLogById = createAsyncThunk(
  'dailyLogs/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: DailyLog }>(`/daily-logs/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch daily log');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createDailyLog = createAsyncThunk(
  'dailyLogs/create',
  async (data: CreateDailyLogRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: DailyLog }>('/daily-logs', data);

      // Refresh notification count (out-of-range values may trigger notifications if checkbox was checked)
      if (data.sendNotification) {
        dispatch(fetchUnreadCount());
      }

      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create daily log');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateDailyLog = createAsyncThunk(
  'dailyLogs/update',
  async ({ id, data }: { id: number; data: UpdateDailyLogRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: DailyLog }>(`/daily-logs/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update daily log');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteDailyLog = createAsyncThunk(
  'dailyLogs/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/daily-logs/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete daily log');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const dailyLogSlice = createSlice({
  name: 'dailyLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDailyLog: (state) => {
      state.currentDailyLog = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyLogs.fulfilled, (state, action) => {
        state.dailyLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchDailyLogsBySystem.fulfilled, (state, action) => {
        state.dailyLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchDailyLogById.fulfilled, (state, action) => {
        state.currentDailyLog = action.payload;
        state.error = null;
      })
      .addCase(createDailyLog.fulfilled, (state, action) => {
        state.dailyLogs.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateDailyLog.fulfilled, (state, action) => {
        const index = state.dailyLogs.findIndex(dl => dl.id === action.payload.id);
        if (index !== -1) {
          state.dailyLogs[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteDailyLog.fulfilled, (state, action) => {
        state.dailyLogs = state.dailyLogs.filter(dl => dl.id !== action.payload);
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentDailyLog } = dailyLogSlice.actions;
export default dailyLogSlice.reducer;
