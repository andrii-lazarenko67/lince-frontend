import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  SystemPhoto,
  UpdateSystemPhotoRequest,
  SystemPhotoState
} from '../../types/systemPhoto.types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

// Initial state with proper TypeScript types - EXACT MATCH
const initialState: SystemPhotoState = {
  photos: [],
  loading: false,
  error: null
};

// Async thunks - following RULE: all backend calls via Redux middleware with global loading state

// Fetch photos by system ID
export const fetchPhotosBySystem = createAsyncThunk<SystemPhoto[], number>(
  'systemPhotos/fetchBySystem',
  async (systemId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get(`/system-photos/system/${systemId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch system photos'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch single photo by ID
export const fetchPhotoById = createAsyncThunk<SystemPhoto, number>(
  'systemPhotos/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get(`/system-photos/${id}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch photo'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Upload photo
export const uploadSystemPhoto = createAsyncThunk<
  SystemPhoto,
  { systemId: number; photo: File; description?: string }
>(
  'systemPhotos/upload',
  async ({ systemId, photo, description }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('photo', photo);
      if (description) {
        formData.append('description', description);
      }

      const response = await axiosInstance.post(
        `/system-photos/system/${systemId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to upload photo'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update photo description
export const updateSystemPhoto = createAsyncThunk<
  SystemPhoto,
  { id: number; data: UpdateSystemPhotoRequest }
>(
  'systemPhotos/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put(`/system-photos/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update photo'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete photo
export const deleteSystemPhoto = createAsyncThunk<number, number>(
  'systemPhotos/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/system-photos/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete photo'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Slice with reducers
const systemPhotoSlice = createSlice({
  name: 'systemPhotos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPhotos: (state) => {
      state.photos = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch photos by system
    builder
      .addCase(fetchPhotosBySystem.fulfilled, (state, action) => {
        state.photos = action.payload;
        state.error = null;
      })
      .addCase(fetchPhotosBySystem.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch photo by ID
    builder
      .addCase(fetchPhotoById.fulfilled, (state, action) => {
        const index = state.photos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        } else {
          state.photos.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchPhotoById.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Upload photo
    builder
      .addCase(uploadSystemPhoto.fulfilled, (state, action) => {
        state.photos.unshift(action.payload); // Add to beginning (most recent)
        state.error = null;
      })
      .addCase(uploadSystemPhoto.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update photo
    builder
      .addCase(updateSystemPhoto.fulfilled, (state, action) => {
        const index = state.photos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSystemPhoto.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete photo
    builder
      .addCase(deleteSystemPhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter(p => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSystemPhoto.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearPhotos } = systemPhotoSlice.actions;
export default systemPhotoSlice.reducer;
