import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  ReportTemplate,
  ReportTemplateState,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest
} from '../../types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: ReportTemplateState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null
};

export const fetchReportTemplates = createAsyncThunk(
  'reportTemplates/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ReportTemplate[] }>('/report-templates');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch report templates'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchReportTemplateById = createAsyncThunk(
  'reportTemplates/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ReportTemplate }>(`/report-templates/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch report template'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchDefaultTemplate = createAsyncThunk(
  'reportTemplates/fetchDefault',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: ReportTemplate | null }>('/report-templates/default');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch default template'));
    }
  }
);

export const createReportTemplate = createAsyncThunk(
  'reportTemplates/create',
  async (data: CreateReportTemplateRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: ReportTemplate }>('/report-templates', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create report template'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateReportTemplate = createAsyncThunk(
  'reportTemplates/update',
  async ({ id, data }: { id: number; data: UpdateReportTemplateRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: ReportTemplate }>(`/report-templates/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update report template'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteReportTemplate = createAsyncThunk(
  'reportTemplates/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/report-templates/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete report template'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const setDefaultTemplate = createAsyncThunk(
  'reportTemplates/setDefault',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: ReportTemplate }>(`/report-templates/${id}/set-default`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to set default template'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const reportTemplateSlice = createSlice({
  name: 'reportTemplates',
  initialState,
  reducers: {
    setCurrentTemplate: (state, action: { payload: ReportTemplate | null }) => {
      state.currentTemplate = action.payload;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all templates
      .addCase(fetchReportTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
        state.loading = false;
      })
      .addCase(fetchReportTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchReportTemplateById.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      })
      // Fetch default
      .addCase(fetchDefaultTemplate.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentTemplate = action.payload;
        }
      })
      // Create template
      .addCase(createReportTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
        // If new template is default, update others
        if (action.payload.isDefault) {
          state.templates = state.templates.map(t =>
            t.id !== action.payload.id ? { ...t, isDefault: false } : t
          );
        }
      })
      // Update template
      .addCase(updateReportTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
        // If updated template is now default, update others
        if (action.payload.isDefault) {
          state.templates = state.templates.map(t =>
            t.id !== action.payload.id ? { ...t, isDefault: false } : t
          );
        }
      })
      // Delete template
      .addCase(deleteReportTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t.id !== action.payload);
        if (state.currentTemplate?.id === action.payload) {
          state.currentTemplate = null;
        }
      })
      // Set default
      .addCase(setDefaultTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.map(t => ({
          ...t,
          isDefault: t.id === action.payload.id
        }));
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
      });
  }
});

export const { setCurrentTemplate, clearCurrentTemplate, clearError } = reportTemplateSlice.actions;
export default reportTemplateSlice.reducer;
