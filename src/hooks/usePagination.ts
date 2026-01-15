import { useState, useCallback, useMemo } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '../types/pagination.types';

export interface UsePaginationOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  onPageChange?: (page: number, rowsPerPage: number) => void;
}

export interface UsePaginationReturn {
  /** Current page (0-indexed for MUI) */
  page: number;
  /** Current rows per page */
  rowsPerPage: number;

  /** API-friendly page (1-indexed for backend) */
  apiPage: number;
  /** API-friendly limit */
  apiLimit: number;

  /** Handler for MUI TablePagination page change */
  handleChangePage: (event: unknown, newPage: number) => void;
  /** Handler for MUI TablePagination rows per page change */
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /** Reset to first page (useful when filters change) */
  resetPage: () => void;

  /** Props object for easy spreading to TablePagination */
  paginationProps: {
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowsPerPageOptions: readonly number[];
  };
}

/**
 * Custom hook for managing pagination state.
 * Handles the conversion between MUI's 0-indexed pages and API's 1-indexed pages.
 *
 * @example
 * const { page, rowsPerPage, apiPage, apiLimit, handleChangePage, handleChangeRowsPerPage, resetPage } = usePagination({
 *   onPageChange: (newPage, newLimit) => {
 *     dispatch(fetchItems({ page: newPage, limit: newLimit }));
 *   }
 * });
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 0,
    initialRowsPerPage = 10,
    onPageChange
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage + 1, rowsPerPage);
  }, [rowsPerPage, onPageChange]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    onPageChange?.(1, newRowsPerPage);
  }, [onPageChange]);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  // API-friendly values (1-indexed)
  const apiPage = page + 1;
  const apiLimit = rowsPerPage;

  const paginationProps = useMemo(() => ({
    page,
    rowsPerPage,
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS as unknown as readonly number[]
  }), [page, rowsPerPage, handleChangePage, handleChangeRowsPerPage]);

  return {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
    paginationProps
  };
}

export default usePagination;
