import type { User } from './auth.types';
import type { System } from './system.types';

export type ProductUsageType = 'in' | 'out';

export interface ProductType {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  typeId: number | null;
  type: ProductType | null;
  unit: string;
  supplier: string | null;
  currentStock: number;
  minStockAlert: number | null;
  description: string | null;
  recommendedDosage: string | null;
  isActive: boolean;
  usages?: ProductUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductUsage {
  id: number;
  productId: number;
  userId: number;
  systemId: number | null;
  type: ProductUsageType;
  quantity: number;
  notes: string | null;
  date: string;
  product?: Product;
  user?: User;
  system?: System;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  typeId?: number;
  unit: string;
  supplier?: string;
  currentStock?: number;
  minStockAlert?: number;
  description?: string;
  recommendedDosage?: string;
}

export interface UpdateProductRequest {
  name?: string;
  typeId?: number;
  unit?: string;
  supplier?: string;
  currentStock?: number;
  minStockAlert?: number;
  description?: string;
  recommendedDosage?: string;
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
  productTypes: ProductType[];
  currentProduct: Product | null;
  usages: ProductUsage[];
  error: string | null;
}
