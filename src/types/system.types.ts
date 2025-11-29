import { MonitoringPoint } from './monitoringPoint.types';
import { ChecklistItem } from './inspection.types';

export type SystemStatus = 'active' | 'inactive' | 'maintenance';

export interface System {
  id: number;
  name: string;
  type: string;
  location: string | null;
  description: string | null;
  status: SystemStatus;
  monitoringPoints?: MonitoringPoint[];
  checklistItems?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemRequest {
  name: string;
  type: string;
  location?: string;
  description?: string;
  status?: SystemStatus;
}

export interface UpdateSystemRequest {
  name?: string;
  type?: string;
  location?: string;
  description?: string;
  status?: SystemStatus;
}

export interface SystemState {
  systems: System[];
  currentSystem: System | null;
  error: string | null;
}
