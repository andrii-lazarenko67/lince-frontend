export type ReportModuleId = 'systems' | 'dailyLogs' | 'inspections' | 'incidents' | 'products';

export interface ReportModuleConfig {
  id: ReportModuleId;
  enabled: boolean;
  order: number;
  settings: Record<string, boolean | string | number>;
}

export interface ReportTemplateConfig {
  modules: ReportModuleConfig[];
  settings: {
    showSummary: boolean;
    showCharts: boolean;
    dateFormat?: string;
  };
}

export interface ReportTemplate {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  config: ReportTemplateConfig;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  config: ReportTemplateConfig;
  isDefault?: boolean;
}

export interface UpdateReportTemplateRequest {
  name?: string;
  description?: string;
  config?: ReportTemplateConfig;
  isDefault?: boolean;
}

export interface ReportTemplateState {
  templates: ReportTemplate[];
  currentTemplate: ReportTemplate | null;
  loading: boolean;
  error: string | null;
}

// Default template configuration
export const DEFAULT_TEMPLATE_CONFIG: ReportTemplateConfig = {
  modules: [
    { id: 'systems', enabled: true, order: 1, settings: { showDescription: true, showStatus: true } },
    { id: 'dailyLogs', enabled: true, order: 2, settings: { showChart: true, showTable: true } },
    { id: 'inspections', enabled: true, order: 3, settings: { showPhotos: false } },
    { id: 'incidents', enabled: true, order: 4, settings: {} },
    { id: 'products', enabled: true, order: 5, settings: { showUsage: true } }
  ],
  settings: {
    showSummary: true,
    showCharts: true
  }
};
