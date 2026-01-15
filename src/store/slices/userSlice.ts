import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { User, UserState, FetchUsersParams, UserPagination } from '../../types';
import { setLoading } from './uiSlice';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface FetchUsersResponse {
  success: boolean;
  data: User[];
  pagination: UserPagination;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<FetchUsersResponse>('/users', { params });
      return {
        users: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: User }>(`/users/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: Partial<User>, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: User }>('/users', data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create user');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: number; data: Partial<User> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: User }>(`/users/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update user');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/users/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadUserAvatar = createAsyncThunk(
  'users/uploadAvatar',
  async ({ id, file }: { id: number; file: File }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axiosInstance.put<{ success: boolean; data: User }>(`/users/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.pagination = updatePaginationAfterCreate(state.pagination);
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.pagination = updatePaginationAfterDelete(state.pagination);
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
