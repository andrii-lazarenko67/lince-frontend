import type { User } from './auth.types';
import type { System, ChecklistItem } from './system.types';

export type { ChecklistItem } from './system.types';

export type InspectionItemStatus = 'C' | 'NC' | 'NA' | 'NV';
export type InspectionStatus = 'pending' | 'completed' | 'viewed';

export interface InspectionItem {
  id: number;
  inspectionId: number;
  checklistItemId: number;
  status: InspectionItemStatus;
  comment: string | null;
  checklistItem?: ChecklistItem;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPhoto {
  id: number;
  inspectionId: number;
  url: string;
  publicId: string | null;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: number;
  userId: number;
  systemId: number;
  stageId: number | null;
  date: string;
  status: InspectionStatus;
  conclusion: string | null;
  managerNotes: string | null;
  viewedBy: number | null;
  viewedAt: string | null;
  user?: User;
  system?: System;
  stage?: System;
  viewedByUser?: User;
  items?: InspectionItem[];
  photos?: InspectionPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionRequest {
  systemId: number;
  stageId?: number;
  date?: string;
  conclusion?: string;
  items: {
    checklistItemId: number;
    status: InspectionItemStatus;
    comment?: string;
  }[];
  sendNotification?: boolean;
}

export interface UpdateInspectionRequest {
  conclusion?: string;
  status?: InspectionStatus;
  items?: {
    checklistItemId: number;
    status: InspectionItemStatus;
    comment?: string;
  }[];
}

export interface FetchInspectionsParams {
  page?: number;
  limit?: number;
  systemId?: number;
  stageId?: number;
  userId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface InspectionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InspectionState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  checklistItems: ChecklistItem[];
  pagination: InspectionPagination;
  loading: boolean;
  error: string | null;
}
