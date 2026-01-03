import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  GeneratedReport,
  GeneratedReportState,
  GenerateReportRequest,
  GeneratedReportData
} from '../../types';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: GeneratedReportState = {
  reports: [],
  currentReport: null,
  reportData: null,
  loading: false,
  generating: false,
  error: null
};

export const fetchGeneratedReports = createAsyncThunk(
  'generatedReports/fetchAll',
  async (params: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await axiosInstance.get<{
        success: boolean;
        data: GeneratedReport[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/generated-reports?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch generated reports'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchGeneratedReportById = createAsyncThunk(
  'generatedReports/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: GeneratedReport }>(`/generated-reports/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch generated report'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const generateReport = createAsyncThunk(
  'generatedReports/generate',
  async (data: GenerateReportRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{
        success: boolean;
        data: {
          report: GeneratedReport;
          reportData: GeneratedReportData;
        };
      }>('/generated-reports/generate', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to generate report'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadReportPdf = createAsyncThunk(
  'generatedReports/uploadPdf',
  async ({ id, pdfBlob }: { id: number; pdfBlob: Blob }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'report.pdf');

      const response = await axiosInstance.post<{ success: boolean; data: GeneratedReport }>(
        `/generated-reports/${id}/upload-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to upload PDF'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const downloadReportPdf = createAsyncThunk(
  'generatedReports/downloadPdf',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: { url: string } }>(`/generated-reports/${id}/download`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to get download URL'));
    }
  }
);

export const deleteGeneratedReport = createAsyncThunk(
  'generatedReports/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/generated-reports/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete generated report'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const generatedReportSlice = createSlice({
  name: 'generatedReports',
  initialState,
  reducers: {
    setCurrentReport: (state, action: { payload: GeneratedReport | null }) => {
      state.currentReport = action.payload;
    },
    setReportData: (state, action: { payload: GeneratedReportData | null }) => {
      state.reportData = action.payload;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.reportData = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reports
      .addCase(fetchGeneratedReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeneratedReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.loading = false;
      })
      .addCase(fetchGeneratedReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchGeneratedReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      })
      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.currentReport = action.payload.report;
        state.reportData = action.payload.reportData;
        state.reports.unshift(action.payload.report);
        state.generating = false;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      })
      // Upload PDF
      .addCase(uploadReportPdf.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
      })
      // Delete report
      .addCase(deleteGeneratedReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(r => r.id !== action.payload);
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
          state.reportData = null;
        }
      });
  }
});

export const { setCurrentReport, setReportData, clearCurrentReport, clearError } = generatedReportSlice.actions;
export default generatedReportSlice.reducer;
