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

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface DailyLog {
  id: number;
  userId: number;
  systemId: number;
  date: string;
  shift: ShiftType;
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
  shift: ShiftType;
  notes?: string;
  entries: {
    monitoringPointId: number;
    value: number;
    notes?: string;
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
