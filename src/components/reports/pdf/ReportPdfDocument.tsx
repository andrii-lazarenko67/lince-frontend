/**
 * Report PDF Document Component
 * Uses @react-pdf/renderer for professional PDF generation
 * Implements all 9 report blocks with proper styling
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer';
import type {
  ReportTemplateConfig,
  ReportBlock,
  ReportBranding,
  GeneratedReportPeriod
} from '../../../types';

// Types for report data
export interface ReportClient {
  id: number;
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  logo?: string;
  brandColor?: string;
}

export interface ReportSystemChild {
  id: number;
  name: string;
  status?: string;
  description?: string;
  systemType?: { id: number; name: string };
}

export interface ReportSystem {
  id: number;
  name: string;
  description?: string;
  status?: string;
  location?: string;
  systemType?: { id: number; name: string };
  photos?: Array<{ id: number; url: string; description?: string }>;
  children?: ReportSystemChild[];
}

export interface ReportDailyLogEntry {
  id: number;
  value: number | null;
  isOutOfRange?: boolean;
  notes?: string;
  monitoringPoint?: {
    id: number;
    name: string;
    minValue?: number;
    maxValue?: number;
    unit?: { symbol: string };
  };
}

export interface ReportDailyLog {
  id: number;
  date: string;
  recordType?: string;
  notes?: string;
  system?: { id: number; name: string };
  stage?: { id: number; name: string };
  user?: { id: number; name: string };
  entries?: ReportDailyLogEntry[];
}

export interface ReportInspectionItem {
  id: number;
  status: 'C' | 'NC' | 'NA' | 'NV';  // C=Compliant, NC=Non-Compliant, NA=Not Applicable, NV=Not Verified
  comment?: string;
  notes?: string;
  checklistItem?: { id: number; name: string; description?: string };
}

export interface ReportInspection {
  id: number;
  date: string;
  status: string;
  conclusion?: string;
  system?: { id: number; name: string };
  user?: { id: number; name: string };
  items?: ReportInspectionItem[];
  photos?: Array<{ id: number; url: string; description?: string }>;
}

export interface ReportIncidentComment {
  id: number;
  content: string;
  createdAt: string;
  user?: { id: number; name: string };
}

export interface ReportIncident {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
  system?: { id: number; name: string };
  reporter?: { id: number; name: string };
  assignee?: { id: number; name: string };
  photos?: Array<{ id: number; url: string; description?: string }>;
  comments?: ReportIncidentComment[];
}

export interface ReportData {
  client: ReportClient;
  period: GeneratedReportPeriod;
  systems: ReportSystem[];
  dailyLogs: ReportDailyLog[];
  inspections: ReportInspection[];
  incidents: ReportIncident[];
  summary: {
    totalSystems: number;
    totalReadings: number;
    outOfRangeCount: number;
    totalInspections: number;
    totalIncidents: number;
    openIncidents: number;
  };
  conclusion?: string;
  signature?: {
    name?: string;
    role?: string;
    registration?: string;
    signatureImage?: string;
  };
  generatedAt: string;
  generatedBy: { id: number; name: string };
  isServiceProvider?: boolean;
  // Chart images as base64 strings (keyed by monitoringPointId)
  chartImages?: {
    field?: Map<number, string>;
    laboratory?: Map<number, string>;
  };
}

export interface ReportPdfProps {
  reportName: string;
  config: ReportTemplateConfig;
  data: ReportData;
  t: (key: string, options?: Record<string, unknown>) => string;
}

// Create styles with dynamic primary color
const createStyles = (primaryColor: string) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 10
  },
  headerLogo: {
    width: 80,
    height: 40,
    objectFit: 'contain'
  },
  headerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'right'
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor,
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor,
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: primaryColor,
    paddingBottom: 4
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  infoLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    width: 120
  },
  infoValue: {
    color: '#6b7280',
    flex: 1
  },
  table: {
    marginTop: 8,
    marginBottom: 12
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    fontSize: 9,
    flex: 1,
    textAlign: 'left'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb'
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb'
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
    flex: 1,
    textAlign: 'left'
  },
  tableCellAlert: {
    color: '#dc2626',
    fontFamily: 'Helvetica-Bold'
  },
  text: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5
  },
  textMuted: {
    fontSize: 9,
    color: '#9ca3af'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8
  },
  photoContainer: {
    width: 120,
    marginBottom: 8
  },
  photo: {
    width: 120,
    height: 90,
    objectFit: 'cover',
    borderRadius: 4
  },
  photoCaption: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
    width: 120
  },
  signatureBox: {
    marginTop: 30,
    alignItems: 'center'
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
    marginBottom: 8
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151'
  },
  signatureRole: {
    fontSize: 9,
    color: '#6b7280'
  },
  signatureImage: {
    width: 150,
    height: 50,
    marginBottom: 8,
    objectFit: 'contain'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 8
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af'
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8
  },
  badgeCritical: {
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  },
  badgeHigh: {
    backgroundColor: '#fff7ed',
    color: '#ea580c'
  },
  badgeMedium: {
    backgroundColor: '#fefce8',
    color: '#ca8a04'
  },
  badgeLow: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a'
  },
  statusOpen: {
    color: '#dc2626'
  },
  statusInProgress: {
    color: '#2563eb'
  },
  statusResolved: {
    color: '#16a34a'
  },
  statusClosed: {
    color: '#6b7280'
  },
  timeline: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: primaryColor
  },
  timelineItem: {
    marginBottom: 8,
    paddingLeft: 8
  },
  timelineDate: {
    fontSize: 8,
    color: '#9ca3af'
  },
  conclusionBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    padding: 15,
    marginTop: 10
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  summaryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 10
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center'
  },
  chartContainer: {
    marginTop: 15,
    marginBottom: 10
  },
  chartImage: {
    width: '100%',
    maxHeight: 250,
    objectFit: 'contain'
  },
  chartTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 5,
    textAlign: 'center'
  },
  chartsSection: {
    marginTop: 20,
    marginBottom: 15
  },
  chartsSectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor,
    marginBottom: 10
  }
});

// Helper functions
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

// Block Components
interface BlockProps {
  data: ReportData;
  block: ReportBlock;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const IdentificationBlock: React.FC<BlockProps & { reportName: string }> = ({
  data,
  styles,
  t,
  reportName
}) => {
  // Determine label based on user type:
  // - Service Provider sees "Client" (they're serving clients)
  // - End Customer sees "Company" (it's their own company)
  const clientLabel = data.isServiceProvider
    ? t('reports.pdf.client')
    : t('reports.pdf.company');

  return (
    <View>
      <Text style={styles.title}>{reportName}</Text>
      <Text style={styles.subtitle}>
        {t('reports.pdf.period')}: {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
      </Text>

      {/* Identification Section */}
      <Text style={styles.sectionTitle}>{t('reports.blocks.identification.title')}</Text>
      <View style={styles.infoBox}>
        {/* Company/Client Name */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{clientLabel}:</Text>
          <Text style={styles.infoValue}>{data.client.name || '—'}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('common.address')}:</Text>
          <Text style={styles.infoValue}>{data.client.address || '—'}</Text>
        </View>

        {/* Contact Name */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('common.contact')}:</Text>
          <Text style={styles.infoValue}>{data.client.contact || '—'}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('common.phone')}:</Text>
          <Text style={styles.infoValue}>{data.client.phone || '—'}</Text>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('common.email')}:</Text>
          <Text style={styles.infoValue}>{data.client.email || '—'}</Text>
        </View>

        {/* Generated By */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('reports.pdf.generatedBy')}:</Text>
          <Text style={styles.infoValue}>{data.generatedBy.name}</Text>
        </View>

        {/* Created On */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('reports.pdf.createdOn')}:</Text>
          <Text style={styles.infoValue}>{formatDate(data.generatedAt)}</Text>
        </View>
      </View>
    </View>
  );
};

const ScopeBlock: React.FC<BlockProps> = ({ data, styles, t }) => (
  <View>
    <Text style={styles.sectionTitle}>{t('reports.blocks.scope.title')}</Text>
    <Text style={styles.text}>
      {t('reports.pdf.scopeDescription', {
        count: data.systems.length,
        startDate: formatDate(data.period.startDate),
        endDate: formatDate(data.period.endDate)
      })}
    </Text>
    <View style={{ marginTop: 8 }}>
      {data.systems.map((system) => (
        <Text key={system.id} style={styles.text}>
          • {system.name} {system.systemType ? `(${system.systemType.name})` : ''}
        </Text>
      ))}
    </View>
  </View>
);

const SystemsBlock: React.FC<BlockProps> = ({ data, block, styles, t }) => {
  // Translate system status
  const getStatusLabel = (status?: string): string => {
    if (!status) return '-';
    // Try to translate using systems namespace, fallback to raw value
    const translated = t(`systems.${status}`, { defaultValue: status });
    return translated;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('reports.blocks.systems.title')}</Text>
      {data.systems.length === 0 ? (
        <Text style={styles.textMuted}>{t('reports.pdf.noSystems')}</Text>
      ) : (
        <>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('reports.pdf.name')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.type')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.status')}</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('reports.pdf.description')}</Text>
            </View>
            {data.systems.map((system, idx) => (
              <View key={system.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{system.name}</Text>
                <Text style={styles.tableCell}>{system.systemType?.name || '-'}</Text>
                <Text style={styles.tableCell}>{getStatusLabel(system.status)}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{system.description || '-'}</Text>
              </View>
            ))}
          </View>

          {/* Process Stages Section - Show children/sub-systems for each system */}
          {data.systems.some(s => s.children && s.children.length > 0) && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.sectionTitle}>{t('reports.pdf.processStages')}</Text>
              {data.systems.map(system => (
                system.children && system.children.length > 0 && (
                  <View key={`stages-${system.id}`} style={{ marginBottom: 10 }}>
                    <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
                      {system.name}:
                    </Text>
                    {system.children.map(stage => (
                      <View key={stage.id} style={styles.infoRow}>
                        <Text style={styles.text}>• {stage.name}</Text>
                      </View>
                    ))}
                  </View>
                )
              ))}
            </View>
          )}

          {block.includePhotos && data.systems.some(s => s.photos && s.photos.length > 0) && (
            <View style={styles.photoGrid}>
              {data.systems.flatMap(system =>
                (system.photos || []).slice(0, 4).map(photo => (
                  <View key={photo.id} style={styles.photoContainer}>
                    <Image src={photo.url} style={styles.photo} />
                    {photo.description && (
                      <Text style={styles.photoCaption}>{photo.description}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// Helper to format date as short day/month format
const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateString;
  }
};

// Helper to format number value
const formatValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  // Format with up to 2 decimal places, removing trailing zeros
  return Number(value).toFixed(2).replace(/\.?0+$/, '');
};

// Helper to format range
const formatRange = (min?: number, max?: number): string => {
  if (min === undefined && max === undefined) return '-';
  const minStr = min !== undefined ? formatValue(min) : '∞';
  const maxStr = max !== undefined ? formatValue(max) : '∞';
  return `${minStr} – ${maxStr}`;
};

// Limit detailed analysis to last 7 days to prevent table overflow
const MAX_DETAILED_DAYS = 7;

// Overview Analysis sub-component - shows summary table
// Now accepts filtered logs instead of using data.dailyLogs directly
interface AnalysesViewProps extends BlockProps {
  logs: ReportDailyLog[];
}

const AnalysesOverviewTable: React.FC<AnalysesViewProps> = ({ logs, block, styles, t }) => {
  if (logs.length === 0) {
    return <Text style={styles.textMuted}>{t('reports.pdf.noAnalyses')}</Text>;
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.date')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.system')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.user')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.entries')}</Text>
        {block.highlightAlerts && (
          <Text style={styles.tableHeaderCell}>{t('reports.dailyLogs.alerts')}</Text>
        )}
      </View>
      {logs.map((log, idx) => {
        const outOfRange = log.entries?.filter(e => e.isOutOfRange).length || 0;
        return (
          <View key={log.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.tableCell}>{formatDate(log.date)}</Text>
            <Text style={styles.tableCell}>{log.system?.name || log.stage?.name || '-'}</Text>
            <Text style={styles.tableCell}>{log.user?.name || '-'}</Text>
            <Text style={styles.tableCell}>{log.entries?.length || 0}</Text>
            {block.highlightAlerts && (
              <Text style={[styles.tableCell, outOfRange > 0 ? styles.tableCellAlert : {}]}>
                {outOfRange}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// Detailed Analysis table - accepts filtered logs
const AnalysesDetailedTable: React.FC<AnalysesViewProps> = ({ logs, styles, t }) => {
  // Build unique dates sorted chronologically, take only last 7 days
  const allDates = [...new Set(logs.map(log => log.date))].sort();
  const uniqueDates = allDates.slice(-MAX_DETAILED_DAYS);

  if (uniqueDates.length === 0) {
    return <Text style={styles.textMuted}>{t('reports.pdf.noDetailedAnalyses')}</Text>;
  }

  // Build unique monitoring points with their ranges
  const monitoringPointMap = new Map<number, {
    id: number;
    name: string;
    minValue?: number;
    maxValue?: number;
    unit?: string;
  }>();

  // Build a map of date+mpId -> entry data (only for the last 7 days)
  const dateSet = new Set(uniqueDates);
  const valueMap = new Map<string, {
    value: number | null;
    isOutOfRange?: boolean;
    notes?: string;
    date: string;
    mpName: string;
  }>();

  logs
    .filter(log => dateSet.has(log.date))
    .forEach(log => {
      log.entries?.forEach(entry => {
        if (entry.monitoringPoint) {
          const mp = entry.monitoringPoint;
          if (!monitoringPointMap.has(mp.id)) {
            monitoringPointMap.set(mp.id, {
              id: mp.id,
              name: mp.name,
              minValue: mp.minValue,
              maxValue: mp.maxValue,
              unit: mp.unit?.symbol
            });
          }
          const key = `${log.date}_${mp.id}`;
          valueMap.set(key, {
            value: entry.value,
            isOutOfRange: entry.isOutOfRange,
            notes: entry.notes,
            date: log.date,
            mpName: mp.name
          });
        }
      });
    });

  const monitoringPoints = Array.from(monitoringPointMap.values());

  if (monitoringPoints.length === 0) {
    return <Text style={styles.textMuted}>{t('reports.pdf.noDetailedAnalyses')}</Text>;
  }

  // Collect observations
  const observations: Array<{ date: string; mpName: string; value: number | null; notes?: string; isOutOfRange?: boolean }> = [];
  valueMap.forEach((entry) => {
    if (entry.notes || entry.isOutOfRange) {
      observations.push({
        date: entry.date,
        mpName: entry.mpName,
        value: entry.value,
        notes: entry.notes,
        isOutOfRange: entry.isOutOfRange
      });
    }
  });
  observations.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2.5, minWidth: 120 }]}>
            {t('reports.pdf.parameter')}
          </Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.2, minWidth: 60, textAlign: 'center' }]}>
            {t('reports.pdf.expectedRange')}
          </Text>
          {uniqueDates.map(date => (
            <Text key={date} style={[styles.tableHeaderCell, { flex: 1, minWidth: 45, textAlign: 'center' }]}>
              {formatShortDate(date)}
            </Text>
          ))}
        </View>

        {monitoringPoints.map((mp, idx) => (
          <View key={mp.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, { flex: 2.5, minWidth: 120 }]}>
              {mp.name} {mp.unit ? `(${mp.unit})` : ''}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.2, minWidth: 60, textAlign: 'center' }]}>
              {formatRange(mp.minValue, mp.maxValue)}
            </Text>
            {uniqueDates.map(date => {
              const key = `${date}_${mp.id}`;
              const entry = valueMap.get(key);
              const isOutOfRange = entry?.isOutOfRange;
              return (
                <Text
                  key={date}
                  style={[
                    styles.tableCell,
                    { flex: 1, minWidth: 45, textAlign: 'center' },
                    isOutOfRange ? styles.tableCellAlert : {}
                  ]}
                >
                  {formatValue(entry?.value)}
                </Text>
              );
            })}
          </View>
        ))}
      </View>

      {observations.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 6 }]}>
            {t('reports.pdf.observations')}
          </Text>
          {observations.map((obs, idx) => (
            <View key={idx} style={{ marginBottom: 6 }}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold' }]}>
                {formatShortDate(obs.date)} – {obs.mpName}: {formatValue(obs.value)}
              </Text>
              {obs.notes && (
                <Text style={styles.text}>{obs.notes}</Text>
              )}
              {obs.isOutOfRange && !obs.notes && (
                <Text style={[styles.text, { color: '#dc2626' }]}>
                  {t('reports.pdf.valueOutOfRange')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Helper to render chart images
const renderChartImages = (
  chartImages: Map<number, string> | undefined,
  styles: ReturnType<typeof createStyles>,
  title: string
) => {
  if (!chartImages || chartImages.size === 0) return null;

  const images = Array.from(chartImages.entries());

  return (
    <View style={styles.chartsSection}>
      <Text style={styles.chartsSectionTitle}>{title}</Text>
      {images.map(([mpId, base64]) => (
        <View key={mpId} style={styles.chartContainer}>
          <Image src={base64} style={styles.chartImage} />
        </View>
      ))}
    </View>
  );
};

const AnalysesBlock: React.FC<BlockProps> = ({ data, block, styles, t }) => {
  // Split logs by recordType
  const fieldLogs = data.dailyLogs.filter(log => log.recordType === 'field');
  const laboratoryLogs = data.dailyLogs.filter(log => log.recordType === 'laboratory');

  const hasFieldLogs = fieldLogs.length > 0;
  const hasLaboratoryLogs = laboratoryLogs.length > 0;
  const hasAnyLogs = data.dailyLogs.length > 0;

  // Determine which sections to show (default to true for overview, false for detailed)
  const showFieldOverview = block.showFieldOverview !== false;
  const showFieldDetailed = block.showFieldDetailed === true;
  const showLaboratoryOverview = block.showLaboratoryOverview !== false;
  const showLaboratoryDetailed = block.showLaboratoryDetailed === true;

  // Check if at least one section is enabled
  const hasAnySectionEnabled = showFieldOverview || showFieldDetailed || showLaboratoryOverview || showLaboratoryDetailed;

  // Check for chart images
  const hasFieldCharts = data.chartImages?.field && data.chartImages.field.size > 0;
  const hasLaboratoryCharts = data.chartImages?.laboratory && data.chartImages.laboratory.size > 0;
  const showCharts = block.includeCharts && (hasFieldCharts || hasLaboratoryCharts);

  return (
    <View>
      {!hasAnyLogs || !hasAnySectionEnabled ? (
        <>
          <Text style={styles.sectionTitle}>{t('reports.blocks.analyses.title')}</Text>
          <Text style={styles.textMuted}>{t('reports.pdf.noAnalyses')}</Text>
        </>
      ) : (
        <>
          {/* Field Monitoring Analysis – Overview */}
          {showFieldOverview && (
            <>
              <Text style={styles.sectionTitle}>{t('reports.blocks.analyses.fieldOverviewTitle')}</Text>
              <AnalysesOverviewTable logs={fieldLogs} data={data} block={block} styles={styles} t={t} />
            </>
          )}

          {/* Field Charts */}
          {showCharts && hasFieldCharts && (
            renderChartImages(
              data.chartImages?.field,
              styles,
              t('reports.charts.fieldChartsTitle')
            )
          )}

          {/* Field Monitoring Analysis – Detailed */}
          {showFieldDetailed && hasFieldLogs && (
            <View style={{ marginTop: showFieldOverview ? 15 : 0 }}>
              <Text style={styles.sectionTitle}>{t('reports.blocks.analyses.fieldDetailedTitle')}</Text>
              <AnalysesDetailedTable logs={fieldLogs} data={data} block={block} styles={styles} t={t} />
            </View>
          )}

          {/* Laboratory Monitoring Analysis – Overview */}
          {showLaboratoryOverview && (
            <View style={{ marginTop: (showFieldOverview || showFieldDetailed) ? 20 : 0 }}>
              <Text style={styles.sectionTitle}>{t('reports.blocks.analyses.laboratoryOverviewTitle')}</Text>
              <AnalysesOverviewTable logs={laboratoryLogs} data={data} block={block} styles={styles} t={t} />
            </View>
          )}

          {/* Laboratory Charts */}
          {showCharts && hasLaboratoryCharts && (
            renderChartImages(
              data.chartImages?.laboratory,
              styles,
              t('reports.charts.laboratoryChartsTitle')
            )
          )}

          {/* Laboratory Monitoring Analysis – Detailed */}
          {showLaboratoryDetailed && hasLaboratoryLogs && (
            <View style={{ marginTop: showLaboratoryOverview ? 15 : ((showFieldOverview || showFieldDetailed) ? 20 : 0) }}>
              <Text style={styles.sectionTitle}>{t('reports.blocks.analyses.laboratoryDetailedTitle')}</Text>
              <AnalysesDetailedTable logs={laboratoryLogs} data={data} block={block} styles={styles} t={t} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

// Helper function to count inspection items by status
const countInspectionItemsByStatus = (items: ReportInspectionItem[] | undefined) => {
  const counts = { C: 0, NC: 0, NA: 0, NV: 0 };
  items?.forEach(item => {
    if (counts[item.status] !== undefined) {
      counts[item.status]++;
    }
  });
  return counts;
};

// Check if inspection has non-conformities
const hasNonConformities = (inspection: ReportInspection): boolean => {
  return inspection.items?.some(item => item.status === 'NC') || false;
};

// Inspection Overview Table Component
const InspectionsOverviewTable: React.FC<{
  inspections: ReportInspection[];
  styles: ReturnType<typeof createStyles>;
  t: (key: string, options?: Record<string, unknown>) => string;
  highlightOnlyNC: boolean;
}> = ({ inspections, styles, t, highlightOnlyNC }) => {
  // Filter inspections if highlighting only NC
  const displayInspections = highlightOnlyNC
    ? inspections.filter(hasNonConformities)
    : inspections;

  if (displayInspections.length === 0) {
    return (
      <Text style={styles.textMuted}>
        {highlightOnlyNC
          ? t('reports.pdf.noNCInspections')
          : t('reports.pdf.noInspections')}
      </Text>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.date')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.system')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.inspections.inspector')}</Text>
        <Text style={styles.tableHeaderCell}>{t('reports.pdf.status')}</Text>
        <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{t('reports.inspections.compliant')}</Text>
        <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{t('reports.inspections.nonCompliant')}</Text>
      </View>
      {displayInspections.map((insp, idx) => {
        const counts = countInspectionItemsByStatus(insp.items);
        const hasNC = counts.NC > 0;
        return (
          <View key={insp.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.tableCell}>{formatDate(insp.date)}</Text>
            <Text style={styles.tableCell}>{insp.system?.name || '-'}</Text>
            <Text style={styles.tableCell}>{insp.user?.name || '-'}</Text>
            <Text style={styles.tableCell}>{t(`reports.inspections.${insp.status}`)}</Text>
            <Text style={[styles.tableCell, { textAlign: 'center', color: '#16a34a' }]}>{counts.C}</Text>
            <Text style={[styles.tableCell, { textAlign: 'center' }, hasNC ? styles.tableCellAlert : {}]}>
              {counts.NC}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Inspection Detailed View Component
const InspectionsDetailedView: React.FC<{
  inspections: ReportInspection[];
  block: ReportBlock;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, options?: Record<string, unknown>) => string;
  highlightOnlyNC: boolean;
}> = ({ inspections, block, styles, t, highlightOnlyNC }) => {
  // Filter inspections if highlighting only NC
  const displayInspections = highlightOnlyNC
    ? inspections.filter(hasNonConformities)
    : inspections;

  if (displayInspections.length === 0) {
    return (
      <Text style={styles.textMuted}>
        {highlightOnlyNC
          ? t('reports.pdf.noNCInspections')
          : t('reports.pdf.noInspections')}
      </Text>
    );
  }

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'C': return t('reports.inspections.statusC');
      case 'NC': return t('reports.inspections.statusNC');
      case 'NA': return t('reports.inspections.statusNA');
      case 'NV': return t('reports.inspections.statusNV');
      default: return status;
    }
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'C': return { color: '#16a34a' };  // Green for compliant
      case 'NC': return { color: '#dc2626', fontFamily: 'Helvetica-Bold' as const };  // Red bold for NC
      case 'NA': return { color: '#6b7280' };  // Gray for NA
      case 'NV': return { color: '#f59e0b' };  // Amber for not verified
      default: return {};
    }
  };

  return (
    <View>
      {displayInspections.map((insp) => (
        <View key={insp.id} style={{ marginBottom: 15 }}>
          {/* Inspection Header */}
          <View style={[styles.infoBox, { marginBottom: 8 }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('reports.pdf.date')}:</Text>
              <Text style={styles.infoValue}>{formatDate(insp.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('reports.pdf.system')}:</Text>
              <Text style={styles.infoValue}>{insp.system?.name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('reports.inspections.inspector')}:</Text>
              <Text style={styles.infoValue}>{insp.user?.name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('reports.pdf.status')}:</Text>
              <Text style={styles.infoValue}>{t(`reports.inspections.${insp.status}`)}</Text>
            </View>
          </View>

          {/* Checklist Items Table */}
          {insp.items && insp.items.length > 0 && (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>{t('reports.pdf.checklistItem')}</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>{t('reports.pdf.status')}</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('reports.pdf.comment')}</Text>
              </View>
              {insp.items.map((item, itemIdx) => (
                <View key={item.id} style={[styles.tableRow, itemIdx % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {item.checklistItem?.name || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }, getStatusStyle(item.status)]}>
                    {getStatusLabel(item.status)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {item.comment || item.notes || '-'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Conclusion */}
          {insp.conclusion && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
                {t('reports.pdf.conclusion')}:
              </Text>
              <Text style={styles.text}>{insp.conclusion}</Text>
            </View>
          )}

          {/* Photos for this inspection */}
          {block.includePhotos && insp.photos && insp.photos.length > 0 && (
            <View style={[styles.photoGrid, { marginTop: 8 }]}>
              {insp.photos.slice(0, 4).map(photo => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image src={photo.url} style={styles.photo} />
                  {photo.description && (
                    <Text style={styles.photoCaption}>{photo.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const InspectionsBlock: React.FC<BlockProps> = ({ data, block, styles, t }) => {
  // Determine which views to show (default: overview true, detailed false)
  const showOverview = block.showInspectionOverview !== false;
  const showDetailed = block.showInspectionDetailed === true;
  const highlightOnlyNC = block.highlightOnlyNonConformities !== false;

  // Check if at least one view is enabled
  const hasAnyViewEnabled = showOverview || showDetailed;

  if (data.inspections.length === 0 || !hasAnyViewEnabled) {
    return (
      <View>
        <Text style={styles.sectionTitle}>{t('reports.blocks.inspections.title')}</Text>
        <Text style={styles.textMuted}>{t('reports.pdf.noInspections')}</Text>
      </View>
    );
  }

  // Count inspections with NC for summary
  const totalWithNC = data.inspections.filter(hasNonConformities).length;

  return (
    <View>
      {/* Overview Section */}
      {showOverview && (
        <>
          <Text style={styles.sectionTitle}>{t('reports.blocks.inspections.overviewTitle')}</Text>
          {highlightOnlyNC && totalWithNC > 0 && (
            <View style={[styles.infoBox, { backgroundColor: '#fef2f2', marginBottom: 8 }]}>
              <Text style={[styles.text, { color: '#dc2626' }]}>
                ⚠ {t('reports.pdf.inspectionsWithNC', { count: totalWithNC, total: data.inspections.length })}
              </Text>
            </View>
          )}
          <InspectionsOverviewTable
            inspections={data.inspections}
            styles={styles}
            t={t}
            highlightOnlyNC={highlightOnlyNC}
          />
        </>
      )}

      {/* Detailed Section */}
      {showDetailed && (
        <View style={{ marginTop: showOverview ? 20 : 0 }}>
          <Text style={styles.sectionTitle}>{t('reports.blocks.inspections.detailedTitle')}</Text>
          <InspectionsDetailedView
            inspections={data.inspections}
            block={block}
            styles={styles}
            t={t}
            highlightOnlyNC={highlightOnlyNC}
          />
        </View>
      )}
    </View>
  );
};

const OccurrencesBlock: React.FC<BlockProps> = ({ data, block, styles, t }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.badgeCritical;
      case 'high': return styles.badgeHigh;
      case 'medium': return styles.badgeMedium;
      default: return styles.badgeLow;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'in_progress': return styles.statusInProgress;
      case 'resolved': return styles.statusResolved;
      default: return styles.statusClosed;
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('reports.blocks.occurrences.title')}</Text>
      {data.incidents.length === 0 ? (
        <Text style={styles.textMuted}>{t('reports.pdf.noOccurrences')}</Text>
      ) : (
        <>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('reports.pdf.title')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.system')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.priority')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.status')}</Text>
              <Text style={styles.tableHeaderCell}>{t('reports.pdf.date')}</Text>
            </View>
            {data.incidents.map((inc, idx) => (
              <View key={inc.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{inc.title}</Text>
                <Text style={styles.tableCell}>{inc.system?.name || '-'}</Text>
                <Text style={[styles.tableCell, getPriorityStyle(inc.priority)]}>
                  {t(`reports.incidents.${inc.priority}`)}
                </Text>
                <Text style={[styles.tableCell, getStatusStyle(inc.status)]}>
                  {t(`reports.incidents.${inc.status}`)}
                </Text>
                <Text style={styles.tableCell}>{formatDate(inc.createdAt)}</Text>
              </View>
            ))}
          </View>
          {block.includeTimeline && data.incidents.length > 0 && (
            <View style={styles.timeline}>
              {data.incidents.slice(0, 5).map(inc => (
                <View key={inc.id} style={styles.timelineItem}>
                  <Text style={styles.timelineDate}>{formatDateTime(inc.createdAt)}</Text>
                  <Text style={styles.text}>{inc.title}</Text>
                  {inc.resolvedAt && (
                    <Text style={[styles.textMuted, { color: '#16a34a' }]}>
                      ✓ {t('reports.incidents.resolved')}: {formatDateTime(inc.resolvedAt)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const ConclusionBlock: React.FC<BlockProps> = ({ data, styles, t }) => (
  <View>
    <Text style={styles.sectionTitle}>{t('reports.blocks.conclusion.title')}</Text>
    <View style={styles.summaryGrid}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.summary.totalSystems}</Text>
        <Text style={styles.summaryLabel}>{t('reports.pdf.totalSystems')}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.summary.totalReadings}</Text>
        <Text style={styles.summaryLabel}>{t('reports.pdf.totalAnalyses')}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.summary.totalInspections}</Text>
        <Text style={styles.summaryLabel}>{t('reports.pdf.totalInspections')}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.summary.totalIncidents}</Text>
        <Text style={styles.summaryLabel}>{t('reports.pdf.totalOccurrences')}</Text>
      </View>
    </View>
    {data.summary.outOfRangeCount > 0 && (
      <View style={[styles.infoBox, { backgroundColor: '#fef2f2' }]}>
        <Text style={[styles.text, { color: '#dc2626' }]}>
          ⚠ {data.summary.outOfRangeCount} {t('reports.statistics.outOfRange').toLowerCase()}
        </Text>
      </View>
    )}
    {data.conclusion && (
      <View style={styles.conclusionBox}>
        <Text style={styles.text}>{data.conclusion}</Text>
      </View>
    )}
  </View>
);

const SignatureBlock: React.FC<Pick<BlockProps, 'data' | 'styles'>> = ({ data, styles }) => (
  <View style={styles.signatureBox}>
    {data.signature?.signatureImage && (
      <Image src={data.signature.signatureImage} style={styles.signatureImage} />
    )}
    <View style={styles.signatureLine} />
    <Text style={styles.signatureName}>
      {data.signature?.name || data.generatedBy.name}
    </Text>
    {data.signature?.role && (
      <Text style={styles.signatureRole}>{data.signature.role}</Text>
    )}
    {data.signature?.registration && (
      <Text style={styles.signatureRole}>{data.signature.registration}</Text>
    )}
    <Text style={[styles.signatureRole, { marginTop: 8 }]}>
      {formatDate(data.generatedAt)}
    </Text>
  </View>
);

const AttachmentsBlock: React.FC<Pick<BlockProps, 'styles' | 't'>> = ({ styles, t }) => (
  <View>
    <Text style={styles.sectionTitle}>{t('reports.blocks.attachments.title')}</Text>
    <Text style={styles.textMuted}>{t('reports.blocks.attachments.description')}</Text>
  </View>
);

// Header component with logo
const ReportHeader: React.FC<{
  branding: ReportBranding;
  client: ReportClient;
  styles: ReturnType<typeof createStyles>;
}> = ({ branding, client, styles }) => {
  const logoSrc = branding.showLogo ? client.logo : undefined;

  return (
    <View style={styles.header}>
      {branding.logoPosition === 'left' && logoSrc && (
        <Image src={logoSrc} style={styles.headerLogo} />
      )}
      {branding.logoPosition === 'center' ? (
        <View style={{ flex: 1, alignItems: 'center' }}>
          {logoSrc && <Image src={logoSrc} style={styles.headerLogo} />}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {branding.showHeader && (
            <Text style={styles.headerText}>{branding.headerText}</Text>
          )}
        </View>
      )}
      {branding.logoPosition === 'right' && logoSrc && (
        <Image src={logoSrc} style={styles.headerLogo} />
      )}
    </View>
  );
};

// Main Document Component
export const ReportPdfDocument: React.FC<ReportPdfProps> = ({
  reportName,
  config,
  data,
  t
}) => {
  const { blocks, branding } = config;
  const primaryColor = branding.primaryColor || '#1976d2';
  const styles = createStyles(primaryColor);

  // Sort and filter enabled blocks
  const enabledBlocks = blocks
    .filter(block => block.enabled)
    .sort((a, b) => a.order - b.order);

  // Blocks that should NOT wrap (keep together on one page if they fit)
  const noWrapBlocks = ['identification', 'signature', 'conclusion'];

  const renderBlock = (block: ReportBlock) => {
    const props: BlockProps = { data, block, styles, t };

    switch (block.type) {
      case 'identification':
        return <IdentificationBlock key={block.type} {...props} reportName={reportName} />;
      case 'scope':
        return <ScopeBlock key={block.type} {...props} />;
      case 'systems':
        return <SystemsBlock key={block.type} {...props} />;
      case 'analyses':
        return <AnalysesBlock key={block.type} {...props} />;
      case 'inspections':
        return <InspectionsBlock key={block.type} {...props} />;
      case 'occurrences':
        return <OccurrencesBlock key={block.type} {...props} />;
      case 'conclusion':
        return <ConclusionBlock key={block.type} {...props} />;
      case 'signature':
        return <SignatureBlock key={block.type} data={data} styles={styles} />;
      case 'attachments':
        return <AttachmentsBlock key={block.type} styles={styles} t={t} />;
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader branding={branding} client={data.client} styles={styles} />

        {enabledBlocks.map(block => (
          <View key={block.type} wrap={!noWrapBlocks.includes(block.type)}>
            {renderBlock(block)}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {branding.showFooter && branding.footerText}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  );
};

export default ReportPdfDocument;
