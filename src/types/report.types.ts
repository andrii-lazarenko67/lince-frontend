import type { DailyLog } from './dailyLog.types';
import type { Inspection } from './inspection.types';
import type { Incident } from './incident.types';
import type { Product, ProductUsage } from './product.types';

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface LegacyGenerateReportRequest {
  type: ReportType;
  systemIds?: number[];
  stageIds?: number[];
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  type: ReportType;
  period: {
    startDate: string;
    endDate: string;
  };
  dailyLogs: DailyLog[];
  inspections: Inspection[];
  incidents: Incident[];
  products: Product[];
  productUsages: ProductUsage[];
  generatedAt: string;
}

export interface ReportState {
  currentReport: ReportData | null;
  isGenerating: boolean;
  error: string | null;
}
