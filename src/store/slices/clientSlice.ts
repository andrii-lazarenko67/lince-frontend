import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Client, ClientState, CreateClientRequest, UpdateClientRequest } from '../../types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  selectedClientId: null,
  loading: false,
  error: null
};

export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Client[] }>('/clients');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch clients'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Client }>(`/clients/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch client'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/create',
  async (data: CreateClientRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: Client }>('/clients', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create client'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, data }: { id: number; data: UpdateClientRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Client }>(`/clients/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update client'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/clients/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete client'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient: (state, action: { payload: number | null }) => {
      state.selectedClientId = action.payload;
      // Store in localStorage for persistence
      if (action.payload) {
        localStorage.setItem('selectedClientId', action.payload.toString());
      } else {
        localStorage.removeItem('selectedClientId');
      }
    },
    clearSelectedClient: (state) => {
      state.selectedClientId = null;
      localStorage.removeItem('selectedClientId');
    },
    loadSelectedClientFromStorage: (state) => {
      const stored = localStorage.getItem('selectedClientId');
      if (stored) {
        state.selectedClientId = parseInt(stored, 10);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single client
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.currentClient = action.payload;
        state.loading = false;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create client
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload);
      })
      // Update client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?.id === action.payload.id) {
          state.currentClient = action.payload;
        }
      })
      // Delete client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c.id !== action.payload);
        if (state.selectedClientId === action.payload) {
          state.selectedClientId = null;
          localStorage.removeItem('selectedClientId');
        }
      });
  }
});

export const {
  setSelectedClient,
  clearSelectedClient,
  loadSelectedClientFromStorage,
  clearError,
  clearCurrentClient
} = clientSlice.actions;

export default clientSlice.reducer;
