import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Inspection, InspectionState, ChecklistItem, CreateInspectionRequest, UpdateInspectionRequest } from '../../types';
import { setLoading } from './uiSlice';

const initialState: InspectionState = {
  inspections: [],
  currentInspection: null,
  checklistItems: [],
  error: null
};

export const fetchInspections = createAsyncThunk(
  'inspections/fetchAll',
  async (params: { systemId?: number; userId?: number; status?: string; startDate?: string; endDate?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Inspection[] }>('/inspections', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inspections');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchInspectionById = createAsyncThunk(
  'inspections/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Inspection }>(`/inspections/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inspection');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchChecklistItems = createAsyncThunk(
  'inspections/fetchChecklistItems',
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

export const createInspection = createAsyncThunk(
  'inspections/create',
  async (data: CreateInspectionRequest & { photos?: File[] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('systemId', data.systemId.toString());
      if (data.date) formData.append('date', data.date);
      if (data.conclusion) formData.append('conclusion', data.conclusion);
      formData.append('items', JSON.stringify(data.items));

      if (data.photos) {
        data.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await axiosInstance.post<{ success: boolean; data: Inspection }>('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create inspection');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateInspection = createAsyncThunk(
  'inspections/update',
  async ({ id, data }: { id: number; data: UpdateInspectionRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Inspection }>(`/inspections/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update inspection');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const approveInspection = createAsyncThunk(
  'inspections/approve',
  async ({ id, managerNotes }: { id: number; managerNotes?: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Inspection }>(`/inspections/${id}/approve`, { managerNotes });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to approve inspection');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteInspection = createAsyncThunk(
  'inspections/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/inspections/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete inspection');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const addInspectionPhotos = createAsyncThunk(
  'inspections/addPhotos',
  async ({ id, photos }: { id: number; photos: File[] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await axiosInstance.post<{ success: boolean; data: Inspection }>(
        `/inspections/${id}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to add photos');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const inspectionSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInspection: (state) => {
      state.currentInspection = null;
    },
    clearChecklistItems: (state) => {
      state.checklistItems = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.inspections = action.payload;
        state.error = null;
      })
      .addCase(fetchInspectionById.fulfilled, (state, action) => {
        state.currentInspection = action.payload;
        state.error = null;
      })
      .addCase(fetchChecklistItems.fulfilled, (state, action) => {
        state.checklistItems = action.payload;
        state.error = null;
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.inspections.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        const index = state.inspections.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(approveInspection.fulfilled, (state, action) => {
        const index = state.inspections.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteInspection.fulfilled, (state, action) => {
        state.inspections = state.inspections.filter(i => i.id !== action.payload);
        state.error = null;
      })
      .addCase(addInspectionPhotos.fulfilled, (state, action) => {
        // Update currentInspection with new photos
        if (state.currentInspection && state.currentInspection.id === action.payload.id) {
          state.currentInspection = { ...state.currentInspection, photos: action.payload.photos };
        }
        // Update in inspections list
        const index = state.inspections.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = { ...state.inspections[index], photos: action.payload.photos };
        }
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentInspection, clearChecklistItems } = inspectionSlice.actions;
export default inspectionSlice.reducer;
