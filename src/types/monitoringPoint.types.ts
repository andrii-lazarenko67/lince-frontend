export interface MonitoringPoint {
  id: number;
  systemId: number;
  name: string;
  parameter: string;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  alertEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitoringPointRequest {
  systemId: number;
  name: string;
  parameter: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
}

export interface UpdateMonitoringPointRequest {
  name?: string;
  parameter?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  alertEnabled?: boolean;
  isActive?: boolean;
}

export interface MonitoringPointState {
  monitoringPoints: MonitoringPoint[];
  currentMonitoringPoint: MonitoringPoint | null;
  error: string | null;
}
