// Parameter types - EXACT MATCH to backend Parameter model
export interface Parameter {
  id: number;
  name: string;
  description: string | null;
  createdBy: number;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParameterRequest {
  name: string;
  description?: string;
}

export interface UpdateParameterRequest {
  name?: string;
  description?: string;
}

export interface ParameterState {
  parameters: Parameter[];
  loading: boolean;
  error: string | null;
}
