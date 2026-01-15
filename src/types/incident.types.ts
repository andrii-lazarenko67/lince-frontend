import type { User } from './auth.types';
import type { System } from './system.types';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface IncidentPhoto {
  id: number;
  incidentId: number;
  url: string;
  publicId: string | null;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentComment {
  id: number;
  incidentId: number;
  userId: number;
  content: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: number;
  userId: number;
  systemId: number;
  stageId: number | null;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedTo: number | null;
  resolvedAt: string | null;
  resolution: string | null;
  reporter?: User;
  assignee?: User;
  system?: System;
  stage?: System;
  photos?: IncidentPhoto[];
  comments?: IncidentComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  systemId: number;
  stageId?: number | null;
  title: string;
  description: string;
  priority?: IncidentPriority;
  sendNotification?: boolean;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  priority?: IncidentPriority;
  status?: IncidentStatus;
}

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface FetchIncidentsParams {
  page?: number;
  limit?: number;
  systemId?: number;
  stageId?: number;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

export interface IncidentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  assignableUsers: AssignableUser[];
  pagination: IncidentPagination;
  loading: boolean;
  error: string | null;
}
