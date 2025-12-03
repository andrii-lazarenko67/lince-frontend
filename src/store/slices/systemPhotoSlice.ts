import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  SystemPhoto,
  UpdateSystemPhotoRequest,
  SystemPhotoState
} from '../../types/systemPhoto.types';

// Initial state with proper TypeScript types - EXACT MATCH
const initialState: SystemPhotoState = {
  photos: [],
  loading: false,
  error: null
};

// Async thunks - following RULE: all backend calls via Redux middleware

// Fetch photos by system ID
export const fetchPhotosBySystem = createAsyncThunk<SystemPhoto[], number>(
  'systemPhotos/fetchBySystem',
  async (systemId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/system-photos/system/${systemId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system photos');
    }
  }
);

// Fetch single photo by ID
export const fetchPhotoById = createAsyncThunk<SystemPhoto, number>(
  'systemPhotos/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/system-photos/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch photo');
    }
  }
);

// Upload photo
export const uploadSystemPhoto = createAsyncThunk<
  SystemPhoto,
  { systemId: number; photo: File; description?: string }
>(
  'systemPhotos/upload',
  async ({ systemId, photo, description }, { rejectWithValue }) => {
    try {
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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload photo');
    }
  }
);

// Update photo description
export const updateSystemPhoto = createAsyncThunk<
  SystemPhoto,
  { id: number; data: UpdateSystemPhotoRequest }
>(
  'systemPhotos/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/system-photos/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update photo');
    }
  }
);

// Delete photo
export const deleteSystemPhoto = createAsyncThunk<number, number>(
  'systemPhotos/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/system-photos/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete photo');
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
      .addCase(fetchPhotosBySystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotosBySystem.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload;
      })
      .addCase(fetchPhotosBySystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch photo by ID
    builder
      .addCase(fetchPhotoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotoById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.photos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        } else {
          state.photos.push(action.payload);
        }
      })
      .addCase(fetchPhotoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload photo
    builder
      .addCase(uploadSystemPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSystemPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.photos.unshift(action.payload); // Add to beginning (most recent)
      })
      .addCase(uploadSystemPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update photo
    builder
      .addCase(updateSystemPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemPhoto.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.photos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        }
      })
      .addCase(updateSystemPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete photo
    builder
      .addCase(deleteSystemPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSystemPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = state.photos.filter(p => p.id !== action.payload);
      })
      .addCase(deleteSystemPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearPhotos } = systemPhotoSlice.actions;
export default systemPhotoSlice.reducer;
