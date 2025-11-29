import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { User, LoginRequest, LoginResponse, AuthState } from '../../types';
import { setLoading } from './uiSlice';

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials);
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(setLoading(false));
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: User }>('/auth/me');
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to get user');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: { currentPassword: string; newPassword: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.put('/auth/change-password', data);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
