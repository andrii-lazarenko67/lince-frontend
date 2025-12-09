import type { ChecklistItem } from './system.types';

// Re-export ChecklistItem for convenience
export type { ChecklistItem };

export interface CreateChecklistItemRequest {
  systemId: number;
  name: string;
  description?: string;
  isRequired?: boolean;
  order?: number;
}

export interface UpdateChecklistItemRequest {
  name?: string;
  description?: string;
  isRequired?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
  currentChecklistItem: ChecklistItem | null;
  error: string | null;
}
