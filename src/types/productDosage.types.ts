import type { Product } from './product.types';
import type { System } from './system.types';
import type { Unit } from './unit.types';
import type { User } from './auth.types';

// DosageMode ENUM - EXACT MATCH to backend ENUM('manual', 'automatic')
export type DosageMode = 'manual' | 'automatic';

// ProductDosage interface - EXACT MATCH to backend ProductDosage model
export interface ProductDosage {
  id: number;
  productId: number;
  systemId: number | null;
  value: number; // DECIMAL(10, 2)
  unitId: number;
  dosageMode: DosageMode;
  frequency: string | null;
  notes: string | null;
  recordedBy: number;
  recordedAt: string; // DATE as ISO string
  createdAt: string;
  updatedAt: string;
  // Associated objects
  product?: Product;
  system?: System;
  unit?: Unit;
  recorder?: User;
}

export interface CreateProductDosageRequest {
  productId: number;
  systemId?: number | null;
  value: number;
  unitId: number;
  dosageMode: DosageMode;
  frequency?: string;
  notes?: string;
  recordedAt?: string; // Optional, defaults to now
}

export interface UpdateProductDosageRequest {
  productId?: number;
  systemId?: number | null;
  value?: number;
  unitId?: number;
  dosageMode?: DosageMode;
  frequency?: string;
  notes?: string;
  recordedAt?: string;
}

export interface ProductDosageState {
  dosages: ProductDosage[];
  loading: boolean;
  error: string | null;
}
