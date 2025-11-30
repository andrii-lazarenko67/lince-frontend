import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { System, SystemState, CreateSystemRequest, UpdateSystemRequest } from '../../types';
import { setLoading } from './uiSlice';

const initialState: SystemState = {
  systems: [],
  currentSystem: null,
  error: null
};

export const fetchSystems = createAsyncThunk(
  'systems/fetchAll',
  async (params: { status?: string; type?: string; search?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: System[] }>('/systems', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch systems');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchSystemById = createAsyncThunk(
  'systems/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: System }>(`/systems/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch system');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createSystem = createAsyncThunk(
  'systems/create',
  async (data: CreateSystemRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: System }>('/systems', data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create system');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateSystem = createAsyncThunk(
  'systems/update',
  async ({ id, data }: { id: number; data: UpdateSystemRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: System }>(`/systems/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update system');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteSystem = createAsyncThunk(
  'systems/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/systems/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete system');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const systemSlice = createSlice({
  name: 'systems',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSystem: (state) => {
      state.currentSystem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystems.fulfilled, (state, action) => {
        state.systems = action.payload;
        state.error = null;
      })
      .addCase(fetchSystems.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchSystemById.fulfilled, (state, action) => {
        state.currentSystem = action.payload;
        state.error = null;
      })
      .addCase(createSystem.fulfilled, (state, action) => {
        state.systems.push(action.payload);
        state.error = null;
      })
      .addCase(updateSystem.fulfilled, (state, action) => {
        const index = state.systems.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.systems[index] = action.payload;
        }
        if (state.currentSystem?.id === action.payload.id) {
          state.currentSystem = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteSystem.fulfilled, (state, action) => {
        state.systems = state.systems.filter(s => s.id !== action.payload);
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentSystem } = systemSlice.actions;
export default systemSlice.reducer;
