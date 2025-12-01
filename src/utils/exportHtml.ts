/**
 * HTML Export Utility
 * Generates styled HTML reports from data
 */

export interface HtmlExportConfig {
  title: string;
  subtitle?: string;
  filename: string;
  metadata?: Array<{ label: string; value: string }>;
}

export interface HtmlTableSection {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  cellClasses?: Array<(value: string | number, rowIndex: number) => string>;
}

const DEFAULT_STYLES = `
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
  h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
  th { background-color: #f3f4f6; font-weight: 600; }
  tr:nth-child(even) { background-color: #f9fafb; }
  .info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  .status-open { color: #dc2626; }
  .status-resolved { color: #16a34a; }
  .status-in_progress { color: #ea580c; }
  .status-completed { color: #16a34a; }
  .status-pending { color: #ca8a04; }
  .priority-critical { color: #dc2626; font-weight: bold; }
  .priority-high { color: #ea580c; }
  .priority-medium { color: #ca8a04; }
  .priority-low { color: #16a34a; }
  .text-success { color: #16a34a; }
  .text-danger { color: #dc2626; }
  .text-warning { color: #ca8a04; }
`;

/**
 * Generates an HTML document with styled tables
 */
export function generateHtmlDocument(
  config: HtmlExportConfig,
  sections: HtmlTableSection[],
  customStyles?: string
): string {
  const styles = customStyles || DEFAULT_STYLES;

  const metadataHtml = config.metadata?.map(
    item => `<p><strong>${item.label}:</strong> ${item.value}</p>`
  ).join('\n    ') || '';

  const sectionsHtml = sections.map(section => `
  <h2>${section.title}</h2>
  <table>
    <tr>${section.headers.map(h => `<th>${h}</th>`).join('')}</tr>
    ${section.rows.map((row, rowIndex) => `
    <tr>${row.map((cell, cellIndex) => {
      const cellClass = section.cellClasses?.[cellIndex]?.(cell, rowIndex) || '';
      return `<td${cellClass ? ` class="${cellClass}"` : ''}>${cell}</td>`;
    }).join('')}</tr>`).join('')}
  </table>`).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${config.title}</title>
  <style>${styles}</style>
</head>
<body>
  <h1>${config.title}</h1>
  ${config.subtitle ? `<p>${config.subtitle}</p>` : ''}
  ${metadataHtml ? `<div class="info">\n    ${metadataHtml}\n  </div>` : ''}
  ${sectionsHtml}
</body>
</html>`;
}

/**
 * Downloads the HTML content as a file
 */
export function downloadHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Helper function to export data as HTML with a single call
 */
export function exportToHtml(
  config: HtmlExportConfig,
  sections: HtmlTableSection[],
  customStyles?: string
): void {
  const html = generateHtmlDocument(config, sections, customStyles);
  downloadHtml(html, config.filename);
}

/**
 * Helper to get status CSS class
 */
export function getStatusClass(status: string): string {
  return `status-${status.toLowerCase().replace(/\s+/g, '_')}`;
}

/**
 * Helper to get priority CSS class
 */
export function getPriorityClass(priority: string): string {
  return `priority-${priority.toLowerCase()}`;
}
