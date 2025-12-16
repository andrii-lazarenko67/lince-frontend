import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { SystemType, CreateSystemTypeRequest, UpdateSystemTypeRequest, SystemTypeState } from '../../types/systemType.types';

// Initial state
const initialState: SystemTypeState = {
  systemTypes: [],
  loading: false,
  error: null
};

// Async thunks for API calls
export const fetchSystemTypes = createAsyncThunk<SystemType[]>(
  'systemTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: SystemType[] }>('/system-types');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system types');
    }
  }
);

export const createSystemType = createAsyncThunk<SystemType, CreateSystemTypeRequest>(
  'systemTypes/create',
  async (systemTypeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ success: boolean; data: SystemType }>('/system-types', systemTypeData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create system type');
    }
  }
);

export const updateSystemType = createAsyncThunk<SystemType, { id: number; data: UpdateSystemTypeRequest }>(
  'systemTypes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<{ success: boolean; data: SystemType }>(`/system-types/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update system type');
    }
  }
);

export const deleteSystemType = createAsyncThunk<number, number>(
  'systemTypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/system-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete system type');
    }
  }
);

// Slice with reducers
const systemTypeSlice = createSlice({
  name: 'systemTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all system types
    builder
      .addCase(fetchSystemTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.systemTypes = action.payload;
      })
      .addCase(fetchSystemTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create system type
    builder
      .addCase(createSystemType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSystemType.fulfilled, (state, action) => {
        state.loading = false;
        state.systemTypes.push(action.payload);
      })
      .addCase(createSystemType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update system type
    builder
      .addCase(updateSystemType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.systemTypes.findIndex(st => st.id === action.payload.id);
        if (index !== -1) {
          state.systemTypes[index] = action.payload;
        }
      })
      .addCase(updateSystemType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete system type
    builder
      .addCase(deleteSystemType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSystemType.fulfilled, (state, action) => {
        state.loading = false;
        state.systemTypes = state.systemTypes.filter(st => st.id !== action.payload);
      })
      .addCase(deleteSystemType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = systemTypeSlice.actions;
export default systemTypeSlice.reducer;
