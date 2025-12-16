import type { MonitoringPoint } from './monitoringPoint.types';
import type { SystemType } from './systemType.types';

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
  systemTypeId: number;
  systemType?: SystemType;
  location: string | null;
  description: string | null;
  status: SystemStatus;
  parentId: number | null;
  parent?: {
    id: number;
    name: string;
    systemTypeId: number;
    systemType?: SystemType;
  };
  children?: Array<{
    id: number;
    name: string;
    systemTypeId: number;
    systemType?: SystemType;
    status: SystemStatus;
    location?: string | null;
  }>;
  monitoringPoints?: MonitoringPoint[];
  checklistItems?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemRequest {
  name: string;
  systemTypeId: number;
  location?: string;
  description?: string;
  status?: SystemStatus;
  parentId?: number | null;
}

export interface UpdateSystemRequest {
  name?: string;
  systemTypeId?: number;
  location?: string;
  description?: string;
  status?: SystemStatus;
  parentId?: number | null;
}

export interface SystemState {
  systems: System[];
  currentSystem: System | null;
  error: string | null;
}
