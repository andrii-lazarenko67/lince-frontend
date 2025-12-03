// Unit types - EXACT MATCH to backend Unit model
export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  category: string | null;
  createdBy: number;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  name: string;
  abbreviation: string;
  category?: string;
}

export interface UpdateUnitRequest {
  name?: string;
  abbreviation?: string;
  category?: string;
}

export interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}
