import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { System, SystemState, CreateSystemRequest, UpdateSystemRequest, FetchSystemsParams, SystemPagination } from '../../types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface FetchSystemsResponse {
  success: boolean;
  data: System[];
  pagination: SystemPagination;
}

const initialState: SystemState = {
  systems: [],
  currentSystem: null,
  pagination: {
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchSystems = createAsyncThunk(
  'systems/fetchAll',
  async (params: FetchSystemsParams = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<FetchSystemsResponse>('/systems', { params });
      return {
        systems: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch systems'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch system'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create system'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update system'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteSystem = createAsyncThunk(
  'systems/delete',
  async ({ id, force }: { id: number; force?: boolean }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const params = force ? { force: 'true' } : {};
      await axiosInstance.delete(`/systems/${id}`, { params });
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; relatedRecords?: { dailyLogs: number; inspections: number; incidents: number } } } };
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to delete system',
        relatedRecords: err.response?.data?.relatedRecords
      });
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
      // fetchSystems
      .addCase(fetchSystems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystems.fulfilled, (state, action) => {
        state.systems = action.payload.systems;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSystems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSystemById.fulfilled, (state, action) => {
        state.currentSystem = action.payload;
        state.error = null;
      })
      .addCase(createSystem.fulfilled, (state, action) => {
        const newSystem = action.payload;
        state.systems.push(newSystem);
        state.pagination = updatePaginationAfterCreate(state.pagination);

        // If this system has a parent, update the parent's children array
        if (newSystem.parentId) {
          const parentIndex = state.systems.findIndex(s => s.id === newSystem.parentId);
          if (parentIndex !== -1) {
            const parent = state.systems[parentIndex];
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push({
              id: newSystem.id,
              name: newSystem.name,
              systemTypeId: newSystem.systemTypeId,
              systemType: newSystem.systemType,
              status: newSystem.status
            });
          }
        }
        state.error = null;
      })
      .addCase(updateSystem.fulfilled, (state, action) => {
        const updatedSystem = action.payload;
        const index = state.systems.findIndex(s => s.id === updatedSystem.id);

        if (index !== -1) {
          const oldSystem = state.systems[index];

          // If parentId changed, update both old and new parent's children arrays
          if (oldSystem.parentId !== updatedSystem.parentId) {
            // Remove from old parent's children
            if (oldSystem.parentId) {
              const oldParentIndex = state.systems.findIndex(s => s.id === oldSystem.parentId);
              if (oldParentIndex !== -1 && state.systems[oldParentIndex].children) {
                state.systems[oldParentIndex].children = state.systems[oldParentIndex].children!.filter(
                  c => c.id !== updatedSystem.id
                );
              }
            }

            // Add to new parent's children
            if (updatedSystem.parentId) {
              const newParentIndex = state.systems.findIndex(s => s.id === updatedSystem.parentId);
              if (newParentIndex !== -1) {
                if (!state.systems[newParentIndex].children) {
                  state.systems[newParentIndex].children = [];
                }
                state.systems[newParentIndex].children!.push({
                  id: updatedSystem.id,
                  name: updatedSystem.name,
                  systemTypeId: updatedSystem.systemTypeId,
                  systemType: updatedSystem.systemType,
                  status: updatedSystem.status
                });
              }
            }
          } else if (updatedSystem.parentId) {
            // Same parent, but update child info in parent's children array
            const parentIndex = state.systems.findIndex(s => s.id === updatedSystem.parentId);
            if (parentIndex !== -1 && state.systems[parentIndex].children) {
              const childIndex = state.systems[parentIndex].children!.findIndex(c => c.id === updatedSystem.id);
              if (childIndex !== -1) {
                state.systems[parentIndex].children![childIndex] = {
                  id: updatedSystem.id,
                  name: updatedSystem.name,
                  systemTypeId: updatedSystem.systemTypeId,
                  systemType: updatedSystem.systemType,
                  status: updatedSystem.status
                };
              }
            }
          }

          state.systems[index] = updatedSystem;
        }

        if (state.currentSystem?.id === updatedSystem.id) {
          state.currentSystem = updatedSystem;
        }
        state.error = null;
      })
      .addCase(deleteSystem.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const deletedSystem = state.systems.find(s => s.id === deletedId);

        // Remove from parent's children array if it has a parent
        if (deletedSystem?.parentId) {
          const parentIndex = state.systems.findIndex(s => s.id === deletedSystem.parentId);
          if (parentIndex !== -1 && state.systems[parentIndex].children) {
            state.systems[parentIndex].children = state.systems[parentIndex].children!.filter(
              c => c.id !== deletedId
            );
          }
        }

        // Remove the system from the systems array
        state.systems = state.systems.filter(s => s.id !== deletedId);
        state.pagination = updatePaginationAfterDelete(state.pagination);
        state.error = null;
      })
      .addCase(deleteSystem.rejected, (state, action) => {
        const payload = action.payload as { message: string; relatedRecords?: { dailyLogs: number; inspections: number; incidents: number } } | string;
        state.error = typeof payload === 'string' ? payload : payload.message;
      });
  }
});

export const { clearError, clearCurrentSystem } = systemSlice.actions;
export default systemSlice.reducer;
