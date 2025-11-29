import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { setLoading } from './uiSlice';

interface ReportData {
  type: string;
  period: {
    startDate: string;
    endDate: string;
  };
  systems: Array<{
    id: number;
    name: string;
    data: unknown;
  }>;
  summary: {
    totalReadings: number;
    outOfRangeCount: number;
    inspectionsCount: number;
    incidentsCount: number;
  };
  generatedAt: string;
}

interface ReportState {
  currentReport: ReportData | null;
  isGenerating: boolean;
  error: string | null;
}

const initialState: ReportState = {
  currentReport: null,
  isGenerating: false,
  error: null
};

export const generateReport = createAsyncThunk(
  'reports/generate',
  async (params: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    systemIds?: number[];
    monitoringPointIds?: number[];
    startDate?: string;
    endDate?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: ReportData }>('/reports/generate', params);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to generate report');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const exportReportPDF = createAsyncThunk(
  'reports/exportPDF',
  async (params: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    systemIds?: number[];
    monitoringPointIds?: number[];
    startDate?: string;
    endDate?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post('/reports/export/pdf', params, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${params.type}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to export PDF');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const exportReportCSV = createAsyncThunk(
  'reports/exportCSV',
  async (params: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    systemIds?: number[];
    monitoringPointIds?: number[];
    startDate?: string;
    endDate?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post('/reports/export/csv', params, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${params.type}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to export CSV');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReport: (state) => {
      state.currentReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.currentReport = action.payload;
        state.isGenerating = false;
        state.error = null;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(exportReportPDF.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(exportReportCSV.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearReport } = reportSlice.actions;
export default reportSlice.reducer;
