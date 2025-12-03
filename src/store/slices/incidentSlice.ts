import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Incident, IncidentState, IncidentComment, CreateIncidentRequest, UpdateIncidentRequest } from '../../types';
import { setLoading } from './uiSlice';

const initialState: IncidentState = {
  incidents: [],
  currentIncident: null,
  error: null
};

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchAll',
  async (params: { systemId?: number; status?: string; priority?: string; startDate?: string; endDate?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Incident[] }>('/incidents', { params });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch incidents');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  'incidents/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Incident }>(`/incidents/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch incident');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/create',
  async (data: CreateIncidentRequest & { photos?: File[] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('systemId', data.systemId.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.priority) formData.append('priority', data.priority);

      if (data.photos) {
        data.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await axiosInstance.post<{ success: boolean; data: Incident }>('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create incident');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/update',
  async ({ id, data }: { id: number; data: UpdateIncidentRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Incident }>(`/incidents/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update incident');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  'incidents/updateStatus',
  async ({ id, status, resolution }: { id: number; status: string; resolution?: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Incident }>(`/incidents/${id}/status`, { status, resolution });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update incident status');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const assignIncident = createAsyncThunk(
  'incidents/assign',
  async ({ id, assignedToId }: { id: number; assignedToId: number }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Incident }>(`/incidents/${id}/assign`, { assignedToId });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to assign incident');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const addIncidentComment = createAsyncThunk(
  'incidents/addComment',
  async ({ id, content }: { id: number; content: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: IncidentComment }>(`/incidents/${id}/comments`, { content });
      return { incidentId: id, comment: response.data.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteIncident = createAsyncThunk(
  'incidents/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/incidents/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete incident');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const addIncidentPhotos = createAsyncThunk(
  'incidents/addPhotos',
  async ({ id, photos }: { id: number; photos: File[] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await axiosInstance.post<{ success: boolean; data: Incident }>(
        `/incidents/${id}/photos`,
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

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentIncident: (state) => {
      state.currentIncident = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.incidents = action.payload;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.currentIncident = action.payload;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.incidents.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        const index = state.incidents.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
        state.error = null;
      })
      .addCase(assignIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
        state.error = null;
      })
      .addCase(addIncidentComment.fulfilled, (state, action) => {
        if (state.currentIncident?.id === action.payload.incidentId) {
          state.currentIncident.comments = [
            ...(state.currentIncident.comments || []),
            action.payload.comment
          ];
        }
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.incidents = state.incidents.filter(i => i.id !== action.payload);
        state.error = null;
      })
      .addCase(addIncidentPhotos.fulfilled, (state, action) => {
        if (state.currentIncident && state.currentIncident.id === action.payload.id) {
          state.currentIncident = { ...state.currentIncident, photos: action.payload.photos };
        }
        const index = state.incidents.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = { ...state.incidents[index], photos: action.payload.photos };
        }
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentIncident } = incidentSlice.actions;
export default incidentSlice.reducer;
