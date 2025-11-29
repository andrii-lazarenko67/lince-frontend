import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { MonitoringPoint, MonitoringPointState, CreateMonitoringPointRequest, UpdateMonitoringPointRequest } from '../../types';
import { setLoading } from './uiSlice';

const initialState: MonitoringPointState = {
  monitoringPoints: [],
  currentMonitoringPoint: null,
  error: null
};

export const fetchMonitoringPoints = createAsyncThunk(
  'monitoringPoints/fetchAll',
  async (params: { systemId?: number; isActive?: boolean } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: MonitoringPoint[] }>('/monitoring-points', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch monitoring points');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchMonitoringPointsBySystem = createAsyncThunk(
  'monitoringPoints/fetchBySystem',
  async (systemId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: MonitoringPoint[] }>(`/monitoring-points/system/${systemId}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch monitoring points');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createMonitoringPoint = createAsyncThunk(
  'monitoringPoints/create',
  async (data: CreateMonitoringPointRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: MonitoringPoint }>('/monitoring-points', data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create monitoring point');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateMonitoringPoint = createAsyncThunk(
  'monitoringPoints/update',
  async ({ id, data }: { id: number; data: UpdateMonitoringPointRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: MonitoringPoint }>(`/monitoring-points/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update monitoring point');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteMonitoringPoint = createAsyncThunk(
  'monitoringPoints/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/monitoring-points/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete monitoring point');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const monitoringPointSlice = createSlice({
  name: 'monitoringPoints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMonitoringPoints: (state) => {
      state.monitoringPoints = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringPoints.fulfilled, (state, action) => {
        state.monitoringPoints = action.payload;
        state.error = null;
      })
      .addCase(fetchMonitoringPointsBySystem.fulfilled, (state, action) => {
        state.monitoringPoints = action.payload;
        state.error = null;
      })
      .addCase(createMonitoringPoint.fulfilled, (state, action) => {
        state.monitoringPoints.push(action.payload);
        state.error = null;
      })
      .addCase(updateMonitoringPoint.fulfilled, (state, action) => {
        const index = state.monitoringPoints.findIndex(mp => mp.id === action.payload.id);
        if (index !== -1) {
          state.monitoringPoints[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteMonitoringPoint.fulfilled, (state, action) => {
        state.monitoringPoints = state.monitoringPoints.filter(mp => mp.id !== action.payload);
        state.error = null;
      });
  }
});

export const { clearError, clearMonitoringPoints } = monitoringPointSlice.actions;
export default monitoringPointSlice.reducer;
