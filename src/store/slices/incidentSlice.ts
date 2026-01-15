import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Incident, IncidentState, IncidentComment, CreateIncidentRequest, UpdateIncidentRequest, AssignableUser, FetchIncidentsParams, IncidentPagination } from '../../types';
import { setLoading } from './uiSlice';
import { fetchUnreadCount } from './notificationSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface FetchIncidentsResponse {
  success: boolean;
  data: Incident[];
  pagination: IncidentPagination;
}

const initialState: IncidentState = {
  incidents: [],
  currentIncident: null,
  assignableUsers: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchAll',
  async (params: FetchIncidentsParams = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<FetchIncidentsResponse>('/incidents', { params });
      return {
        incidents: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch incidents'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch incident'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/create',
  async (data: CreateIncidentRequest & { photos?: File[]; sendNotification?: boolean }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('systemId', data.systemId.toString());
      if (data.stageId) formData.append('stageId', data.stageId.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.priority) formData.append('priority', data.priority);
      // Send notification based on user's choice (checkbox)
      if (data.sendNotification) {
        formData.append('sendNotification', 'true');
      }

      if (data.photos) {
        data.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await axiosInstance.post<{ success: boolean; data: Incident }>('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refresh notification count after creating incident (if notification was sent)
      if (data.sendNotification) {
        dispatch(fetchUnreadCount());
      }

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create incident'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update incident'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update incident status'));
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
      const response = await axiosInstance.put<{ success: boolean; data: Incident }>(`/incidents/${id}/assign`, { assignedTo: assignedToId });

      // Refresh notification count after assigning incident (notification sent to assigned user)
      dispatch(fetchUnreadCount());

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to assign incident'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add comment'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete incident'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add photos'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch users that can be assigned to incidents (for managers and admins)
export const fetchAssignableUsers = createAsyncThunk(
  'incidents/fetchAssignableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: AssignableUser[] }>('/incidents/assignable-users');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch assignable users'));
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
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.incidents = action.payload.incidents;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.currentIncident = action.payload;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.incidents.unshift(action.payload);
        state.pagination = updatePaginationAfterCreate(state.pagination);
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
        state.pagination = updatePaginationAfterDelete(state.pagination);
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
      })
      .addCase(fetchAssignableUsers.fulfilled, (state, action) => {
        state.assignableUsers = action.payload;
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentIncident } = incidentSlice.actions;
export default incidentSlice.reducer;
