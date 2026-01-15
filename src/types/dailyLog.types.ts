import type { User } from './auth.types';
import type { System } from './system.types';
import type { MonitoringPoint } from './monitoringPoint.types';

export interface DailyLogEntry {
  id: number;
  dailyLogId: number;
  monitoringPointId: number;
  value: number;
  isOutOfRange: boolean;
  notes: string | null;
  monitoringPoint?: MonitoringPoint;
  createdAt: string;
  updatedAt: string;
}

export type RecordType = 'field' | 'laboratory';
export type TimeMode = 'auto' | 'manual';

export interface DailyLog {
  id: number;
  userId: number;
  systemId: number;
  stageId: number | null;
  recordType: RecordType;
  date: string;
  period: string | null;
  time: string | null;
  timeMode: TimeMode | null;
  laboratory: string | null;
  collectionDate: string | null;
  collectionTime: string | null;
  collectionTimeMode: TimeMode | null;
  notes: string | null;
  user?: User;
  system?: System;
  stage?: System;
  entries?: DailyLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyLogRequest {
  systemId: number;
  stageId?: number | null;
  recordType: RecordType;
  date: string;
  period?: string;
  time?: string;
  timeMode?: TimeMode;
  laboratory?: string;
  collectionDate?: string;
  collectionTime?: string;
  collectionTimeMode?: TimeMode;
  notes?: string;
  entries: {
    monitoringPointId: number;
    value: number;
    notes?: string;
  }[];
  sendNotification?: boolean;
}

export interface UpdateDailyLogRequest {
  notes?: string;
  entries?: {
    monitoringPointId: number;
    value: number;
  }[];
}

export interface FetchDailyLogsParams {
  page?: number;
  limit?: number;
  systemId?: number;
  stageId?: number;
  userId?: number;
  recordType?: 'field' | 'laboratory';
  startDate?: string;
  endDate?: string;
}

export interface DailyLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DailyLogState {
  dailyLogs: DailyLog[];
  currentDailyLog: DailyLog | null;
  pagination: DailyLogPagination;
  loading: boolean;
  error: string | null;
}
