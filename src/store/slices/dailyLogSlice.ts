import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { DailyLog, DailyLogState, CreateDailyLogRequest, UpdateDailyLogRequest, FetchDailyLogsParams, DailyLogPagination } from '../../types';
import { setLoading } from './uiSlice';
import { fetchUnreadCount } from './notificationSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface FetchDailyLogsResponse {
  success: boolean;
  data: DailyLog[];
  pagination: DailyLogPagination;
}

const initialState: DailyLogState = {
  dailyLogs: [],
  currentDailyLog: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchDailyLogs = createAsyncThunk(
  'dailyLogs/fetchAll',
  async (params: FetchDailyLogsParams = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<FetchDailyLogsResponse>('/daily-logs', { params });
      return {
        dailyLogs: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch daily logs'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchDailyLogsBySystem = createAsyncThunk(
  'dailyLogs/fetchBySystem',
  async ({
    systemId,
    stageId,
    recordType,
    startDate,
    endDate
  }: {
    systemId: number;
    stageId?: number;
    recordType?: 'field' | 'laboratory';
    startDate?: string;
    endDate?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: DailyLog[] }>(`/daily-logs/system/${systemId}`, {
        params: { stageId, recordType, startDate, endDate }
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch daily logs'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch daily log'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create daily log'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update daily log'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete daily log'));
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
      .addCase(fetchDailyLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyLogs.fulfilled, (state, action) => {
        state.dailyLogs = action.payload.dailyLogs;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDailyLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        state.pagination = updatePaginationAfterCreate(state.pagination);
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
        state.pagination = updatePaginationAfterDelete(state.pagination);
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentDailyLog } = dailyLogSlice.actions;
export default dailyLogSlice.reducer;
