import { User } from './auth.types';
import { System } from './system.types';

export type ProductUsageType = 'in' | 'out';

export interface ProductUsage {
  id: number;
  productId: number;
  userId: number;
  systemId: number | null;
  type: ProductUsageType;
  quantity: number;
  notes: string | null;
  date: string;
  user?: User;
  system?: System;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  unit: string;
  supplier: string | null;
  currentStock: number;
  minStockAlert: number | null;
  description: string | null;
  isActive: boolean;
  usages?: ProductUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  type: string;
  unit: string;
  supplier?: string;
  currentStock?: number;
  minStockAlert?: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  type?: string;
  unit?: string;
  supplier?: string;
  currentStock?: number;
  minStockAlert?: number;
  description?: string;
  isActive?: boolean;
}

export interface AddProductUsageRequest {
  type: ProductUsageType;
  quantity: number;
  systemId?: number;
  notes?: string;
  date?: string;
}

export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  usages: ProductUsage[];
  error: string | null;
}
