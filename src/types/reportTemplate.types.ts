// Report block types matching backend
export type ReportBlockType =
  | 'identification'
  | 'scope'
  | 'systems'
  | 'analyses'
  | 'inspections'
  | 'occurrences'
  | 'conclusion'
  | 'signature'
  | 'attachments';

// Chart configuration types
export type ChartType = 'bar' | 'line' | 'area';
export type ChartAggregation = 'daily' | 'weekly' | 'monthly';

export interface ChartColorConfig {
  primary: string;           // Bar/line color (default: template primaryColor)
  specLimitLine: string;     // Red line color (default: '#dc2626')
  background: string;        // Chart background (default: '#ffffff')
  gridLines: string;         // Grid line color (default: '#e5e7eb')
  text: string;              // Text/label color (default: '#374151')
}

export interface ChartParameterConfig {
  monitoringPointId: number;
  color?: string;            // Override color for this parameter
  showSpecLimit: boolean;    // Show the red limit line
}

export interface ChartConfig {
  enabled: boolean;
  chartType: ChartType;
  aggregation: ChartAggregation;
  parameters: ChartParameterConfig[];
  colors: ChartColorConfig;
  showLegend: boolean;
  showDataLabels: boolean;
  title?: string;            // Optional chart title
}

// Chart data structure for rendering
export interface ChartDataPoint {
  date: string;              // ISO date string
  label: string;             // Formatted label (e.g., "Jan", "01/15")
  value: number | null;
  isOutOfRange: boolean;
}

export interface ChartSeriesData {
  monitoringPointId: number;
  monitoringPointName: string;
  parameterName: string;
  unit: string;
  minValue: number | null;   // Specification limit (lower)
  maxValue: number | null;   // Specification limit (upper)
  data: ChartDataPoint[];
  color: string;
  showSpecLimit?: boolean;
}

export interface ReportChartData {
  fieldCharts: ChartSeriesData[];
  laboratoryCharts: ChartSeriesData[];
  // Chart configs passed from backend
  fieldChartConfig?: ChartConfig;
  laboratoryChartConfig?: ChartConfig;
}

// Default chart configuration
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  enabled: false,
  chartType: 'bar',
  aggregation: 'daily',
  parameters: [],
  colors: {
    primary: '#1976d2',
    specLimitLine: '#dc2626',
    background: '#ffffff',
    gridLines: '#e5e7eb',
    text: '#374151'
  },
  showLegend: true,
  showDataLabels: true
};

export interface ReportBlock {
  type: ReportBlockType;
  enabled: boolean;
  order: number;
  // Block-specific options
  includePhotos?: boolean;
  includeCharts?: boolean;
  highlightAlerts?: boolean;
  includeTimeline?: boolean;
  // Analyses block options - 4 individual view toggles
  showFieldOverview?: boolean;        // Field Monitoring Analysis – Overview
  showFieldDetailed?: boolean;        // Field Monitoring Analysis – Detailed
  showLaboratoryOverview?: boolean;   // Laboratory Monitoring Analysis – Overview
  showLaboratoryDetailed?: boolean;   // Laboratory Monitoring Analysis – Detailed
  // Chart configuration for analyses block
  chartConfig?: ChartConfig;
  // Separate field and laboratory chart configs (new structure)
  fieldChartConfig?: ChartConfig;
  laboratoryChartConfig?: ChartConfig;
  // Inspections block options
  showInspectionOverview?: boolean;   // Inspections – Overview
  showInspectionDetailed?: boolean;   // Inspections – Detailed View
  highlightOnlyNonConformities?: boolean;  // Default: true - highlight only NC inspections
}

export interface ReportBranding {
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  primaryColor: string;
  showHeader: boolean;
  headerText: string;
  showFooter: boolean;
  footerText: string;
}

export interface ReportTemplateConfig {
  blocks: ReportBlock[];
  branding: ReportBranding;
}

export type ReportTemplateType = 'service_provider' | 'end_customer' | 'both';

export interface ReportTemplate {
  id: number;
  userId: number;
  clientId: number | null;
  name: string;
  description: string | null;
  type: ReportTemplateType;
  config: ReportTemplateConfig;
  isDefault: boolean;
  isGlobal: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name: string;
  } | null;
}

export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  type?: ReportTemplateType;
  config?: ReportTemplateConfig;
  isDefault?: boolean;
  clientId?: number;
}

export interface UpdateReportTemplateRequest {
  name?: string;
  description?: string;
  type?: ReportTemplateType;
  config?: ReportTemplateConfig;
  isDefault?: boolean;
}

export interface ReportTemplateState {
  templates: ReportTemplate[];
  currentTemplate: ReportTemplate | null;
  defaultConfig: ReportTemplateConfig | null;
  loading: boolean;
  error: string | null;
}

// Default template configuration
export const DEFAULT_TEMPLATE_CONFIG: ReportTemplateConfig = {
  blocks: [
    { type: 'identification', enabled: true, order: 1 },
    { type: 'scope', enabled: true, order: 2 },
    { type: 'systems', enabled: true, order: 3, includePhotos: true },
    {
      type: 'analyses',
      enabled: true,
      order: 4,
      includeCharts: true,
      highlightAlerts: false,
      showFieldOverview: true,
      showFieldDetailed: false,
      showLaboratoryOverview: true,
      showLaboratoryDetailed: false,
      chartConfig: DEFAULT_CHART_CONFIG
    },
    {
      type: 'inspections',
      enabled: true,
      order: 5,
      includePhotos: true,
      showInspectionOverview: true,
      showInspectionDetailed: false,
      highlightOnlyNonConformities: true
    },
    { type: 'occurrences', enabled: true, order: 6, includeTimeline: true },
    { type: 'conclusion', enabled: true, order: 7 },
    { type: 'signature', enabled: true, order: 8 },
    { type: 'attachments', enabled: false, order: 9 }
  ],
  branding: {
    showLogo: true,
    logoPosition: 'left',
    primaryColor: '#1976d2',
    showHeader: true,
    headerText: 'Technical Report',
    showFooter: true,
    footerText: 'Page {page} of {pages}'
  }
};

// Generated Report types
export interface GeneratedReportPeriod {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
}

export interface GeneratedReportFilters {
  systemIds?: number[];
  stageIds?: number[];
  includeSubSystems?: boolean;
  includeOnlyAlerts?: boolean;
  includePhotos?: boolean;
  includeCharts?: boolean;
}

export interface GeneratedReport {
  id: number;
  templateId: number;
  userId: number;
  clientId: number | null;
  name: string;
  systemIds: number[];
  period: GeneratedReportPeriod;
  filters: GeneratedReportFilters;
  config: ReportTemplateConfig;
  pdfUrl: string | null;
  publicId: string | null;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  template?: ReportTemplate;
  user?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name: string;
  } | null;
}

export interface GenerateReportRequest {
  templateId: number;
  name: string;
  systemIds: number[];
  period: GeneratedReportPeriod;
  filters?: GeneratedReportFilters;
}

export interface GeneratedReportState {
  reports: GeneratedReport[];
  currentReport: GeneratedReport | null;
  reportData: GeneratedReportData | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

// Data collected for report generation
export interface GeneratedReportData {
  client: {
    id: number;
    name: string;
    address?: string;
    contact?: string;
    phone?: string;
    email?: string;
    logo?: string;
    brandColor?: string;
  };
  systems: unknown[];
  dailyLogs: unknown[];
  inspections: unknown[];
  incidents: unknown[];
  products: unknown[];
  productUsages?: unknown[];
  period: GeneratedReportPeriod;
  summary?: {
    totalSystems: number;
    totalReadings: number;
    outOfRangeCount: number;
    totalInspections: number;
    totalIncidents: number;
    openIncidents: number;
    totalProducts?: number;
  };
  conclusion?: string;
  signature?: {
    name?: string;
    role?: string;
    registration?: string;
    signatureImage?: string;
  };
  generatedAt: string;
  generatedBy: {
    id: number;
    name: string;
  };
  // Chart data for PDF rendering
  chartData?: ReportChartData;
}
