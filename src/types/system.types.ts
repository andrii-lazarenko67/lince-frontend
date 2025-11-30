import type { MonitoringPoint } from './monitoringPoint.types';

export type SystemStatus = 'active' | 'inactive' | 'maintenance';

export interface ChecklistItem {
  id: number;
  systemId: number;
  name: string;
  description: string | null;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
