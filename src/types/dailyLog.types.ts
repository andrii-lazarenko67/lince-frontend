import { User } from './auth.types';
import { System } from './system.types';
import { MonitoringPoint } from './monitoringPoint.types';

export interface DailyLogEntry {
  id: number;
  dailyLogId: number;
  monitoringPointId: number;
  value: number;
  isOutOfRange: boolean;
  monitoringPoint?: MonitoringPoint;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: number;
  userId: number;
  systemId: number;
  date: string;
  notes: string | null;
  user?: User;
  system?: System;
  entries?: DailyLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyLogRequest {
  systemId: number;
  date: string;
  notes?: string;
  entries: {
    monitoringPointId: number;
    value: number;
  }[];
}

export interface UpdateDailyLogRequest {
  notes?: string;
  entries?: {
    monitoringPointId: number;
    value: number;
  }[];
}

export interface DailyLogState {
  dailyLogs: DailyLog[];
  currentDailyLog: DailyLog | null;
  error: string | null;
}
