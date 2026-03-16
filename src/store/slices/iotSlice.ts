import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { setLoading } from './uiSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';

export interface IoTMonitoringPoint {
  id: number;
  name: string;
  minValue?: number | null;
  maxValue?: number | null;
  parameterObj?: { name: string };
  unitObj?: { abbreviation: string };
}

export interface IoTDevice {
  id: number;
  clientId: number;
  systemId: number;
  monitoringPointId: number;
  name: string;
  description?: string;
  token: string;
  status: 'active' | 'inactive';
  lastSeen?: string | null;
  lastValue?: number | null;
  isOutOfRange?: boolean | null;
  system?: { id: number; name: string };
  monitoringPoint?: IoTMonitoringPoint;
}

export interface IoTReading {
  id: number;
  deviceId: number;
  value: number;
  isOutOfRange: boolean;
  recordedAt: string;
}

interface IoTState {
  devices: IoTDevice[];
  readings: IoTReading[];
  loading: boolean;
  error: string | null;
}

const initialState: IoTState = {
  devices: [],
  readings: [],
  loading: false,
  error: null
};

export const fetchIoTDevices = createAsyncThunk(
  'iot/fetchDevices',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: IoTDevice[] }>('/iot/devices');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch IoT devices'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createIoTDevice = createAsyncThunk(
  'iot/createDevice',
  async (
    data: { name: string; description?: string; systemId: number; monitoringPointId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: IoTDevice }>('/iot/devices', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create IoT device'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteIoTDevice = createAsyncThunk(
  'iot/deleteDevice',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/iot/devices/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete IoT device'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateIoTDeviceStatus = createAsyncThunk(
  'iot/updateStatus',
  async ({ id, status }: { id: number; status: 'active' | 'inactive' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.patch<{ success: boolean; data: IoTDevice }>(`/iot/devices/${id}/status`, { status });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update device status'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchIoTReadings = createAsyncThunk(
  'iot/fetchReadings',
  async ({ deviceId, hours = 24 }: { deviceId: number; hours?: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: IoTReading[] }>('/iot/readings', {
        params: { deviceId, hours }
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch IoT readings'));
    }
  }
);

export const importIoTToLog = createAsyncThunk(
  'iot/importToLog',
  async ({ deviceId, date }: { deviceId: number; date: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post('/iot/import-to-log', { deviceId, date });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to import to log'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const iotSlice = createSlice({
  name: 'iot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReadings: (state) => {
      state.readings = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIoTDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIoTDevices.fulfilled, (state, action) => {
        state.devices = action.payload;
        state.loading = false;
      })
      .addCase(fetchIoTDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createIoTDevice.fulfilled, (state, action) => {
        state.devices.unshift(action.payload);
      })
      .addCase(deleteIoTDevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d.id !== action.payload);
      })
      .addCase(updateIoTDeviceStatus.fulfilled, (state, action) => {
        const idx = state.devices.findIndex(d => d.id === action.payload.id);
        if (idx !== -1) state.devices[idx] = { ...state.devices[idx], status: action.payload.status };
      })
      .addCase(fetchIoTReadings.fulfilled, (state, action) => {
        state.readings = action.payload;
      });
  }
});

export const { clearError, clearReadings } = iotSlice.actions;
export default iotSlice.reducer;
