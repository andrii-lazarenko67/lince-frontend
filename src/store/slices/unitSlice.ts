import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Unit, CreateUnitRequest, UpdateUnitRequest, UnitState } from '../../types/unit.types';

// Initial state with proper TypeScript types
const initialState: UnitState = {
  units: [],
  loading: false,
  error: null
};

// Async thunks for API calls - following the RULE: all backend calls via Redux middleware
export const fetchUnits = createAsyncThunk<Unit[]>(
  'units/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/units');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch units');
    }
  }
);

export const fetchUnitsByCategory = createAsyncThunk<Unit[], string>(
  'units/fetchByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/units/category/${category}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch units by category');
    }
  }
);

export const createUnit = createAsyncThunk<Unit, CreateUnitRequest>(
  'units/create',
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/units', unitData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create unit');
    }
  }
);

export const updateUnit = createAsyncThunk<Unit, { id: number; data: UpdateUnitRequest }>(
  'units/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/units/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update unit');
    }
  }
);

export const deleteUnit = createAsyncThunk<number, number>(
  'units/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/units/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete unit');
    }
  }
);

// Slice with reducers
const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all units
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch units by category
    builder
      .addCase(fetchUnitsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnitsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create unit
    builder
      .addCase(createUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update unit
    builder
      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete unit
    builder
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = unitSlice.actions;
export default unitSlice.reducer;
