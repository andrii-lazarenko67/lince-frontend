// SystemType entity
export interface SystemType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateSystemTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateSystemTypeRequest {
  name?: string;
  description?: string;
}

// State interface
export interface SystemTypeState {
  systemTypes: SystemType[];
  loading: boolean;
  error: string | null;
}
