import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import systemSlice from './slices/systemSlice';
import monitoringPointSlice from './slices/monitoringPointSlice';
import dailyLogSlice from './slices/dailyLogSlice';
import inspectionSlice from './slices/inspectionSlice';
import incidentSlice from './slices/incidentSlice';
import productSlice from './slices/productSlice';
import librarySlice from './slices/librarySlice';
import notificationSlice from './slices/notificationSlice';
import dashboardSlice from './slices/dashboardSlice';
import reportSlice from './slices/reportSlice';
import parameterSlice from './slices/parameterSlice';
import unitSlice from './slices/unitSlice';
import productDosageSlice from './slices/productDosageSlice';
import systemPhotoSlice from './slices/systemPhotoSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    users: userSlice,
    systems: systemSlice,
    monitoringPoints: monitoringPointSlice,
    dailyLogs: dailyLogSlice,
    inspections: inspectionSlice,
    incidents: incidentSlice,
    products: productSlice,
    library: librarySlice,
    notifications: notificationSlice,
    dashboard: dashboardSlice,
    reports: reportSlice,
    parameters: parameterSlice,
    units: unitSlice,
    productDosages: productDosageSlice,
    systemPhotos: systemPhotoSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
