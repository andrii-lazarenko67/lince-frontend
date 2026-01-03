import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  Client,
  ClientState,
  ClientStats,
  CreateClientRequest,
  UpdateClientRequest,
  UserClient,
  AddUserAccessRequest,
  UpdateUserAccessRequest
} from '../../types';
import type { User } from '../../types/auth.types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  currentClientStats: null,
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

export const fetchClientStats = createAsyncThunk(
  'clients/fetchStats',
  async (clientId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: ClientStats }>(
        `/clients/${clientId}/stats`
      );
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch client stats'));
    }
  }
);

// User access management actions
export const fetchClientUsers = createAsyncThunk(
  'clients/fetchUsers',
  async (clientId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: UserClient[] }>(
        `/clients/${clientId}/users`
      );
      return { clientId, users: response.data.data };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch client users'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchAvailableUsers = createAsyncThunk(
  'clients/fetchAvailableUsers',
  async (clientId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: User[] }>(
        `/clients/${clientId}/users/available`
      );
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch available users'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const addUserAccess = createAsyncThunk(
  'clients/addUserAccess',
  async (
    { clientId, data }: { clientId: number; data: AddUserAccessRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: UserClient }>(
        `/clients/${clientId}/users`,
        data
      );
      return { clientId, userClient: response.data.data };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add user access'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateUserAccess = createAsyncThunk(
  'clients/updateUserAccess',
  async (
    { clientId, userId, data }: { clientId: number; userId: number; data: UpdateUserAccessRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: UserClient }>(
        `/clients/${clientId}/users/${userId}`,
        data
      );
      return { clientId, userClient: response.data.data };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update user access'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const removeUserAccess = createAsyncThunk(
  'clients/removeUserAccess',
  async (
    { clientId, userId }: { clientId: number; userId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/clients/${clientId}/users/${userId}`);
      return { clientId, userId };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to remove user access'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Logo management actions
export const uploadClientLogo = createAsyncThunk(
  'clients/uploadLogo',
  async ({ clientId, file }: { clientId: number; file: File }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('logo', file);
      const response = await axiosInstance.post<{ success: boolean; data: { logo: string } }>(
        `/clients/${clientId}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return { clientId, logo: response.data.data.logo };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to upload logo'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteClientLogo = createAsyncThunk(
  'clients/deleteLogo',
  async (clientId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/clients/${clientId}/logo`);
      return clientId;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete logo'));
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
      state.currentClientStats = null;
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
      })
      // Fetch client stats
      .addCase(fetchClientStats.fulfilled, (state, action) => {
        state.currentClientStats = action.payload;
      })
      // Fetch client users
      .addCase(fetchClientUsers.fulfilled, (state, action) => {
        if (state.currentClient?.id === action.payload.clientId) {
          state.currentClient.userClients = action.payload.users;
        }
      })
      // Add user access
      .addCase(addUserAccess.fulfilled, (state, action) => {
        if (state.currentClient?.id === action.payload.clientId) {
          if (!state.currentClient.userClients) {
            state.currentClient.userClients = [];
          }
          state.currentClient.userClients.push(action.payload.userClient);
        }
      })
      // Update user access
      .addCase(updateUserAccess.fulfilled, (state, action) => {
        if (state.currentClient?.id === action.payload.clientId && state.currentClient.userClients) {
          const index = state.currentClient.userClients.findIndex(
            uc => uc.userId === action.payload.userClient.userId
          );
          if (index !== -1) {
            state.currentClient.userClients[index] = action.payload.userClient;
          }
        }
      })
      // Remove user access
      .addCase(removeUserAccess.fulfilled, (state, action) => {
        if (state.currentClient?.id === action.payload.clientId && state.currentClient.userClients) {
          state.currentClient.userClients = state.currentClient.userClients.filter(
            uc => uc.userId !== action.payload.userId
          );
        }
      })
      // Upload logo
      .addCase(uploadClientLogo.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.clientId);
        if (index !== -1) {
          state.clients[index].logo = action.payload.logo;
        }
        if (state.currentClient?.id === action.payload.clientId) {
          state.currentClient.logo = action.payload.logo;
        }
      })
      // Delete logo
      .addCase(deleteClientLogo.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload);
        if (index !== -1) {
          state.clients[index].logo = null;
        }
        if (state.currentClient?.id === action.payload) {
          state.currentClient.logo = null;
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
