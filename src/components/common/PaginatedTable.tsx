import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import type { PaginationMeta } from '../../types/pagination.types';
import { ROWS_PER_PAGE_OPTIONS } from '../../types/pagination.types';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface PaginatedTableProps<T> {
  // Table props
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;

  // Pagination props
  pagination: PaginationMeta;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Optional: disable pagination entirely
  disablePagination?: boolean;
}

function PaginatedTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage,
  loading = false,
  pagination,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  disablePagination = false
}: PaginatedTableProps<T>) {
  const { t } = useTranslation();
  const defaultEmptyMessage = emptyMessage || t('common.noDataAvailable');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-track': { bgcolor: 'grey.100' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: 4,
            '&:hover': { bgcolor: 'grey.500' }
          }
        }}
      >
        <MuiTable sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.className}
                  align={column.align || 'left'}
                  sx={{
                    bgcolor: '#15c',
                    color: 'primary.contrastText',
                    fontWeight: 700,
                    borderBottom: 2,
                    borderColor: 'primary.dark',
                    whiteSpace: 'nowrap',
                    px: 2,
                    py: 1.5
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, borderBottom: 'none' }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {defaultEmptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  hover={!!onRowClick}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td': { borderBottom: 'none' },
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': onRowClick ? { bgcolor: 'action.selected' } : undefined
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.className}
                      align={column.align || 'left'}
                      sx={{ px: 2, py: 1.5 }}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as Record<string, unknown>)[column.key]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {!disablePagination && (data.length > 0 || pagination.total > 0) && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[...ROWS_PER_PAGE_OPTIONS]}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      )}
    </>
  );
}

export default PaginatedTable;
