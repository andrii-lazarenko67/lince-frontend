/**
 * Report PDF Generator
 * Generates professional PDF reports based on template configuration
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  ReportTemplateConfig,
  ReportBlock,
  GeneratedReportData,
  GeneratedReportPeriod
} from '../types';

interface ReportPdfConfig {
  name: string;
  period: GeneratedReportPeriod;
  templateConfig: ReportTemplateConfig;
  reportData: GeneratedReportData;
  clientName?: string;
  userName?: string;
  t: (key: string) => string; // Translation function
}

interface SystemData {
  id: number;
  name: string;
  description?: string;
  status?: string;
  type?: { name: string };
}

interface DailyLogData {
  date: string;
  system?: { name: string };
  user?: { name: string };
  notes?: string;
  entries?: unknown[];
}

interface InspectionData {
  date: string;
  system?: { name: string };
  user?: { name: string };
  status: string;
  conclusion?: string;
  items?: unknown[];
}

interface IncidentData {
  title: string;
  system?: { name: string };
  priority: string;
  status: string;
  createdAt: string;
  reporter?: { name: string };
}

/**
 * Generates a complete PDF report based on template and data
 */
export function generateReportPdf(config: ReportPdfConfig): Blob {
  const { name, period, templateConfig, reportData, clientName, userName, t } = config;
  const { blocks, branding } = templateConfig;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // Parse branding color
  const primaryColor = hexToRgb(branding.primaryColor || '#1976d2');

  // Helper function to add page header
  const addPageHeader = () => {
    if (branding.showHeader && branding.headerText) {
      doc.setFontSize(10);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(branding.headerText, pageWidth / 2, 8, { align: 'center' });
    }
  };

  // Helper function to add page footer
  const addPageFooter = (pageNum: number, totalPages: number) => {
    if (branding.showFooter && branding.footerText) {
      const footerText = branding.footerText
        .replace('{page}', String(pageNum))
        .replace('{pages}', String(totalPages));
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  };

  // Helper to check and add new page
  const checkNewPage = (requiredSpace: number = 30) => {
    if (currentY > pageHeight - requiredSpace) {
      doc.addPage();
      currentY = margin;
      addPageHeader();
    }
  };

  // Sort blocks by order and filter enabled
  const enabledBlocks = blocks
    .filter(block => block.enabled)
    .sort((a, b) => a.order - b.order);

  // First page header
  addPageHeader();

  // Render each block
  enabledBlocks.forEach((block, index) => {
    if (index > 0) {
      checkNewPage(40);
    }

    switch (block.type) {
      case 'identification':
        currentY = renderIdentificationBlock(doc, {
          name,
          period,
          clientName,
          userName,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t
        });
        break;

      case 'scope':
        currentY = renderScopeBlock(doc, {
          period,
          systems: reportData.systems as SystemData[],
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t
        });
        break;

      case 'systems':
        currentY = renderSystemsBlock(doc, {
          systems: reportData.systems as SystemData[],
          block,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t,
          checkNewPage
        });
        break;

      case 'analyses':
        currentY = renderAnalysesBlock(doc, {
          dailyLogs: reportData.dailyLogs as DailyLogData[],
          block,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t,
          checkNewPage
        });
        break;

      case 'inspections':
        currentY = renderInspectionsBlock(doc, {
          inspections: reportData.inspections as InspectionData[],
          block,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t,
          checkNewPage
        });
        break;

      case 'occurrences':
        currentY = renderOccurrencesBlock(doc, {
          incidents: reportData.incidents as IncidentData[],
          block,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t,
          checkNewPage
        });
        break;

      case 'conclusion':
        currentY = renderConclusionBlock(doc, {
          reportData,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t
        });
        break;

      case 'signature':
        checkNewPage(50);
        currentY = renderSignatureBlock(doc, {
          userName,
          primaryColor,
          currentY,
          pageWidth,
          margin,
          t
        });
        break;

      case 'attachments':
        // Attachments block - placeholder for now
        break;
    }
  });

  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(i, totalPages);
  }

  return doc.output('blob');
}

// Block renderers
interface BlockRenderContext {
  primaryColor: { r: number; g: number; b: number };
  currentY: number;
  pageWidth: number;
  margin: number;
  t: (key: string) => string;
}

interface IdentificationContext extends BlockRenderContext {
  name: string;
  period: GeneratedReportPeriod;
  clientName?: string;
  userName?: string;
}

function renderIdentificationBlock(
  doc: jsPDF,
  ctx: IdentificationContext
): number {
  const { name, period, clientName, userName, primaryColor, pageWidth, margin, t } = ctx;
  let y = ctx.currentY;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(name || t('reports.pdf.technicalReport'), pageWidth / 2, y + 10, { align: 'center' });
  y += 20;

  // Horizontal line
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  const infoY = y + 8;
  doc.text(`${t('reports.pdf.period')}: ${formatDate(period.startDate)} - ${formatDate(period.endDate)}`, margin + 5, infoY);
  doc.text(`${t('reports.pdf.type')}: ${t(`reports.generator.periods.${period.type}`)}`, margin + 5, infoY + 7);
  if (clientName) {
    doc.text(`${t('reports.pdf.client')}: ${clientName}`, pageWidth / 2, infoY);
  }
  if (userName) {
    doc.text(`${t('reports.pdf.generatedBy')}: ${userName}`, pageWidth / 2, infoY + 7);
  }
  doc.text(`${t('reports.pdf.generatedAt')}: ${new Date().toLocaleString()}`, margin + 5, infoY + 14);

  return y + 40;
}

interface ScopeContext extends BlockRenderContext {
  period: GeneratedReportPeriod;
  systems: SystemData[];
}

function renderScopeBlock(doc: jsPDF, ctx: ScopeContext): number {
  const { period, systems, margin, t } = ctx;
  let y = ctx.currentY;

  // Section title
  y = renderSectionTitle(doc, t('reports.blocks.scope.title'), y, ctx);

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  const scopeText = t('reports.pdf.scopeDescription')
    .replace('{count}', String(systems.length))
    .replace('{startDate}', formatDate(period.startDate))
    .replace('{endDate}', formatDate(period.endDate));

  doc.text(scopeText, margin, y, { maxWidth: ctx.pageWidth - margin * 2 });
  y += 15;

  // List systems
  if (systems.length > 0) {
    doc.setFontSize(9);
    systems.forEach((system) => {
      doc.text(`• ${system.name}${system.type ? ` (${system.type.name})` : ''}`, margin + 5, y);
      y += 5;
    });
  }

  return y + 5;
}

interface SystemsContext extends BlockRenderContext {
  systems: SystemData[];
  block: ReportBlock;
  checkNewPage: (space?: number) => void;
}

function renderSystemsBlock(doc: jsPDF, ctx: SystemsContext): number {
  const { systems, primaryColor, margin, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.systems.title'), y, ctx);

  if (systems.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(t('reports.pdf.noSystems'), margin, y);
    return y + 10;
  }

  const headers = [t('reports.pdf.name'), t('reports.pdf.type'), t('reports.pdf.description')];
  const rows = systems.map(system => [
    system.name,
    system.type?.name || '-',
    system.description || '-'
  ]);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  return (doc as any).lastAutoTable?.finalY + 10 || y + 20;
}

interface AnalysesContext extends BlockRenderContext {
  dailyLogs: DailyLogData[];
  block: ReportBlock;
  checkNewPage: (space?: number) => void;
}

function renderAnalysesBlock(doc: jsPDF, ctx: AnalysesContext): number {
  const { dailyLogs, primaryColor, margin, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.analyses.title'), y, ctx);

  if (dailyLogs.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(t('reports.pdf.noAnalyses'), margin, y);
    return y + 10;
  }

  const headers = [t('reports.pdf.date'), t('reports.pdf.system'), t('reports.pdf.user'), t('reports.pdf.entries'), t('reports.pdf.notes')];
  const rows = dailyLogs.map(log => [
    formatDate(log.date),
    log.system?.name || '-',
    log.user?.name || '-',
    String(log.entries?.length || 0),
    log.notes || '-'
  ]);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  return (doc as any).lastAutoTable?.finalY + 10 || y + 20;
}

interface InspectionsContext extends BlockRenderContext {
  inspections: InspectionData[];
  block: ReportBlock;
  checkNewPage: (space?: number) => void;
}

function renderInspectionsBlock(doc: jsPDF, ctx: InspectionsContext): number {
  const { inspections, primaryColor, margin, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.inspections.title'), y, ctx);

  if (inspections.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(t('reports.pdf.noInspections'), margin, y);
    return y + 10;
  }

  const headers = [t('reports.pdf.date'), t('reports.pdf.system'), t('reports.pdf.user'), t('reports.pdf.status'), t('reports.pdf.conclusion')];
  const rows = inspections.map(insp => [
    formatDate(insp.date),
    insp.system?.name || '-',
    insp.user?.name || '-',
    insp.status,
    insp.conclusion || '-'
  ]);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  return (doc as any).lastAutoTable?.finalY + 10 || y + 20;
}

interface OccurrencesContext extends BlockRenderContext {
  incidents: IncidentData[];
  block: ReportBlock;
  checkNewPage: (space?: number) => void;
}

function renderOccurrencesBlock(doc: jsPDF, ctx: OccurrencesContext): number {
  const { incidents, primaryColor, margin, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.occurrences.title'), y, ctx);

  if (incidents.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(t('reports.pdf.noOccurrences'), margin, y);
    return y + 10;
  }

  const headers = [t('reports.pdf.title'), t('reports.pdf.system'), t('reports.pdf.priority'), t('reports.pdf.status'), t('reports.pdf.date')];
  const rows = incidents.map(inc => [
    inc.title,
    inc.system?.name || '-',
    inc.priority,
    inc.status,
    formatDate(inc.createdAt)
  ]);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  return (doc as any).lastAutoTable?.finalY + 10 || y + 20;
}

interface ConclusionContext extends BlockRenderContext {
  reportData: GeneratedReportData;
}

function renderConclusionBlock(doc: jsPDF, ctx: ConclusionContext): number {
  const { reportData, margin, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.conclusion.title'), y, ctx);

  // Summary statistics
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  const stats = [
    `${t('reports.pdf.totalSystems')}: ${(reportData.systems as unknown[])?.length || 0}`,
    `${t('reports.pdf.totalAnalyses')}: ${(reportData.dailyLogs as unknown[])?.length || 0}`,
    `${t('reports.pdf.totalInspections')}: ${(reportData.inspections as unknown[])?.length || 0}`,
    `${t('reports.pdf.totalOccurrences')}: ${(reportData.incidents as unknown[])?.length || 0}`
  ];

  stats.forEach((stat) => {
    doc.text(`• ${stat}`, margin + 5, y);
    y += 6;
  });

  return y + 10;
}

interface SignatureContext extends BlockRenderContext {
  userName?: string;
}

function renderSignatureBlock(doc: jsPDF, ctx: SignatureContext): number {
  const { userName, pageWidth, t } = ctx;
  let y = ctx.currentY;

  y = renderSectionTitle(doc, t('reports.blocks.signature.title'), y, ctx);

  const signatureWidth = 70;
  const signatureX = (pageWidth - signatureWidth) / 2;

  // Signature line
  doc.setDrawColor(128, 128, 128);
  doc.setLineWidth(0.3);
  doc.line(signatureX, y + 20, signatureX + signatureWidth, y + 20);

  // Name placeholder
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(userName || t('reports.pdf.technician'), pageWidth / 2, y + 27, { align: 'center' });

  // Date
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(formatDate(new Date().toISOString()), pageWidth / 2, y + 33, { align: 'center' });

  return y + 45;
}

// Helper functions
function renderSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  ctx: BlockRenderContext
): number {
  const { primaryColor, pageWidth, margin } = ctx;

  doc.setFontSize(14);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(title, margin, y);

  // Underline
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);

  return y + 10;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 25, g: 118, b: 210 }; // Default blue
}

/**
 * Downloads the PDF directly
 */
export function downloadReportPdf(config: ReportPdfConfig, filename: string): void {
  const blob = generateReportPdf(config);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
