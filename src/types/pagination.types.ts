/**
 * Standard pagination metadata returned from API
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
};

/**
 * Rows per page options for MUI TablePagination
 */
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;

/**
 * Generic fetch params interface with pagination
 */
export interface PaginatedFetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Type helper for async thunk return with pagination
 */
export interface PaginatedPayload<T> {
  items: T[];
  pagination: PaginationMeta;
}
