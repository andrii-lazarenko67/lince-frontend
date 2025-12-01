/**
 * CSV Export Utility
 * Generates CSV files from data
 */

export interface CsvExportConfig {
  title?: string;
  filename: string;
  metadata?: Array<{ label: string; value: string }>;
}

export interface CsvSection {
  title: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
}

/**
 * Escapes a value for CSV format
 */
function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Generates CSV content from sections
 */
export function generateCsvContent(
  config: CsvExportConfig,
  sections: CsvSection[]
): string {
  let csv = '';

  // Add title if provided
  if (config.title) {
    csv += `${config.title}\n`;
  }

  // Add metadata if provided
  if (config.metadata && config.metadata.length > 0) {
    config.metadata.forEach(item => {
      csv += `${item.label},${escapeCsvValue(item.value)}\n`;
    });
    csv += '\n';
  }

  // Add sections
  sections.forEach((section, index) => {
    if (index > 0) csv += '\n';

    csv += `${section.title}\n`;
    csv += section.headers.map(h => escapeCsvValue(h)).join(',') + '\n';

    section.rows.forEach(row => {
      csv += row.map(cell => escapeCsvValue(cell)).join(',') + '\n';
    });
  });

  return csv;
}

/**
 * Downloads the CSV content as a file
 */
export function downloadCsv(content: string, filename: string): void {
  // Add BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Helper function to export data as CSV with a single call
 */
export function exportToCsv(
  config: CsvExportConfig,
  sections: CsvSection[]
): void {
  const csv = generateCsvContent(config, sections);
  downloadCsv(csv, config.filename);
}

/**
 * Simple export for a single table (no sections)
 */
export function exportSimpleCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
  filename: string
): void {
  let csv = headers.map(h => escapeCsvValue(h)).join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => escapeCsvValue(cell)).join(',') + '\n';
  });
  downloadCsv(csv, filename);
}

/**
 * Format date for CSV export
 */
export function formatDateForCsv(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Format datetime for CSV export
 */
export function formatDateTimeForCsv(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}
