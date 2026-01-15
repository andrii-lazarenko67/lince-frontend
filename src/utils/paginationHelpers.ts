import type { PaginationMeta } from '../types/pagination.types';

/**
 * Build URL query params from pagination state and additional filters
 */
export function buildPaginationParams(
  page: number,
  limit: number,
  additionalParams?: Record<string, string | number | boolean | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  return params;
}

/**
 * Handle pagination update after creating an item.
 * Increments total and recalculates totalPages.
 */
export function updatePaginationAfterCreate(
  pagination: PaginationMeta
): PaginationMeta {
  const newTotal = pagination.total + 1;
  return {
    ...pagination,
    total: newTotal,
    totalPages: Math.ceil(newTotal / pagination.limit)
  };
}

/**
 * Handle pagination update after deleting an item.
 * Decrements total and recalculates totalPages.
 */
export function updatePaginationAfterDelete(
  pagination: PaginationMeta
): PaginationMeta {
  const newTotal = Math.max(0, pagination.total - 1);
  return {
    ...pagination,
    total: newTotal,
    totalPages: Math.ceil(newTotal / pagination.limit) || 0
  };
}

/**
 * Create default pagination state
 */
export function createDefaultPagination(): PaginationMeta {
  return {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  };
}
