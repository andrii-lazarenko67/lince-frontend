import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <MuiTable sx={{ borderCollapse: 'collapse' }}>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              className={column.className}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                borderBottom: 2,
                borderColor: 'primary.dark'
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
            <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: 'none' }}>
              <Typography color="text.secondary" variant="body2">{emptyMessage}</Typography>
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
                '&:last-child td': {
                  borderBottom: 'none'
                },
                '&:nth-of-type(odd)': {
                  bgcolor: 'action.hover'
                },
                '&:hover': onRowClick ? {
                  bgcolor: 'action.selected'
                } : undefined
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
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
  );
}

export default Table;
