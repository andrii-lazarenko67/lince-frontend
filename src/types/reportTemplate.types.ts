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

export interface ReportBlock {
  type: ReportBlockType;
  enabled: boolean;
  order: number;
  // Block-specific options
  includePhotos?: boolean;
  includeCharts?: boolean;
  highlightAlerts?: boolean;
  includeTimeline?: boolean;
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
    { type: 'analyses', enabled: true, order: 4, includeCharts: true, highlightAlerts: true },
    { type: 'inspections', enabled: true, order: 5, includePhotos: true },
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
  systems: unknown[];
  dailyLogs: unknown[];
  inspections: unknown[];
  incidents: unknown[];
  products: unknown[];
  period: GeneratedReportPeriod;
  generatedAt: string;
}
