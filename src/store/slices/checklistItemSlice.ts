import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { ChecklistItem, CreateChecklistItemRequest, UpdateChecklistItemRequest, ChecklistItemState } from '../../types';
import { setLoading } from './uiSlice';

const initialState: ChecklistItemState = {
  checklistItems: [],
  currentChecklistItem: null,
  error: null
};

// Fetch all checklist items with optional filters
export const fetchChecklistItems = createAsyncThunk(
  'checklistItems/fetchAll',
  async (params: { systemId?: number; isActive?: boolean } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ChecklistItem[] }>('/checklist-items', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch checklist items');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch checklist items by system ID
export const fetchChecklistItemsBySystem = createAsyncThunk(
  'checklistItems/fetchBySystem',
  async (systemId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ChecklistItem[] }>(`/checklist-items/system/${systemId}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch checklist items');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch single checklist item by ID
export const fetchChecklistItemById = createAsyncThunk(
  'checklistItems/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ChecklistItem }>(`/checklist-items/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch checklist item');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create checklist item
export const createChecklistItem = createAsyncThunk(
  'checklistItems/create',
  async (data: CreateChecklistItemRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: ChecklistItem }>('/checklist-items', data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create checklist item');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update checklist item
export const updateChecklistItem = createAsyncThunk(
  'checklistItems/update',
  async ({ id, data }: { id: number; data: UpdateChecklistItemRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: ChecklistItem }>(`/checklist-items/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update checklist item');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete checklist item (soft delete - sets isActive to false)
export const deleteChecklistItem = createAsyncThunk(
  'checklistItems/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/checklist-items/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete checklist item');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const checklistItemSlice = createSlice({
  name: 'checklistItems',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearChecklistItems: (state) => {
      state.checklistItems = [];
    },
    clearCurrentChecklistItem: (state) => {
      state.currentChecklistItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchChecklistItems.fulfilled, (state, action) => {
        state.checklistItems = action.payload;
        state.error = null;
      })
      .addCase(fetchChecklistItems.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch by system
      .addCase(fetchChecklistItemsBySystem.fulfilled, (state, action) => {
        state.checklistItems = action.payload;
        state.error = null;
      })
      .addCase(fetchChecklistItemsBySystem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchChecklistItemById.fulfilled, (state, action) => {
        state.currentChecklistItem = action.payload;
        state.error = null;
      })
      .addCase(fetchChecklistItemById.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Create
      .addCase(createChecklistItem.fulfilled, (state, action) => {
        state.checklistItems.push(action.payload);
        state.error = null;
      })
      .addCase(createChecklistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateChecklistItem.fulfilled, (state, action) => {
        const index = state.checklistItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.checklistItems[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateChecklistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        state.checklistItems = state.checklistItems.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteChecklistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearChecklistItems, clearCurrentChecklistItem } = checklistItemSlice.actions;
export default checklistItemSlice.reducer;
