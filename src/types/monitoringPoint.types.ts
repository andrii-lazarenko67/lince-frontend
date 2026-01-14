import type { Parameter } from './parameter.types';
import type { Unit } from './unit.types';

// CLEAN DATA STRUCTURE - No duplication, only foreign keys
export interface MonitoringPoint {
  id: number;
  systemId: number;
  name: string;
  parameterId: number; // Foreign key to Parameters - REQUIRED
  unitId: number | null; // Foreign key to Units - OPTIONAL
  parameterObj?: Parameter; // Associated Parameter object
  unitObj?: Unit; // Associated Unit object
  minValue: number | null;
  maxValue: number | null;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitoringPointRequest {
  systemId: number;
  name: string;
  parameterId: number; // REQUIRED
  unitId?: number | null; // OPTIONAL
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
}

export interface UpdateMonitoringPointRequest {
  name?: string;
  parameterId?: number;
  unitId?: number | null;
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
}

export interface MonitoringPointState {
  monitoringPoints: MonitoringPoint[];
  currentMonitoringPoint: MonitoringPoint | null;
  monitoringPointsForChart: MonitoringPointForChart[];
  error: string | null;
}

// Simplified monitoring point for chart configuration
export interface MonitoringPointForChart {
  id: number;
  name: string;
  systemId: number;
  systemName: string;
  parameterName: string;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  hasSpecLimits: boolean;
}
