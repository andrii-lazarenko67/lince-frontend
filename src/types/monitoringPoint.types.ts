import type { Parameter } from './parameter.types';
import type { Unit } from './unit.types';

// CLEAN DATA STRUCTURE - No duplication, only foreign keys
export interface MonitoringPoint {
  id: number;
  systemId: number;
  name: string;
  parameterId: number; // Foreign key to Parameters - REQUIRED
  unitId: number; // Foreign key to Units - REQUIRED
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
  unitId: number; // REQUIRED
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
}

export interface UpdateMonitoringPointRequest {
  name?: string;
  parameterId?: number;
  unitId?: number;
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
}

export interface MonitoringPointState {
  monitoringPoints: MonitoringPoint[];
  currentMonitoringPoint: MonitoringPoint | null;
  error: string | null;
}
