import { User } from './auth.types';
import { System } from './system.types';

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

export type InspectionItemStatus = 'pass' | 'fail' | 'na';
export type InspectionStatus = 'pending' | 'completed' | 'approved';

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
  date: string;
  status: InspectionStatus;
  conclusion: string | null;
  managerNotes: string | null;
  user?: User;
  system?: System;
  items?: InspectionItem[];
  photos?: InspectionPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionRequest {
  systemId: number;
  date?: string;
  conclusion?: string;
  items: {
    checklistItemId: number;
    status: InspectionItemStatus;
    comment?: string;
  }[];
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

export interface InspectionState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  checklistItems: ChecklistItem[];
  error: string | null;
}
