import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Parameter, CreateParameterRequest, UpdateParameterRequest, ParameterState } from '../../types/parameter.types';

// Initial state with proper TypeScript types
const initialState: ParameterState = {
  parameters: [],
  loading: false,
  error: null
};

// Async thunks for API calls - following the RULE: all backend calls via Redux middleware
export const fetchParameters = createAsyncThunk<Parameter[]>(
  'parameters/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/parameters');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parameters');
    }
  }
);

export const createParameter = createAsyncThunk<Parameter, CreateParameterRequest>(
  'parameters/create',
  async (parameterData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/parameters', parameterData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create parameter');
    }
  }
);

export const updateParameter = createAsyncThunk<Parameter, { id: number; data: UpdateParameterRequest }>(
  'parameters/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/parameters/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update parameter');
    }
  }
);

export const deleteParameter = createAsyncThunk<number, number>(
  'parameters/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/parameters/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete parameter');
    }
  }
);

// Slice with reducers
const parameterSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all parameters
    builder
      .addCase(fetchParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters = action.payload;
      })
      .addCase(fetchParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create parameter
    builder
      .addCase(createParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createParameter.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters.push(action.payload);
      })
      .addCase(createParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update parameter
    builder
      .addCase(updateParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParameter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parameters.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.parameters[index] = action.payload;
        }
      })
      .addCase(updateParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete parameter
    builder
      .addCase(deleteParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParameter.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters = state.parameters.filter(p => p.id !== action.payload);
      })
      .addCase(deleteParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = parameterSlice.actions;
export default parameterSlice.reducer;
